"use client";

import { useState, useRef, useEffect, createContext, useContext } from "react";
import { MinusCircle, MessageSquare, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ========== TYPES ==========
type IntentType = "LEARNING" | "BOOKING" | "PRICE" | "CERT" | "CASUAL" | "NEGATIVE" | "CONFUSED" | null;
type InterestLevel = "COLD" | "WARM" | "HOT";
type ConfidenceLevel = "LOW" | "MEDIUM" | "HIGH";
type BuyReadiness = "NO" | "MAYBE" | "YES";
type Mood = "HAPPY" | "NEUTRAL" | "BORED" | "STRESSED" | "CONFUSED";
type BookingStage = "NONE" | "MODE" | "DETAILS" | "DATETIME" | "CONFIRMED";
type ConversationStage =
    | "WELCOME"
    | "LEARNING_CATEGORY" | "LEARNING_SUBJECT" | "LEARNING_LEVEL" | "LEARNING_ACTION"
    | "BOOKING_MODE" | "BOOKING_DETAILS" | "BOOKING_DATETIME" | "BOOKING_CONFIRM"
    | "PRICE_CATEGORY" | "PRICE_PLANS" | "PRICE_DETAIL"
    | "CERT_REASON" | "CERT_DETAIL"
    | "CASUAL_MOOD" | "CASUAL_CHAT"
    | "NEGATIVE_CONCERN" | "NEGATIVE_RESOLVE";

interface UserState {
    userId: string;
    userName: string;
    userPhone: string;
    userEmail: string;
    userCity: string;
    intentPrimary: IntentType;
    intentSecondary: IntentType;
    interestLevel: InterestLevel;
    confidenceLevel: ConfidenceLevel;
    buyReadiness: BuyReadiness;
    mood: Mood;
    lastTopic: string;
    lastStage: ConversationStage;
    bookingStage: BookingStage;
    timeInChat: number;
    messageCount: number;
    returningUser: boolean;
    bookingData: {
        mode?: string;
        date?: string;
        time?: string;
    };
}

interface Message {
    role: "user" | "bot";
    content: string;
    options?: string[];
}

// ========== CONTEXT ==========
const ChatContext = createContext<{
    state: UserState;
    updateState: (updates: Partial<UserState>) => void;
} | null>(null);

function ChatProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<UserState>({
        userId: Math.random().toString(36).substr(2, 9),
        userName: "",
        userPhone: "",
        userEmail: "",
        userCity: "",
        intentPrimary: null,
        intentSecondary: null,
        interestLevel: "WARM",
        confidenceLevel: "MEDIUM",
        buyReadiness: "NO",
        mood: "NEUTRAL",
        lastTopic: "",
        lastStage: "WELCOME",
        bookingStage: "NONE",
        timeInChat: 0,
        messageCount: 0,
        returningUser: false,
        bookingData: {}
    });

    const updateState = (updates: Partial<UserState>) => {
        setState(prev => ({ ...prev, ...updates }));
    };

    return (
        <ChatContext.Provider value={{ state, updateState }}>
            {children}
        </ChatContext.Provider>
    );
}

function useChatState() {
    const context = useContext(ChatContext);
    if (!context) throw new Error("useChatState must be used within ChatProvider");
    return context;
}

// ========== INTENT CLASSIFICATION ==========
function classifyIntent(message: string): IntentType {
    const lower = message.toLowerCase();

    if (/(learn|study|teach|train|course|subject|maths|science|english|skill)/i.test(lower)) return "LEARNING";
    if (/(book|schedule|appointment|slot|session|timing|reserve)/i.test(lower)) return "BOOKING";
    if (/(fee|price|cost|charge|pay|amount|rupee|dollar)/i.test(lower)) return "PRICE";
    if (/(certificate|cert|proof|credential|resume)/i.test(lower)) return "CERT";
    if (/(hi|hello|hey|joke|funny|chat|talk|bore)/i.test(lower)) return "CASUAL";
    if (/(not sure|confuse|doubt|uncertain|worry|scare|difficult)/i.test(lower)) return "CONFUSED";
    if (/(no|bad|waste|useless|expensive|not interest)/i.test(lower)) return "NEGATIVE";

    return null;
}

// ========== MAIN COMPONENT ==========
function AIChatInner() {
    const { state, updateState } = useChatState();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initialize welcome message
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setTimeout(() => {
                setMessages([{
                    role: "bot",
                    content: "Heyyy 👋😄 Welcome to Hariharan Hub!\n\nI'm your smart assistant 🤖✨\nI help students and professionals with:\n• Learning\n• Training\n• Career growth\n• Booking sessions\n• Certificates\n• And even casual chat 😄\n\nBefore we go ahead…\nTell me honestly 😊\nWhat are you mainly here for today?",
                    options: ["Learn something", "Book a session", "Know fees", "Certificate info", "Career guidance", "Just exploring", "Casual chat"]
                }]);
            }, 500);
        }
    }, [isOpen]);

    // Auto scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const handleSend = async (userMessage?: string) => {
        const msg = userMessage || input.trim();
        if (!msg) return;

        setInput("");
        setMessages(prev => [...prev, { role: "user", content: msg }]);
        setLoading(true);

        // Update message count
        updateState({ messageCount: state.messageCount + 1 });

        // Classify intent
        const intent = classifyIntent(msg);
        if (intent) {
            updateState({
                intentPrimary: intent,
                interestLevel: msg.length > 20 ? "HOT" : state.interestLevel
            });
        }

        setTimeout(() => {
            const response = generateResponse(msg, state);
            setMessages(prev => [...prev, response]);
            setLoading(false);
        }, 800);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[60]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4 w-[340px] md:w-[420px] h-[650px] max-h-[85vh] bg-[#0e0e0e] border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
                    >
                        {/* Header */}
                        <div className="p-5 bg-gradient-to-r from-orange-600/20 to-transparent border-b border-white/5 flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-black text-white tracking-widest uppercase italic">Hari Bot</h3>
                                <p className="text-[9px] text-emerald-500 uppercase tracking-wider">● Online</p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
                                <MinusCircle size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-black/20">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                                    <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed whitespace-pre-wrap ${m.role === "user"
                                            ? "bg-orange-600 text-white rounded-tr-none"
                                            : "bg-[#1a1a1a] text-white/90 border border-white/5 rounded-tl-none"
                                        }`}>
                                        {m.content}
                                    </div>
                                    {m.options && (
                                        <div className="flex flex-wrap gap-2 mt-3 max-w-[85%]">
                                            {m.options.map((opt, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleSend(opt)}
                                                    className="px-3 py-1.5 bg-white/5 hover:bg-orange-600/20 border border-white/10 hover:border-orange-600/50 rounded-full text-xs text-orange-200 transition-all active:scale-95"
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-[#1a1a1a] p-3 rounded-2xl flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/5 bg-[#1a1a1a]/50">
                            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
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
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isOpen && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 md:w-16 md:h-16 bg-white text-black rounded-full shadow-2xl flex items-center justify-center border-4 border-orange-600"
                >
                    <MessageSquare size={24} />
                </motion.button>
            )}
        </div>
    );
}

// ========== RESPONSE GENERATOR ==========
function generateResponse(message: string, state: UserState): Message {
    const lower = message.toLowerCase();
    const intent = state.intentPrimary;

    // LEARNING FLOW
    if (intent === "LEARNING" || lower.includes("learn")) {
        if (!state.lastStage || state.lastStage === "WELCOME") {
            return {
                role: "bot",
                content: "Nice 😄✨ learning is always a power move!\n\nJust so I guide you perfectly…\nTell me one thing 😊\n\nAre you mainly:",
                options: ["School student", "College student", "Working professional", "Career switcher", "Just curious"]
            };
        }
    }

    // BOOKING FLOW
    if (intent === "BOOKING" || lower.includes("book")) {
        if (state.bookingStage === "NONE") {
            return {
                role: "bot",
                content: "Wonderful 😄👏 booking early is a very smart decision!\n\nBefore I proceed, just one quick question 😊\nWhat kind of session do you prefer?",
                options: ["Online", "Offline", "Personal coaching", "Group class", "Just demo"]
            };
        }
    }

    // PRICING FLOW
    if (intent === "PRICE" || lower.includes("fee") || lower.includes("price")) {
        return {
            role: "bot",
            content: "Great question 😄💰 very practical thinking!\n\nFees depend on your goal, level & duration.\nSo first tell me honestly 😊\n\nThis is mainly for:",
            options: ["School studies", "College studies", "Job skills", "Career growth", "Company training"]
        };
    }

    // CERTIFICATION FLOW
    if (intent === "CERT" || lower.includes("certificate")) {
        return {
            role: "bot",
            content: "Very smart thinking 😄🎓\nCertificates really make a BIG difference in career.\n\nTell me one thing honestly 😊\nYou mainly want certificate for:",
            options: ["Resume", "Job interview", "Internship", "College", "Skill proof", "Knowledge"]
        };
    }

    // CASUAL/MOOD
    if (intent === "CASUAL" || /^(hi|hello|hey)$/i.test(lower)) {
        return {
            role: "bot",
            content: "Haha 😄 nice to relax a bit!\n\nTell me 😉\nRight now your mood is more like:",
            options: ["Happy 😄", "Bored 😐", "Tired 😴", "Stressed 😵", "Motivated 🔥"]
        };
    }

    // CONFUSED/NEGATIVE
    if (intent === "CONFUSED" || intent === "NEGATIVE") {
        return {
            role: "bot",
            content: "I understand 🙂 totally normal to feel unsure.\n\nActually…\nPeople who ask questions usually become the MOST successful 😄\n\nLet me help you calmly ✨\nWhat is your biggest concern right now?",
            options: ["Fees", "Time", "Difficulty", "Usefulness", "Career outcome"]
        };
    }

    // DEFAULT FALLBACK
    return {
        role: "bot",
        content: "Got it 😊 I'm here to help!\n\nWould you like me to:",
        options: ["Explain more", "Book session", "Show prices", "Talk to expert", "Main menu"]
    };
}

export default function AIChat() {
    return (
        <ChatProvider>
            <AIChatInner />
        </ChatProvider>
    );
}
