import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../auth/AuthContext"

function AdminOrders() {
	const [orders, setOrders] = useState([])
	const [loading, setLoading] = useState(true)
	const { isAuthenticated, isAdmin, loading: authLoading } = useAuth()
	const navigate = useNavigate()

	useEffect(() => {
		if (authLoading) return
		if (!isAuthenticated || !isAdmin) {
			navigate("/admin", { replace: true })
			return
		}

		fetch("https://buba-backend.onrender.com/orders/all-orders", {
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
	}, [authLoading, isAuthenticated, isAdmin, navigate])

	const handleStatusChange = (orderId, newStatus) => {
		fetch(`https://buba-backend.onrender.com/orders/updateStatus/${orderId}`, {
			method: "PUT",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ status: newStatus }),
		})
			.then(res => res.json())
			.then(data => {
				if (data.success) {
					setOrders(
						orders.map(order =>
							order._id === orderId ? { ...order, status: newStatus } : order,
						),
					)
				} else {
					alert("Ошибка при обновлении статуса: " + data.message)
				}
			})
			.catch(err => {
				console.error("Ошибка:", err)
				alert("Не удалось обновить статус заказа")
			})
	}

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
		<div className='mt-10 max-w-6xl mx-auto px-6'>
			<h3 className='my-6 text-2xl font-semibold'>Все заказы пользователей</h3>

			{orders.length === 0 ? (
				<div className='bg-white border border-slate-200 rounded-xl p-8 text-center'>
					<p className='text-gray-500'>Заказов пока нет</p>
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
									<p className='text-sm font-medium mt-1'>
										Пользователь: {order.user?.name || order.user?.email}
									</p>
								</div>

								<select
									value={order.status}
									onChange={e => handleStatusChange(order._id, e.target.value)}
									className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)} border-none cursor-pointer`}>
									<option value='pending'>В обработке</option>
									<option value='processing'>Обрабатывается</option>
									<option value='shipped'>Отправлен</option>
									<option value='delivered'>Доставлен</option>
									<option value='cancelled'>Отменен</option>
								</select>
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

							{/* ← ОСНОВНОЕ ИСПРАВЛЕНИЕ: проверка address */}
							<div className='border-t border-slate-200 pt-4 mt-4 flex justify-between'>
								<div>
									<p className='text-sm text-gray-500 mb-1'>Адрес:</p>
									{order.address ? (
										<>
											<p className='font-medium'>{order.address.street}</p>
											<p className='text-sm'>
												{order.address.city}, {order.address.region}
											</p>
											<p className='text-sm'>{order.address.postalCode}</p>
											{order.address.phone && (
												<p className='text-sm'>{order.address.phone}</p>
											)}
										</>
									) : (
										<p className='text-sm text-gray-400'>Адрес не указан</p>
									)}
								</div>

								<div className='text-right'>
									<p className='text-sm text-gray-500 mb-1'>Общая сумма:</p>
									<p className='text-2xl font-bold text-[#F86D72]'>
										{order.totalAmount?.toFixed(0) || 0} ₽
									</p>
									<p className='text-sm text-gray-400'>
										{order.totalItems || 0} товаров
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

export default AdminOrders
