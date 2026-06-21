const express = require("express");
const router = express.Router();
const Item = require("../models/ItemSchema");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { cookieAuth } = require("../auth/middleware");

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

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

// Создание товара
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

      let coverImageUrl = "";
      if (req.files["coverImage"]) {
        const file = req.files["coverImage"][0];
        const result = await uploadToCloudinary(file.buffer, "products/covers");
        coverImageUrl = result.secure_url;
      }

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

// Получение товаров (админ)
router.get("/getItems", cookieAuth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Доступ запрещен. Вы не админ." });
    }
    const items = await Item.find().populate("category", "name");
    return res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получение одного товара
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate(
      "category",
      "name",
    );
    if (!item) {
      return res.status(404).json({ message: "Товары не найдены" });
    }
    return res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновление товара
router.put(
  "/updateItem/:id",
  cookieAuth,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "additionalImages", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const updateData = { ...req.body };

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

      if (req.files["coverImage"]) {
        const file = req.files["coverImage"][0];
        const result = await uploadToCloudinary(file.buffer, "products/covers");
        updateData.coverImage = result.secure_url;
      }

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
      res.json({ message: "Товар обновлен", item });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Удаление товара
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
