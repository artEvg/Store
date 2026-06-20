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
					<div className='fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md'>
						<div className='bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg font-medium text-center'>
							✅ Заказ успешно оформлен
						</div>
					</div>
				)}

				<div className='min-h-screen flex items-center justify-center mt-24 px-4'>
					<p className='text-gray-500 text-base'>🛒 Ваша корзина пуста</p>
				</div>
			</>
		)
	}

	const totalAmount = cart.items.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0,
	)

	return (
		<div className='mt-20 min-h-screen px-4 py-6 max-w-6xl mx-auto'>
			<h3 className='my-4 text-xl'>Корзина</h3>

			{showSuccess && (
				<div className='fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md'>
					<div className='bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg font-medium text-center'>
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
						className='flex flex-col md:flex-row items-stretch gap-4 border rounded-lg p-3 md:p-4 shadow-sm bg-white'>
						<div className='w-full md:w-24 aspect-square overflow-hidden rounded'>
							<img
								src={`https://buba-backend.onrender.com/images/${item?.item?.coverImage}`}
								className='w-full h-full object-cover'
								alt={item?.item?.title}
							/>
						</div>

						<div className='flex-1 w-full'>
							<h2 className='font-semibold text-base'>{item?.item?.title}</h2>
							<p className='text-gray-500 text-sm'>{item?.item?.author}</p>

							{item.size && (
								<p className='text-sm text-gray-400'>Размер: {item.size}</p>
							)}

							<p className='text-[#F86D72] font-bold'>
								{item?.item?.price.toFixed(0)} ₽
							</p>

							<div className='flex items-center gap-2 mt-2'>
								<button
									className='w-9 h-9 md:w-10 md:h-10 p-0 disabled:opacity-50 flex items-center justify-center'
									disabled={item?.quantity <= 1}
									onClick={() =>
										updateCart(item?.item._id, item?.quantity - 1)
									}>
									-
								</button>

								<span className='font-medium'>{item?.quantity}</span>

								<button
									className='w-9 h-9 md:w-10 md:h-10 p-0 flex items-center justify-center'
									onClick={() =>
										updateCart(item?.item._id, item?.quantity + 1)
									}>
									+
								</button>
							</div>
						</div>

						<div className='text-right w-full md:w-auto'>
							<p className='text-[#F86D72] font-semibold mb-2'>
								Всего: {(item?.price * item?.quantity).toFixed(0)} ₽
							</p>

							<button
								onClick={() => removeFromCart(item.item._id)}
								className='text-sm'>
								Удалить
							</button>
						</div>
					</div>
				))}
			</div>

			{/* Форма адреса */}
			<div className='mt-6 bg-white border border-slate-200 rounded-xl p-4 md:p-6'>
				<h4 className='font-semibold mb-4'>Адрес доставки</h4>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
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
			<div className='mt-6 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4'>
				<div>
					<p className='text-base font-semibold'>Общая сумма:</p>
					<p className='text-xl md:text-2xl font-bold text-[#F86D72]'>
						{totalAmount.toFixed(0)} ₽
					</p>
				</div>

				<button
					onClick={handleOrder}
					disabled={submitting}
					className='w-full md:w-auto px-6 py-3 text-lg bg-[#F86D72] text-white rounded-lg hover:bg-[#F86D72] disabled:bg-gray-400'>
					{submitting ? "Оформление..." : "Заказать"}
				</button>
			</div>
		</div>
	)
}

export default CartPage
