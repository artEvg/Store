const express = require("express")
const router = express.Router()
const Category = require("../models/CategorySchema")

router.post("/createCategory", async (req, res) => {
	try {
		const { name } = req.body
		if (!name) {
			return res.status(400).json({ error: "Название обязательно" })
		}

		const newCategory = new Category({
			name,
		})

		await newCategory.save()
		res
			.status(201)
			.json({ message: "Категория успешно создана", item: newCategory })
	} catch (error) {
		res.status(500).json({ error: err.message })
	}
})

router.get("/getCategories", async (req, res) => {
	try {
		const categories = await Category.find()

		return res.json(categories)
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
})

module.exports = router
