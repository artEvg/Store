const express = require("express")
const router = express.Router()
const Order = require("../models/OrderSchema")
const Cart = require("../models/CartSchema")
const Item = require("../models/ItemSchema")
const { cookieAuth } = require("../auth/middleware")

// Создать заказ из корзины
router.post("/create", cookieAuth, async (req, res) => {
	try {
		const { address } = req.body

		if (
			!address ||
			!address.street ||
			!address.city ||
			!address.region ||
			!address.postalCode ||
			!address.phone
		) {
			return res.status(400).json({
				success: false,
				message: "Все поля адреса обязательны",
			})
		}

		let cart = await Cart.findOne({ user: req.user.id }).populate(
			"items.item",
			"title price coverImage stock",
		)

		if (!cart || cart.items.length === 0) {
			return res.status(400).json({
				success: false,
				message: "Корзина пуста",
			})
		}

		const orderItems = cart.items.map(ci => ({
			item: ci.item._id,
			quantity: ci.quantity,
			price: ci.price,
			size: ci.size || "",
		}))

		const totalAmount = cart.items.reduce(
			(sum, ci) => sum + ci.price * ci.quantity,
			0,
		)
		const totalItems = cart.items.reduce((sum, ci) => sum + ci.quantity, 0)

		const newOrder = new Order({
			user: req.user.id,
			items: orderItems,
			totalAmount,
			totalItems,
			address: address,
			status: "pending",
		})

		await newOrder.save()

		// Обновить остаток товаров
		for (const ci of cart.items) {
			const dbItem = await Item.findById(ci.item._id)
			if (dbItem) {
				dbItem.stock -= ci.quantity
				await dbItem.save()
			}
		}

		// Очистить корзину
		cart.items = []
		cart.totalItems = 0
		cart.totalAmount = 0
		await cart.save()

		const populatedOrder = await Order.findById(newOrder._id)
			.populate("items.item", "title price coverImage stock")
			.populate("user", "name email")

		return res.status(201).json({
			success: true,
			message: "Заказ успешно оформлен",
			order: populatedOrder,
		})
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Ошибка при создании заказа",
			error: error.message,
		})
	}
})

// Получить все заказы пользователя
router.get("/my-orders", cookieAuth, async (req, res) => {
	try {
		const orders = await Order.find({ user: req.user.id })
			.populate("items.item", "title price coverImage stock")
			.populate("user", "name email")
			.sort({ createdAt: -1 })

		return res.status(200).json({
			success: true,
			orders,
		})
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Ошибка при получении заказов",
			error: error.message,
		})
	}
})

router.get("/all-orders", cookieAuth, async (req, res) => {
	try {
		if (req.user.role !== "admin") {
			return res.status(403).json({
				success: false,
				message: "Доступ запрещен. Только админ",
			})
		}

		const orders = await Order.find()
			.populate("items.item", "title price coverImage stock")
			.populate("user", "name email")
			.sort({ createdAt: -1 })

		return res.status(200).json({
			success: true,
			orders,
		})
	} catch (error) {
		console.error("Ошибка в all-orders:", error)
		return res.status(500).json({
			success: false,
			message: "Ошибка при получении заказов",
			error: error.message,
		})
	}
})

// Получить один заказ по ID
router.get("/:id", cookieAuth, async (req, res) => {
	try {
		const order = await Order.findById(req.params.id)
			.populate("items.item", "title price coverImage stock")
			.populate("user", "name email")

		if (!order) {
			return res.status(404).json({
				success: false,
				message: "Заказ не найден",
			})
		}

		// Проверить, что заказ принадлежит пользователю
		if (order.user._id.toString() !== req.user.id) {
			return res.status(403).json({
				success: false,
				message: "Доступ запрещен",
			})
		}

		return res.status(200).json({
			success: true,
			order,
		})
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Ошибка при получении заказа",
			error: error.message,
		})
	}
})

// Обновить статус заказа (для админа)
router.put("/updateStatus/:id", cookieAuth, async (req, res) => {
	try {
		if (req.user.role !== "admin") {
			return res.status(403).json({
				success: false,
				message: "Доступ запрещен. Только админ",
			})
		}

		const { status } = req.body

		if (
			!status ||
			!["pending", "processing", "shipped", "delivered", "cancelled"].includes(
				status,
			)
		) {
			return res.status(400).json({
				success: false,
				message: "Некорректный статус",
			})
		}

		const order = await Order.findByIdAndUpdate(
			req.params.id,
			{ status },
			{ new: true },
		)
			.populate("items.item", "title price coverImage stock")
			.populate("user", "name email")

		return res.status(200).json({
			success: true,
			message: "Статус заказа обновлен",
			order,
		})
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Ошибка при обновлении статуса",
			error: error.message,
		})
	}
})

module.exports = router
