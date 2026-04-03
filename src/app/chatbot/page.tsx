"use client"

import next from 'next'
import React, { useRef } from 'react'
import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}
const BACKEND_URL = "http://127.0.0.1:8000"
//const BACKEND_URL = "https://aig-be-s040.onrender.com"
export default function Chatbot() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [sessionId, setSessionId] = useState<string>('');

    const [editBotModalVisible, setEditBotModalVisible] = useState<boolean>(false);
    const [knowledgeBase, setKnowledgeBase] = useState<string>("");
    const [guidelines, setGuidelines] = useState<string>("")
    const [mistakes, setMistakes] = useState<string>("")

    const isManager = true;
    const handleCloseModal = () => {
        setEditBotModalVisible(false)
    }

    useEffect(() => {
        if (editBotModalVisible) {
            fetchBotData();
        }
    }, [editBotModalVisible])

    const fetchBotData = async () => {
        try {
            const response: any = await fetch(`${BACKEND_URL}/get_bot_config`)
            if (response.ok) {
                const data = await response.json();
                setKnowledgeBase(data["knowledge_base"])
                setGuidelines(data["guidelines"]);
                setMistakes(data["mistakes"])
            }
        } catch (error) {
            console.error(`There is a problem getting bot data ${error}`)
        }
    }

    const saveBotData = async () => {
        try {
            const response: any = await fetch(`${BACKEND_URL}/save_bot_config`)
            if (response.ok) {
                console.log("Bot config saved successful")
            }
        } catch (error) {
            console.error(`There is a problem getting bot data ${error}`)
        }
    }




    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        let currentSession = sessionStorage.getItem('chat_session_id');

        if (!currentSession) {
            currentSession = "session_" + Math.random().toString(36).substring(2, 15);
            sessionStorage.setItem('chat_session_id', currentSession);
        }

        setSessionId(currentSession);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    const handleSend = async () => {
        if (!input.trim() || !sessionId) return;

        const userText = input;
        setInput('');

        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: userText,
            sender: 'user',
            timestamp: new Date()
        }]);

        setIsLoading(true);

        try {
            const response = await fetch(`${BACKEND_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userText, session_id: sessionId }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // 4. Get the AI's reply
            const data = await response.json();

            // 5. Add the AI's reply to the UI
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: data.reply,
                sender: 'bot',
                timestamp: new Date()
            }]);

        } catch (error) {
            console.error("Failed to send message:", error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: "I'm having trouble connecting to the server. Please ensure the backend is running.",
                sender: 'bot',
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    }

    const handleReportMistake = async (bad_message: string, message_id: string) => {
        console.log("to be implemented")
        try {

            const badMessageId = message_id;
            let pastMessages = "";
            for (const message of messages) {
                if (message.id === badMessageId) {
                    break;
                } else {
                    pastMessages += `${message.sender}: ${message.text}\n`;
                }
            }
            const response = await fetch(`${BACKEND_URL}/report_message`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "past_messages": pastMessages,
                    "bad_message": bad_message,
                })

            })
            if (!response.ok) {
                throw new Error("report message failed!")
            }

        } catch (error) {
            console.error("Failed to report mistake:", error);
        }
    }

    const handleSaveConfig = async () => {
        const response = await fetch(`${BACKEND_URL}/save_bot_config`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "knowledge_base": knowledgeBase,
                "additional_guidelines": guidelines,
            })
        })
        if (response.ok) {
            setEditBotModalVisible(false)
            console.log("Bot config saved successful")
        } else {
            console.error("Failed to save bot config");
        }
    }
    return (
        <div className="w-full max-w-3xl max-h-2xl h-[calc(80vh)] flex flex-col gap-3 items-center py-10">
            {isManager &&
                <button className="bg-red-500 p-1 w-20 rounded-xl cursor-pointer hover:bg-red-300 shadow-xl" onClick={() => setEditBotModalVisible(true)}>
                    <text> Edit Bot </text>
                </button>
            }
            {editBotModalVisible &&
                <div className="fixed flex inset-0 bg-black/50  backdrop-blur-sm p-4 z-50 items-center justify-center min-w-md">
                    <div className="flex flex-col gap-4 justify-center items-center border-b bg-gray-300 rounded-xl h-[calc(50vh)] w-full max-w-xl">
                        <div className="w-full items-center justify-around flex flex-col gap-2">
                            <h1 className="pt-2">Edit Bot's configuration</h1>
                            <div className="w-full border-b"> </div>
                        </div>
                        <div className="w-full">
                            <div className="flex flex-col w-full gap-2 items-center">
                                <label htmlFor="knowledgeBase">Knowledge Base</label>
                                <textarea id="knowledgeBase" value={knowledgeBase} onChange={(e) => setKnowledgeBase(e.target.value)} className="w-full h-full p-2 bg-gray-600 text-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                            </div>
                            <div className="flex flex-col w-full gap-2 items-center">
                                <label htmlFor="guidelines">Additional guidelines</label>
                                <textarea id="guidelines" value={guidelines} onChange={(e) => setGuidelines(e.target.value)} className="w-full h-full p-2 bg-gray-600 text-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                            </div>
                        </div>
                        <div className="w-full flex flex-row gap-4 justify-center">
                            <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-300 max-w-xs min-w-[80px]" onClick={handleSaveConfig}>
                                Save
                            </button>
                            <button className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-300 max-w-xs min-w-[80px]" onClick={() => setEditBotModalVisible(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            }
            <div className="flex flex-col bg-gray-300 flex-1 shadow-xl w-full min-h-0 overflow-hidden rounded-xl">

                <div className="bg-blue-600 rounded-t-xl text-white p-4 flex justify-between items-center">
                    <h3 className="m-0 text-base font-semibold">Chat Support</h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-gray-300 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}
                        >
                            <div className={`max-w-[75%] px-4 py-3 rounded-xl text-sm leading-relaxed break-words ${message.sender === 'user'
                                ? 'bg-blue-600 text-white rounded-br-sm'
                                : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                                }`}>
                                {message.sender === "bot" ? (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {message.text}
                                    </ReactMarkdown>
                                ) : (
                                    message.text
                                )}
                            </div>
                            {message.sender === 'bot' && (
                                <div className="mt-1 ml-1">
                                    <button
                                        onClick={() => handleReportMistake(message.text, message.id)}
                                        className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 cursor-pointer"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Report Mistake
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex flex-col items-start">
                            <div className="bg-white text-gray-800 px-4 py-4 rounded-xl rounded-bl-sm shadow-sm flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-white rounded-b-lg border-t border-gray-200 flex gap-2">
                    <textarea
                        className="flex-1 px-3 py-2 border-3 border-gray-300 rounded-lg bg-white text-sm outline-none text-gray-800 max-h-37.5"
                        disabled={false}
                        placeholder="Type a message..."
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={3}
                        value={input}
                    />
                    <button
                        className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center disabled:opacity-50 cursor-pointer"
                        disabled={false}
                        onClick={handleSend}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )

}
