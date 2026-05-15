"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Trash2,
    Loader2,
    Share2,
    BarChart3,
    MessageCircle,
    Gamepad2,
    Eye,
    EyeOff,
    CheckCircle2,
    Image as ImageIcon,
    Video,
    MoreHorizontal,
    Trophy,
    X,
    ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

type InteractionType = "poll" | "question" | "game";

interface Poll {
    id: string;
    question: string;
    options: { text: string; count: number }[];
    isActive: boolean;
    backgroundUrl: string;
    backgroundType: "image" | "video";
    totalVotes: number;
    createdAt: string;
}

interface Question {
    id: string;
    prompt: string;
    isActive: boolean;
    backgroundUrl: string;
    backgroundType: "image" | "video";
    responses: { id: string; answerText: string; userName: string; createdAt: string }[];
    createdAt: string;
}

interface GameSession {
    id: string;
    gameId: string;
    title: string;
    isActive: boolean;
    playCount: number;
    createdAt: string;
}

export default function SocialInteractionModule() {
    const [activeTab, setActiveTab] = useState<InteractionType>("poll");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [polls, setPolls] = useState<Poll[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [games, setGames] = useState<GameSession[]>([]);

    // Creation States
    const [isCreating, setIsCreating] = useState(false);
    const [newPoll, setNewPoll] = useState({
        question: "",
        options: ["", ""],
        backgroundUrl: "",
        backgroundType: "image" as "image" | "video"
    });
    const [newQuestion, setNewQuestion] = useState({
        prompt: "",
        backgroundUrl: "",
        backgroundType: "image" as "image" | "video"
    });
    const [newGame, setNewGame] = useState({
        gameId: "memory",
        title: ""
    });

    const sessionId = typeof window !== "undefined" ? localStorage.getItem("admin_sessionId") || "" : "";

    useEffect(() => {
        fetchInteractions();
    }, []);

    const fetchInteractions = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/social/interactions", {
                headers: { "X-Session-Id": sessionId }
            });
            if (res.ok) {
                const data = await res.json();
                setPolls(data.polls || []);
                setQuestions(data.questions || []);
                setGames(data.games || []);
                if (data.warnings?.length) {
                    toast.error("Some data unavailable. Run repair-db from Settings.");
                }
            } else {
                toast.error("Failed to load interactions. Run repair-db from Settings.");
            }
        } catch (error) {
            toast.error("Failed to fetch interactions");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (activeTab === 'poll' && (!newPoll.question || newPoll.options.some(o => !o))) return toast.error("Fill all fields");
        if (activeTab === 'question' && !newQuestion.prompt) return toast.error("Fill the prompt");
        if (activeTab === 'game' && !newGame.title) return toast.error("Fill the title");

        setSubmitting(true);
        try {
            const payload = activeTab === 'poll' ? {
                type: 'poll',
                data: {
                    ...newPoll,
                    options: newPoll.options.map(text => ({ text }))
                }
            } :
                activeTab === 'question' ? { type: 'question', data: newQuestion } :
                    { type: 'game', data: newGame };

            const res = await fetch("/api/admin/social/interactions", {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Session-Id": sessionId },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success(`${activeTab} launched!`);
                setIsCreating(false);
                fetchInteractions();
                setNewPoll({ question: "", options: ["", ""], backgroundUrl: "", backgroundType: "image" });
                setNewQuestion({ prompt: "", backgroundUrl: "", backgroundType: "image" });
                setNewGame({ gameId: "memory", title: "" });
            } else {
                const err = await res.json().catch(() => ({}));
                toast.error(err.error || `Failed to create ${activeTab}. Run repair-db from Settings.`);
            }
        } catch (error) {
            toast.error("Launch failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string, type: InteractionType) => {
        if (!confirm("Are you sure? This will delete all associated responses.")) return;
        try {
            const res = await fetch(`/api/admin/social/interactions?id=${id}&type=${type}`, {
                method: "DELETE",
                headers: { "X-Session-Id": sessionId }
            });
            if (res.ok) {
                toast.success("Deleted!");
                fetchInteractions();
            }
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    const handleToggle = async (id: string, type: InteractionType, currentStatus: boolean) => {
        try {
            const res = await fetch("/api/admin/social/interactions", {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "X-Session-Id": sessionId },
                body: JSON.stringify({ id, type, isActive: !currentStatus })
            });
            if (res.ok) {
                toast.success(currentStatus ? "Paused" : "Live!");
                fetchInteractions();
            }
        } catch (error) {
            toast.error("Toggle failed");
        }
    };

    const stats = {
        totalPolls: polls.length,
        totalVotes: polls.reduce((acc, p) => acc + p.totalVotes, 0),
        avgVotes: polls.length ? Math.round(polls.reduce((acc, p) => acc + p.totalVotes, 0) / polls.length) : 0,
        activeInteractions: polls.filter(p => p.isActive).length + questions.filter(q => q.isActive).length + games.filter(g => g.isActive).length
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white items-center gap-3 flex">
                        <Share2 className="text-primary" size={28} />
                        Social Interaction Hub
                    </h1>
                    <p className="text-sm font-bold text-gray-500 mt-1 uppercase tracking-widest text-[10px]">Manage vibrant polls, questions, and games</p>
                </div>

                <div className="flex bg-white dark:bg-[#1e1e1e] p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    {(['poll', 'question', 'game'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab
                                ? "bg-primary text-white shadow-lg shadow-primary/25"
                                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                }`}
                        >
                            {tab}s
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Active Sections", value: stats.activeInteractions, icon: Eye, color: "bg-blue-500" },
                    { label: "Total Poll Votes", value: stats.totalVotes, icon: MessageCircle, color: "bg-emerald-500" },
                    { label: "Avg Engagement", value: stats.avgVotes, icon: BarChart3, color: "bg-orange-500" },
                    { label: "Interactions", value: polls.length + questions.length + games.length, icon: Trophy, color: "bg-purple-500" }
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-[#1e1e1e] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${stat.color} text-white shadow-lg bg-opacity-90`}>
                            <stat.icon size={20} />
                        </div>
                        <div>
                            <div className="text-2xl font-black">{stat.value}</div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">Synchronizing Interactions...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Add Interaction Card */}
                    <button
                        onClick={() => setIsCreating(true)}
                        className="h-64 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-white/5 hover:border-primary/50 transition-all group"
                    >
                        <div className="p-4 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                            <Plus size={32} />
                        </div>
                        <span className="font-black text-xs uppercase tracking-widest text-gray-400">Launch New {activeTab}</span>
                    </button>

                    {/* Poll Cards */}
                    {activeTab === 'poll' && polls.map((poll) => (
                        <div key={poll.id} className="bg-white dark:bg-[#1e1e1e] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 flex flex-col shadow-sm group hover:shadow-2xl transition-all duration-500 border-b-4 border-b-primary/20">
                            <div className="flex justify-between items-center mb-6">
                                <button
                                    onClick={() => handleToggle(poll.id, 'poll', poll.isActive)}
                                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${poll.isActive ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'}`}
                                >
                                    {poll.isActive ? 'Live' : 'Paused'}
                                </button>
                                <button onClick={() => handleDelete(poll.id, 'poll')} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <h3 className="text-xl font-black leading-tight mb-6 tracking-tight">{poll.question}</h3>
                            <div className="space-y-3 flex-1">
                                {poll.options.map((opt, idx) => {
                                    const percentage = poll.totalVotes > 0 ? (opt.count / poll.totalVotes) * 100 : 0;
                                    return (
                                        <div key={idx} className="relative h-12 bg-gray-50 dark:bg-white/5 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                className="absolute inset-y-0 left-0 bg-primary/10 dark:bg-primary/30"
                                            />
                                            <div className="relative h-full flex justify-between items-center px-5">
                                                <span className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wide">{opt.text}</span>
                                                <span className="text-[10px] font-black text-primary">{opt.count} Votes</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-8 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                <span>{poll.totalVotes} Contributions</span>
                                <span>{new Date(poll.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}

                    {/* Question Cards */}
                    {activeTab === 'question' && questions.map((q) => (
                        <div key={q.id} className="bg-white dark:bg-[#1e1e1e] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 flex flex-col shadow-sm group hover:shadow-2xl transition-all duration-500 border-b-4 border-b-pink-500/20">
                            <div className="flex justify-between items-center mb-6">
                                <button
                                    onClick={() => handleToggle(q.id, 'question', q.isActive)}
                                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${q.isActive ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'}`}
                                >
                                    {q.isActive ? 'Active' : 'Archived'}
                                </button>
                                <button onClick={() => handleDelete(q.id, 'question')} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <h3 className="text-xl font-black leading-tight mb-8 tracking-tight">{q.prompt}</h3>

                            <div className="space-y-2 mb-6">
                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Recent Answers</div>
                                {q.responses.slice(0, 3).map((r, i) => (
                                    <div key={i} className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 text-[11px] font-bold italic text-gray-600 dark:text-gray-400 leading-snug">
                                        "{r.answerText.length > 60 ? r.answerText.substring(0, 60) + "..." : r.answerText}"
                                    </div>
                                ))}
                                {q.responses.length === 0 && <div className="py-4 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">No answers yet</div>}
                            </div>

                            <button className="w-full py-4 rounded-2xl bg-pink-50 dark:bg-pink-500/10 text-pink-500 text-[10px] font-black uppercase tracking-widest hover:bg-pink-100 dark:hover:bg-pink-500/20 transition-all flex items-center justify-center gap-2">
                                <MessageCircle size={14} /> View All {q.responses.length} Responses
                            </button>
                        </div>
                    ))}

                    {/* Game Cards */}
                    {activeTab === 'game' && games.map((g) => (
                        <div key={g.id} className="bg-white dark:bg-[#1e1e1e] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 flex flex-col shadow-sm group hover:shadow-2xl transition-all duration-500 border-b-4 border-b-amber-500/20">
                            <div className="flex justify-between items-center mb-6">
                                <button
                                    onClick={() => handleToggle(g.id, 'game', g.isActive)}
                                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${g.isActive ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'}`}
                                >
                                    {g.isActive ? 'Available' : 'Hidden'}
                                </button>
                                <button onClick={() => handleDelete(g.id, 'game')} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-4 rounded-[2rem] bg-amber-100 text-amber-600">
                                    <Gamepad2 size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black leading-tight tracking-tight uppercase">{g.title}</h3>
                                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{g.gameId} game</span>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col justify-center items-center py-6">
                                <div className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{g.playCount}</div>
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Global Plays</div>
                            </div>

                            <button className="w-full py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest hover:border-amber-500/50 transition-all flex items-center justify-center gap-2">
                                <ExternalLink size={14} /> Open Live Version
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Creation Modal */}
            <AnimatePresence>
                {isCreating && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 pb-24 lg:pb-6">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsCreating(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-[#1e1e1e] w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-gray-100 dark:border-gray-800"
                        >
                            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                                <h3 className="text-xl font-black flex items-center gap-3">
                                    <Plus className="text-primary" /> Launch {activeTab}
                                </h3>
                                <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"><X size={18} /></button>
                            </div>

                            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                                {activeTab === 'poll' && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Poll Question</label>
                                            <input
                                                type="text"
                                                value={newPoll.question}
                                                onChange={e => setNewPoll({ ...newPoll, question: e.target.value })}
                                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-4 font-black text-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all uppercase tracking-tighter"
                                                placeholder="Ask your audience..."
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                <span>Options</span>
                                                <button onClick={() => setNewPoll({ ...newPoll, options: [...newPoll.options, ""] })} className="text-primary font-black">+ Add Option</button>
                                            </div>
                                            {newPoll.options.map((opt, i) => (
                                                <div key={i} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={opt}
                                                        onChange={e => {
                                                            const next = [...newPoll.options];
                                                            next[i] = e.target.value;
                                                            setNewPoll({ ...newPoll, options: next });
                                                        }}
                                                        className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 font-bold text-sm"
                                                        placeholder={`Option ${i + 1}`}
                                                    />
                                                    {newPoll.options.length > 2 && <button onClick={() => setNewPoll({ ...newPoll, options: newPoll.options.filter((_, idx) => idx !== i) })} className="text-red-400 p-2"><Trash2 size={16} /></button>}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {activeTab === 'question' && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Prompt / Topic</label>
                                        <textarea
                                            value={newQuestion.prompt}
                                            onChange={e => setNewQuestion({ ...newQuestion, prompt: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-4 font-black text-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[120px] uppercase tracking-tighter"
                                            placeholder="e.g. Ask me anything about Next.js!"
                                        />
                                    </div>
                                )}

                                {activeTab === 'game' && (
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Game Type</label>
                                            <select
                                                value={newGame.gameId}
                                                onChange={e => setNewGame({ ...newGame, gameId: e.target.value })}
                                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 font-black uppercase tracking-widest text-xs"
                                            >
                                                <option value="memory">Memory Game</option>
                                                <option value="puzzle">Sliding Puzzle</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Section Title</label>
                                            <input
                                                type="text"
                                                value={newGame.title}
                                                onChange={e => setNewGame({ ...newGame, title: e.target.value })}
                                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-4 font-black text-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all uppercase tracking-tighter"
                                                placeholder="e.g. Test your memory!"
                                            />
                                        </div>
                                    </div>
                                )}

                                {(activeTab === 'poll' || activeTab === 'question') && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Media</label>
                                            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                                                {(['image', 'video'] as const).map(type => (
                                                    <button
                                                        key={type}
                                                        onClick={() => {
                                                            if (activeTab === 'poll') setNewPoll({ ...newPoll, backgroundType: type });
                                                            else setNewQuestion({ ...newQuestion, backgroundType: type });
                                                        }}
                                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[8px] font-black uppercase transition-all ${(activeTab === 'poll' ? newPoll.backgroundType : newQuestion.backgroundType) === type
                                                            ? "bg-white dark:bg-gray-700 shadow-sm text-primary"
                                                            : "text-gray-400"
                                                            }`}
                                                    >
                                                        {type === 'video' ? <Video size={12} /> : <ImageIcon size={12} />} {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Media URL</label>
                                            <input
                                                type="text"
                                                value={activeTab === 'poll' ? newPoll.backgroundUrl : newQuestion.backgroundUrl}
                                                onChange={e => {
                                                    if (activeTab === 'poll') setNewPoll({ ...newPoll, backgroundUrl: e.target.value });
                                                    else setNewQuestion({ ...newQuestion, backgroundUrl: e.target.value });
                                                }}
                                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 font-black text-[10px]"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-8 bg-gray-50/50 dark:bg-white/5 border-t border-gray-100 dark:border-gray-800 flex gap-4">
                                <button
                                    onClick={() => setIsCreating(false)}
                                    className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreate}
                                    disabled={submitting}
                                    className="flex-1 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                    {submitting ? "Propagating..." : `Launch ${activeTab}`}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
