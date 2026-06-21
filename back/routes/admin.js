const express = require("express");
const router = express.Router();
const Item = require("../models/ItemSchema");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { cookieAuth } = require("../auth/middleware");

// Настройка multer с memoryStorage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Универсальная функция загрузки одного файла в Cloudinary (буфер)
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: folder || "products",
          // можно добавить дополнительные параметры, например, public_id
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      )
      .end(buffer);
  });
};

// Загрузка нескольких файлов параллельно (Promise.all)
const uploadMultipleToCloudinary = async (files, folder) => {
  if (!files || files.length === 0) return [];
  const uploadPromises = files.map((file) =>
    uploadToCloudinary(file.buffer, folder),
  );
  const results = await Promise.all(uploadPromises);
  return results.map((r) => r.secure_url);
};

// СОЗДАНИЕ ТОВАРА
router.post(
  "/createItem",
  cookieAuth,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "additionalImages", maxCount: 10 },
  ]),
  async (req, res) => {
    console.log("➡️ /admin/createItem вызван");
    console.log("req.user:", req.user);
    console.log("req.files keys:", Object.keys(req.files || {}));
    console.log("req.body поля:", Object.keys(req.body));

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
        console.log("❌ Не все обязательные поля заполнены");
        return res
          .status(400)
          .json({ error: "Все поля должны быть заполнены" });
      }

      // 1. Загружаем главное изображение
      let coverImageUrl = "";
      if (req.files["coverImage"] && req.files["coverImage"].length > 0) {
        const file = req.files["coverImage"][0];
        console.log("🖼️ Загрузка coverImage, размер:", file.size);
        const result = await uploadToCloudinary(file.buffer, "products/covers");
        coverImageUrl = result.secure_url;
        console.log("✅ Cover загружен:", coverImageUrl);
      } else {
        console.log("⚠️ CoverImage не передан");
      }

      // 2. Загружаем дополнительные изображения
      let additionalImageUrls = [];
      if (
        req.files["additionalImages"] &&
        req.files["additionalImages"].length > 0
      ) {
        console.log(
          "🖼️ Загрузка дополнительных, кол-во:",
          req.files["additionalImages"].length,
        );
        additionalImageUrls = await uploadMultipleToCloudinary(
          req.files["additionalImages"],
          "products/additional",
        );
        console.log("✅ Дополнительные загружены:", additionalImageUrls.length);
      }

      // 3. Создаём товар
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
      console.log("✅ Товар сохранён в БД, ID:", newItem._id);

      res.status(201).json({ message: "Товар создан", item: newItem });
    } catch (error) {
      console.error("❌ Ошибка при создании товара:", error);
      console.error("Stack:", error.stack);
      res.status(500).json({ error: error.message });
    }
  },
);

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

      if (req.files["coverImage"]) {
        updateData.coverImage = req.files["coverImage"][0].filename;
      }

      if (req.files["additionalImages"]) {
        updateData.additionalImages = req.files["additionalImages"].map(
          (file) => file.filename,
        );
      }

      if (req.body.sizes) {
        updateData.sizes = req.body.sizes.split(",");
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
