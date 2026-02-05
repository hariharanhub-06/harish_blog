"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw, Trophy, Brain, Send, HelpCircle, CheckCircle2, Loader2, Heart } from "lucide-react";

// Intermediate Level Words
const WORDS = [
    { word: "REACT", hint: "Popular UI library for building interfaces" },
    { word: "NEXTJS", hint: "The React framework for the web" },
    { word: "GITHUB", hint: "Platform for hosting and sharing code" },
    { word: "PYTHON", hint: "Versatile language known for simplicity" },
    { word: "DATABASE", hint: "Structured collection of data storage" },
    { word: "FRONTEND", hint: "The part of an app users interact with" },
    { word: "BACKEND", hint: "The server-side part of an application" },
    { word: "JAVASCRIPT", hint: "The programming language of the web" },
    { word: "HTML", hint: "The standard markup language for web pages" },
    { word: "CSS", hint: "The language used for styling web pages" },
    { word: "NODEJS", hint: "JavaScript runtime built on Chrome's V8" },
    { word: "APP", hint: "Short for application software" },
    { word: "CLOUD", hint: "Remote servers used for storage/computing" },
    { word: "LOGIN", hint: "Process of gaining access to a system" },
    { word: "ADMIN", hint: "Dashboard for managing application data" },
    { word: "SERVER", hint: "Hardware or software providing services" },
    { word: "BROWSER", hint: "Software for navigating the internet" },
    { word: "MOBILE", hint: "Handheld platform for applications" },
    { word: "DESIGN", hint: "The visual and functional plan of an app" },
    { word: "CODING", hint: "The process of writing computer programs" },
    { word: "API", hint: "Interface for software communication" },
    { word: "DEBUG", hint: "The process of finding and fixing errors" },
    { word: "DEPLOY", hint: "Making an application available for use" },
    { word: "VERSION", hint: "Specific stage of software development" },
    { word: "PROJECT", hint: "A planned piece of work or task" }
];

export default function WordScramble() {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [scrambledWord, setScrambledWord] = useState("");
    const [userInput, setUserInput] = useState("");
    const [score, setScore] = useState(0);
    const [status, setStatus] = useState<"playing" | "correct" | "wrong" | "finished">("playing");
    const [showHint, setShowHint] = useState(false);
    const [hintRevealedLetters, setHintRevealedLetters] = useState<number[]>([]);
    const [userName, setUserName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [startTime, setStartTime] = useState<number>(Date.now());
    const [lives, setLives] = useState(5);
    const [gameOver, setGameOver] = useState(false);

    const scramble = (word: string) => {
        return word.split("").sort(() => Math.random() - 0.5).join("");
    };

    const initGame = useCallback(() => {
        const wordObj = WORDS[currentWordIndex];
        let scrambled = scramble(wordObj.word);
        while (scrambled === wordObj.word) {
            scrambled = scramble(wordObj.word);
        }
        setScrambledWord(scrambled);
        setUserInput("");
        setStatus("playing");
        setShowHint(false);
        setHintRevealedLetters([]);
        setStartTime(Date.now());
        setGameOver(false);
    }, [currentWordIndex]);

    useEffect(() => {
        initGame();
    }, [initGame]);

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (status !== "playing" || gameOver) return;

        const original = WORDS[currentWordIndex].word;
        if (userInput.toUpperCase() === original) {
            setStatus("correct");
            setScore(s => s + (showHint ? 50 : 100) - (hintRevealedLetters.length * 10));
            setTimeout(() => {
                if (currentWordIndex < WORDS.length - 1) {
                    setCurrentWordIndex(i => i + 1);
                } else {
                    setStatus("finished");
                }
            }, 1500);
        } else {
            setStatus("wrong");
            setLives(prev => {
                const newLives = prev - 1;
                if (newLives <= 0) {
                    setGameOver(true);
                    setTimeout(() => setStatus("finished"), 1500);
                }
                return newLives;
            });
            setTimeout(() => {
                if (!gameOver) setStatus("playing");
            }, 1000);
        }
    };

    const handleHint = () => {
        setShowHint(true);
        const original = WORDS[currentWordIndex].word;
        // Reveal a random unrevealed letter
        const unrevealed = original.split("").map((_, i) => i).filter(i => !hintRevealedLetters.includes(i));
        if (unrevealed.length > 0) {
            const randomIdx = unrevealed[Math.floor(Math.random() * unrevealed.length)];
            setHintRevealedLetters(prev => [...prev, randomIdx]);

            // Auto-fill the letter in the input if possible or just show it
            const inputArr = userInput.split("");
            inputArr[randomIdx] = original[randomIdx];
            setUserInput(inputArr.join(""));
        }
    };

    const submitScore = async () => {
        if (!userName.trim() || submitting || submitted) return;
        setSubmitting(true);
        try {
            await fetch("/api/games/leaderboard", {
                method: "POST",
                body: JSON.stringify({
                    gameId: "scramble",
                    userName,
                    score,
                    timeTaken: Math.floor((Date.now() - startTime) / 1000)
                })
            });
            setSubmitted(true);
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const resetGame = () => {
        setCurrentWordIndex(0);
        setScore(0);
        setLives(5);
        setGameOver(false);
        setSubmitted(false);
        setUserName("");
        initGame();
    };

    if (status === "finished") {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6 w-full max-w-sm">
                    {gameOver ? (
                        <Brain size={80} className="text-rose-500 mx-auto animate-pulse" />
                    ) : (
                        <Trophy size={80} className="text-yellow-400 mx-auto animate-bounce" />
                    )}
                    <h2 className="text-4xl font-black text-white uppercase italic">
                        {gameOver ? "Out of Lives!" : "Tech Master!"}
                    </h2>
                    <p className="text-xl text-white/60 font-bold">Final Score: <span className="text-primary text-3xl">{score}</span></p>

                    {!submitted ? (
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Enter Name"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="w-full bg-white/10 border-2 border-white/10 rounded-2xl px-6 py-4 text-white font-black text-center uppercase tracking-widest outline-none focus:border-primary transition-all"
                            />
                            <button
                                onClick={submitScore}
                                disabled={!userName.trim() || submitting}
                                className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2"
                            >
                                {submitting ? <Loader2 className="animate-spin" /> : <Send size={16} />} Post to Leaderboard
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 text-emerald-400">
                            <CheckCircle2 size={48} />
                            <p className="font-black uppercase tracking-widest text-sm">Score Submitted!</p>
                            <button onClick={resetGame} className="mt-4 px-8 py-4 bg-white text-black rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-emerald-500 hover:text-white transition-all">Play Again</button>
                        </div>
                    )}
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-4 md:p-8 h-full max-w-xl mx-auto">
            <div className="text-center mb-8 w-full">
                <div className="flex justify-between items-center mb-6">
                    <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Challenge</p>
                        <p className="text-2xl font-black text-white">{currentWordIndex + 1}<span className="text-white/20">/{WORDS.length}</span></p>
                    </div>
                    <div className="text-center flex flex-col items-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">Lives</p>
                        <div className="flex gap-1.5">
                            {[...Array(5)].map((_, i) => (
                                <Heart
                                    key={i}
                                    size={16}
                                    className={`${i < lives ? "text-rose-500 fill-rose-500" : "text-white/10 fill-white/5"} transition-all duration-500`}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Points</p>
                        <p className="text-2xl font-black text-primary">{score}</p>
                    </div>
                </div>

                <div className="bg-white/5 rounded-[3rem] p-10 border border-white/10 relative overflow-hidden backdrop-blur-xl shadow-2xl">
                    <h3 className="text-5xl md:text-6xl font-black text-white uppercase tracking-[0.3em] mb-10 break-all select-none">
                        {scrambledWord}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <input
                            autoFocus
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            className={`w-full bg-white/10 border-2 rounded-2xl px-6 py-5 text-2xl font-black text-center uppercase tracking-[0.2em] outline-none transition-all ${status === "correct" ? "border-emerald-500 text-emerald-500" :
                                status === "wrong" ? "border-rose-500 text-rose-500 animate-shake" :
                                    "border-white/10 focus:border-primary text-white"
                                }`}
                            placeholder="Unscramble it..."
                            disabled={status !== "playing"}
                        />

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={handleHint}
                                className="flex-1 py-4 bg-white/5 text-white/60 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2 border border-white/10"
                            >
                                <HelpCircle size={14} /> Reveal Letter
                            </button>
                            <button
                                type="submit"
                                className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2"
                            >
                                <Send size={14} /> Submit Word
                            </button>
                        </div>
                    </form>
                </div>

                <AnimatePresence>
                    {showHint && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            className="mt-6 p-5 bg-primary/10 border border-primary/20 rounded-[2rem] text-primary text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-4 text-left"
                        >
                            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                                <Brain size={20} />
                            </div>
                            <span>{WORDS[currentWordIndex].hint}</span>
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
