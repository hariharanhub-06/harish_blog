"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, Loader2, MinusCircle, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: "user" | "ai", content: string }[]>([
        { role: "ai", content: "Hey there! I'm Hari's AI assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener("open-ai-chat", handleOpen);
        return () => window.removeEventListener("open-ai-chat", handleOpen);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, { role: "user", content: userMsg }].map(m => ({
                        role: m.role === "user" ? "user" : "assistant",
                        content: m.content
                    }))
                })
            });

            if (res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, { role: "ai", content: data.content }]);
            } else {
                setMessages(prev => [...prev, { role: "ai", content: "I'm sorry, I'm experiencing some connectivity issues. Please try again later." }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: "ai", content: "Oops! Something went wrong. Let's try that again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[60]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={chatRef}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4 w-[320px] md:w-[400px] h-[550px] max-h-[80vh] bg-[#0e0e0e] border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
                    >
                        {/* Header */}
                        <div className="p-6 bg-gradient-to-r from-orange-600/20 to-transparent border-b border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white shadow-xl shadow-orange-600/30">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white tracking-widest uppercase italic leading-none">Digital Hari</h3>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[9px] font-black text-emerald-500/80 uppercase tracking-widest">Always Online</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors p-1.5 bg-white/5 rounded-full">
                                <MinusCircle size={20} />
                            </button>
                        </div>

                        {/* Messages Box */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[90%] p-4 rounded-3xl text-xs font-bold leading-relaxed shadow-sm ${m.role === "user"
                                            ? "bg-orange-600 text-white rounded-tr-none shadow-orange-600/20"
                                            : "bg-white/5 text-white/90 border border-white/10 rounded-tl-none"
                                        }`}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 border border-white/10 p-4 rounded-3xl rounded-tl-none flex gap-2 items-center">
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                            <div className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                            <div className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-bounce" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-4 bg-white/5 border-t border-white/5 flex gap-3 items-end">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend(e as any);
                                    }
                                }}
                                rows={1}
                                placeholder="Message Hari's Twin..."
                                className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-600 transition-all font-bold placeholder:text-white/20 resize-none max-h-24 overflow-y-auto"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="bg-orange-600 p-3.5 rounded-xl text-white hover:scale-105 active:scale-95 transition-all shadow-xl shadow-orange-600/30 disabled:opacity-50 h-[44px] w-[44px] flex items-center justify-center shrink-0"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            {!isOpen && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-white text-black rounded-full shadow-2xl flex items-center justify-center border-4 border-orange-600 group relative"
                >
                    <MessageSquare size={28} className="group-hover:rotate-12 transition-transform" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center text-[10px] font-black text-white animate-bounce">
                        1
                    </div>
                </motion.button>
            )}
        </div>
    );
}
