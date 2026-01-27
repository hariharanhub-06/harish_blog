"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, Loader2, MinusCircle, User, Mail, Phone, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [leadCaptured, setLeadCaptured] = useState(false);
    const [leadData, setLeadData] = useState({ name: "", email: "", mobile: "" });
    const [leadLoading, setLeadLoading] = useState(false);

    // CHAT STATE
    const [messages, setMessages] = useState<{ role: "user" | "ai", content: string }[]>([
        { role: "ai", content: "Hey! I'm Thenali, Hari's automated assistant 🤖. I can help you connect with him faster. What brings you here today?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    // FLOW STATE
    type ChatFlowState = "INITIAL" | "ASK_PROJECT_DETAILS" | "ASK_COLLAB_DETAILS" | "ASK_GENERAL_MSG" | "COMPLETED";
    const [flowState, setFlowState] = useState<ChatFlowState>("INITIAL");

    const scrollRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const captured = localStorage.getItem("chatLeadCaptured_PROD_V1");
        const storedName = localStorage.getItem("chatUserName");
        if (captured && storedName) {
            setLeadCaptured(true);
            setLeadData(prev => ({ ...prev, name: storedName }));
            setMessages(prev => [
                ...prev,
                { role: "ai", content: `Welcome back, ${storedName}! 👋 Please select an option below.` }
            ]);
        }
    }, []);

    const handleReset = () => {
        localStorage.removeItem("chatLeadCaptured_PROD_V1");
        localStorage.removeItem("chatUserName");
        setLeadCaptured(false);
        setLeadData({ name: "", email: "", mobile: "" });
        setMessages([{ role: "ai", content: "Hey! I'm Thenali. Before we begin, I'd love to know who I'm chatting with!" }]);
        setFlowState("INITIAL");
    };

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

    // ... (Click Outside Logic remains same) ...
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        else document.removeEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);


    const handleLeadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLeadLoading(true);
        try {
            const res = await fetch("/api/chat/lead", { // Ensuring we reuse the existing endpoint if it works, or fallback
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(leadData)
            });
            // We'll optimistically succeed for UI speed
            setLeadCaptured(true);
            localStorage.setItem("chatLeadCaptured_PROD_V1", "true");
            localStorage.setItem("chatUserName", leadData.name);
            setMessages(prev => [...prev, { role: "ai", content: `Nice to meet you, ${leadData.name}! What are you looking for? 👇` }]);
        } catch (error) {
            console.error(error);
        } finally {
            setLeadLoading(false);
        }
    };

    const saveMessageToDB = async (msg: string, category: string) => {
        try {
            await fetch("/api/chat/offline", { // Reusing our offline saver as the main saver
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: leadData.name || "Guest",
                    email: leadData.email || "No Email",
                    mobile: leadData.mobile || "No Mobile",
                    message: `[${category}] ${msg}`
                })
            });
        } catch (e) {
            console.warn("Failed to save msg", e);
        }
    };

    const handleOptionClick = (option: string) => {
        const userMsg = option;
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);

        setTimeout(() => {
            if (option === "Hire Hari / Project") {
                setMessages(prev => [...prev, { role: "ai", content: "Great! Hari loves building new things. 🚀\n\nPlease briefly describe your project or requirement below." }]);
                setFlowState("ASK_PROJECT_DETAILS");
            } else if (option === "Collab / Partnership") {
                setMessages(prev => [...prev, { role: "ai", content: "Awesome! Partnerships are key. 🤝\n\nWhat kind of collaboration do you have in mind?" }]);
                setFlowState("ASK_COLLAB_DETAILS");
            } else {
                setMessages(prev => [...prev, { role: "ai", content: "Sure thing. How can I assist you? You can ask me anything or leave a message for Hari." }]);
                setFlowState("ASK_GENERAL_MSG");
            }
        }, 500);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setLoading(true);

        // Simulate "Thinking"
        setTimeout(async () => {
            let reply = "";
            let category = "General";

            if (flowState === "ASK_PROJECT_DETAILS") {
                reply = "Thanks for sharing! 📝 I've prioritized this and sent it to Hari. He'll review your requirement and get back to you shortly.\n\nAnything else?";
                category = "Project Inquiry";
                setFlowState("COMPLETED");
            } else if (flowState === "ASK_COLLAB_DETAILS") {
                reply = "Got it! 🤝 I've notified Hari about this partnership opportunity. Expect a response soon!\n\nAnything else?";
                category = "Partnership";
                setFlowState("COMPLETED");
            } else {
                reply = "Message received! ✅ I've forwarded this to Hari. He typically replies within 24 hours.";
                category = "General Message";
                setFlowState("COMPLETED");
            }

            // Save to DB
            await saveMessageToDB(userMsg, category);

            setMessages(prev => [...prev, { role: "ai", content: reply }]);
            setLoading(false);
        }, 800);
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
                                    <h3 className="text-sm font-black text-white tracking-widest uppercase italic leading-none">Thenali</h3>
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
                                    <div className={`max-w-[90%] p-4 rounded-3xl text-xs font-bold leading-relaxed shadow-sm whitespace-pre-wrap ${m.role === "user"
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

                            {/* MENU OPTIONS (Only show if lead captured and in INITIAL state) */}
                            {leadCaptured && flowState === "INITIAL" && messages.length > 0 && !loading && (
                                <div className="flex flex-wrap gap-2 mt-2 ml-1">
                                    <button onClick={() => handleOptionClick("Hire Hari / Project")} className="px-4 py-2 bg-white/5 hover:bg-orange-600 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-white transition-all">
                                        🚀 Hire / Project
                                    </button>
                                    <button onClick={() => handleOptionClick("Collab / Partnership")} className="px-4 py-2 bg-white/5 hover:bg-blue-600 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-white transition-all">
                                        🤝 Collab
                                    </button>
                                    <button onClick={() => handleOptionClick("General Inquiry")} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-white transition-all">
                                        👋 Just Saying Hi
                                    </button>
                                </div>
                            )}

                            {/* LEAD FORM (If not captured) */}
                            {!leadCaptured && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-5"
                                >
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-600" size={16} />
                                            <input
                                                required
                                                placeholder="Your Name"
                                                value={leadData.name}
                                                onChange={e => setLeadData(prev => ({ ...prev, name: e.target.value }))}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-xs text-white focus:outline-none focus:border-orange-600 transition-all font-bold"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-600" size={16} />
                                            <input
                                                required
                                                type="email"
                                                placeholder="Email ID"
                                                value={leadData.email}
                                                onChange={e => setLeadData(prev => ({ ...prev, email: e.target.value }))}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-xs text-white focus:outline-none focus:border-orange-600 transition-all font-bold"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-600" size={16} />
                                            <input
                                                required
                                                type="tel"
                                                placeholder="Mobile No"
                                                value={leadData.mobile}
                                                onChange={e => setLeadData(prev => ({ ...prev, mobile: e.target.value }))}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-xs text-white focus:outline-none focus:border-orange-600 transition-all font-bold"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleLeadSubmit}
                                        disabled={!leadData.name || !leadData.email || !leadData.mobile || leadLoading}
                                        className="w-full bg-orange-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-xl shadow-orange-600/20"
                                    >
                                        {leadLoading ? <Loader2 className="animate-spin" size={16} /> : <>Start Chatting <ArrowRight size={16} /></>}
                                    </button>
                                </motion.div>
                            )}

                        </div>

                        {/* Input Area (Only visible when flow allows input) */}
                        {leadCaptured && (flowState !== "INITIAL" && flowState !== "COMPLETED") && (
                            <div className="flex flex-col border-t border-white/5">
                                <form onSubmit={handleSend} className="p-4 bg-white/5 flex gap-3 items-end">
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
                                        placeholder="Type your message..."
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
                            </div>
                        )}

                        {/* RESET / Completed State Footer  */}
                        {leadCaptured && (flowState === "INITIAL" || flowState === "COMPLETED") && (
                            <div className="p-2 border-t border-white/5 bg-white/5 text-center">
                                {flowState === "COMPLETED" && (
                                    <button onClick={() => setFlowState("INITIAL")} className="text-[10px] text-orange-500 font-bold uppercase tracking-wider mb-2 hover:text-orange-400">Start New Topic</button>
                                )}
                                <button
                                    onClick={handleReset}
                                    className="block w-full text-[8px] font-black uppercase text-white/20 hover:text-orange-600/60 py-2 transition-colors uppercase tracking-widest text-center"
                                >
                                    Reset Chat
                                </button>
                            </div>
                        )}

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
