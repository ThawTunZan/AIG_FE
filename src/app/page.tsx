"use client"; // Required for using React Context (hooks)

import Chatbot from "@/app/chatbot/page";
import { useAuth } from "@/context/AuthContext";
import { AuthPage } from "./login/page";
import { useState } from "react";

export default function Home() {
  const { logout, user } = useAuth();

  let loggedIn: boolean = user !== null;

  return (
    <main className="flex flex-col justify-center items-center min-h-screen">
      {!loggedIn ? (
        <AuthPage />
      ) : (
        <>
          <nav className="bg-white w-full border-b border-gray-300 h-14 shadow-md">
            <div className="flex items-center justify-between h-full px-4">
              <h1 className="text-2xl font-bold text-red-500 cursor-pointer">
                AIG BOT
              </h1>
              <button className="text-red-500 hover:text-red-700 cursor-pointer" onClick={logout}>
                Logout
              </button>
            </div>
          </nav>
          <main className="flex-1 flex justify-center w-full">
            <Chatbot></Chatbot>
          </main>
        </>
      )}
    </main>
  );
}
