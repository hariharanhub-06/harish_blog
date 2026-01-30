
"use client";

import { useEffect, useState } from "react";
import { Loader2, Medal, User } from "lucide-react";

interface LeaderboardEntry {
    id: string;
    userName: string;
    wpm: number;
    accuracy: number;
    duration: number;
    difficulty: string;
    createdAt: string;
}

export default function TypingLeaderboard() {
    const [duration, setDuration] = useState<2 | 5 | 30>(2);
    const [difficulty, setDifficulty] = useState<'basic' | 'intermediate' | 'expert'>('basic');
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchLeaderboard();
    }, [duration, difficulty]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/typing-test/leaderboard?duration=${duration}&difficulty=${difficulty}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setEntries(data);
            } else {
                console.error("API did not return an array:", data);
                setEntries([]);
            }
        } catch (error) {
            console.error("Failed to fetch leaderboard", error);
            setEntries([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-8 md:p-12">
                <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-6">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                            <Medal className="text-yellow-500" />
                            Typing Leaderboard
                        </h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 ml-9">Top performers by level & duration</p>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            {[2, 5, 30].map((mins) => (
                                <button
                                    key={mins}
                                    onClick={() => setDuration(mins as 2 | 5 | 30)}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${duration === mins
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "text-gray-400 hover:text-gray-600"
                                        }`}
                                >
                                    {mins}M
                                </button>
                            ))}
                        </div>

                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            {['basic', 'intermediate', 'expert'].map((lvl) => (
                                <button
                                    key={lvl}
                                    onClick={() => setDifficulty(lvl as any)}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${difficulty === lvl
                                        ? "bg-white text-purple-600 shadow-sm"
                                        : "text-gray-400 hover:text-gray-600"
                                        }`}
                                >
                                    {lvl}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Rank</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">User</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Level</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">WPM</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Accuracy</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-sm font-bold text-gray-400">
                                            No typing test results yet for this level & duration.
                                        </td>
                                    </tr>
                                ) : (
                                    entries.map((entry, index) => (
                                        <tr key={entry.id} className="group hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0">
                                            <td className="px-6 py-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${index === 0 ? "bg-yellow-100 text-yellow-600" :
                                                    index === 1 ? "bg-gray-100 text-gray-600" :
                                                        index === 2 ? "bg-orange-100 text-orange-600" :
                                                            "bg-white text-gray-400 border border-gray-100"
                                                    }`}>
                                                    {index + 1}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                                                        <User size={14} />
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{entry.userName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter ${entry.difficulty === 'expert' ? 'bg-red-50 text-red-500' : entry.difficulty === 'intermediate' ? 'bg-purple-50 text-purple-500' : 'bg-green-50 text-green-500'}`}>
                                                    {entry.difficulty}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-lg font-black text-gray-900">{entry.wpm}</span>
                                                <span className="text-[10px] text-gray-400 ml-1 font-bold">WPM</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${entry.accuracy >= 95 ? "bg-green-100 text-green-600" :
                                                    entry.accuracy >= 80 ? "bg-yellow-100 text-yellow-600" :
                                                        "bg-red-100 text-red-600"
                                                    }`}>
                                                    {entry.accuracy}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold text-gray-400">
                                                {new Date(entry.createdAt).toLocaleDateString()}
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
