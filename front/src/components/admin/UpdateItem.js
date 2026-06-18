import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

function UpdateItem() {
	const { id } = useParams()
	const navigate = useNavigate()
	const [item, setItem] = useState(null)
	const [loading, setLoading] = useState(true)
	const [submitting, setSubmitting] = useState(false)

	useEffect(() => {
		fetch(`https://buba-backend.onrender.com/items/${id}`)
			.then(res => res.json())
			.then(data => {
				setItem({
					...data,
					sizes: data.sizes || [],
					isOnSale: data.isOnSale || false,
					discountPercent: data.discountPercent || 0,
				})
				setLoading(false)
			})
			.catch(err => {
				console.error("Error fetching item:", err)
				setLoading(false)
			})
	}, [id])

	const handleChange = e => {
		const { name, value, type, checked } = e.target
		setItem(prev => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}))
	}

	const handleFileChange = e => {
		const { name } = e.target
		const file = e.target.files[0]
		if (file) {
			setItem(prev => ({ ...prev, [name]: file }))
		}
	}

	const handleUpdate = async () => {
		if (
			!item.title ||
			!item.author ||
			!item.description ||
			!item.price ||
			!item.stock
		) {
			alert("Все основные поля должны быть заполнены")
			return
		}

		setSubmitting(true)

		try {
			const formData = new FormData()
			formData.append("title", item.title)
			formData.append("author", item.author)
			formData.append("description", item.description)
			formData.append("price", item.price)
			formData.append("stock", item.stock)
			formData.append("isOnSale", item.isOnSale)
			formData.append("discountPercent", item.discountPercent)
			formData.append("category", item.category?._id || item.category)
			if (item.sizes) formData.append("sizes", item.sizes.join(","))

			if (item.coverImage && item.coverImage instanceof File) {
				formData.append("coverImage", item.coverImage)
			}
			if (item.additionalImages && item.additionalImages[0] instanceof File) {
				for (const img of item.additionalImages) {
					if (img instanceof File) formData.append("additionalImages", img)
				}
			}

			const res = await fetch(
				`https://buba-backend.onrender.com/items/updateItem/${id}`,
				{
					method: "PUT",
					credentials: "include",
					body: formData,
				},
			)

			const data = await res.json()
			alert(data.message || data.error)
			if (res.ok) navigate("/admin")
		} catch (error) {
			console.error("Ошибка в обновление товара:", error)
			alert("Ошибка при обновлении товара")
		} finally {
			setSubmitting(false)
		}
	}

	const handleDelete = async () => {
		if (!window.confirm("Вы действительно хотите удалить товар?")) return

		try {
			const res = await fetch(
				`https://buba-backend.onrender.com/items/deleteItem/${id}`,
				{
					method: "DELETE",
					credentials: "include",
				},
			)

			const data = await res.json()
			alert(data.message)
			navigate("/admin")
		} catch (error) {
			console.error("Error deleting item:", error)
			alert("Ошибка при удалении товара")
		}
	}

	if (loading) return <p className='mt-44'>Загрузка...</p>
	if (!item) return <p className='mt-44'>Товар не найден</p>

	return (
		<div className='max-w-2xl mx-auto mt-10 p-6 bg-white shadow rounded'>
			<h3 className='mb-5 text-2xl font-semibold'>Обновление товара</h3>

			<input
				className='border p-2 w-full mb-3'
				type='text'
				name='title'
				value={item.title || ""}
				onChange={handleChange}
				placeholder='Название'
			/>

			<input
				className='border p-2 w-full mb-3'
				type='text'
				name='author'
				value={item.author || ""}
				onChange={handleChange}
				placeholder='Производитель'
			/>

			<textarea
				className='border p-2 w-full mb-3'
				name='description'
				value={item.description || ""}
				onChange={handleChange}
				placeholder='Описание'
				rows={4}
			/>

			<div className='grid grid-cols-2 gap-3 mb-3'>
				<input
					className='border p-2'
					type='number'
					name='price'
					value={item.price || ""}
					onChange={handleChange}
					placeholder='Цена'
				/>

				<input
					className='border p-2'
					type='number'
					name='stock'
					value={item.stock || ""}
					onChange={handleChange}
					placeholder='Остаток'
				/>
			</div>

			<div className='mb-3'>
				<label className='block text-sm text-gray-600 mb-1'>Категория:</label>
				<input
					className='border p-2 w-full'
					type='text'
					name='category'
					value={item.category?.name || item.category || ""}
					onChange={handleChange}
					placeholder='Категория'
				/>
			</div>

			<div className='mb-3'>
				<label className='block text-sm text-gray-600 mb-1'>
					Размеры (через запятую):
				</label>
				<input
					className='border p-2 w-full'
					type='text'
					name='sizes'
					value={item.sizes?.join(",") || ""}
					onChange={e =>
						setItem(prev => ({ ...prev, sizes: e.target.value.split(",") }))
					}
					placeholder='S, M, L, XL'
				/>
			</div>

			<label className='flex items-center gap-2 mb-3'>
				<input
					type='checkbox'
					name='isOnSale'
					checked={item.isOnSale || false}
					onChange={handleChange}
				/>
				<span>В продаже</span>
			</label>

			{item.isOnSale && (
				<input
					className='border p-2 w-full mb-3'
					type='number'
					name='discountPercent'
					value={item.discountPercent || 0}
					onChange={handleChange}
					placeholder='Процент скидки (0-100)'
					min={0}
					max={100}
				/>
			)}

			<div className='mb-3'>
				<label className='block text-sm text-gray-600 mb-1'>
					Главное фото:
				</label>
				{item.coverImage && typeof item.coverImage === "string" && (
					<img
						src={`https://buba-backend.onrender.com/images/${item.coverImage}`}
						alt='Current cover'
						className='w-32 h-40 object-cover rounded mb-2'
					/>
				)}
				<input
					type='file'
					name='coverImage'
					onChange={handleFileChange}
					accept='image/*'
				/>
			</div>

			<div className='mb-3'>
				<label className='block text-sm text-gray-600 mb-1'>
					Дополнительные фото:
				</label>
				<div className='flex gap-2 mb-2'>
					{item.additionalImages &&
						item.additionalImages
							.filter(img => typeof img === "string")
							.map((img, idx) => (
								<img
									key={idx}
									src={`https://buba-backend.onrender.com/images/${img}`}
									alt={`Additional ${idx}`}
									className='w-20 h-24 object-cover rounded'
								/>
							))}
				</div>
				<input
					type='file'
					name='additionalImages'
					onChange={handleFileChange}
					accept='image/*'
					multiple
				/>
			</div>

			<div className='flex justify-between mt-4'>
				<button
					onClick={handleUpdate}
					disabled={submitting}
					className='px-6 py-2 bg-[#F86D72] text-white rounded disabled:bg-gray-400'>
					{submitting ? "Обновление..." : "Обновить"}
				</button>

				<button
					className='px-6 py-2 bg-red-600 text-white rounded'
					onClick={handleDelete}>
					Удалить
				</button>
			</div>
		</div>
	)
}

export default UpdateItem
