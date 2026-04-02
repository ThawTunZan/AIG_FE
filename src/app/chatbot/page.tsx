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
export default function Chatbot() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        setMessages([...messages, { id: Date.now().toString(), text: input, sender: 'user', timestamp: new Date() }]);
        setInput('');
        setIsLoading(true);


    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    }

    return (
        <div className="w-full max-w-3xl max-h-2xl h-[calc(100vh-200px)] flex flex-col justify-center">
            <h1 className="text-center">AIG BOT</h1>

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
                    className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center disabled:opacity-50"
                    disabled={false}
                    onClick={handleSend}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </div>
    )

}
