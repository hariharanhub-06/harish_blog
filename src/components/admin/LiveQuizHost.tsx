"use client";

import { useState, useEffect } from "react";
import { Users, Play, ArrowRight, Trophy, StopCircle, RefreshCcw, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Player {
    name: string;
    score: number;
}

interface LiveQuizHostProps {
    sessionId: string;
    initialPin: string;
    quizTitle: string;
    totalQuestions: number;
}

export default function LiveQuizHost({ sessionId, initialPin, quizTitle, totalQuestions }: LiveQuizHostProps) {
    const [status, setStatus] = useState("waiting"); // waiting, active, finished
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
    const [players, setPlayers] = useState<Player[]>([]);
    const [playerCount, setPlayerCount] = useState(0);

    useEffect(() => {
        const interval = setInterval(fetchStatus, 2000);
        return () => clearInterval(interval);
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await fetch(`/api/quiz/live/status?sessionId=${sessionId}`);
            if (res.ok) {
                const data = await res.json();
                setStatus(data.status);
                setCurrentQuestionIndex(data.currentQuestionIndex);
                if (data.leaderboard) setPlayers(data.leaderboard);
                setPlayerCount(data.totalParticipants || 0);
            }
        } catch (error) {
            console.error("Failed to fetch status", error);
        }
    };

    const handleAction = async (action: string) => {
        try {
            await fetch("/api/quiz/live/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId, action })
            });
            fetchStatus();
        } catch (error) {
            console.error("Failed to update session", error);
        }
    };

    const copyPin = () => {
        navigator.clipboard.writeText(initialPin);
        alert("PIN copied to clipboard!");
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-poppins">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex justify-between items-center">
                    <div>
                        <span className="text-xs font-black text-primary uppercase tracking-widest">Live Session</span>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight mt-1">{quizTitle}</h1>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Join PIN</span>
                            <button onClick={copyPin} className="text-4xl font-black text-primary tracking-widest hover:scale-105 transition-transform flex items-center gap-2">
                                {initialPin} <Copy size={20} className="text-gray-300" />
                            </button>
                        </div>
                        <div className="h-12 w-px bg-gray-100" />
                        <div className="text-right">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Players</span>
                            <span className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-2 justify-end">
                                <Users className="text-gray-300" size={28} /> {playerCount}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Controls & Status */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-[400px] flex flex-col justify-center items-center text-center">
                            {status === "waiting" && (
                                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6">
                                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                        <Users className="text-blue-500" size={48} />
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900">Waiting for players...</h2>
                                    <p className="text-gray-400 text-sm font-bold max-w-md mx-auto">
                                        Share the PIN <span className="text-primary">{initialPin}</span> with your students.
                                        Once everyone has joined, click Start Game.
                                    </p>
                                    <button
                                        onClick={() => handleAction("start")}
                                        className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2 mx-auto"
                                    >
                                        <Play size={20} fill="white" /> Start Game
                                    </button>
                                </motion.div>
                            )}

                            {status === "active" && (
                                <div className="w-full space-y-8">
                                    <div className="flex justify-between items-center w-full px-4">
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                                        <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">Live</span>
                                    </div>

                                    <div className="py-12">
                                        <h2 className="text-4xl font-black text-gray-900 mb-2">Question is LIVE!</h2>
                                        <p className="text-gray-400 font-bold">Check player screens for the current question.</p>
                                    </div>

                                    <div className="flex justify-center gap-4">
                                        <button
                                            onClick={() => handleAction("next")}
                                            className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                                        >
                                            Next Question <ArrowRight size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleAction("end")}
                                            className="px-8 py-4 bg-red-50 text-red-500 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-100 transition-all flex items-center gap-2"
                                        >
                                            <StopCircle size={20} /> End Game
                                        </button>
                                    </div>
                                </div>
                            )}

                            {status === "finished" && (
                                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="space-y-6">
                                    <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Trophy className="text-yellow-500" size={48} />
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-900">Game Over!</h2>
                                    <p className="text-gray-400 font-bold">The session has ended. Check the leaderboard for final results.</p>
                                    <button
                                        onClick={() => window.location.href = '/admin/dashboard'}
                                        className="px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all"
                                    >
                                        Back to Dashboard
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Leaderboard */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full max-h-[600px] flex flex-col">
                        <div className="flex items-center gap-2 mb-6">
                            <Trophy className="text-yellow-500" size={20} />
                            <h3 className="font-black text-gray-900 uppercase tracking-tight">Leaderboard</h3>
                        </div>

                        <div className="space-y-3 overflow-y-auto pr-2 flex-1">
                            <AnimatePresence>
                                {players.map((player, i) => (
                                    <motion.div
                                        key={player.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        layout
                                        className={`flex items-center justify-between p-4 rounded-2xl border ${i === 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] ${i === 0 ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                                {i + 1}
                                            </span>
                                            <span className="font-bold text-sm text-gray-900">{player.name}</span>
                                        </div>
                                        <span className="font-black text-gray-900">{player.score}</span>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {players.length === 0 && (
                                <div className="text-center py-12 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                    No players yet
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
