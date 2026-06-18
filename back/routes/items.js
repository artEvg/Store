const express = require("express")
const router = express.Router()
const Item = require("../models/ItemSchema")
const multer = require("multer")

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./images")
	},
	filename: function (req, file, cb) {
		const filename =
			Date.now() +
			"-" +
			file.fieldname +
			"-" +
			Math.random().toString(36).substring(7)
		cb(null, filename)
	},
})

const upload = multer({
	storage: storage,
	limits: { fileSize: 5 * 1024 * 1024 },
})

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
			} = req.body

			if (!title || !author || !description || !price || !stock) {
				return res.status(400).json({ error: "Заполните все поля" })
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
				coverImage: req.files["coverImage"]?.[0]?.filename,
				additionalImages:
					req.files["additionalImages"]?.map(file => file.filename) || [],
			})

			await newItem.save()
			res.status(201).json({ message: "Товар создан", item: newItem })
		} catch (error) {
			res.status(500).json({ error: error.message })
		}
	},
)

router.get("/getItems", async (req, res) => {
	try {
		const items = await Item.find().populate("category", "name")

		return res.json(items)
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
})

router.get("/:id", async (req, res) => {
	try {
		const item = await Item.findById(req.params.id).populate("category", "name")
		if (!item) {
			return res.status(404).json({ message: "Товар не найден" })
		}

		return res.json(item)
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
})

router.put(
	"/updateItem/:id",
	upload.fields([
		{ name: "coverImage", maxCount: 1 },
		{ name: "additionalImages", maxCount: 10 },
	]),
	async (req, res) => {
		try {
			const updateData = { ...req.body }

			if (req.body.isFeatured !== undefined) {
				updateData.isFeatured =
					req.body.isFeatured === true || req.body.isFeatured === "true"
			}

			if (req.body.isOnSale !== undefined) {
				updateData.isOnSale =
					req.body.isOnSale === true || req.body.isOnSale === "true"
			}

			if (req.body.discountPercent !== undefined) {
				updateData.discountPercent = Number(req.body.discountPercent)
			}

			if (req.files["coverImage"]) {
				updateData.coverImage = req.files["coverImage"][0].filename
			}

			if (req.files["additionalImages"]) {
				updateData.additionalImages = req.files["additionalImages"].map(
					file => file.filename,
				)
			}

			if (req.body.sizes) {
				updateData.sizes = req.body.sizes.split(",")
			}

			const item = await Item.findByIdAndUpdate(req.params.id, updateData, {
				new: true,
			}).populate("category", "name")

			if (!item) {
				return res.status(404).json({ message: "Товар не найден" })
			}
			res.json({ message: "Товар успешно обновен", item })
		} catch (error) {
			res.status(500).json({ error: error.message })
		}
	},
)

router.delete("/deleteItem/:id", async (req, res) => {
	try {
		const item = await Item.findByIdAndDelete(req.params.id)

		if (!item) {
			return res.status(404).json({ message: "Товар не найден" })
		}

		res.json({ message: "Товар удален" })
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
})

module.exports = router
