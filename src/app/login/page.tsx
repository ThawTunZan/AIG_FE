"use client"

import { useAuth } from "@/context/AuthContext"
import { useState } from "react"

export default function AuthPage() {
    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [currPage, setCurrPage] = useState<"login" | "register">("login")
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const { login, signup, loading } = useAuth()

    let role = username === "manager" ? "manager" : "user"

    const checkValid = () => {
        if (username === null || username.length < 5 || password === null || password.length < 8 || password === "") {
            setErrorMessage("Please fill in all fields. Username of at least 5 characters and Password of at least 8 characters")
            return false;
        }
        setErrorMessage(null)
        return true
    }

    const registerClicked = async () => {
        if (checkValid()) {
            const res = await signup(username, password, role)
            if (!res.success) {
                setErrorMessage(res.error)
            } else {
                setErrorMessage(null)
            }
        } else {
            if (!errorMessage) setErrorMessage("Please fill in all fields")
        }
    }

    const loginClicked = async () => {
        if (checkValid()) {
            const res = await login(username, password, role)
            if (!res.success) {
                setErrorMessage(res.error)
            } else {
                setErrorMessage(null)
            }
        } else {
            if (!errorMessage) {
                setErrorMessage("Please fill in all fields")
            }
        }
    }

    return (
        <div className="w-full max-w-3xl h-[calc(100vh-10rem)] flex flex-col py-10 items-center">
            <h1 className="text-red-800 text-2xl font-bold mb-4">Login</h1>
            <div className="bg-green-200 flex-1 border rounded-xl w-full flex flex-col justify-center items-center shadow-[0_0_150px_50px_rgba(0,0,0,0.1)] ring-2">
                <h1 className="text-black text-3xl font-bold">AIG BOT</h1>
                <div className="flex flex-col items-center gap-3 p-20 w-full max-w-lg">
                    <h1 className="text-black text-2xl font-bold">
                        {currPage === "login" ? "Login" : "Register"}
                    </h1>

                    {currPage === "register" && (
                        <button className="bg-white hover:bg-gray-200 text-black font-bold py-1 px-4 rounded-xl cursor-pointer self-start text-sm mb-4" onClick={() => { setCurrPage("login"); setErrorMessage(null); }}>
                            Back
                        </button>
                    )}

                    <div className="flex flex-col gap-10 w-full">
                        <div className="flex flex-col">
                            <h2 className="text-black">Username:</h2>
                            <input className="bg-white px-1 py-1 border w-full border-black rounded-sm text-black" value={username} onChange={(e) => setUsername(e.target.value)} type="text" disabled={loading} />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-black">Password:</h2>
                            <input className="bg-white px-1 py-1 border w-full border-black rounded-sm text-black" value={password} onChange={(e) => setPassword(e.target.value)} type="password" disabled={loading} />
                        </div>
                    </div>

                    <span className="text-red-500 text-sm text-center mt-2">{errorMessage}</span>

                    <div className="flex justify-between w-full mt-4">
                        {currPage === "login" ? (
                            <>
                                <button className="bg-yellow-300 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded-xl cursor-pointer disabled:opacity-50 flex-1 mr-2" onClick={loginClicked} disabled={loading}>
                                    {loading ? 'Logging in...' : 'Login'}
                                </button>
                                <button className="bg-white hover:bg-gray-100 border border-gray-400 text-black font-bold py-2 px-6 rounded-xl cursor-pointer disabled:opacity-50 flex-1 ml-2" onClick={() => { setCurrPage("register"); setErrorMessage(null); }} disabled={loading}>
                                    Register
                                </button>
                            </>
                        ) : (
                            <button className="bg-yellow-300 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded-xl cursor-pointer w-full disabled:opacity-50" onClick={registerClicked} disabled={loading}>
                                {loading ? 'Registering...' : 'Register'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

