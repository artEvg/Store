import { createContext, useContext, useEffect, useState } from "react"

const CartContext = createContext()

export function CartProvider({ children }) {
	const [cart, setCart] = useState(null)

	useEffect(() => {
		fetch("https://buba-backend.onrender.com/carts", { credentials: "include" })
			.then(res => res.json())
			.then(data => setCart(data.cart))
	}, [])

	const addToCart = async (itemId, size = "") => {
		console.log("sending itemId:", itemId, "size:", size)

		const res = await fetch("https://buba-backend.onrender.com/carts/add", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify({ itemId, size }),
		})

		const data = await res.json()

		console.log("server response:", data)
		if (res.ok) {
			setCart(data.cart)
		}
	}

	const updateCart = async (itemId, quantity) => {
		const res = await fetch("https://buba-backend.onrender.com/carts/update", {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify({ itemId, quantity }),
		})

		const data = await res.json()
		if (!res.ok) {
			alert(data.message || "Error updating cart")
			return
		}

		setCart(data.cart)
	}

	const removeFromCart = async itemId => {
		const res = await fetch(
			`https://buba-backend.onrender.com/carts/remove/${itemId}`,
			{
				method: "DELETE",
				credentials: "include",
			},
		)

		const data = await res.json()
		setCart(data.cart)
	}

	const clearCart = async () => {
		const res = await fetch("https://buba-backend.onrender.com/carts/clear", {
			method: "POST",
			credentials: "include",
		})

		const data = await res.json()

		if (res.ok) {
			setCart(data.cart)
		} else {
			console.error(data.message || "Failed to clear cart")
		}
	}

	return (
		<CartContext.Provider
			value={{ cart, addToCart, updateCart, removeFromCart, clearCart }}>
			{children}
		</CartContext.Provider>
	)
}

export const useCart = () => useContext(CartContext)
