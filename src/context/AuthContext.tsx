"use client"

import { createContext, useContext, useState } from "react"

const AuthContext = createContext<any>(null)

export type User = {
    username: string
    role: "manager" | "user"
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const isManager = user?.username === "manager"

    const login = async (username: string, password: string, role: "manager" | "user") => {
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password,
                    role,
                })
            })
            const data = await res.json()
            if (res.ok) {
                setUser(data)
                return { success: true, data }
            } else {
                return { success: false, error: data.detail || "Login failed. Please check your credentials." }
            }
        } catch (error) {
            console.error("Login Error:", error)
            return { success: false, error: "Network error occurred during login." }
        } finally {
            setLoading(false)
        }
    }

    const logout = () => {
        setUser(null)
    }

    const signup = async (username: string, password: string, role: "manager" | "user") => {
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password, role })
            })
            const data = await res.json()
            if (res.ok) {
                setUser(data)
                return { success: true, data }
            } else {
                return { success: false, error: data.detail || "Registration failed. Username may already exist." }
            }
        } catch (error) {
            console.error("Signup Error:", error)
            return { success: false, error: "Network error occurred during registration." }
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthContext.Provider value={{ isManager, login, logout, user, setUser, signup, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)