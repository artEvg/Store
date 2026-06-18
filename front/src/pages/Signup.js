import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../auth/AuthContext"

function Signup() {
	const [form, setForm] = useState({ email: "", password: "", name: "" })
	const [loading, setLoading] = useState(false)
	const [err, setErr] = useState("")
	const navigate = useNavigate()
	const { register } = useAuth()

	const onSubmit = async e => {
		e.preventDefault()
		setErr("")
		setLoading(true)

		try {
			const result = await register(form)

			if (!result.success) {
				throw new Error(result.error || "Ошибка регистрации")
			}

			navigate("/", { replace: true })
		} catch (error) {
			setErr(error.message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='max-w-md mx-auto py-10 mt-40'>
			<h1 className='text-2xl font-bold mb-6'>Регистрация</h1>
			<form
				onSubmit={onSubmit}
				className='space-y-4'>
				<input
					className='w-full border p-2 rounded'
					placeholder='Имя'
					value={form.name}
					onChange={e => setForm(s => ({ ...s, name: e.target.value }))}
				/>
				<input
					className='w-full border p-2 rounded'
					placeholder='Почта'
					value={form.email}
					onChange={e => setForm(s => ({ ...s, email: e.target.value }))}
				/>
				<input
					className='w-full border p-2 rounded'
					placeholder='Пароль'
					type='password'
					value={form.password}
					onChange={e => setForm(s => ({ ...s, password: e.target.value }))}
				/>
				{err && <p className='text-red-500 text-sm'>{err}</p>}
				<button
					disabled={loading}
					className='bg-[#F86D72] text-white px-4 py-2 rounded w-full'>
					{loading ? "..." : "Создать аккаунт"}
				</button>
			</form>
		</div>
	)
}

export default Signup
