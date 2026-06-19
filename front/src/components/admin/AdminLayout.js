import React, { useState } from "react"
import { NavLink, Outlet } from "react-router-dom"
import {
	Menu,
	X,
	BookOpen,
	PlusCircle,
	Home,
	ClipboardList,
} from "lucide-react"

function AdminLayout() {
	const [open, setOpen] = useState(false)

	return (
		<div className='min-h-screen bg-slate-50 text-slate-900'>
			<header className='sticky top-0 z-30 shadow-lg h-14 bg-slate-900 flex items-center justify-between px-4'>
				<div className='flex items-center gap-2'>
					<button
						className='md:hidden inline-flex items-center justify-center !bg-transparent !border-none !text-white rounded-md p-2'
						aria-label='Open menu'
						onClick={() => setOpen(true)}>
						<Menu className='h-5 w-5' />
					</button>
					<h4 className='font-bold text-white'>Панель Администратора</h4>
				</div>

				<nav className='hidden md:flex items-center gap-4'>
					<NavLink
						to='/admin'
						className='flex items-center gap-2 text-slate-300 hover:text-white transition-colors'>
						<BookOpen className='h-4 w-4' />
						<span>Все товары</span>
					</NavLink>

					<NavLink
						to='/admin/add-item'
						className='flex items-center gap-2 text-slate-300 hover:text-white transition-colors'>
						<PlusCircle className='h-4 w-4' />
						<span>Добавить товар</span>
					</NavLink>

					<NavLink
						to='/admin/orders'
						className='flex items-center gap-2 text-slate-300 hover:text-white transition-colors'>
						<ClipboardList className='h-4 w-4' />
						<span>Заказы</span>
					</NavLink>

					<NavLink
						to='/'
						className='flex items-center gap-2 text-slate-300 hover:text-white transition-colors'>
						<Home className='h-4 w-4' />
						<span>На главную</span>
					</NavLink>
				</nav>

				{/* ← УДАЛЕНО: вторая кнопка меню (дубликат) */}
			</header>

			<div
				className={`fixed inset-0 z-50 flex flex-col bg-slate-900 text-slate-100 transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
				<div
					className={`absolute inset-0 bg-black opacity-50 transition-opacity ${open ? "opacity-50" : "opacity-0"}`}
					onClick={() => setOpen(false)}
				/>

				<div
					className={`relative flex flex-col h-full p-4 space-y-2 transition-transform duration-300 transform ${open ? "translate-x-0" : "-translate-x-full"}`}>
					<button
						className='absolute right-4 top-4 text-white p-2 hover:bg-slate-800 rounded-md'
						onClick={() => setOpen(false)}
						aria-label='Close menu'>
						<X className='h-5 w-5' />
					</button>

					<div className='flex flex-col space-y-2 mt-2 pt-12'>
						<NavLink
							to='/admin'
							onClick={() => setOpen(false)}
							className='flex items-center gap-3 hover:bg-slate-800 p-2 rounded-md transition-colors'>
							<BookOpen className='h-4 w-4' />
							<span>Все товары</span>
						</NavLink>

						<NavLink
							to='/admin/add-item'
							onClick={() => setOpen(false)}
							className='flex items-center gap-3 hover:bg-slate-800 p-2 rounded-md transition-colors'>
							<PlusCircle className='h-4 w-4' />
							<span>Добавить товар</span>
						</NavLink>

						<NavLink
							to='/admin/orders'
							onClick={() => setOpen(false)}
							className='flex items-center gap-3 hover:bg-slate-800 p-2 rounded-md transition-colors'>
							<ClipboardList className='h-4 w-4' />
							<span>Заказы</span>
						</NavLink>

						<NavLink
							to='/'
							onClick={() => setOpen(false)}
							className='flex items-center gap-3 hover:bg-slate-800 p-2 rounded-md transition-colors'>
							<Home className='h-4 w-4' />
							<span>На главную</span>
						</NavLink>
					</div>
				</div>
			</div>

			<main className='w-full p-4 md:p-6'>
				<div className='mx-auto max-w-6xl'>
					<Outlet />
				</div>
			</main>
		</div>
	)
}

export default AdminLayout
