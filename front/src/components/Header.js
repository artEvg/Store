import React from "react"
import { useAuth } from "../auth/AuthContext"
import { useNavigate, Link } from "react-router-dom"
import { ShoppingBasket, Menu, X } from "lucide-react"
import { useCart } from "../auth/CartContext"

function Header() {
	const { logout, isAuthenticated, isAdmin } = useAuth()
	const { cart } = useCart()
	const navigate = useNavigate()

	const [isScrolled, setIsScrolled] = React.useState(false)
	const [isMenuOpen, setIsMenuOpen] = React.useState(false)

	const navLinks = [
		{ name: "Главная", path: "/" },
		{ name: "Контакты", path: "/contacts" },
		{ name: "О нас", path: "/about" },
	]

	React.useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10)
		}

		window.addEventListener("scroll", handleScroll)
		return () => window.removeEventListener("scroll", handleScroll)
	}, [])

	const handleLogout = async () => {
		await logout()
		navigate("/")
	}

	const renderUserActions = () => {
		if (!isAuthenticated) {
			return (
				<div className='hidden md:flex items-center gap-3'>
					<button
						onClick={() => navigate("/login")}
						className='px-4 py-2 whitespace-nowrap'>
						Вход
					</button>
					<button
						onClick={() => navigate("/signup")}
						className='px-4 py-2 whitespace-nowrap'>
						Регистрация
					</button>
				</div>
			)
		}

		return (
			<div className='hidden md:flex items-center gap-4'>
				{isAdmin ? (
					<button
						onClick={() => navigate("/admin")}
						className='w-auto px-4 whitespace-nowrap'>
						Панель Админа
					</button>
				) : (
					<Link
						to='/cart'
						className='relative'>
						{cart?.totalItems > 0 && (
							<div className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center'>
								{cart.totalItems}
							</div>
						)}
						<ShoppingBasket size={24} />
					</Link>
				)}

				<button
					onClick={handleLogout}
					className='whitespace-nowrap'>
					Выход
				</button>
			</div>
		)
	}

	return (
		<nav
			className={`fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 md:px-10 lg:px-16 transition-all duration-300 ${
				isScrolled ? "bg-white shadow-md py-2" : "bg-white py-3"
			} border-b border-gray-200`}>
			<Link
				to='/'
				className='flex items-center shrink-0'>
				<h3 className='text-3xl font-extrabold text-[#F86D72] tracking-wider uppercase m-0 before:hidden'>
					BUBA
				</h3>
			</Link>

			<div className='hidden md:flex items-center gap-8'>
				{navLinks.map(link => (
					<Link
						key={link.name}
						to={link.path}
						className='text-gray-700 hover:text-[#F86D72] transition'>
						{link.name}
					</Link>
				))}

				{/* ← УДАЛЕНО: кнопка "Заказы" для админа */}
				{isAuthenticated && !isAdmin && (
					<Link
						to='/orders'
						className='text-gray-700 hover:text-[#F86D72] transition'>
						Заказы
					</Link>
				)}
			</div>

			{/* Правая часть: userActions + бургер, прижатая вправо */}
			<div className='ml-auto flex items-center gap-2'>
				{renderUserActions()}

				<button
					className='md:hidden items-end !bg-transparent !text-black !p-0'
					onClick={() => setIsMenuOpen(true)}>
					<Menu
						className='items-end'
						size={28}
					/>
				</button>
			</div>

			<div
				className={`
          fixed top-0 left-0 w-full h-screen bg-white flex flex-col items-center justify-center gap-6
          transition-all duration-300
          ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
				<button
					className='absolute items-end top-5 right-0 !bg-transparent !text-black !p-0'
					onClick={() => setIsMenuOpen(false)}>
					<X
						className='items-end'
						size={28}
					/>
				</button>

				{navLinks.map(link => (
					<Link
						key={link.name}
						to={link.path}
						onClick={() => setIsMenuOpen(false)}
						className='text-lg'>
						{link.name}
					</Link>
				))}

				{/* ← УДАЛЕНО: кнопка "Заказы" для админа в мобильном меню */}
				{isAuthenticated && !isAdmin && (
					<Link
						to='/orders'
						onClick={() => setIsMenuOpen(false)}
						className='text-lg'>
						Заказы
					</Link>
				)}

				{!isAuthenticated ? (
					<>
						<button
							onClick={() => {
								navigate("/login")
								setIsMenuOpen(false)
							}}>
							Вход
						</button>

						<button
							onClick={() => {
								navigate("/signup")
								setIsMenuOpen(false)
							}}>
							Регистрация
						</button>
					</>
				) : (
					<>
						{isAdmin ? (
							<button
								onClick={() => {
									navigate("/admin")
									setIsMenuOpen(false)
								}}>
								Панель Админа
							</button>
						) : (
							<Link
								to='/cart'
								onClick={() => setIsMenuOpen(false)}
								className='relative flex items-center gap-2'>
								{cart?.totalItems > 0 && (
									<div className='absolute -top-8 -right-8 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center'>
										{cart.totalItems}
									</div>
								)}
								<ShoppingBasket size={28} />
								<span>Корзина</span>
							</Link>
						)}

						<button
							onClick={() => {
								handleLogout()
								setIsMenuOpen(false)
							}}>
							Выход
						</button>
					</>
				)}
			</div>
		</nav>
	)
}

export default Header
