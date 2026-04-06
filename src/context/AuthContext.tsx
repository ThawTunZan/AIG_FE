"use client"

import { createContext, useContext, useState } from "react"

const AuthContext = createContext<any>(null)

export type User = {
    username: string
    role: "manager" | "user"
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const isManager = user?.username === "manager"

    const login = (userData: User) => {
        setLoading(true)
        // Simulate an API call
        setTimeout(() => {
            setUser({ username: userData.username, role: userData.role, })
            setLoading(false)
        }, 1000)
    }

    const logout = () => {
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ isManager, login, logout, user, setUser }}>
            {children}
        </AuthContext.Provider>
    )

}

export const useAuth = () => useContext(AuthContext)