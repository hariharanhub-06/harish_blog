"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, User, MinusCircle, MessageSquare, Sparkles, Phone, Mail, ArrowRight, Loader2, Calendar, Check, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import knowledgeBase from "../data/knowledge_base.json";

interface Message {
    role: "user" | "ai";
    content: string;
    options?: string[]; // For buttons
}

interface LeadData {
    name: string;
    email: string;
    mobile: string;
}

type ChatFlowState =
    | "INITIAL"
    | "FREE_CHAT"
    | "BOOKING_SERVICE_SELECT"
    | "BOOKING_DATE_SELECT"
    | "BOOKING_CONFIRM"
    | "BOOKING_PAYMENT_INFO"
    | "COMPLETED";

// Booking Options
const SERVICES = [
    { id: "training_free", label: "2hr Training (No Cert) - Free", price: 0 },
    { id: "training_cert", label: "2hr Training (Certificate) - ₹150", price: 150 },
    { id: "consulting", label: "Consulting (1hr) - ₹1200", price: 1200 },
    { id: "web_dev", label: "Web Dev - From ₹4500", price: 4500 },
    { id: "ai_bot", label: "AI Bot Build - From ₹5600", price: 5600 },
];

export default function AIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [leadCaptured, setLeadCaptured] = useState(false);
    const [leadData, setLeadData] = useState<LeadData>({ name: "", email: "", mobile: "" });
    const [leadLoading, setLeadLoading] = useState(false);

    const [messages, setMessages] = useState<Message[]>([
        { role: "ai", content: "Hello! I'm Hari Haran's virtual assistant 🤖. I can help you with training sessions, consulting, development projects, and bookings. How can I assist you today?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    // Flow State
    const [flowState, setFlowState] = useState<ChatFlowState>("INITIAL");
    const [bookingDetails, setBookingDetails] = useState<any>({});

    const scrollRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<HTMLDivElement>(null);

    // --- EFFECT: Load Lead ---
    useEffect(() => {
        const captured = localStorage.getItem("chatLeadCaptured_PROD_V1");
        const storedName = localStorage.getItem("chatUserName");
        if (captured && storedName) {
            setLeadCaptured(true);
            setLeadData(prev => ({ ...prev, name: storedName }));
            setFlowState("FREE_CHAT"); // Go straight to chat if lead known
            setMessages([{ role: "ai", content: `Welcome back, ${storedName}! 👋 How can I help you today? (Ask me anything or say "Book a session")` }]);
        }
    }, []);

    // --- EFFECT: Auto Scroll ---
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    // --- SEARCH LOGIC (Simple Keyword Match) ---
    const findBestMatch = (query: string): string | null => {
        const tokens = query.toLowerCase().replace(/[^\w\s]/g, "").split(" ");
        let bestMatch = null;
        let maxScore = 0;

        knowledgeBase.forEach((item: any) => {
            let score = 0;
            const qTokens = item.question.toLowerCase().split(" ");

            // Check keyword overlap
            tokens.forEach(t => {
                if (qTokens.includes(t)) score += 1;
                // Boost for exact phrase match if implemented, simplified here
            });

            // Normalize score by length
            const confidence = score / qTokens.length;

            if (confidence > 0.3 && score > maxScore) { // Threshold
                maxScore = score;
                bestMatch = item.answer;
            }
        });

        return bestMatch;
    };

    // --- HANDLERS ---
    const handleReset = () => {
        localStorage.removeItem("chatLeadCaptured_PROD_V1");
        localStorage.removeItem("chatUserName");
        setLeadCaptured(false);
        setLeadData({ name: "", email: "", mobile: "" });
        setMessages([{ role: "ai", content: "Hello! I'm Hari's assistant. Before we begin, I'd love to know who I'm chatting with!" }]);
        setFlowState("INITIAL");
    };

    const handleLeadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLeadLoading(true);
        // Optimistic Capture
        setLeadCaptured(true);
        localStorage.setItem("chatLeadCaptured_PROD_V1", "true");
        localStorage.setItem("chatUserName", leadData.name);
        setMessages(prev => [...prev, { role: "ai", content: `Nice to meet you, ${leadData.name}! What are you looking for today? 👇`, options: ["Book a Session", "Ask a Question", "Just Saying Hi"] }]);
        setFlowState("FREE_CHAT");

        try {
            await fetch("/api/chat/lead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(leadData)
            });
        } catch (e) { console.error(e); }
        setLeadLoading(false);
    };

    const handleOptionClick = (option: string) => {
        handleSend(null, option);
    };

    const handleSend = async (e: React.FormEvent | null, textOverride?: string) => {
        if (e) e.preventDefault();
        const userMsg = textOverride || input.trim();
        if (!userMsg) return;

        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setLoading(true);

        // --- CORE BOT LOGIC ---
        setTimeout(async () => {
            const lowerMsg = userMsg.toLowerCase();
            let reply = "";
            let nextState = flowState;
            let options: string[] | undefined;

            // 1. GLOBAL INTENT CHECK (Booking)
            if (lowerMsg.includes("book") || lowerMsg.includes("schedule") || lowerMsg.includes("appointment")) {
                reply = "Sure! Which service would you like to book with Hari? Please choose from the options below:";
                options = SERVICES.map(s => s.label);
                nextState = "BOOKING_SERVICE_SELECT";
            }
            // 2. STATE SPECIFIC LOGIC
            else if (flowState === "BOOKING_SERVICE_SELECT") {
                const service = SERVICES.find(s => userMsg.includes(s.label) || userMsg.toLowerCase().includes(s.label.toLowerCase().split(" ")[0]));
                if (service) {
                    setBookingDetails({ ...bookingDetails, service: service });
                    reply = `Great! You selected ${service.label}. When would you like to have this session? (e.g., "Monday at 10 AM" or "Tomorrow evening")`;
                    nextState = "BOOKING_DATE_SELECT";
                } else {
                    reply = "I didn't catch that. Please select one of the services below.";
                    options = SERVICES.map(s => s.label);
                }
            }
            else if (flowState === "BOOKING_DATE_SELECT") {
                setBookingDetails({ ...bookingDetails, date: userMsg });
                reply = `Got it. Here's a summary:\n\n📌 Service: ${bookingDetails.service?.label}\n🗓️ Date/Time: ${userMsg}\n👤 Name: ${leadData.name}\n\nShall I confirm this booking?`;
                options = ["Yes, Confirm", "No, Change Details"];
                nextState = "BOOKING_CONFIRM";
            }
            else if (flowState === "BOOKING_CONFIRM") {
                if (lowerMsg.includes("yes")) {
                    const amount = bookingDetails.service?.price;
                    reply = `Booking Confirmed! ✅\n\nThe total fee is ₹${amount}. You can pay via UPI/GPay. Hari looks forward to seeing you!\n\nAnything else?`;
                    // Send confirmation to backend (offline route)
                    await fetch("/api/chat/offline", {
                        method: "POST",
                        body: JSON.stringify({ ...leadData, message: `BOOKING CONFIRMED: ${JSON.stringify(bookingDetails)}` })
                    });
                    nextState = "FREE_CHAT";
                    options = ["Start New Chat", "Done"];
                } else {
                    reply = "No problem. Let's start over. Which service would you like?";
                    options = SERVICES.map(s => s.label);
                    nextState = "BOOKING_SERVICE_SELECT";
                }
            }
            // 3. FREE CHAT / KNOWLEDGE BASE
            else {
                // SUGGESTION LOGIC
                if (lowerMsg.includes("ask a question")) {
                    reply = "Sure! What would you like to know about? 👇";
                    options = ["Who is Hari?", "Pricing & Services", "Rotaract Journey", "Business Advice"];
                    nextState = "FREE_CHAT";
                }
                else if (lowerMsg.includes("who is hari")) {
                    const kbMatch = findBestMatch("Describe yourself in one line");
                    reply = kbMatch || "Hari is a confident, hardworking, people-oriented person.";
                    options = ["What is his vision?", "Is he a foodie?", "Back to Menu"];
                }
                else if (lowerMsg.includes("pricing") || lowerMsg.includes("services")) {
                    reply = "Hari offers Training, Consulting, and Development services. What specific price do you need?";
                    options = ["Consulting Fee", "Training Cost", "Web Dev Price", "Book a Session"];
                }
                else if (lowerMsg.includes("just saying hi")) {
                    reply = "Hello! 👋 Great to see you here. I'm always ready to chat. You can ask me anything about Hari's work, life, or just say 'Tell me a joke'!";
                    options = ["Tell me a joke", "Book a Session"];
                }
                else if (lowerMsg.includes("joke") || lowerMsg.includes("funny")) {
                    const jokes = ["Why do I love Dosa? Because happiness comes round and crispy! 🥞", "My biggest enemy? The Alarm Clock. ⏰", "My secret talent? Sleeping anywhere. 😴"];
                    reply = jokes[Math.floor(Math.random() * jokes.length)];
                    options = ["Another one", "Back to Business"];
                }
                else {
                    // Search in KB
                    const kbMatch = findBestMatch(userMsg);
                    if (kbMatch) {
                        reply = kbMatch;
                    } else {
                        // Fallback
                        reply = "I'm not 100% sure about that, but I've noted your message and forwarded it to Hari directly! he'll reply via email.";
                        await fetch("/api/chat/offline", {
                            method: "POST",
                            body: JSON.stringify({ ...leadData, message: `UNANSWERED: ${userMsg}` })
                        });
                    }
                }

                setMessages(prev => [...prev, { role: "ai", content: reply, options }]);
                setFlowState(nextState);
                setLoading(false);
            }, 600); // Simulate typing delay
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
                        className="mb-4 w-[320px] md:w-[400px] h-[600px] max-h-[85vh] bg-[#0e0e0e] border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
                    >
                        {/* Header */}
                        <div className="p-5 bg-gradient-to-r from-orange-600/20 to-transparent border-b border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white shadow-xl shadow-orange-600/30">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white tracking-widest uppercase italic leading-none">Thenali</h3>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[9px] font-black text-emerald-500/80 uppercase tracking-widest">Online</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors p-1.5 bg-white/5 rounded-full">
                                <MinusCircle size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-black/20">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                                    <div className={`max-w-[90%] p-4 rounded-3xl text-sm font-medium leading-relaxed shadow-sm whitespace-pre-wrap ${m.role === "user"
                                        ? "bg-orange-600 text-white rounded-tr-none shadow-orange-600/20"
                                        : "bg-[#1a1a1a] text-white/90 border border-white/5 rounded-tl-none"
                                        }`}>
                                        {m.content}
                                    </div>
                                    {/* Options Chips */}
                                    {m.options && (
                                        <div className="flex flex-wrap gap-2 mt-3 max-w-[90%]">
                                            {m.options.map((opt, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleOptionClick(opt)}
                                                    className="px-3 py-1.5 bg-white/5 hover:bg-orange-600/20 border border-white/10 hover:border-orange-600/50 rounded-full text-xs text-orange-200 transition-all active:scale-95"
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Lead Form */}
                            {!leadCaptured && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1a1a1a] border border-white/5 rounded-[2rem] p-6 space-y-4">
                                    <h4 className="text-white text-sm font-bold mb-2">Let's get started! 👇</h4>
                                    <div className="space-y-3">
                                        <input required placeholder="Your Name" value={leadData.name} onChange={e => setLeadData({ ...leadData, name: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:border-orange-600 outline-none" />
                                        <input required type="email" placeholder="Email" value={leadData.email} onChange={e => setLeadData({ ...leadData, email: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:border-orange-600 outline-none" />
                                        <input required type="tel" placeholder="Mobile" value={leadData.mobile} onChange={e => setLeadData({ ...leadData, mobile: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:border-orange-600 outline-none" />
                                    </div>
                                    <button onClick={handleLeadSubmit} disabled={!leadData.name || !leadData.email || !leadData.mobile || leadLoading} className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-orange-700 transition-all disabled:opacity-50">
                                        {leadLoading ? <Loader2 className="animate-spin" size={14} /> : "Start Chatting"}
                                    </button>
                                </motion.div>
                            )}

                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-[#1a1a1a] p-3 rounded-2xl rounded-tl-none flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        {leadCaptured && (
                            <div className="p-4 border-t border-white/5 bg-[#1a1a1a]/50">
                                <form onSubmit={(e) => handleSend(e)} className="flex gap-2">
                                    <input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Type your message..."
                                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-orange-600 outline-none"
                                    />
                                    <button type="submit" disabled={!input.trim() || loading} className="bg-orange-600 p-3 rounded-xl text-white hover:bg-orange-700 transition-all disabled:opacity-50">
                                        <Send size={18} />
                                    </button>
                                </form>
                                <div className="flex justify-center mt-2">
                                    <button onClick={handleReset} className="text-[10px] text-white/30 hover:text-white transition-colors uppercase tracking-wider">Reset Chat</button>
                                </div>
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
                    className="w-14 h-14 md:w-16 md:h-16 bg-white text-black rounded-full shadow-2xl flex items-center justify-center border-4 border-orange-600 group relative"
                >
                    <MessageSquare size={24} className="md:w-7 md:h-7 group-hover:scale-110 transition-transform" />
                </motion.button>
            )}
        </div>
    );
}

