const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const dotenv = require("dotenv").config()

const app = express()
const connectDB = require("./config/db")

app.use(cookieParser())
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ limit: "10mb", extended: true }))

app.use(
	cors({
		origin: process.env.FRONTEND_URL || "https://store-jjy2.onrender.com",
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
	}),
)

connectDB()

app.use("/users", require("./routes/users"))
app.use("/items", require("./routes/items"))
app.use("/category", require("./routes/category"))
app.use("/admin", require("./routes/admin"))
app.use("/carts", require("./routes/carts"))
app.use("/images", express.static("images"))
app.use("/orders", require("./routes/orders"))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`server is running on port ${PORT}`))
