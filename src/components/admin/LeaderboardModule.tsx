"use client";

import { useEffect, useState } from "react";
import { Loader2, User, Gamepad2, Keyboard, Trash2, ChevronDown, Trophy, Clock, Hash, Check } from "lucide-react";

interface TypingEntry {
    id: string; userName: string; wpm: number; accuracy: number; duration: number; difficulty: string; createdAt: string;
}
interface QuizEntry {
    id: string; userName: string; score: number; correctAnswers: number; totalQuestions: number; completedAt: string;
}
interface GameEntry {
    id: string; gameId: string; userName: string; score: number; moves: number | null; timeTaken: number | null; createdAt: string;
}
interface Quiz { id: string; title: string; }

const MINI_GAMES = [
    { id: "all", name: "All Games" },
    { id: "dino", name: "Dino Runner" },
    { id: "memory", name: "Memory Card" },
    { id: "puzzle", name: "Picture Puzzle" },
    { id: "scramble", name: "Word Scramble" },
];

function FilterDropdown<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
    const [open, setOpen] = useState(false);
    const current = options.find((o) => o.value === value)?.label ?? value;
    return (
        <div className="relative" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false); }}>
            <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 w-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 transition-colors">
                <span className="flex-1 text-left">{current}</span>
                <ChevronDown size={13} className={`transition-transform shrink-0 ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
                <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white dark:bg-[#252525] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
                    {options.map((opt) => (
                        <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }} className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-xs font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${value === opt.value ? "text-primary" : "text-gray-700 dark:text-gray-300"}`}>
                            {opt.label}
                            {value === opt.value && <Check size={12} className="text-primary" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function LeaderboardModule() {
    const [activeTab, setActiveTab] = useState<"typing" | "quiz" | "mini-games">("mini-games");
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [duration, setDuration] = useState<2 | 5 | 30 | "all">("all");
    const [difficulty, setDifficulty] = useState<"basic" | "intermediate" | "expert" | "all">("all");
    const [typingEntries, setTypingEntries] = useState<TypingEntry[]>([]);

    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [selectedQuizId, setSelectedQuizId] = useState<string>("all");
    const [quizEntries, setQuizEntries] = useState<QuizEntry[]>([]);

    const [selectedGameId, setSelectedGameId] = useState<string>("all");
    const [gameEntries, setGameEntries] = useState<GameEntry[]>([]);

    useEffect(() => {
        if (activeTab === "typing") fetchTypingLeaderboard();
        else if (activeTab === "quiz") { fetchQuizzes(); fetchQuizLeaderboard(); }
        else fetchGameLeaderboard();
    }, [activeTab, duration, difficulty, selectedQuizId, selectedGameId]);

    const fetchTypingLeaderboard = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (duration !== "all") params.set("duration", duration.toString());
            if (difficulty !== "all") params.set("difficulty", difficulty);
            const res = await fetch(`/api/typing-test/leaderboard?${params}`);
            const data = await res.json();
            setTypingEntries(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const fetchQuizzes = async () => {
        try {
            const res = await fetch("/api/quizzes");
            const data = await res.json();
            if (Array.isArray(data)) setQuizzes(data);
        } catch (e) { console.error(e); }
    };

    const fetchQuizLeaderboard = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/quiz/leaderboard?quizId=${selectedQuizId}`);
            const data = await res.json();
            setQuizEntries(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const fetchGameLeaderboard = async () => {
        setLoading(true);
        try {
            const url = selectedGameId !== "all" ? `/api/games/leaderboard?gameId=${selectedGameId}` : "/api/games/leaderboard";
            const res = await fetch(url);
            const data = await res.json();
            setGameEntries(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        try {
            const endpoint = activeTab === "typing" ? `/api/typing-test/leaderboard?id=${id}` : activeTab === "quiz" ? `/api/quiz/leaderboard?id=${id}` : `/api/games/leaderboard?id=${id}`;
            const res = await fetch(endpoint, { method: "DELETE" });
            if (res.ok) {
                if (activeTab === "typing") fetchTypingLeaderboard();
                else if (activeTab === "quiz") fetchQuizLeaderboard();
                else fetchGameLeaderboard();
            }
        } catch (e) { console.error(e); } finally { setDeletingId(null); }
    };

    const getGameName = (id: string) => MINI_GAMES.find((g) => g.id === id)?.name || "Unknown Game";
    const entries = activeTab === "typing" ? typingEntries : activeTab === "quiz" ? quizEntries : gameEntries;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <Trophy className="text-yellow-500" />
                        Leaderboards
                    </h2>
                    <p className="text-gray-400 text-[10px] font-bold mt-1 uppercase tracking-[0.2em]">
                        Managing top performers across activities
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-gray-100 dark:bg-white/10 p-1.5 rounded-2xl border border-gray-200 dark:border-white/10 overflow-x-auto max-w-full">
                    {[
                        { id: "mini-games" as const, icon: Gamepad2, label: "Arcade" },
                        { id: "typing" as const, icon: Keyboard, label: "Typing" },
                        { id: "quiz" as const, icon: Trophy, label: "Quiz" },
                    ].map(({ id, icon: Icon, label }) => (
                        <button key={id} onClick={() => setActiveTab(id)} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === id ? "bg-white dark:bg-[#1e1e1e] text-primary shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"}`}>
                            <Icon size={14} /> {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-wrap items-end gap-6">
                {activeTab === "mini-games" && (
                    <div className="flex flex-col gap-1.5 w-full md:w-64">
                        <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-1">Select Game</label>
                        <FilterDropdown
                            value={selectedGameId}
                            onChange={setSelectedGameId}
                            options={MINI_GAMES.map((g) => ({ value: g.id, label: g.name }))}
                                                    />
                    </div>
                )}

                {activeTab === "typing" && (
                    <>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-1">Duration</label>
                            <div className="flex bg-gray-100 dark:bg-white/10 p-1 rounded-xl border border-gray-200 dark:border-white/10">
                                {(["all", 2, 5, 30] as const).map((val) => (
                                    <button key={val} onClick={() => setDuration(val)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${duration === val ? "bg-white dark:bg-[#1e1e1e] text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"}`}>
                                        {val === "all" ? "All" : `${val}M`}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-1">Difficulty</label>
                            <div className="flex bg-gray-100 dark:bg-white/10 p-1 rounded-xl border border-gray-200 dark:border-white/10">
                                {(["all", "basic", "intermediate", "expert"] as const).map((lvl) => (
                                    <button key={lvl} onClick={() => setDifficulty(lvl)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${difficulty === lvl ? "bg-white dark:bg-[#1e1e1e] text-purple-600 shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"}`}>
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {activeTab === "quiz" && (
                    <div className="flex flex-col gap-1.5 w-full md:w-80">
                        <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-1">Select Quiz</label>
                        <FilterDropdown
                            value={selectedQuizId}
                            onChange={setSelectedQuizId}
                            options={[{ value: "all", label: "Overall" }, ...quizzes.map((q) => ({ value: q.id, label: q.title }))]}
                                                    />
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#1e1e1e] rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={32} /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-gray-800 text-left">
                                    {["Rank", "User",
                                        ...(activeTab === "typing" ? ["Speed", "Accuracy"] : activeTab === "quiz" ? ["Score", "Correct"] : ["Game", "Score", "Stats"]),
                                        "Date", "Actions"
                                    ].map((h) => (
                                        <th key={h} className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 ${h === "Actions" ? "text-right" : ""}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {entries.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center opacity-30">
                                                <Trophy size={48} className="mb-4 text-gray-400" />
                                                <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">No results found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    entries.map((entry, index) => (
                                        <tr key={entry.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0">
                                            <td className="px-8 py-5">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                                                    index === 0 ? "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600" :
                                                    index === 1 ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300" :
                                                    index === 2 ? "bg-orange-100 dark:bg-orange-500/20 text-orange-600" :
                                                    "bg-gray-50 dark:bg-white/5 text-gray-400 border border-gray-200 dark:border-gray-700"
                                                }`}>{index + 1}</div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                                                        <User size={16} />
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{entry.userName}</span>
                                                </div>
                                            </td>
                                            {activeTab === "typing" ? (
                                                <>
                                                    <td className="px-8 py-5">
                                                        <span className="text-lg font-black text-gray-900 dark:text-white">{(entry as TypingEntry).wpm}</span>
                                                        <span className="text-[10px] text-gray-400 ml-1 font-bold">WPM</span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${(entry as TypingEntry).accuracy >= 95 ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600" : (entry as TypingEntry).accuracy >= 80 ? "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600" : "bg-red-100 dark:bg-red-500/20 text-red-600"}`}>
                                                            {(entry as TypingEntry).accuracy}%
                                                        </span>
                                                    </td>
                                                </>
                                            ) : activeTab === "quiz" ? (
                                                <>
                                                    <td className="px-8 py-5">
                                                        <span className="text-lg font-black text-primary">{(entry as QuizEntry).score}</span>
                                                        <span className="text-[10px] text-gray-400 ml-1 font-bold">PTS</span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className="text-xs font-bold text-gray-900 dark:text-white">{(entry as QuizEntry).correctAnswers} / {(entry as QuizEntry).totalQuestions}</span>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300">{getGameName((entry as GameEntry).gameId)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className="text-xl font-black text-primary italic">{(entry as GameEntry).score}</span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-4">
                                                            {(entry as GameEntry).moves !== null && (
                                                                <div className="flex items-center gap-1.5" title="Moves">
                                                                    <Hash size={12} className="text-orange-500" />
                                                                    <span className="text-xs font-black dark:text-gray-300">{(entry as GameEntry).moves}</span>
                                                                </div>
                                                            )}
                                                            {(entry as GameEntry).timeTaken !== null && (
                                                                <div className="flex items-center gap-1.5" title="Time Taken">
                                                                    <Clock size={12} className="text-blue-500" />
                                                                    <span className="text-xs font-black dark:text-gray-300">{(entry as GameEntry).timeTaken}s</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                            <td className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                {new Date((entry as any).createdAt || (entry as any).completedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button onClick={() => handleDelete(entry.id)} disabled={deletingId === entry.id} className="p-2.5 bg-red-50 dark:bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all disabled:opacity-50">
                                                    {deletingId === entry.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
