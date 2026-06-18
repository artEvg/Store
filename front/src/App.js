import logo from "./logo.svg"
import "./App.css"
import Header from "./components/Header"
import Home from "./pages/Home"
import Catalog from "./pages/Catalog"
import Contacts from "./pages/Contacts"
import About from "./pages/About"
import { Route, Routes, useLocation } from "react-router-dom"
import AdminLayout from "./components/admin/AdminLayout"
import AddItem from "./components/admin/AddItem"
import AllItems from "./components/admin/AllItems"
import AdminOrders from "./components/admin/AdminOrders"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import ItemDetails from "./pages/ItemDetails"
import { AuthProvider } from "./auth/AuthContext"
import { CartProvider } from "./auth/CartContext"
import CartPage from "./pages/CartPage"
import ProfileOrders from "./pages/ProfileOrders"
import UpdateItem from "./components/admin/UpdateItem"
import DiscountPercent from "./components/DiscountPercent"

// import OnSaleProducts from "./components/OnSaleProducts";
import Footer from "./components/Footer"
function App() {
	const location = useLocation()

	const hideHeader = /^\/admin(\/|$)/.test(location.pathname)
	return (
		<AuthProvider>
			<CartProvider>
				{!hideHeader && <Header key={location.pathname} />}

				<Routes>
					<Route
						path='/'
						element={<Home />}
					/>
					<Route
						path='/catalog'
						element={<Catalog />}
					/>
					<Route
						path='/contacts'
						element={<Contacts />}
					/>
					<Route
						path='/about'
						element={<About />}
					/>
					<Route
						path='/login'
						element={<Login />}
					/>
					<Route
						path='/signup'
						element={<Signup />}
					/>
					<Route
						path='/cart'
						element={<CartPage />}
					/>
					<Route
						path='/orders'
						element={<ProfileOrders />}
					/>

					<Route
						path='/discount'
						element={<DiscountPercent />}
					/>
					<Route
						path='/itemDetails/:id'
						element={<ItemDetails />}
					/>

					<Route
						path='/admin'
						element={<AdminLayout />}>
						<Route
							path='add-item'
							element={<AddItem />}
						/>
						<Route
							path='orders'
							element={<AdminOrders />}
						/>
						<Route
							index
							element={<AllItems />}
						/>
						<Route
							path='/admin/update-item/:id'
							element={<UpdateItem />}
						/>
					</Route>
				</Routes>

				<Footer />
			</CartProvider>
		</AuthProvider>
	)
}

export default App
