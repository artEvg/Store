const express = require("express");
const router = express.Router();
const Item = require("../models/ItemSchema");
const multer = require("multer");
const cloudinary = require("../config/cloudinary"); // подключили конфиг

// Вместо diskStorage используем memoryStorage (файлы будут в буфере)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Вспомогательная функция загрузки одного файла в Cloudinary
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

// СОЗДАНИЕ ТОВАРА
router.post(
  "/createItem",
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
        return res.status(400).json({ error: "Заполните все поля" });
      }

      // Загружаем обложку, если есть
      let coverImageUrl = "";
      if (req.files["coverImage"]) {
        const file = req.files["coverImage"][0];
        const result = await uploadToCloudinary(file.buffer, "products/covers");
        coverImageUrl = result.secure_url;
      }

      // Загружаем дополнительные изображения
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
        coverImage: coverImageUrl, // теперь храним URL
        additionalImages: additionalImageUrls, // массив URL
      });

      await newItem.save();
      res.status(201).json({ message: "Товар создан", item: newItem });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// ПОЛУЧЕНИЕ ВСЕХ ТОВАРОВ (без изменений)
router.get("/getItems", async (req, res) => {
  try {
    const items = await Item.find().populate("category", "name");
    return res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ПОЛУЧЕНИЕ ОДНОГО ТОВАРА (без изменений)
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate(
      "category",
      "name",
    );
    if (!item) {
      return res.status(404).json({ message: "Товар не найден" });
    }
    return res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ОБНОВЛЕНИЕ ТОВАРА
router.put(
  "/updateItem/:id",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "additionalImages", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const updateData = { ...req.body };

      // Преобразуем булевы поля
      if (req.body.isFeatured !== undefined) {
        updateData.isFeatured =
          req.body.isFeatured === true || req.body.isFeatured === "true";
      }
      if (req.body.isOnSale !== undefined) {
        updateData.isOnSale =
          req.body.isOnSale === true || req.body.isOnSale === "true";
      }
      if (req.body.discountPercent !== undefined) {
        updateData.discountPercent = Number(req.body.discountPercent);
      }
      if (req.body.sizes) {
        updateData.sizes = req.body.sizes.split(",");
      }

      // Если загружена новая обложка — загружаем в Cloudinary и сохраняем URL
      if (req.files["coverImage"]) {
        const file = req.files["coverImage"][0];
        const result = await uploadToCloudinary(file.buffer, "products/covers");
        updateData.coverImage = result.secure_url;
      }

      // Если загружены новые дополнительные изображения — загружаем и заменяем массив
      if (req.files["additionalImages"]) {
        const urls = [];
        for (const file of req.files["additionalImages"]) {
          const result = await uploadToCloudinary(
            file.buffer,
            "products/additional",
          );
          urls.push(result.secure_url);
        }
        updateData.additionalImages = urls;
      }

      const item = await Item.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
      }).populate("category", "name");

      if (!item) {
        return res.status(404).json({ message: "Товар не найден" });
      }
      res.json({ message: "Товар успешно обновлён", item });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// УДАЛЕНИЕ ТОВАРА (по желанию можно добавить удаление файлов из Cloudinary, но пока оставим как есть)
router.delete("/deleteItem/:id", async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Товар не найден" });
    }
    res.json({ message: "Товар удален" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
