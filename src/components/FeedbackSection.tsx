
"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare, User, Building, Send, Loader2, Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { InfiniteCarousel } from "./InfiniteCarousel";

interface Feedback {
    id: string;
    name: string;
    role: string;
    organization: string;
    rating: number;
    content: string;
    createdAt: string;
}

export default function FeedbackSection() {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        role: "Student",
        organization: "",
        rating: 5,
        content: ""
    });

    const fetchFeedbacks = async () => {
        try {
            const res = await fetch("/api/feedback");
            if (res.ok) {
                const data = await res.json();
                setFeedbacks(data);
            }
        } catch (error) {
            console.error("Failed to fetch feedbacks", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const averageRating = feedbacks.length > 0
        ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)
        : "5.0";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setSubmitted(true);
                setFormData({ name: "", role: "Student", organization: "", rating: 5, content: "" });
                // Note: It won't show in the carousel until admin approves
            }
        } catch (error) {
            console.error("Feedback submit error", error);
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <section id="feedback" className="container mx-auto px-6 py-24 scroll-mt-20">
            <div className="flex flex-col items-center mb-16 text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-600 mb-4">Testimonials</span>
                <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-6">
                    Minds <span className="text-orange-600">Empowered</span>
                </h2>
                <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl">
                    <div className="flex text-orange-500">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={18} fill={i < Math.round(Number(averageRating)) ? "currentColor" : "none"} />
                        ))}
                    </div>
                    <span className="text-xl font-black text-white">{averageRating} / 5.0</span>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest border-l border-white/10 pl-4">{feedbacks.length} Reviews</span>
                </div>
            </div>

            {/* Testimonials Carousel */}
            {feedbacks.length > 0 ? (
                <div className="mb-24 py-12 bg-white/5 border-y border-white/5 relative overflow-hidden backdrop-blur-sm">
                    <InfiniteCarousel
                        speed={20} // 3 RPM (60s / 3 = 20s)
                        items={feedbacks.map((f) => (
                            <div key={f.id} className="w-[85vw] md:w-[400px] p-8 bg-black/40 border border-white/10 rounded-[2.5rem] flex flex-col h-full relative group hover:border-orange-600/30 transition-all duration-500">
                                <Quote className="absolute top-6 right-8 text-white/5 group-hover:text-orange-600/10 transition-colors" size={64} />

                                <div className="flex text-orange-500 mb-6">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} fill={i < f.rating ? "currentColor" : "none"} />
                                    ))}
                                </div>

                                <p className="text-white/80 text-sm font-bold leading-relaxed mb-8 flex-1 italic">
                                    &ldquo;{f.content}&rdquo;
                                </p>

                                <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                                    <div className="w-12 h-12 rounded-2xl bg-orange-600/20 flex items-center justify-center text-orange-600">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-white uppercase tracking-tight">{f.name}</h4>
                                        <p className="text-[10px] font-bold text-orange-500/80 uppercase tracking-widest mt-1">
                                            {f.role} • {f.organization}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    />
                </div>
            ) : !loading && (
                <div className="text-center py-20 text-gray-500 font-bold uppercase tracking-widest opacity-50">
                    No testimonials yet. Be the first to share your experience!
                </div>
            )}

            {/* Feedback Submission Form */}
            <div className="max-w-4xl mx-auto">
                <div className="bg-[#1a1a1a] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 rounded-full blur-[80px] -mr-32 -mt-32" />

                    <div className="p-8 md:p-16 relative z-10 flex flex-col md:flex-row gap-12">
                        <div className="md:w-1/3">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Share Your <span className="text-orange-600">Impact</span></h3>
                            <p className="text-gray-400 text-sm font-bold leading-relaxed mb-8">
                                Your feedback helps me improve and inspires other students. It only takes a minute!
                            </p>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3 text-white/40">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-orange-600"><Star size={16} /></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Rate Experience</span>
                                </div>
                                <div className="flex items-center gap-3 text-white/40">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-orange-600"><Building size={16} /></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Mention Org</span>
                                </div>
                            </div>
                        </div>

                        <div className="md:w-2/3">
                            <AnimatePresence mode="wait">
                                {submitted ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="h-full flex flex-col items-center justify-center text-center py-12"
                                    >
                                        <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                                            <Send size={40} />
                                        </div>
                                        <h4 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Thank You!</h4>
                                        <p className="text-gray-400 font-bold text-sm">Your feedback has been submitted for review.</p>
                                        <button
                                            onClick={() => setSubmitted(false)}
                                            className="mt-8 text-orange-600 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors"
                                        >
                                            Submit Another?
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.form
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        onSubmit={handleSubmit}
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-4">Full Name</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-orange-600 transition-all font-bold"
                                                    placeholder="Hari Haran"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-4">Tell us who you are</label>
                                                <select
                                                    value={formData.role}
                                                    onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-orange-600 transition-all font-bold appearance-none cursor-pointer"
                                                >
                                                    <option value="Student" className="bg-[#1a1a1a]">Student</option>
                                                    <option value="Professional" className="bg-[#1a1a1a]">Professional</option>
                                                    <option value="Entrepreneur" className="bg-[#1a1a1a]">Entrepreneur</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-4">College / Company Name</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.organization}
                                                onChange={e => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-orange-600 transition-all font-bold"
                                                placeholder="Example University / Tech Corp"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-4">Rating</label>
                                            <div className="flex gap-4 items-center bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                                                        className={`transition-all ${star <= formData.rating ? "text-orange-500 scale-110" : "text-white/10 hover:text-white/30"}`}
                                                    >
                                                        <Star size={24} fill={star <= formData.rating ? "currentColor" : "none"} />
                                                    </button>
                                                ))}
                                                <span className="text-xs font-black text-white ml-auto uppercase tracking-widest">{formData.rating} Star{formData.rating > 1 ? 's' : ''}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-4">Your Feedback</label>
                                            <textarea
                                                required
                                                rows={4}
                                                value={formData.content}
                                                onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-orange-600 transition-all font-bold resize-none"
                                                placeholder="Describe your experience with Hari's training or services..."
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={formLoading}
                                            className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-orange-600/20 disabled:opacity-50"
                                        >
                                            {formLoading ? <Loader2 className="animate-spin" size={18} /> : <>Submit Feedback <Send size={18} /></>}
                                        </button>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

