import { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

// Strict Auth States
export const AUTH_STATUS = {
    UNKNOWN: 'unknown',
    AUTHENTICATED: 'authenticated',
    UNAUTHENTICATED: 'unauthenticated'
}

export const AuthProvider = ({ children }) => {
    // Start as UNKNOWN to prevent premature redirects
    const [status, setStatus] = useState(AUTH_STATUS.UNKNOWN)
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem('token') || null)

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

    // Create axios instance that updates when token changes
    const api = useMemo(() => {
        const instance = axios.create({ baseURL: API_BASE })

        instance.interceptors.request.use(config => {
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
            return config
        })

        return instance
    }, [token, API_BASE])

    // Verify session - The STATE MACHINE Core
    useEffect(() => {
        const verifySession = async () => {
            // No token = definitely unauthenticated
            if (!token) {
                setStatus(AUTH_STATUS.UNAUTHENTICATED)
                setUser(null)
                return
            }

            try {
                // 1. Decode JWT to check expiry locally first
                const decoded = jwtDecode(token)

                if (decoded.exp * 1000 < Date.now()) {
                    // Token expired
                    throw new Error("Token expired")
                }

                // 2. Verify with backend (Source of Truth)
                // Use /users/me endpoint which mimics /auth/me behavior but exists in our backend
                const res = await api.get('/users/me')

                // 3. Success -> Update state to AUTHENTICATED
                setUser(res.data)
                setStatus(AUTH_STATUS.AUTHENTICATED)
                localStorage.setItem('token', token)

            } catch (error) {
                console.error("Session verification failed:", error)
                // 4. Failure -> Update state to UNAUTHENTICATED
                localStorage.removeItem('token')
                setToken(null)
                setUser(null)
                setStatus(AUTH_STATUS.UNAUTHENTICATED)
            }
        }

        verifySession()
    }, [token, api])

    const login = useCallback(async (email, password) => {
        try {
            const formData = new FormData()
            formData.append('username', email)
            formData.append('password', password)

            const res = await api.post('/auth/token', formData)
            const { access_token } = res.data

            // Set token first - this triggers the useEffect verifySession
            setToken(access_token)
            localStorage.setItem('token', access_token)

            // OPTIONAL: Manually fetch user here to speed up UI 
            // instead of waiting for useEffect cycle, but let's stick to simple flow first.
            // But to ensure "navigate after login" works immediately, we might want to wait.
            // For now, allow the useEffect to handle the transition to AUTHENTICATED.

            return { success: true }
        } catch (error) {
            console.error("Login failed", error)
            return {
                success: false,
                error: error.response?.data?.detail || "Login failed"
            }
        }
    }, [api])

    const register = useCallback(async (email, password) => {
        try {
            const res = await api.post('/auth/register', { email, password })
            return { success: true, needsVerify: false } // Modify if email verification implemented
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || "Registration failed"
            }
        }
    }, [api])

    const logout = useCallback(() => {
        setToken(null)
        setUser(null)
        setStatus(AUTH_STATUS.UNAUTHENTICATED)
        localStorage.removeItem('token')
    }, [])

    return (
        <AuthContext.Provider value={{
            user,
            status,
            login,
            logout,
            register,
            api
        }}>
            {children}
        </AuthContext.Provider>
    )
}
