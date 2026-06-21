const express = require("express");
const router = express.Router();
const Item = require("../models/ItemSchema");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { cookieAuth } = require("../auth/middleware");

// Используем memoryStorage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Функция загрузки в Cloudinary (можно вынести в отдельный файл, но пока оставим здесь)
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: folder || "products" }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(buffer);
  });
};

// СОЗДАНИЕ ТОВАРА (админ)
router.post(
  "/createItem",
  cookieAuth,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "additionalImages", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const {
        title,
        author,
        description,
        price,
        stock,
        isFeatured,
        category,
        discountPercent,
        isOnSale,
        sizes,
      } = req.body;

      if (!title || !author || !description || !price || !stock) {
        return res
          .status(400)
          .json({ error: "Все поля должны быть заполнены" });
      }

      // Загружаем обложку
      let coverImageUrl = "";
      if (req.files["coverImage"]) {
        const file = req.files["coverImage"][0];
        const result = await uploadToCloudinary(file.buffer, "products/covers");
        coverImageUrl = result.secure_url;
      }

      // Загружаем дополнительные
      let additionalImageUrls = [];
      if (req.files["additionalImages"]) {
        for (const file of req.files["additionalImages"]) {
          const result = await uploadToCloudinary(
            file.buffer,
            "products/additional",
          );
          additionalImageUrls.push(result.secure_url);
        }
      }

      const newItem = new Item({
        title,
        author,
        description,
        price,
        stock,
        isFeatured,
        isOnSale,
        discountPercent,
        category,
        sizes: sizes ? sizes.split(",") : [],
        coverImage: coverImageUrl,
        additionalImages: additionalImageUrls,
      });

      await newItem.save();
      res.status(201).json({ message: "Товар создан", item: newItem });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Остальные маршруты (/getItems, /:id, /updateItem, /deleteItem) обновите аналогично,
// заменив локальное сохранение на cloudinary в updateItem (уже есть пример в items.js).
// Я приведу полный обновлённый файл ниже.
