"use client";

import { useState, useEffect, useRef } from "react";
import { Users, Play, ArrowRight, Trophy, StopCircle, RefreshCcw, Copy, CheckCircle2 } from "lucide-react";
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
    const [liveQuestion, setLiveQuestion] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<number | null>(null);
    const indexRef = useRef(currentQuestionIndex);
    const hasAdvancedRef = useRef(-2);

    useEffect(() => {
        indexRef.current = currentQuestionIndex;
    }, [currentQuestionIndex]);

    useEffect(() => {
        const interval = setInterval(fetchStatus, 2000);
        return () => clearInterval(interval);
    }, [sessionId]);

    // Local countdown timer for the host
    useEffect(() => {
        if (status !== "active") return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) return 0;
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [status]);

    // Auto-advance logic: Trigger reveal and start 10s countdown
    useEffect(() => {
        const isAllAnswered = liveQuestion?.totalAnswers >= playerCount && playerCount > 0;
        const shouldReveal = (timeLeft === 0 || isAllAnswered) && status === "active";

        if (shouldReveal && autoAdvanceTimer === null && hasAdvancedRef.current !== currentQuestionIndex) {
            setAutoAdvanceTimer(10);
        } else if (!shouldReveal) {
            setAutoAdvanceTimer(null);
        }
    }, [timeLeft, liveQuestion, playerCount, status, autoAdvanceTimer, currentQuestionIndex]);

    // Independent countdown for auto-advance
    useEffect(() => {
        if (autoAdvanceTimer === null || autoAdvanceTimer < 0) return;

        if (autoAdvanceTimer === 0) {
            if (hasAdvancedRef.current !== currentQuestionIndex) {
                hasAdvancedRef.current = currentQuestionIndex;
                handleAction("next");
            }
            setAutoAdvanceTimer(null);
            return;
        }

        const timer = setInterval(() => {
            setAutoAdvanceTimer(prev => (prev !== null ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [autoAdvanceTimer, currentQuestionIndex]);

    const fetchStatus = async () => {
        try {
            const res = await fetch(`/api/quiz/live/status?sessionId=${sessionId}&host=true`);
            if (res.ok) {
                const data = await res.json();
                setStatus(data.status);

                // If question changed, reset timer
                if (data.currentQuestionIndex !== indexRef.current) {
                    setCurrentQuestionIndex(data.currentQuestionIndex);
                    if (data.currentQuestion) {
                        setLiveQuestion(data.currentQuestion);
                        setTimeLeft(data.currentQuestion.timeLimit || 30);
                        setAutoAdvanceTimer(null);
                    }
                } else if (data.currentQuestion) {
                    // Just update live data (distribution)
                    setLiveQuestion(data.currentQuestion);
                }

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
                body: JSON.stringify({ sessionId, action, currentQuestionIndex: indexRef.current })
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

    const isAllAnswered = liveQuestion?.totalAnswers >= playerCount && playerCount > 0;
    const showResults = timeLeft === 0 || isAllAnswered;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-poppins">
            <div className="max-w-6xl mx-auto space-y-4 md:space-y-8">
                {/* Header */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:row justify-between items-center gap-4">
                    <div className="text-center md:text-left w-full">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Live Session</span>
                        <h1 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight mt-1">{quizTitle}</h1>
                    </div>
                    <div className="flex items-center justify-center md:justify-end gap-4 md:gap-10 w-full">
                        <div className="text-center md:text-right">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Join PIN</span>
                            <button onClick={copyPin} className="text-2xl md:text-4xl font-black text-primary tracking-widest hover:scale-105 transition-transform flex items-center gap-2">
                                {initialPin} <Copy size={16} className="text-gray-300" />
                            </button>
                        </div>
                        <div className="h-10 w-px bg-gray-100 hidden md:block" />
                        <div className="text-center md:text-right">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Players joined</span>
                            <span className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight flex items-center gap-2 justify-center md:justify-end">
                                <Users className="text-gray-300" size={24} /> {playerCount}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Controls & Status */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-[400px] flex flex-col items-center">
                            {status === "waiting" && (
                                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
                                    <div className="w-20 h-20 md:w-24 md:h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4 animate-pulse">
                                        <Users className="text-blue-500" size={40} />
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900">Waiting for players...</h2>
                                    <p className="text-gray-400 text-sm font-bold max-w-md mx-auto">
                                        Share the PIN <span className="text-primary font-black">{initialPin}</span> with your students.
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

                            {status === "active" && liveQuestion && (
                                <div className="w-full h-full flex flex-col">
                                    <div className="flex justify-between items-center w-full mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-gray-900 text-white flex items-center justify-center text-2xl font-black">
                                                {timeLeft}
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Time Left</span>
                                                <span className="text-xs font-black uppercase tracking-widest text-gray-900">Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</span>
                                            <span className={`px-3 py-1 ${showResults ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'} rounded-full text-[10px] font-black uppercase tracking-widest`}>
                                                {showResults ? (autoAdvanceTimer !== null ? `Moving in ${autoAdvanceTimer}s` : 'Time Up') : 'Live'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-10">
                                        <div className="text-center">
                                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                                                {liveQuestion.questionText}
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {liveQuestion.options.map((opt: any) => {
                                                const voteCount = liveQuestion.distribution?.find((d: any) => d.optionId === opt.id)?.count || 0;
                                                const percentage = liveQuestion.totalAnswers > 0 ? (voteCount / liveQuestion.totalAnswers) * 100 : 0;

                                                return (
                                                    <div key={opt.id} className={`relative p-5 rounded-2xl border-2 transition-all overflow-hidden ${showResults && opt.isCorrect ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 bg-white'
                                                        }`}>
                                                        {/* Progress Bar Background */}
                                                        {showResults && (
                                                            <div
                                                                className={`absolute inset-0 opacity-10 transition-all duration-1000 ${opt.isCorrect ? 'bg-emerald-500' : 'bg-primary'}`}
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        )}

                                                        <div className="relative flex justify-between items-center">
                                                            <span className={`font-bold text-sm ${showResults && opt.isCorrect ? 'text-emerald-700' : 'text-gray-900'}`}>
                                                                {opt.optionText}
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                {showResults && opt.isCorrect && <CheckCircle2 size={16} className="text-emerald-500" />}
                                                                <span className="text-xs font-black text-gray-400">{voteCount}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="flex flex-col md:flex-row justify-center gap-4 pt-4 pb-2">
                                            <button
                                                onClick={() => handleAction("next")}
                                                className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                                            >
                                                Next Question <ArrowRight size={20} />
                                            </button>
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => handleAction("skip")}
                                                    className="flex-1 px-8 py-4 bg-white border-2 border-gray-100 text-gray-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <RefreshCcw size={18} /> Skip
                                                </button>
                                                <button
                                                    onClick={() => handleAction("end")}
                                                    className="flex-1 px-8 py-4 bg-red-50 text-red-500 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <StopCircle size={20} /> End
                                                </button>
                                            </div>
                                        </div>
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
                                {players.map((player: any, i) => (
                                    <motion.div
                                        key={player.name}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        layout
                                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-500 ${i === 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] ${i === 0 ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                                {i + 1}
                                            </span>
                                            <div>
                                                <span className="font-bold text-sm text-gray-900 block leading-tight">{player.name}</span>
                                                {player.streak > 1 && (
                                                    <span className="text-[9px] font-black text-primary uppercase flex items-center gap-1">
                                                        {player.streak} Streak 🔥
                                                    </span>
                                                )}
                                            </div>
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
