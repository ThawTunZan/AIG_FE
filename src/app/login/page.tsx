"use client"

import { useAuth } from "@/context/AuthContext"
import { useState } from "react"

export function AuthPage() {
    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const { login } = useAuth()

    return (
        <div className="w-full max-w-3xl h-[calc(100vh-10rem)] flex flex-col py-10 items-center">
            <h1 className="text-red-800 text-2xl font-bold mb-4">Login</h1>
            <div className="bg-green-200 flex-1 border rounded-xl w-full flex flex-col justify-center items-center shadow-[0_0_150px_50px_rgba(0,0,0,0.1)] ring-2">
                <h1 className="text-black text-3xl font-bold"> AIG BOT</h1>
                <div className="flex flex-col items-center gap-3 p-20">

                    <div className="flex flex-col gap-10">
                        <div className="flex flex-col">
                            <h2 className="text-black">Username:</h2>
                            <input className="bg-gray-100 px-1 border w-full border-black rounded-sm text-black" value={username} onChange={(e) => setUsername(e.target.value)} type="text"></input>
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-black">Password:</h2>
                            <input className="bg-gray-100 px-1 border w-full border-black rounded-sm text-black" value={password} onChange={(e) => setPassword(e.target.value)} type="password"></input>
                        </div>
                    </div>
                    <div className="flex justify-between w-full">
                        <button className="bg-yellow-300 hover:bg-yellow-400 text-black font-bold py-2 px-4 rounded-xl cursor-pointer" onClick={() => login({ username, password })}>
                            Login
                        </button>
                        <button className="bg-yellow-300 hover:bg-yellow-400 text-black font-bold py-2 px-4 rounded-xl cursor-pointer" onClick={() => console.log("Register clicked")}>
                            Register
                        </button>
                    </div>
                </div>
            </div>
        </div >
    )
}

