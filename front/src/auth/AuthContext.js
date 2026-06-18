import { createContext, useContext, useEffect, useState, useMemo } from "react"

export const AuthContext = createContext(null)

export const useAuth = () => {
	const context = useContext(AuthContext)

	if (!context) {
		throw new Error("useAuth должен использоваться в AuthProvider")
	}

	return context
}

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)

	const normalizeRole = role => (role || "user").toString().trim().toLowerCase()

	const checkAuthStatus = async () => {
		try {
			const response = await fetch(
				"https://buba-backend.onrender.com/users/verify",
				{
					method: "GET",
					credentials: "include",
				},
			)

			if (response.ok) {
				const data = await response.json()
				setUser({
					...data.user,
					role: normalizeRole(data?.user?.role),
				})
			} else {
				setUser(null)
			}
		} catch (error) {
			console.error("Auth check failed:", error)
			setUser(null)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		checkAuthStatus()
	}, [])

	const login = async credentials => {
		try {
			const response = await fetch(
				"https://buba-backend.onrender.com/users/signin",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
					body: JSON.stringify(credentials),
				},
			)

			const data = await response.json()

			if (response.ok) {
				const nextUser = {
					...data.user,
					role: normalizeRole(data?.user?.role),
				}

				setUser(nextUser)
				return { success: true, user: nextUser }
			}

			return {
				success: false,
				error: data.message,
			}
		} catch (error) {
			return {
				success: false,
				error: "Login failed",
			}
		}
	}

	const register = async userData => {
		try {
			const response = await fetch(
				"https://buba-backend.onrender.com/users/register",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
					body: JSON.stringify(userData),
				},
			)

			const data = await response.json()

			if (response.ok) {
				const nextUser = {
					...data.user,
					role: normalizeRole(data?.user?.role),
				}

				setUser(nextUser)
				return { success: true, user: nextUser }
			}

			return {
				success: false,
				error: data.message,
			}
		} catch (error) {
			return {
				success: false,
				error: "Register failed",
			}
		}
	}

	const logout = async () => {
		try {
			await fetch("https://buba-backend.onrender.com/users/logout", {
				method: "POST",
				credentials: "include",
			})
		} catch (error) {
			console.error("Logout request failed:", error)
		} finally {
			setUser(null)
		}
	}

	const value = useMemo(
		() => ({
			user,
			setUser,
			login,
			register,
			logout,
			loading,
			refreshAuth: checkAuthStatus,
			isAuthenticated: !!user,
			isAdmin: user?.role === "admin",
		}),
		[user, loading],
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
