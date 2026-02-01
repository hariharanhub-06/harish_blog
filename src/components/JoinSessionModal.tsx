"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, ArrowRight, Video, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

interface JoinSessionModalProps {
    sessionId: string;
    sessionTitle: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function JoinSessionModal({ sessionId, sessionTitle, isOpen, onClose }: JoinSessionModalProps) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();

    // Auto-fill and show error if redirected back
    useEffect(() => {
        if (isOpen) {
            const err = searchParams.get("joinError");
            const urlEmail = searchParams.get("email");
            if (err === "unauthorized") {
                setError("Access Denied. This email is not registered for this session.");
                if (urlEmail) setEmail(urlEmail);
            }
        }
    }, [isOpen, searchParams]);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/sessions/check-registration", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId, email })
            });
            const data = await res.json();

            if (data.registered) {
                window.location.href = `/live/${sessionId}?email=${encodeURIComponent(email)}`;
            } else {
                setError(data.error || "Access Denied. Please ensure you use the registered email.");
                setLoading(false);
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl relative"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                        >
                            <X size={20} className="text-gray-400" />
                        </button>

                        <div className="p-8 pt-12 text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-600">
                                <Video size={32} />
                            </div>

                            <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-tight mb-2 uppercase">
                                Join Session
                            </h2>
                            <p className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-8 px-4">
                                {sessionTitle}
                            </p>

                            <form onSubmit={handleJoin} className="space-y-4 text-left">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1"> Registered Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                        <input
                                            required
                                            type="email"
                                            placeholder="Enter your email"
                                            className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 rounded-2xl font-bold text-gray-900 outline-none transition-all text-sm ${error ? 'border-red-500 bg-red-50' : 'border-transparent focus:border-red-500/20 focus:bg-white'}`}
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                if (error) setError(null);
                                            }}
                                        />
                                    </div>
                                    {error && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-[10px] text-red-600 font-black uppercase tracking-widest ml-1"
                                        >
                                            {error}
                                        </motion.p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !email}
                                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-black active:scale-95 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <>
                                            Entering Room
                                            <ArrowRight size={16} />
                                        </>
                                    )}
                                </button>
                            </form>

                            <p className="mt-8 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                Check your confirmation email for the join link.
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
