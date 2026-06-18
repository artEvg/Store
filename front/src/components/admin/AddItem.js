import React, { useEffect, useState } from "react"
import { useAuth } from "../../auth/AuthContext"
import { useNavigate } from "react-router-dom"

function AddItem() {
	const [categories, setCategories] = useState([])
	const [loadingCats, setLoadingCats] = useState(true)
	const [msg, setMsg] = useState(null)
	const [submitting, setSubmitting] = useState(false)
	const { isAuthenticated, isAdmin, user, loading } = useAuth()
	const [preview, setPreview] = useState(null)
	const [additionalPreview, setAdditionalPreview] = useState([])
	const navigate = useNavigate()

	const [form, setForm] = useState({
		title: "",
		author: "",
		description: "",
		price: "",
		stock: "",
		category: "",
		discountPercent: "",
		isFeautred: false,
		isOnSale: false,
		discountPercent: false,
		coverImage: null,
		additionalImages: [],
		sizes: "",
	})

	useEffect(() => {
		if (loading) return
		if (!isAuthenticated || !isAdmin) {
			navigate("/", { replace: true })
			return
		}
		const loadCats = async () => {
			try {
				const res = await fetch(
					"https://buba-backend.onrender.com/category/getCategories",
					{
						method: "GET",
						credentials: "include",
					},
				)
				const data = await res.json()
				setCategories(Array.isArray(data) ? data : data?.categories || [])
			} catch (error) {
				console.error("Failed to load categories:", error)
			} finally {
				setLoadingCats(false)
			}
		}

		loadCats()
	}, [loading, isAuthenticated, isAdmin, navigate])

	const onChange = e => {
		const { name, type, value, checked, files } = e.target

		if (type == "file") {
			if (name === "additionalImages") {
				const newFiles = files || []
				const newPreviews = Array.from(newFiles).map(file =>
					URL.createObjectURL(file),
				)

				setForm(p => ({
					...p,
					additionalImages: [...p.additionalImages, ...newFiles],
				}))
				setAdditionalPreview([...additionalPreview, ...newPreviews])
			} else {
				const file = files?.[0] || null
				setForm(p => ({ ...p, [name]: file }))
				setPreview(file ? URL.createObjectURL(file) : null)
			}
			return
		}

		if (type == "checkbox") {
			setForm(p => ({ ...p, [name]: checked }))
			return
		}

		setForm(p => ({ ...p, [name]: value }))
	}

	const removeAdditionalImage = index => {
		setForm(p => ({
			...p,
			additionalImages: p.additionalImages.filter((_, i) => i !== index),
		}))
		setAdditionalPreview(additionalPreview.filter((_, i) => i !== index))
	}

	const onSubmit = async e => {
		e.preventDefault()
		setMsg(null)

		if (!isAuthenticated || !isAdmin) {
			navigate("/", { replace: true })
			return
		}

		if (
			!form.title ||
			!form.author ||
			!form.description ||
			!form.price ||
			!form.stock
		) {
			setMsg(
				"❌ All fields (title, author, description, price, stock) are required.",
			)
			return
		}

		const fd = new FormData()
		fd.append("title", form.title)
		fd.append("author", form.author)
		fd.append("description", form.description)
		fd.append("price", String(form.price))
		fd.append("stock", String(form.stock))
		fd.append("discountPercent", String(form.discountPercent))
		if (form.category) fd.append("category", form.category)

		fd.append("isFeautred", String(form.isFeautred))
		fd.append("isOnSale", String(form.isOnSale))
		if (form.sizes) fd.append("sizes", form.sizes)

		if (form.coverImage) fd.append("coverImage", form.coverImage)

		// Добавляем все дополнительные изображения
		form.additionalImages.forEach((file, index) => {
			fd.append("additionalImages", file)
		})

		try {
			setSubmitting(true)
			const res = await fetch(
				"https://buba-backend.onrender.com/admin/createItem",
				{
					method: "POST",
					credentials: "include",
					body: fd,
				},
			)
			const data = await res.json().catch(() => ({}))

			if (res.status === 401 || res.status === 403) {
				setMsg("❌ Not authorized")
				navigate("/", { replace: true })
				return
			}

			if (!res.ok) {
				throw new Error(data?.error || "Ошибка при создании товара")
			}
			setMsg("Товар успешно добавлен")

			setForm({
				title: "",
				author: "",
				description: "",
				price: "",
				stock: "",
				category: "",
				discountPercent: "",
				isFeautred: false,
				isOnSale: false,
				coverImage: null,
				additionalImages: [],
				sizes: "",
			})

			setPreview(null)
			setAdditionalPreview([])
		} catch (err) {
			setMsg("❌", err.message)
		} finally {
			setSubmitting(false)
		}
	}

	if (loading) return null
	if (!isAuthenticated || !isAdmin) return null

	return (
		<div className='max-w-3xl mx-auto'>
			<h2 className='text-xl font-semibold mb-4'>Добавить Товар</h2>

			<form
				onSubmit={onSubmit}
				className='bg-white border border-slate-200 rounded-xl p-5 space-y-4'>
				<div className='grid md:grid-cols-2 gap-4'>
					<div>
						<label className='block text-sm mb-1'>Название *</label>
						<input
							name='title'
							value={form.title}
							onChange={onChange}
							className='w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300'
							placeholder='Название товара'
							required
						/>
					</div>

					<div>
						<label className='block text-sm mb-1'>Производитель *</label>
						<input
							name='author'
							value={form.author}
							onChange={onChange}
							className='w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300'
							placeholder='Название производителя'
							required
						/>
					</div>

					<div>
						<label className='block text-sm mb-1'>Цена *</label>
						<input
							type='number'
							name='price'
							min='0'
							step='0.01'
							value={form.price}
							onChange={onChange}
							className='w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300'
							placeholder='...'
							required
						/>
					</div>

					<div>
						<label className='block text-sm mb-1'>Остаток *</label>
						<input
							type='number'
							name='stock'
							min='0'
							step='1'
							value={form.stock}
							onChange={onChange}
							className='w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300'
							placeholder='...'
							required
						/>
					</div>

					<div className='md:col-span-2'>
						<label className='block text-sm mb-1'>Описание *</label>
						<textarea
							name='description'
							value={form.description}
							onChange={onChange}
							rows={4}
							className='w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300'
							placeholder='Напишите небольшое описание...'
							required
						/>
					</div>

					<div>
						<label className='block text-sm mb-1'>Категория</label>
						<select
							name='category'
							value={form.category}
							onChange={onChange}
							disabled={loadingCats}
							className='w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300 bg-white'>
							<option value=''>
								{loadingCats ? "Загрузка..." : "Выберите категорию"}
							</option>
							{categories?.map(c => (
								<option
									key={c._id}
									value={c._id}>
									{c.name}
								</option>
							))}
						</select>
					</div>

					<div>
						<label className='block text-sm mb-1'>
							Размеры (для одежды/обуви)
						</label>
						<input
							type='text'
							name='sizes'
							value={form.sizes}
							onChange={onChange}
							className='w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300'
							placeholder='S,M,L,XL или 36,37,38,39 (через запятую)'
						/>
						<p className='text-xs text-slate-500 mt-1'>
							Введите размеры через запятую
						</p>
					</div>

					<div>
						<label className='block text-sm mb-1'>Скидка</label>
						<input
							type='number'
							name='discountPercent'
							min='0'
							max='100'
							step='1'
							value={form.discountPercent}
							onChange={onChange}
							className='w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300'
							placeholder='...'
						/>
					</div>

					<div className='flex items-center gap-6 md:col-span-2'>
						<label className='inline-flex items-center gap-2'>
							<input
								type='checkbox'
								name='isFeautred'
								checked={form.isFeautred}
								onChange={onChange}
								className='h-4 w-4 rounded border-slate-300'
							/>
							<span className='text-sm'>Рекомендуемое</span>
						</label>

						<label className='inline-flex items-center gap-2'>
							<input
								type='checkbox'
								name='discountPercent'
								checked={form.discountPercent}
								onChange={onChange}
								className='h-4 w-4 rounded border-slate-300'
							/>
							<span className='text-sm'>Процент скидки</span>
						</label>

						<label className='inline-flex items-center gap-2'>
							<input
								type='checkbox'
								name='isOnSale'
								checked={form.isOnSale}
								onChange={onChange}
								className='h-4 w-4 rounded border-slate-300'
							/>
							<span className='text-sm'>В продаже</span>
						</label>
					</div>

					<div className='md:col-span-2'>
						<label className='block text-sm mb-1'>Главное изображение *</label>
						<input
							type='file'
							name='coverImage'
							accept='image/*'
							onChange={onChange}
							className='block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200'
							required
						/>

						{/* Preview главного изображения */}
						{preview && (
							<div className='mt-3'>
								<p className='text-sm text-slate-500 mb-1'>
									Просмотр главного фото:
								</p>
								<img
									src={preview}
									alt='preview'
									className='h-40 w-40 object-cover rounded-lg border border-slate-200'
								/>
							</div>
						)}
					</div>

					<div className='md:col-span-2'>
						<label className='block text-sm mb-1'>
							Дополнительные изображения (необязательно)
						</label>
						<input
							type='file'
							name='additionalImages'
							accept='image/*'
							multiple
							onChange={onChange}
							className='block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200'
						/>
						<p className='text-xs text-slate-500 mt-1'>
							Можно выбрать несколько файлов одновременно
						</p>

						{/* Preview дополнительных изображений */}
						{additionalPreview.length > 0 && (
							<div className='mt-3'>
								<p className='text-sm text-slate-500 mb-1'>
									Дополнительные фото ({additionalPreview.length}):
								</p>
								<div className='grid grid-cols-4 gap-2'>
									{additionalPreview.map((img, idx) => (
										<div
											key={idx}
											className='relative'>
											<img
												src={img}
												alt={`additional-${idx}`}
												className='h-20 w-20 object-cover rounded-lg border border-slate-200'
											/>
											<button
												type='button'
												onClick={() => removeAdditionalImage(idx)}
												className='absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600'>
												×
											</button>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>

				<button
					type='submit'
					disabled={submitting}
					className='inline-flex items-center whitespace-nowrap justify-center rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-60'>
					{submitting ? "Заполнение..." : "Создать Товар"}
				</button>

				{msg && <p className='text-sm mt-2'>{msg}</p>}
			</form>
		</div>
	)
}

export default AddItem
