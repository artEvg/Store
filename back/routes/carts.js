const express = require("express")
const router = express.Router()

const Cart = require("../models/CartSchema")
const Item = require("../models/ItemSchema")
const { cookieAuth } = require("../auth/middleware")

router.get("/", cookieAuth, async (req, res) => {
	try {
		let cart = await Cart.findOne({ user: req.user.id }).populate(
			"items.item",
			"title price coverImage stock",
		)

		if (!cart) {
			cart = new Cart({
				user: req.user.id,
				items: [],
				totalItems: 0,
				totalAmount: 0,
			})
			await cart.save()
		}

		return res.status(200).json({
			success: true,
			message: "Cart retrieved successfully",
			cart,
		})
	} catch (error) {
		console.error("Error retrieving cart:", error)
		return res.status(500).json({
			success: false,
			message: "Error retrieving cart",
			error: error.message,
		})
	}
})

router.post("/add", cookieAuth, async (req, res) => {
	try {
		const { itemId, size } = req.body

		if (!itemId) {
			return res.status(400).json({
				success: false,
				message: "itemId is required",
			})
		}

		const dbItem = await Item.findById(itemId)
		if (!dbItem) {
			return res.status(404).json({
				success: false,
				message: "Товар не найден",
			})
		}

		if (dbItem.stock <= 0) {
			return res.status(400).json({
				success: false,
				message: "Товара нет в наличии",
			})
		}

		let cart = await Cart.findOne({ user: req.user.id }).populate(
			"items.item",
			"title price coverImage stock",
		)

		if (!cart) {
			cart = new Cart({
				user: req.user.id,
				items: [],
				totalItems: 0,
				totalAmount: 0,
			})
		}

		// Проверяем, есть ли уже этот товар с таким же размером
		const cartItemIndex = cart.items.findIndex(
			ci =>
				ci.item &&
				ci.item._id &&
				ci.item._id.toString() === itemId &&
				ci.size === size, // ← сравниваем размер
		)

		if (cartItemIndex > -1) {
			cart.items[cartItemIndex].quantity += 1
		} else {
			cart.items.push({
				item: itemId,
				price: dbItem.price,
				quantity: 1,
				size: size || "", // ← добавляем размер
			})
		}

		dbItem.stock -= 1
		await dbItem.save()

		cart.totalItems = cart.items.reduce((sum, ci) => sum + ci.quantity, 0)
		cart.totalAmount = cart.items.reduce(
			(sum, ci) => sum + ci.price * ci.quantity,
			0,
		)

		await cart.save()

		const populatedCart = await Cart.findById(cart._id).populate(
			"items.item",
			"title price coverImage stock",
		)

		return res.status(200).json({
			success: true,
			message: "Товар добавлен в корзину",
			cart: populatedCart,
		})
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Error adding to cart",
			error: error.message,
		})
	}
})

router.put("/update", cookieAuth, async (req, res) => {
	try {
		const { itemId, quantity } = req.body

		if (!itemId || typeof quantity !== "number" || quantity < 1) {
			return res.status(400).json({
				success: false,
				message: "itemId и quantity обязательны, quantity должен быть >= 1",
			})
		}

		let cart = await Cart.findOne({ user: req.user.id }).populate(
			"items.item",
			"title price coverImage stock",
		)

		if (!cart) {
			return res.status(404).json({ message: "Корзина не найдена" })
		}

		const cartItem = cart.items.find(
			ci => ci.item && ci.item._id && ci.item._id.toString() === itemId,
		)

		if (!cartItem) {
			return res.status(404).json({ message: "Товар не найден в корзине" })
		}

		const dbItem = await Item.findById(itemId)
		if (!dbItem) {
			return res.status(404).json({ message: "Товар не найден" })
		}

		const diff = quantity - cartItem.quantity

		if (diff > 0) {
			if (dbItem.stock < diff) {
				return res
					.status(400)
					.json({ message: "Недостаточно товара на складе" })
			}
			dbItem.stock -= diff
		} else if (diff < 0) {
			dbItem.stock += Math.abs(diff)
		}

		cartItem.quantity = quantity

		await dbItem.save()

		cart.totalItems = cart.items.reduce((sum, ci) => sum + ci.quantity, 0)
		cart.totalAmount = cart.items.reduce(
			(sum, ci) => sum + ci.price * ci.quantity,
			0,
		)

		await cart.save()

		const populatedCart = await Cart.findById(cart._id).populate(
			"items.item",
			"title price coverImage stock",
		)

		return res.json({
			success: true,
			message: "Количество товара обновлено",
			cart: populatedCart,
		})
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: "Error updating cart",
			error: err.message,
		})
	}
})

router.delete("/remove/:itemId", cookieAuth, async (req, res) => {
	try {
		const { itemId } = req.params

		const cart = await Cart.findOne({ user: req.user.id })
		if (!cart) {
			return res.status(404).json({ message: "Корзина не найдена" })
		}

		const itemIndex = cart.items.findIndex(
			ci => ci.item && ci.item.toString() === itemId,
		)

		if (itemIndex === -1) {
			return res.status(404).json({ message: "Товар не найден в корзине" })
		}

		const cartItem = cart.items[itemIndex]
		const dbItem = await Item.findById(itemId)

		if (dbItem) {
			dbItem.stock += cartItem.quantity
			await dbItem.save()
		}

		cart.items.splice(itemIndex, 1)

		cart.totalItems = cart.items.reduce((sum, ci) => sum + ci.quantity, 0)
		cart.totalAmount = cart.items.reduce(
			(sum, ci) => sum + ci.price * ci.quantity,
			0,
		)

		await cart.save()

		const populatedCart = await Cart.findById(cart._id).populate(
			"items.item",
			"title price coverImage stock",
		)

		return res.json({ success: true, cart: populatedCart })
	} catch (error) {
		return res.status(500).json({
			message: "Ошибка удаления товара",
			error: error.message,
		})
	}
})

router.post("/clear", cookieAuth, async (req, res) => {
	try {
		let cart = await Cart.findOne({ user: req.user.id }).populate(
			"items.item",
			"title price coverImage stock",
		)

		if (!cart) {
			cart = new Cart({
				user: req.user.id,
				items: [],
				totalItems: 0,
				totalAmount: 0,
			})
			await cart.save()

			return res.json({ success: true, message: "Корзина очищена", cart })
		}

		cart.items = []
		cart.totalItems = 0
		cart.totalAmount = 0

		await cart.save()

		return res.json({ success: true, message: "Корзина очищена", cart })
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Ошибка при очистке корзины",
			error: error.message,
		})
	}
})

module.exports = router
