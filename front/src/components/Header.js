import React from "react"
import { useAuth } from "../auth/AuthContext"
import { useNavigate, Link } from "react-router-dom"
import { ShoppingBasket, Menu, X } from "lucide-react"
import { useCart } from "../auth/CartContext"

function Header() {
	const { user, logout, isAuthenticated, isAdmin, refreshAuth } = useAuth()
	const { cart } = useCart()

	const navigate = useNavigate()

	const [isScrolled, setIsScrolled] = React.useState(false)
	const [isMenuOpen, setIsMenuOpen] = React.useState(false)
	const [authKey, setAuthKey] = React.useState(0)

	const navLinks = [
		{ name: "Главная", path: "/" },
		{ name: "Товары", path: "/catalog" },
		{ name: "Контакты", path: "/contacts" },
		{ name: "О нас", path: "/about" },
		{ name: "Заказы", path: "/orders" },
	]

	React.useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10)
		}

		window.addEventListener("scroll", handleScroll)

		return () => {
			window.removeEventListener("scroll", handleScroll)
		}
	}, [])

	React.useEffect(() => {
		// Слушаем изменения в auth через sessionStorage событие
		const handleStorageChange = e => {
			if (e.key === "auth_token" || e.key === "user") {
				setAuthKey(k => k + 1)
			}
		}

		window.addEventListener("storage", handleStorageChange)

		// Также проверяем на каждую перерисовку
		const checkAuth = () => {
			const token = sessionStorage.getItem("auth_token")
			const storedUser = sessionStorage.getItem("user")

			if (token && storedUser && !isAuthenticated) {
				setAuthKey(k => k + 1)
				if (refreshAuth) refreshAuth()
			}
		}

		checkAuth()

		return () => {
			window.removeEventListener("storage", handleStorageChange)
		}
	}, [isAuthenticated, refreshAuth])

	const handleLogout = async () => {
		await logout()
		setAuthKey(k => k + 1)
		navigate("/")
	}

	React.useEffect(() => {
		const needReload = sessionStorage.getItem("needHeaderReload")

		if (needReload === "true") {
			sessionStorage.removeItem("needHeaderReload")
			window.location.reload()
		}
	}, [])

	const renderUserActions = () => {
		if (!isAuthenticated) {
			return (
				<div className='hidden md:flex items-center gap-3'>
					<button
						onClick={() => navigate("/login")}
						className='px-4 py-2 whitespace-nowrap'>
						Вход{" "}
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
			key={authKey}
			className={`            
        fixed top-0 left-0 w-full z-50
        flex items-center justify-between
        px-4 md:px-10 lg:px-16
        transition-all duration-300
        ${isScrolled ? "bg-white shadow-md py-2" : "bg-white py-3"}
        border-b border-gray-200
      `}>
			<Link
				to='/'
				className='flex items-center shrink-0'>
				<h3 className='text-3xl font-extrabold text-[#F86D72] tracking-wider uppercase m-0 before:hidden'>
					BUBA
				</h3>
			</Link>
			{/* Desktop Navigation */}
			<div className='hidden md:flex items-center gap-8'>
				{navLinks.map(link => (
					<Link
						key={link.name}
						to={link.path}
						className='text-gray-700 hover:text-[#F86D72] transition'>
						{link.name}
					</Link>
				))}
			</div>
			{/* Right */}
			{renderUserActions()}
			{/* Mobile Menu Button */}
			<button
				className='md:hidden !bg-transparent !text-black !p-0'
				onClick={() => setIsMenuOpen(true)}>
				<Menu size={28} />
			</button>
			{/* Mobile Menu */}
			<div
				className={`
        fixed top-0 left-0
        w-full h-screen
        bg-white
        flex flex-col
        items-center
        justify-center
        gap-6
        transition-all duration-300
        ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
				<button
					className='absolute top-5 right-5 !bg-transparent !text-black !p-0'
					onClick={() => setIsMenuOpen(false)}>
					<X size={28} />
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
						{!isAdmin && (
							<button
								onClick={() => {
									navigate("/cart")
									setIsMenuOpen(false)
								}}>
								Корзина
							</button>
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
