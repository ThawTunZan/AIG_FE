import Chatbot from "@/app/chatbot/page";

export default function Home() {
  return (
    <main className="flex flex-col justify-center items-center min-h-screen">
      <nav className="bg-white w-full border-b border-gray-300 h-14 shadow-md">
        <div className="flex items-center justify-between h-full px-4">
          <h1 className="text-2xl font-bold text-red-500">
            AIG BOT
          </h1>
        </div>
      </nav>
      <main className="flex-1 flex justify-center items-center p-4 w-full">
        <Chatbot></Chatbot>
      </main>
    </main>
  );
}
