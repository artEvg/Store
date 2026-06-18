import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../auth/AuthContext"

function ProfileOrders() {
	const [orders, setOrders] = useState([])
	const [loading, setLoading] = useState(true)
	const { isAuthenticated, isAdmin, loading: authLoading } = useAuth()
	const navigate = useNavigate()

	useEffect(() => {
		if (authLoading) return
		if (!isAuthenticated) {
			navigate("/", { replace: true })
			return
		}

		fetch("https://buba-backend.onrender.com/orders/my-orders", {
			credentials: "include",
		})
			.then(res => res.json())
			.then(data => {
				if (data.success) {
					setOrders(data.orders)
				}
				setLoading(false)
			})
			.catch(err => {
				console.error("Ошибка при получении заказов:", err)
				setLoading(false)
			})
	}, [authLoading, isAuthenticated, navigate])

	const getStatusColor = status => {
		const colors = {
			pending: "bg-yellow-100 text-yellow-700",
			processing: "bg-blue-100 text-blue-700",
			shipped: "bg-purple-100 text-purple-700",
			delivered: "bg-green-100 text-green-700",
			cancelled: "bg-red-100 text-red-700",
		}
		return colors[status] || colors.pending
	}

	const getStatusText = status => {
		const texts = {
			pending: "В обработке",
			processing: "Обрабатывается",
			shipped: "Отправлен",
			delivered: "Доставлен",
			cancelled: "Отменен",
		}
		return texts[status] || status
	}

	if (authLoading || loading)
		return (
			<div className='flex justify-center items-center mt-44'>
				<div className='w-10 h-10 border-4 border-[#F86D72] border-t-transparent rounded-full animate-spin'></div>
			</div>
		)

	return (
		<div className='mt-20 max-w-6xl mx-auto px-6'>
			<h3 className='my-6 text-2xl font-semibold'>Мои заказы</h3>

			{orders.length === 0 ? (
				<div className='bg-white border border-slate-200 rounded-xl p-8 text-center'>
					<p className='text-gray-500'>У вас пока нет заказов</p>
					<button
						onClick={() => navigate("/")}
						className='mt-4 px-6 py-2 bg-[#F86D72] text-white rounded-lg hover:bg-[#F86D72]'>
						Перейти к товарам
					</button>
				</div>
			) : (
				<div className='space-y-6'>
					{orders.map(order => (
						<div
							key={order._id}
							className='bg-white border border-slate-200 rounded-xl p-6'>
							<div className='flex justify-between items-start mb-4'>
								<div>
									<p className='text-sm text-gray-500'>
										Заказ #{order._id.slice(-6)}
									</p>
									<p className='text-sm text-gray-400'>
										{new Date(order.createdAt).toLocaleDateString("ru-RU")}
									</p>
								</div>

								<span
									className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
									{getStatusText(order.status)}
								</span>
							</div>

							<div className='border-t border-slate-200 pt-4'>
								<h4 className='font-semibold mb-3'>Товары:</h4>
								<div className='space-y-2'>
									{order.items.map((item, idx) => (
										<div
											key={idx}
											className='flex items-center gap-4'>
											<img
												src={`https://buba-backend.onrender.com/images/${item?.item?.coverImage}`}
												className='w-16 h-20 object-cover rounded'
												alt={item?.item?.title}
											/>
											<div className='flex-1'>
												<p className='font-medium'>{item?.item?.title}</p>
												{item.size && (
													<p className='text-sm text-gray-400'>
														Размер: {item.size}
													</p>
												)}
												<p className='text-sm text-gray-500'>
													{item.quantity} × {item.price.toFixed(0)} ₽
												</p>
											</div>
											<p className='text-[#F86D72] font-semibold'>
												{(item.price * item.quantity).toFixed(0)} ₽
											</p>
										</div>
									))}
								</div>
							</div>

							<div className='border-t border-slate-200 pt-4 mt-4'>
								<div className='grid md:grid-cols-2 gap-4'>
									<div>
										<p className='text-sm text-gray-500 mb-1'>
											Адрес доставки:
										</p>
										<p className='font-medium'>{order.address.street}</p>
										<p className='text-sm'>
											{order.address.city}, {order.address.region}
										</p>
										<p className='text-sm'>{order.address.postalCode}</p>
										<p className='text-sm'>{order.address.phone}</p>
									</div>

									<div className='text-right'>
										<p className='text-sm text-gray-500 mb-1'>Общая сумма:</p>
										<p className='text-2xl font-bold text-[#F86D72]'>
											{order.totalAmount.toFixed(0)} ₽
										</p>
										<p className='text-sm text-gray-400'>
											{order.totalItems} товаров
										</p>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

export default ProfileOrders
