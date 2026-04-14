"use client"

import { useAuth } from '@/context/AuthContext';
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

type ReportStatus = "idle" | "reporting" | "success" | "error";

export default function Chatbot() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [sessionId, setSessionId] = useState<string>('');

    const [editBotModalVisible, setEditBotModalVisible] = useState<boolean>(false);
    const [knowledgeBase, setKnowledgeBase] = useState<string>("");
    const [guidelines, setGuidelines] = useState<string>("")
    const [mistakes, setMistakes] = useState<string>("")
    const [saveError, setSaveError] = useState<string>("")
    const [saveSuccess, setSaveSuccess] = useState<string>("")

    // Loading states
    const [isFetchingBotData, setIsFetchingBotData] = useState<boolean>(false);
    const [isScraping, setIsScraping] = useState<boolean>(false);
    const [reportStatuses, setReportStatuses] = useState<Record<string, ReportStatus>>({});

    // --- META AGENT STATES ---
    const [metaMessages, setMetaMessages] = useState<Message[]>([]);
    const [metaInput, setMetaInput] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isMetaLoading, setIsMetaLoading] = useState<boolean>(false);
    const [urlInput, setUrlInput] = useState("");

    const { user } = useAuth()
    const isManager = user?.role === "manager"

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

    useEffect(() => {
        if (editBotModalVisible) {
            fetchBotData();
            setSaveError("");
            setSaveSuccess("");
        }
    }, [editBotModalVisible])

    const handleMetaSend = async () => {
        if (!metaInput.trim() && !selectedFile) return;

        const userText = metaInput;
        setMetaInput('');
        setSaveError("");

        setMetaMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: selectedFile ? `[Uploaded: ${selectedFile.name}] ${userText}` : userText,
            sender: 'user',
            timestamp: new Date()
        }]);

        setIsMetaLoading(true);

        try {
            const formData = new FormData();
            formData.append("message", userText);
            if (selectedFile) {
                formData.append("file", selectedFile);
            }

            const response = await fetch(`${BACKEND_URL}/meta_chat`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Meta-Agent network error');

            const data = await response.json();

            setMetaMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: data.reply,
                sender: 'bot',
                timestamp: new Date()
            }]);

            fetchBotData();
            setSelectedFile(null);

        } catch (error) {
            console.error(error);
            setSaveError("Failed to chat with Meta-Agent.");
        } finally {
            setIsMetaLoading(false);
        }
    }

    const fetchBotData = async () => {
        setIsFetchingBotData(true);
        setSaveError("");
        try {
            const userId = user?.username;
            const userRole = user?.role;
            const response: any = await fetch(`${BACKEND_URL}/get_bot_config?userId=${userId}&role=${userRole}`, {
                method: "GET"
            })
            if (response.ok) {
                const data = await response.json();
                setKnowledgeBase(data["knowledge_base"] || "")
                setGuidelines(data["guidelines"] || "");
                setMistakes(data["mistakes"] || "")
            } else {
                setSaveError("Failed to fetch bot configuration.");
            }
        } catch (error) {
            console.error(`There is a problem getting bot data ${error}`)
            setSaveError("Network error while trying to fetch bot data.");
        } finally {
            setIsFetchingBotData(false);
        }
    }

    const handleSaveConfig = async () => {
        setSaveError("");
        setSaveSuccess("");
        try {
            const userId = user?.username;
            const userRole = user?.role;
            const response = await fetch(`${BACKEND_URL}/save_bot_config?userId=${userId}&role=${userRole}`, {
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
                setSaveSuccess("Bot configuration updated successfully!");
                setTimeout(() => setEditBotModalVisible(false), 1500);
            } else if (response.status === 401) {
                setSaveError("Unauthorized: You do not have permission to edit the bot.");
            } else {
                setSaveError("Failed to save bot config. Please try again.");
            }
        } catch (error) {
            setSaveError("Network error. Please check your connection.");
            console.error(error);
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
    }, [messages, isLoading]);

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

            const data = await response.json();

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
        setReportStatuses(prev => ({ ...prev, [message_id]: "reporting" }));

        try {
            let pastMessages = "";
            for (const message of messages) {
                if (message.id === message_id) break;
                pastMessages += `${message.sender}: ${message.text}\n`;
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

            if (!response.ok) throw new Error("report message failed!")

            setReportStatuses(prev => ({ ...prev, [message_id]: "success" }));
        } catch (error) {
            console.error("Failed to report mistake:", error);
            setReportStatuses(prev => ({ ...prev, [message_id]: "error" }));
        }
    }

    const handleUrlScrape = async () => {
        if (!urlInput.trim()) return;

        setIsScraping(true);
        setSaveError("");
        setSaveSuccess("");

        try {
            const response = await fetch(`${BACKEND_URL}/update_knowledge_base?userId=${user?.username}&role=${user?.role}`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: urlInput })
            });
            const data = await response.json();

            if (data.status === "Success" || response.ok) {
                setSaveSuccess("Website scraped and added to knowledge base.");
                fetchBotData();
                setUrlInput("");
            } else {
                setSaveError(data.message || "Failed to scrape website.");
            }
        } catch (error) {
            console.error("Scraping failed", error);
            setSaveError("Network error while trying to scrape website.");
        } finally {
            setIsScraping(false);
        }
    };

    return (
        <div className="w-full max-w-3xl max-h-2xl h-[calc(80vh)] flex flex-col gap-3 items-center py-10">
            {isManager &&
                <button className="bg-red-500 p-1 w-20 rounded-xl cursor-pointer hover:bg-red-300 shadow-xl text-white font-semibold" onClick={() => setEditBotModalVisible(true)}>
                    Edit Bot
                </button>
            }

            {editBotModalVisible && (
                <div className="fixed inset-0 bg-black/50 p-4 z-50 flex items-center justify-center">
                    <div className="flex flex-col bg-gray-100 rounded-xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden">

                        <div className="bg-gray-200 p-4 border-b border-gray-300 flex justify-between items-center">
                            <h2 className="font-bold text-lg text-black">Manager Dashboard</h2>
                            <button onClick={() => setEditBotModalVisible(false)} className="text-gray-500 hover:text-gray-800 font-bold text-xl cursor-pointer">&times;</button>
                        </div>

                        <div className="p-6 overflow-y-auto flex flex-col gap-8 relative">
                            {isFetchingBotData && (
                                <div className="absolute inset-0 z-10 bg-white/70 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            )}

                            <div className="w-full flex flex-col gap-3">
                                <h3 className="font-semibold text-blue-600 border-b pb-1">Meta-Agent</h3>

                                <div className="bg-white border border-gray-300 rounded-lg h-40 overflow-y-auto p-3 flex flex-col gap-2 shadow-inner">
                                    {metaMessages.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center italic mt-4">Upload a doc or tell the Meta-Agent what kind of bot to build...</p>
                                    ) : (
                                        metaMessages.map((msg) => (
                                            <div key={msg.id} className={`p-2 rounded text-sm w-fit max-w-[85%] ${msg.sender === 'user' ? 'bg-blue-100 text-blue-900 self-end' : 'bg-green-100 text-green-900 self-start'}`}>
                                                <span className="font-bold text-xs block mb-1">{msg.sender === 'user' ? 'You' : 'Meta-Agent'}</span>
                                                {msg.text}
                                            </div>
                                        ))
                                    )}
                                    {isMetaLoading && <p className="text-xs text-gray-500 animate-pulse">Meta-Agent is thinking...</p>}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <input
                                        type="file"
                                        accept=".txt"
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                        className="text-sm text-gray-700 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={metaInput}
                                            onChange={(e) => setMetaInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleMetaSend()}
                                            placeholder="E.g., Make the bot more polite..."
                                            className="flex-1 border border-gray-300 p-2 text-sm rounded bg-white text-black outline-none"
                                            disabled={isMetaLoading}
                                        />
                                        <button
                                            onClick={handleMetaSend}
                                            disabled={isMetaLoading || (!metaInput.trim() && !selectedFile)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded enabled:hover:bg-blue-700 disabled:opacity-50 text-sm enabled:cursor-pointer font-medium"
                                        >
                                            Send
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full flex flex-col gap-3">
                                <h3 className="font-semibold text-blue-600 border-b pb-1">2. Manual Configuration</h3>

                                {saveError && <div className="p-2 bg-red-100 border border-red-400 text-red-700 text-sm rounded text-center">{saveError}</div>}
                                {saveSuccess && <div className="p-2 bg-green-100 border border-green-400 text-green-700 text-sm rounded text-center">{saveSuccess}</div>}

                                <div className="flex flex-col w-full gap-2 items-start bg-blue-50 p-3 rounded border border-blue-200 mb-2">
                                    <label className="text-sm font-semibold text-blue-800">Import from URL</label>
                                    <div className="flex gap-2 w-full">
                                        <input
                                            type="url"
                                            value={urlInput}
                                            onChange={(e) => setUrlInput(e.target.value)}
                                            placeholder="https://help.atome.ph/..."
                                            className="flex-1 p-2 border border-gray-300 rounded text-sm text-black"
                                            disabled={isScraping}
                                            onKeyDown={(e) => e.key === 'Enter' && handleUrlScrape()}
                                        />
                                        <button onClick={handleUrlScrape} disabled={isScraping} className="bg-blue-600 text-white px-4 py-1 rounded enabled:hover:bg-blue-700 text-sm enabled:cursor-pointer disabled:opacity-50 min-w-24">
                                            {isScraping ? 'Scraping...' : 'Scrape'}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-semibold text-gray-700">Knowledge Base</label>
                                    <textarea value={knowledgeBase} onChange={(e) => setKnowledgeBase(e.target.value)} rows={3} className="w-full p-2 bg-white text-black border border-gray-300 rounded text-sm"></textarea>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-semibold text-gray-700">Additional Guidelines</label>
                                    <textarea value={guidelines} onChange={(e) => setGuidelines(e.target.value)} rows={3} className="w-full p-2 bg-white text-black border border-gray-300 rounded text-sm"></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-200 p-4 border-t border-gray-300 flex justify-end gap-3">
                            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 cursor-pointer font-medium text-sm" onClick={() => setEditBotModalVisible(false)}>
                                Cancel
                            </button>
                            <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 cursor-pointer font-medium text-sm" onClick={handleSaveConfig}>
                                Save Manual Edits
                            </button>
                        </div>

                    </div>
                </div>
            )}

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
                                        disabled={reportStatuses[message.id] === 'reporting' || reportStatuses[message.id] === 'success'}
                                        className={`text-xs flex items-center gap-1 enabled:cursor-pointer ${reportStatuses[message.id] === 'success' ? 'text-green-600' :
                                            reportStatuses[message.id] === 'error' ? 'text-red-500' :
                                                'text-gray-500 hover:text-red-500'
                                            }`}
                                    >
                                        {reportStatuses[message.id] === 'reporting' ? (
                                            <>Reporting...</>
                                        ) : reportStatuses[message.id] === 'success' ? (
                                            <>✓ Reported</>
                                        ) : reportStatuses[message.id] === 'error' ? (
                                            <>Error. Try Again.</>
                                        ) : (
                                            <>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                Report Mistake
                                            </>
                                        )}
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
                        className="flex-1 px-3 py-2 border-3 border-gray-300 rounded-lg bg-white text-sm outline-none text-gray-800 max-h-37.5 disabled:opacity-50 disabled:bg-gray-100"
                        disabled={isLoading}
                        placeholder="Type a message..."
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={3}
                        value={input}
                    />
                    <button
                        className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center disabled:opacity-50 enabled:cursor-pointer"
                        disabled={isLoading || !input.trim()}
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
