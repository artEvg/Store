const mongoose = require("mongoose")

const ItemSchema = new mongoose.Schema({
	title: {
		type: String,
		require: true,
	},
	author: {
		type: String,
		require: true,
	},

	description: {
		type: String,
		require: true,
	},

	price: {
		type: Number,
		require: true,
	},

	stock: {
		type: Number,
		require: true,
		default: 0,
	},

	sizes: {
		type: [String],
		default: [],
	},

	isFeatured: {
		type: Boolean,
		default: false,
	},

	isOnSale: {
		type: Boolean,
		default: false,
	},

	discountPercent: {
		type: Number,
		default: 0,
	},

	category: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Category",
	},

	coverImage: {
		type: String,
	},

	additionalImages: {
		type: [String],
		default: [],
	},
})

module.exports = mongoose.model("Item", ItemSchema)
