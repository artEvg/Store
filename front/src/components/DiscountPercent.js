import React, { useEffect, useState } from "react"
import { useCart } from "../auth/CartContext"
import { Link } from "react-router-dom"

function DiscountPercent() {
	const [itemList, setItemList] = useState([])
	const [message, setMessage] = useState("")
	const { addToCart } = useCart()

	useEffect(() => {
		fetch("http://localhost:5000/items/getItems")
			.then(res => res.json())
			.then(data => setItemList(data))
			.catch(err => console.error("Ошибка в загрузке товара:", err))
	}, [])

	const discountPercent = itemList?.filter(item => item.discountPercent > 0)

	return <div className='mt-10'></div>
}

export default DiscountPercent
