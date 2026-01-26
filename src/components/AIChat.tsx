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

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

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
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4 w-[380px] md:w-[450px] h-[600px] bg-[#0e0e0e] border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
                    >
                        {/* Header */}
                        <div className="p-8 bg-gradient-to-r from-orange-600/20 to-transparent border-b border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center text-white shadow-xl shadow-orange-600/30">
                                    <Sparkles size={22} />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-white tracking-widest uppercase italic">Digital Hari</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest">Always Online</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors p-2 bg-white/5 rounded-full">
                                <MinusCircle size={22} />
                            </button>
                        </div>

                        {/* Messages Box */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[85%] p-5 rounded-3xl text-sm font-bold leading-relaxed shadow-sm ${m.role === "user"
                                            ? "bg-orange-600 text-white rounded-tr-none shadow-orange-600/20"
                                            : "bg-white/5 text-white/90 border border-white/10 rounded-tl-none"
                                        }`}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl rounded-tl-none flex gap-2 items-center">
                                        <div className="flex gap-1.5">
                                            <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                            <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                            <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-6 bg-white/5 border-t border-white/5 flex gap-4 items-end">
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
                                placeholder="Message Hari's Digital Twin..."
                                className="flex-1 bg-[#1a1a1a] border-2 border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-orange-600 transition-all font-bold placeholder:text-white/20 resize-none max-h-32 overflow-y-auto"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="bg-orange-600 p-4 rounded-2xl text-white hover:scale-105 active:scale-95 transition-all shadow-xl shadow-orange-600/30 disabled:opacity-50 h-[56px] w-[56px] flex items-center justify-center"
                            >
                                <Send size={22} />
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
