"use client";

import { useEffect, useState } from "react";
import { Loader2, Medal, User, Gamepad2, Keyboard, Trash2, Search, ChevronDown, Trophy, Clock, Hash } from "lucide-react";

interface TypingEntry {
    id: string;
    userName: string;
    wpm: number;
    accuracy: number;
    duration: number;
    difficulty: string;
    createdAt: string;
}

interface QuizEntry {
    id: string;
    userName: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    completedAt: string;
}

interface GameEntry {
    id: string;
    gameId: string;
    userName: string;
    score: number;
    moves: number | null;
    timeTaken: number | null;
    createdAt: string;
}

interface Quiz {
    id: string;
    title: string;
}

const MINI_GAMES = [
    { id: "all", name: "All Games" },
    { id: "dino", name: "Dino Runner" },
    { id: "memory", name: "Memory Card" },
    { id: "puzzle", name: "Picture Puzzle" },
    { id: "scramble", name: "Word Scramble" }
];

export default function LeaderboardModule() {
    const [activeTab, setActiveTab] = useState<"typing" | "quiz" | "mini-games">("mini-games");
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Typing States
    const [duration, setDuration] = useState<2 | 5 | 30 | "all">("all");
    const [difficulty, setDifficulty] = useState<'basic' | 'intermediate' | 'expert' | "all">('all');
    const [typingEntries, setTypingEntries] = useState<TypingEntry[]>([]);

    // Quiz States
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [selectedQuizId, setSelectedQuizId] = useState<string>("all");
    const [quizEntries, setQuizEntries] = useState<QuizEntry[]>([]);

    // Mini Games States
    const [selectedGameId, setSelectedGameId] = useState<string>("all");
    const [gameEntries, setGameEntries] = useState<GameEntry[]>([]);

    useEffect(() => {
        if (activeTab === "typing") {
            fetchTypingLeaderboard();
        } else if (activeTab === "quiz") {
            fetchQuizzes();
            fetchQuizLeaderboard();
        } else {
            fetchGameLeaderboard();
        }
    }, [activeTab, duration, difficulty, selectedQuizId, selectedGameId]);

    const fetchTypingLeaderboard = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (duration !== "all") params.set("duration", duration.toString());
            if (difficulty !== "all") params.set("difficulty", difficulty);
            const res = await fetch(`/api/typing-test/leaderboard?${params.toString()}`);
            const data = await res.json();
            setTypingEntries(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchQuizzes = async () => {
        try {
            const res = await fetch("/api/quizzes");
            const data = await res.json();
            if (Array.isArray(data)) setQuizzes(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchQuizLeaderboard = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/quiz/leaderboard?quizId=${selectedQuizId}`);
            const data = await res.json();
            setQuizEntries(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGameLeaderboard = async () => {
        setLoading(true);
        try {
            let url = "/api/games/leaderboard";
            if (selectedGameId !== "all") url += `?gameId=${selectedGameId}`;
            const res = await fetch(url);
            const data = await res.json();
            setGameEntries(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this record permanently?")) return;
        setDeletingId(id);
        try {
            let endpoint = "";
            if (activeTab === "typing") endpoint = `/api/typing-test/leaderboard?id=${id}`;
            else if (activeTab === "quiz") endpoint = `/api/quiz/leaderboard?id=${id}`;
            else endpoint = `/api/games/leaderboard?id=${id}`;

            const res = await fetch(endpoint, { method: "DELETE" });
            if (res.ok) {
                if (activeTab === "typing") fetchTypingLeaderboard();
                else if (activeTab === "quiz") fetchQuizLeaderboard();
                else fetchGameLeaderboard();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setDeletingId(null);
        }
    };

    const getGameName = (id: string) => MINI_GAMES.find(g => g.id === id)?.name || id;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                        <Trophy className="text-yellow-500" />
                        Leaderboards
                    </h2>
                    <p className="text-secondary text-[10px] font-bold mt-1 uppercase tracking-[0.2em] opacity-60">
                        Managing top performers across activities
                    </p>
                </div>

                <div className="flex bg-gray-100/80 p-1.5 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto max-w-full">
                    <button
                        onClick={() => setActiveTab("mini-games")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === "mini-games" ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                    >
                        <Gamepad2 size={14} /> Arcade
                    </button>
                    <button
                        onClick={() => setActiveTab("typing")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === "typing" ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                    >
                        <Keyboard size={14} /> Typing
                    </button>
                    <button
                        onClick={() => setActiveTab("quiz")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === "quiz" ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                    >
                        <Trophy size={14} /> Quiz
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-wrap items-center gap-6">
                {activeTab === "mini-games" && (
                    <div className="flex flex-col gap-1.5 w-full md:w-64">
                        <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-2">Select Game</label>
                        <div className="relative">
                            <select
                                value={selectedGameId}
                                onChange={(e) => setSelectedGameId(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:border-primary/30 appearance-none cursor-pointer"
                            >
                                {MINI_GAMES.map((g) => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                        </div>
                    </div>
                )}

                {activeTab === "typing" ? (
                    <>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-2">Duration</label>
                            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                                {["all", 2, 5, 30].map((val) => (
                                    <button
                                        key={val}
                                        onClick={() => setDuration(val as any)}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${duration === val ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                    >
                                        {val === "all" ? "All" : `${val}M`}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-2">Difficulty</label>
                            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                                {["all", "basic", "intermediate", "expert"].map((lvl) => (
                                    <button
                                        key={lvl}
                                        onClick={() => setDifficulty(lvl as any)}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${difficulty === lvl ? "bg-white text-purple-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                    >
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                ) : activeTab === "quiz" && (
                    <div className="flex flex-col gap-1.5 w-full md:w-80">
                        <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-2">Select Quiz</label>
                        <div className="relative">
                            <select
                                value={selectedQuizId}
                                onChange={(e) => setSelectedQuizId(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:border-primary/30 appearance-none cursor-pointer"
                            >
                                <option value="all">Overall</option>
                                {quizzes.map((q) => (
                                    <option key={q.id} value={q.id}>{q.title}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center p-20">
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100 text-left">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Rank</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">User</th>
                                    {activeTab === "typing" ? (
                                        <>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Speed</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Accuracy</th>
                                        </>
                                    ) : activeTab === "quiz" ? (
                                        <>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Score</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Correct</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Game</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Score</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Stats</th>
                                        </>
                                    )}
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(activeTab === "typing" ? typingEntries : activeTab === "quiz" ? quizEntries : gameEntries).length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center opacity-30">
                                                <Trophy size={48} className="mb-4 text-gray-400" />
                                                <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">No results found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    (activeTab === "typing" ? typingEntries : activeTab === "quiz" ? quizEntries : gameEntries).map((entry, index) => (
                                        <tr key={entry.id} className="group hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0 border-l-4 border-l-transparent hover:border-l-primary/30">
                                            <td className="px-8 py-5">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${index === 0 ? "bg-yellow-100 text-yellow-600 shadow-sm" :
                                                    index === 1 ? "bg-gray-100 text-gray-600 shadow-sm" :
                                                        index === 2 ? "bg-orange-100 text-orange-600 shadow-sm" :
                                                            "bg-white text-gray-400 border border-gray-100"
                                                    }`}>
                                                    {index + 1}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-primary/5 text-primary rounded-xl flex items-center justify-center shrink-0">
                                                        <User size={16} />
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">{entry.userName}</span>
                                                </div>
                                            </td>
                                            {activeTab === "typing" ? (
                                                <>
                                                    <td className="px-8 py-5">
                                                        <span className="text-lg font-black text-gray-900">{(entry as TypingEntry).wpm}</span>
                                                        <span className="text-[10px] text-gray-400 ml-1 font-bold">WPM</span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${(entry as TypingEntry).accuracy >= 95 ? "bg-emerald-100 text-emerald-600" : (entry as TypingEntry).accuracy >= 80 ? "bg-yellow-100 text-yellow-600" : "bg-red-100 text-red-600"}`}>
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
                                                        <span className="text-xs font-bold text-gray-900">{(entry as QuizEntry).correctAnswers} / {(entry as QuizEntry).totalQuestions}</span>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">{getGameName((entry as GameEntry).gameId)}</span>
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
                                                                    <span className="text-xs font-black">{(entry as GameEntry).moves}</span>
                                                                </div>
                                                            )}
                                                            {(entry as GameEntry).timeTaken !== null && (
                                                                <div className="flex items-center gap-1.5" title="Time Taken">
                                                                    <Clock size={12} className="text-blue-500" />
                                                                    <span className="text-xs font-black">{(entry as GameEntry).timeTaken}s</span>
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
                                                <button
                                                    onClick={() => handleDelete(entry.id)}
                                                    disabled={deletingId === entry.id}
                                                    className="p-2.5 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all disabled:opacity-50"
                                                >
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

