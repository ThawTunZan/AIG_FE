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
        } else {
            alert(data.detail || "Login failed")
        }
        setLoading(false)
        return data
    }

    const logout = () => {
        setUser(null)
    }

    const signup = async (userData: User) => {
        setLoading(true);
        const res = await fetch(`${BACKEND_URL}/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        })
        const data = await res.json()
        if (res.ok) {
            setUser(data)
        }
        setLoading(false)
        return data
    }

    return (
        <AuthContext.Provider value={{ isManager, login, logout, user, setUser, signup }}>
            {children}
        </AuthContext.Provider>
    )

}

export const useAuth = () => useContext(AuthContext)