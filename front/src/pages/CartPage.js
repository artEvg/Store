import React, { useState } from "react"
import { useCart } from "../auth/CartContext"
import { useNavigate } from "react-router-dom"

function CartPage() {
	const { cart, updateCart, removeFromCart, clearCart } = useCart()
	const [showSuccess, setShowSuccess] = useState(false)
	const [showError, setShowError] = useState("")
	const [submitting, setSubmitting] = useState(false)
	const navigate = useNavigate()

	const [address, setAddress] = useState({
		street: "",
		city: "",
		region: "",
		postalCode: "",
		phone: "",
	})

	const handleOrder = async () => {
		// Проверка адреса
		if (
			!address.street ||
			!address.city ||
			!address.region ||
			!address.postalCode ||
			!address.phone
		) {
			setShowError("Заполните все поля адреса")
			return
		}

		setSubmitting(true)
		setShowError("")

		try {
			const res = await fetch(
				"https://buba-backend.onrender.com/orders/create",
				{
					method: "POST",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ address }),
				},
			)

			const data = await res.json()

			if (!res.ok) {
				throw new Error(data?.message || "Ошибка при создании заказа")
			}

			await clearCart()
			setShowSuccess(true)

			setTimeout(() => {
				setShowSuccess(false)
				navigate("/orders")
			}, 2000)
		} catch (err) {
			setShowError(err.message)
		} finally {
			setSubmitting(false)
		}
	}

	if (!cart || cart.items.length === 0) {
		return (
			<>
				{showSuccess && (
					<div className='fixed top-6 left-1/2 -translate-x-1/2 z-50'>
						<div className='bg-green-500 text-white px-8 py-4 rounded-xl shadow-lg font-medium'>
							✅ Заказ успешно оформлен
						</div>
					</div>
				)}

				<div className='min-h-screen flex items-center justify-center mt-48'>
					<p className='text-gray-500 text-lg'>🛒 Ваша корзина пуста</p>
				</div>
			</>
		)
	}

	const totalAmount = cart.items.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0,
	)

	return (
		<div className='mt-5 min-h-screen p-10 max-w-6xl mx-auto'>
			<h3 className='my-5'>Корзина</h3>

			{showSuccess && (
				<div className='fixed top-6 left-1/2 -translate-x-1/2 z-50'>
					<div className='bg-green-500 text-white px-8 py-4 rounded-xl shadow-lg font-medium'>
						✅ Заказ успешно оформлен
					</div>
				</div>
			)}

			{showError && (
				<div className='mb-4 p-3 rounded bg-red-100 text-red-700 text-center'>
					{showError}
				</div>
			)}

			<div className='space-y-4'>
				{cart?.items?.map(item => (
					<div
						key={item._id}
						className='flex items-center gap-4 border rounded-lg p-4 shadow-sm bg-white'>
						<img
							src={`https://buba-backend.onrender.com/images/${item?.item?.coverImage}`}
							className='rounded w-24 h-32 object-cover'
							alt={item?.item?.title}
						/>

						<div className='flex-1'>
							<h2 className='font-semibold'>{item?.item?.title}</h2>
							<p className='text-gray-500'>{item?.item?.author}</p>

							{item.size && (
								<p className='text-sm text-gray-400'>Размер: {item.size}</p>
							)}

							<p className='text-[#F86D72] font-bold'>
								{item?.item?.price.toFixed(0)} ₽
							</p>

							<div className='flex items-center gap-2 mt-2'>
								<button
									className='w-10 h-10 p-0 disabled:opacity-50'
									disabled={item?.quantity <= 1}
									onClick={() =>
										updateCart(item?.item._id, item?.quantity - 1)
									}>
									-
								</button>

								<span className='font-medium'>{item?.quantity}</span>

								<button
									className='w-10 h-10 p-0'
									onClick={() =>
										updateCart(item?.item._id, item?.quantity + 1)
									}>
									+
								</button>
							</div>
						</div>

						<div className='text-right'>
							<p className='text-[#F86D72] font-semibold mb-2'>
								Всего: {(item?.price * item?.quantity).toFixed(0)} ₽
							</p>

							<button onClick={() => removeFromCart(item.item._id)}>
								Удалить
							</button>
						</div>
					</div>
				))}
			</div>

			{/* Форма адреса */}
			<div className='mt-8 bg-white border border-slate-200 rounded-xl p-6'>
				<h4 className='font-semibold mb-4'>Адрес доставки</h4>

				<div className='grid md:grid-cols-2 gap-4'>
					<div>
						<label className='block text-sm mb-1'>Город *</label>
						<input
							type='text'
							value={address.city}
							onChange={e => setAddress({ ...address, city: e.target.value })}
							className='w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#F86D72]'
							placeholder='Владивосток'
						/>
					</div>

					<div>
						<label className='block text-sm mb-1'>Region/Приморье *</label>
						<input
							type='text'
							value={address.region}
							onChange={e => setAddress({ ...address, region: e.target.value })}
							className='w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#F86D72]'
							placeholder='Приморский край'
						/>
					</div>

					<div className='md:col-span-2'>
						<label className='block text-sm mb-1'>Улица, дом *</label>
						<input
							type='text'
							value={address.street}
							onChange={e => setAddress({ ...address, street: e.target.value })}
							className='w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#F86D72]'
							placeholder='ул. Светланская, 45'
						/>
					</div>

					<div>
						<label className='block text-sm mb-1'>Почтовый индекс *</label>
						<input
							type='text'
							value={address.postalCode}
							onChange={e =>
								setAddress({ ...address, postalCode: e.target.value })
							}
							className='w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#F86D72]'
							placeholder='690000'
						/>
					</div>

					<div>
						<label className='block text-sm mb-1'>Телефон *</label>
						<input
							type='tel'
							value={address.phone}
							onChange={e => setAddress({ ...address, phone: e.target.value })}
							className='w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#F86D72]'
							placeholder='+7 (999) 000-00-00'
						/>
					</div>
				</div>
			</div>

			{/* Общая сумма и кнопка */}
			<div className='mt-8 flex justify-between items-center'>
				<div>
					<p className='text-lg font-semibold'>Общая сумма:</p>
					<p className='text-2xl font-bold text-[#F86D72]'>
						{totalAmount.toFixed(0)} ₽
					</p>
				</div>

				<button
					onClick={handleOrder}
					disabled={submitting}
					className='px-8 py-3 min-w-[180px] text-lg bg-[#F86D72] text-white rounded-lg hover:bg-[#F86D72] disabled:bg-gray-400'>
					{submitting ? "Оформление..." : "Заказать"}
				</button>
			</div>
		</div>
	)
}

export default CartPage
