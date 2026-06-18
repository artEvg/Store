const mongoose = require("mongoose")

const CartItemSchema = new mongoose.Schema({
	item: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Item",
		required: true,
	},
	quantity: {
		type: Number,
		required: true,
		min: 1,
		default: 1,
	},

	price: {
		type: Number,
		required: true,
	},

	size: {
		type: String,
		default: "",
	},
})

const CartSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
		unique: true,
	},
	items: [CartItemSchema],
	totalAmount: {
		type: Number,
		default: 0,
	},
	totalItems: {
		type: Number,
		default: 0,
	},
})

module.exports = mongoose.model("Cart", CartSchema)
