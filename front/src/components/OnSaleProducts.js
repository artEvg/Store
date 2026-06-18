import React, { useEffect, useState } from "react"
import { useCart } from "../auth/CartContext"
import { Link } from "react-router-dom"

function OnSaleProducts() {
	const [itemList, setItemList] = useState([])
	const [message, setMessage] = useState("")
	const { addToCart } = useCart()

	useEffect(() => {
		fetch("https://buba-backend.onrender.com/items/getItems")
			.then(res => res.json())
			.then(data => setItemList(data))
			.catch(err => console.error("Error fetching items:", err))
	}, [])

	const isOnSale = itemList?.filter(item => item.isOnSale === true)

	return <div className='mt-10'></div>
}

export default OnSaleProducts
