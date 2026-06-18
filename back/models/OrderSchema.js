const mongoose = require("mongoose")

const OrderItemSchema = new mongoose.Schema({
	item: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Item",
		required: true,
	},
	quantity: {
		type: Number,
		required: true,
		min: 1,
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

const OrderSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	items: [OrderItemSchema],
	totalAmount: {
		type: Number,
		required: true,
	},
	totalItems: {
		type: Number,
		required: true,
	},
	address: {
		street: {
			type: String,
			required: true,
		},
		city: {
			type: String,
			required: true,
		},
		region: {
			type: String,
			required: true,
		},
		postalCode: {
			type: String,
			required: true,
		},
		phone: {
			type: String,
			required: true,
		},
	},
	status: {
		type: String,
		enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
		default: "pending",
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
})

module.exports = mongoose.model("Order", OrderSchema)
