"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw, Trophy, Brain, Send, HelpCircle, CheckCircle2, AlertCircle } from "lucide-react";

const WORDS = [
    { word: "REACT", hint: "A popular JavaScript library for building UI" },
    { word: "NEXTJS", hint: "The React framework for the web" },
    { word: "TYPESCRIPT", hint: "JavaScript with syntax for types" },
    { word: "TAILWIND", hint: "A utility-first CSS framework" },
    { word: "DEVELOPER", hint: "A person who creates computer software" },
    { word: "JAVASCRIPT", hint: "The programming language of the web" },
    { word: "DATABASE", hint: "An organized collection of data" },
    { word: "FRONTEND", hint: "The part of a website users interact with" }
];

export default function WordScramble() {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [scrambledWord, setScrambledWord] = useState("");
    const [userInput, setUserInput] = useState("");
    const [score, setScore] = useState(0);
    const [status, setStatus] = useState<"playing" | "correct" | "wrong" | "finished">("playing");
    const [showHint, setShowHint] = useState(false);
    const [attempts, setAttempts] = useState(0);

    const scramble = (word: string) => {
        return word.split("").sort(() => Math.random() - 0.5).join("");
    };

    const initGame = useCallback(() => {
        const wordObj = WORDS[currentWordIndex];
        let scrambled = scramble(wordObj.word);
        // Ensure it's actually scrambled
        while (scrambled === wordObj.word) {
            scrambled = scramble(wordObj.word);
        }
        setScrambledWord(scrambled);
        setUserInput("");
        setStatus("playing");
        setShowHint(false);
        setAttempts(0);
    }, [currentWordIndex]);

    useEffect(() => {
        initGame();
    }, [initGame]);

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (status !== "playing") return;

        const original = WORDS[currentWordIndex].word;
        if (userInput.toUpperCase() === original) {
            setStatus("correct");
            setScore(s => s + (showHint ? 5 : 10));
            setTimeout(() => {
                if (currentWordIndex < WORDS.length - 1) {
                    setCurrentWordIndex(i => i + 1);
                } else {
                    setStatus("finished");
                }
            }, 1500);
        } else {
            setStatus("wrong");
            setAttempts(a => a + 1);
            setTimeout(() => setStatus("playing"), 1000);
        }
    };

    const resetGame = () => {
        setCurrentWordIndex(0);
        setScore(0);
        initGame();
    };

    if (status === "finished") {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="space-y-6"
                >
                    <Trophy size={80} className="text-yellow-400 mx-auto animate-bounce" />
                    <h2 className="text-4xl font-black text-white uppercase italic">Game Over!</h2>
                    <p className="text-xl text-white/60 font-bold">Final Score: <span className="text-primary text-3xl">{score}</span></p>
                    <button
                        onClick={resetGame}
                        className="px-8 py-4 bg-white text-black rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl shadow-white/5"
                    >
                        Play Again
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-4 md:p-8 h-full max-w-xl mx-auto">
            <div className="text-center mb-8 w-full">
                <div className="flex justify-between items-center mb-6">
                    <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Word</p>
                        <p className="text-2xl font-black text-white">{currentWordIndex + 1}<span className="text-white/20">/{WORDS.length}</span></p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Score</p>
                        <p className="text-2xl font-black text-primary">{score}</p>
                    </div>
                </div>

                <div className="bg-white/5 rounded-[2.5rem] p-12 border border-white/10 relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                    <h3 className="text-6xl md:text-7xl font-black text-white uppercase tracking-[0.2em] mb-8 break-all select-none">
                        {scrambledWord}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <input
                                autoFocus
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                className={`w-full bg-white/10 border-2 rounded-2xl px-6 py-4 text-xl font-black text-center uppercase tracking-widest outline-none transition-all ${status === "correct" ? "border-emerald-500 text-emerald-500" :
                                        status === "wrong" ? "border-rose-500 text-rose-500 animate-shake" :
                                            "border-white/10 focus:border-primary text-white"
                                    }`}
                                placeholder="Unscramble it..."
                                disabled={status !== "playing"}
                            />
                            <AnimatePresence>
                                {status === "correct" && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-3 -top-3 bg-emerald-500 text-white p-2 rounded-full">
                                        <CheckCircle2 size={24} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setShowHint(true)}
                                className="flex-1 py-4 bg-white/5 text-white/60 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                            >
                                <HelpCircle size={16} /> Hint
                            </button>
                            <button
                                type="submit"
                                className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2"
                            >
                                <Send size={16} /> Submit
                            </button>
                        </div>
                    </form>
                </div>

                <AnimatePresence>
                    {showHint && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-2xl text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-3"
                        >
                            <Brain size={16} />
                            {WORDS[currentWordIndex].hint}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }
                .animate-shake {
                    animation: shake 0.2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
