
"use client";

import { useState, useEffect, useCallback } from "react";
import {
    X,
    Clock,
    Target,
    Trophy,
    Gamepad2,
    CheckCircle2,
    XCircle,
    Loader2,
    RefreshCcw,
    ArrowRight,
    Users,
    AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Option {
    id: string;
    optionText: string;
    isCorrect: boolean;
}

interface Question {
    id: string;
    questionText: string;
    imageUrl?: string;
    timeLimit: number;
    points: number;
    options: Option[];
}

interface Quiz {
    id: string;
    title: string;
    description: string;
    timeLimit: number;
    questions: Question[];
}

interface QuizGameOverlayProps {
    quiz: Quiz | null;
    isLive?: boolean;
    onClose: () => void;
}

export default function QuizGameOverlay({ quiz, isLive = false, onClose }: QuizGameOverlayProps) {
    const [gameState, setGameState] = useState<"intro" | "playing" | "results" | "penalty">("intro");
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [userName, setUserName] = useState("");
    const [pin, setPin] = useState("");
    const [leaderboard, setLeaderboard] = useState<any[]>([]);

    // Anti-cheat: Tab visibility change
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && gameState === "playing") {
                handlePenalty();
            }
        };

        const handleBlur = () => {
            if (gameState === "playing") {
                handlePenalty();
            }
        };

        window.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleBlur);

        return () => {
            window.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleBlur);
        };
    }, [gameState]);

    const handlePenalty = () => {
        setGameState("penalty");
        submitScore();
    };

    const submitScore = async () => {
        if (!quiz || !userName) return;
        try {
            await fetch("/api/quiz/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    quizId: quiz.id,
                    userName,
                    score,
                    correctAnswers: correctCount,
                    totalQuestions: quiz.questions.length,
                    timeTaken: 0
                })
            });
            fetchLeaderboard();
        } catch (error) {
            console.error("Failed to submit score", error);
        }
    };

    const fetchLeaderboard = async () => {
        if (!quiz) return;
        try {
            const res = await fetch(`/api/quiz/leaderboard?quizId=${quiz.id}`);
            if (res.ok) {
                const data = await res.json();
                setLeaderboard(data);
            }
        } catch (error) {
            console.error("Failed to fetch leaderboard", error);
        }
    };

    useEffect(() => {
        let timer: any;
        if (gameState === "playing" && timeLeft > 0 && !selectedOptionId) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && !selectedOptionId && gameState === "playing") {
            handleOptionSelect("");
        }
        return () => clearInterval(timer);
    }, [gameState, timeLeft, selectedOptionId]);

    const startQuiz = () => {
        if (!userName) return alert("Please enter your name");
        setGameState("playing");
        setTimeLeft(quiz?.questions[0]?.timeLimit || quiz?.timeLimit || 30);
    };

    const handleOptionSelect = (optionId: string) => {
        if (selectedOptionId) return;

        setSelectedOptionId(optionId);
        const currentQuestion = quiz?.questions[currentQuestionIndex];
        const selectedOption = currentQuestion?.options.find(o => o.id === optionId);

        if (selectedOption?.isCorrect) {
            const timeBonus = Math.floor((timeLeft / (currentQuestion?.timeLimit || 30)) * 500);
            setScore(prev => prev + (currentQuestion?.points || 1000) + timeBonus);
            setCorrectCount(prev => prev + 1);
        }

        setTimeout(() => {
            if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedOptionId(null);
                setTimeLeft(quiz?.questions[currentQuestionIndex + 1]?.timeLimit || quiz?.timeLimit || 30);
            } else {
                setGameState("results");
                submitScore();
            }
        }, 1500);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col font-poppins text-white overflow-hidden"
        >
            <div className="absolute top-6 right-6 z-[110]">
                <button
                    onClick={onClose}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 group"
                >
                    <X size={24} className="group-hover:rotate-90 transition-transform" />
                </button>
            </div>

            <div className="flex-1 flex flex-col relative">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

                <AnimatePresence mode="wait">
                    {gameState === "intro" && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto z-10"
                        >
                            {isLive ? (
                                <>
                                    <div className="w-20 h-20 bg-blue-500/10 rounded-[2rem] flex items-center justify-center mb-8 border border-blue-500/20">
                                        <Users size={40} className="text-blue-500" />
                                    </div>
                                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-4">Live Session</h1>
                                    <p className="text-gray-400 text-lg mb-12 font-medium">Enter the PIN provided by the host to join the battle!</p>
                                    <div className="w-full space-y-4">
                                        <input
                                            type="text"
                                            placeholder="ENTER GAME PIN"
                                            value={pin}
                                            onChange={(e) => setPin(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center font-black text-4xl tracking-[0.3em] focus:ring-2 focus:ring-blue-500 outline-none transition-all uppercase"
                                        />
                                        <input
                                            type="text"
                                            placeholder="YOUR NICKNAME"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center font-bold text-xl tracking-widest focus:ring-2 focus:ring-blue-500 outline-none transition-all uppercase"
                                        />
                                        <button
                                            className="w-full bg-blue-600 text-white rounded-2xl py-4 font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/20"
                                        >
                                            Join Lobby
                                        </button>
                                    </div>
                                </>
                            ) : quiz && (
                                <>
                                    <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-8 border border-primary/20">
                                        <Gamepad2 size={40} className="text-primary" />
                                    </div>
                                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-2">{quiz.title}</h1>
                                    <p className="text-gray-400 text-lg mb-12 font-medium">{quiz.description}</p>

                                    <div className="flex gap-8 mb-12 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Clock className="text-primary" size={24} />
                                            <span>{quiz.timeLimit}s Per Q</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <Target className="text-primary" size={24} />
                                            <span>{quiz.questions.length} Questions</span>
                                        </div>
                                    </div>

                                    <div className="w-full space-y-4">
                                        <input
                                            type="text"
                                            placeholder="ENTER YOUR NAME"
                                            value={userName}
                                            onChange={(e) => setUserName(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center font-black text-xl tracking-[0.1em] focus:ring-2 focus:ring-primary outline-none transition-all uppercase"
                                        />
                                        <button
                                            onClick={startQuiz}
                                            className="w-full bg-primary text-white rounded-2xl py-4 font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                        >
                                            Start Game <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}

                    {gameState === "playing" && quiz && (
                        <motion.div
                            key="playing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col p-6 md:p-12 z-10"
                        >
                            <div className="flex justify-between items-center mb-12">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all border-primary text-primary">
                                        <span className="text-2xl font-black">{timeLeft}</span>
                                    </div>
                                    <div className="hidden md:block">
                                        <div className="h-2 w-64 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-primary"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{currentQuestionIndex + 1} OF {quiz.questions.length}</span>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block leading-none mb-1">Live Score</span>
                                    <span className="text-3xl font-black tracking-tighter leading-none">{score}</span>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full">
                                <motion.div
                                    key={currentQuestionIndex}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-12"
                                >
                                    <h2 className="text-3xl md:text-5xl font-black tracking-tight text-center leading-tight">
                                        {quiz.questions[currentQuestionIndex].questionText}
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                        {quiz.questions[currentQuestionIndex].options.map((option, idx) => {
                                            const isSelected = selectedOptionId === option.id;
                                            const isCorrect = option.isCorrect;
                                            const showResult = selectedOptionId !== null;

                                            let borderClass = "border-white/10 hover:border-primary bg-white/5";
                                            if (showResult) {
                                                if (isCorrect) borderClass = "border-emerald-500 bg-emerald-500/20";
                                                else if (isSelected) borderClass = "border-red-500 bg-red-500/20";
                                                else borderClass = "border-white/5 bg-white/2 opacity-30";
                                            }

                                            return (
                                                <button
                                                    key={option.id}
                                                    onClick={() => handleOptionSelect(option.id)}
                                                    disabled={showResult}
                                                    className={`p-6 md:p-8 rounded-[2rem] border-2 transition-all text-left flex items-center gap-6 group ${borderClass}`}
                                                >
                                                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center font-black text-sm md:text-xl transition-all ${isSelected ? 'bg-white text-primary' : 'bg-white/10'}`}>
                                                        {String.fromCharCode(65 + idx)}
                                                    </div>
                                                    <span className="text-base md:text-xl font-bold">{option.optionText}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}

                    {gameState === "penalty" && (
                        <motion.div
                            key="penalty"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto z-10"
                        >
                            <AlertTriangle size={80} className="text-red-500 mb-8 animate-bounce" />
                            <h2 className="text-4xl font-black text-red-500 uppercase tracking-tighter mb-4">Cheating Detected!</h2>
                            <p className="text-gray-400 text-lg mb-12 font-bold">Switching tabs or screens is not allowed during the quiz. Your session has been terminated and your current score has been recorded.</p>
                            <button
                                onClick={() => setGameState("results")}
                                className="px-12 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all"
                            >
                                View Results
                            </button>
                        </motion.div>
                    )}

                    {gameState === "results" && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex-1 flex flex-col md:flex-row p-6 md:p-12 gap-12 z-10 items-center justify-center"
                        >
                            <div className="flex-1 flex flex-col items-center justify-center text-center">
                                <motion.div
                                    initial={{ y: 20 }}
                                    animate={{ y: 0 }}
                                    className="w-32 h-32 bg-yellow-500 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(234,179,8,0.3)] mb-8"
                                >
                                    <Trophy size={64} className="text-yellow-900" />
                                </motion.div>
                                <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-2">{score}</h1>
                                <p className="text-primary font-black uppercase tracking-[0.5em] mb-12">Total Score</p>

                                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Correct</span>
                                        <span className="text-2xl font-black">{correctCount}</span>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Accuracy</span>
                                        <span className="text-2xl font-black">{quiz ? Math.floor((correctCount / quiz.questions.length) * 100) : 0}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full max-w-md bg-white/5 rounded-[3rem] border border-white/5 p-8 flex flex-col h-full max-h-[60vh] md:max-h-none">
                                <h3 className="text-xl font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Target className="text-primary" size={20} />
                                    Leaderboard
                                </h3>
                                <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                                    {leaderboard.length > 0 ? leaderboard.map((entry, i) => (
                                        <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border ${i === 0 ? 'bg-primary/10 border-primary/20' : 'bg-white/5 border-white/5'}`}>
                                            <div className="flex items-center gap-4">
                                                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${i === 0 ? 'bg-yellow-500 text-black' : 'bg-white/10'}`}>
                                                    {i + 1}
                                                </span>
                                                <div>
                                                    <p className="font-bold text-sm uppercase">{entry.userName}</p>
                                                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{entry.attempts} ATTEMPTS</p>
                                                </div>
                                            </div>
                                            <span className="font-black text-lg">{entry.score}</span>
                                        </div>
                                    )) : (
                                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                            <Loader2 className="animate-spin mb-4" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Calculating Standings...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
