"use client";

import { useState, useEffect, useRef } from "react";
import { Timer, Zap, Trophy, RefreshCcw, Keyboard } from "lucide-react";

export default function TypingTestSection() {
    const [duration, setDuration] = useState<2 | 5 | 30>(2);
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(duration * 60);
    const [text, setText] = useState("");
    const [userInput, setUserInput] = useState("");
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [isFinished, setIsFinished] = useState(false);
    const [userName, setUserName] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Initial random text content
    const sampleTexts = [
        "The quick brown fox jumps over the lazy dog. Programming is the art of telling another human what one wants the computer to do. Clean code always looks like it was written by someone who cares.",
        "Success is not final, failure is not fatal: it is the courage to continue that counts. In the middle of difficulty lies opportunity. The best way to predict the future is to create it.",
        "Technology takes us to places providing opportunities and challenges. Innovation distinguishes between a leader and a follower. Stay hungry, stay foolish.",
        "Design is not just what it looks like and feels like. Design is how it works. Simplicity is the ultimate sophistication. Creativity is intelligence having fun."
    ];

    useEffect(() => {
        resetTest();
    }, [duration]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            finishTest();
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const resetTest = () => {
        setIsActive(false);
        setIsFinished(false);
        setTimeLeft(duration * 60);
        setUserInput("");
        setWpm(0);
        setAccuracy(100);
        // Generate a long text by repeating samples
        const baseText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
        setText((baseText + " ").repeat(20).trim());
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        if (!isActive && !isFinished) setIsActive(true);

        setUserInput(value);
        calculateStats(value);
    };

    const calculateStats = (input: string) => {
        const words = input.trim().split(/\s+/).length;
        const timeElapsed = (duration * 60 - timeLeft) / 60; // in minutes
        const currentWpm = timeElapsed > 0 ? Math.round(words / timeElapsed) : 0;

        let correctChars = 0;
        for (let i = 0; i < input.length; i++) {
            if (input[i] === text[i]) correctChars++;
        }
        const currentAccuracy = input.length > 0 ? Math.round((correctChars / input.length) * 100) : 100;

        setWpm(currentWpm);
        setAccuracy(currentAccuracy);
    };

    const finishTest = () => {
        setIsActive(false);
        setIsFinished(true);
    };

    const submitResult = async () => {
        if (!userName.trim()) return alert("Please enter your name!");
        setSubmitting(true);
        try {
            await fetch("/api/typing-test/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userName,
                    wpm,
                    accuracy,
                    duration
                })
            });
            alert("Score submitted to leaderboard!");
            setUserName("");
            resetTest();
        } catch (error) {
            console.error("Failed to submit score", error);
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <section id="typing-test" className="py-20 bg-[#0e0e0e] relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -z-10" />

            <div className="container mx-auto px-6 text-center">
                <div className="flex flex-col items-center mb-12">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Test Your Skills</span>
                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mt-2">
                        Speed <span className="text-blue-500">Typing</span> Challenge
                    </h2>
                </div>

                <div className="max-w-4xl mx-auto bg-white/5 rounded-[2rem] border border-white/10 p-8 md:p-12 relative backdrop-blur-sm">
                    {/* Duration Selectors */}
                    <div className="flex justify-center gap-4 mb-8">
                        {[2, 5, 30].map((mins) => (
                            <button
                                key={mins}
                                onClick={() => !isActive && setDuration(mins as 2 | 5 | 30)}
                                className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${duration === mins
                                        ? "bg-blue-600 text-white shadow-lg scale-105"
                                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                                    }`}
                                disabled={isActive}
                            >
                                {mins} Mins
                            </button>
                        ))}
                    </div>

                    {!isFinished ? (
                        <>
                            {/* Stats Bar */}
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                    <div className="text-blue-500 mb-1"><Timer size={24} className="mx-auto" /></div>
                                    <div className="text-2xl font-black text-white">{formatTime(timeLeft)}</div>
                                    <div className="text-[10px] uppercase tracking-widest text-gray-500">Time Left</div>
                                </div>
                                <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                    <div className="text-green-500 mb-1"><Zap size={24} className="mx-auto" /></div>
                                    <div className="text-2xl font-black text-white">{wpm}</div>
                                    <div className="text-[10px] uppercase tracking-widest text-gray-500">WPM</div>
                                </div>
                                <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                    <div className="text-secondary mb-1"><Trophy size={24} className="mx-auto" /></div>
                                    <div className="text-2xl font-black text-white">{accuracy}%</div>
                                    <div className="text-[10px] uppercase tracking-widest text-gray-500">Accuracy</div>
                                </div>
                            </div>

                            {/* Typing Area */}
                            <div className="relative mb-8 text-left">
                                <div className="absolute inset-0 p-6 text-gray-500 text-lg font-mono leading-relaxed pointer-events-none opacity-50 select-none overflow-hidden">
                                    {text}
                                </div>
                                <textarea
                                    ref={inputRef}
                                    value={userInput}
                                    onChange={handleInputChange}
                                    spellCheck={false}
                                    className="w-full h-64 bg-transparent border-2 border-white/10 rounded-2xl p-6 text-lg font-mono leading-relaxed text-white focus:outline-none focus:border-blue-500/50 transition-colors resize-none relative z-10"
                                    placeholder="Start typing here to begin..."
                                />
                            </div>

                            <button
                                onClick={resetTest}
                                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 mx-auto"
                            >
                                <RefreshCcw size={16} /> Reset Test
                            </button>
                        </>
                    ) : (
                        <div className="space-y-8 animate-in zoom-in duration-300">
                            <div className="inline-block p-6 bg-green-500/10 rounded-full mb-4">
                                <Trophy size={64} className="text-green-500" />
                            </div>

                            <h3 className="text-3xl font-black text-white uppercase tracking-tight">Test Completed!</h3>

                            <div className="grid grid-cols-2 gap-8 max-w-sm mx-auto">
                                <div className="text-center">
                                    <div className="text-4xl font-black text-white mb-1">{wpm}</div>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">WPM</span>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-black text-white mb-1">{accuracy}%</div>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Accuracy</span>
                                </div>
                            </div>

                            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 max-w-md mx-auto space-y-4">
                                <h4 className="text-white font-bold">Save your score to Leaderboard</h4>
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                />
                                <div className="flex gap-4">
                                    <button
                                        onClick={submitResult}
                                        disabled={submitting}
                                        className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        {submitting ? "Saving..." : "Submit Score"}
                                    </button>
                                    <button
                                        onClick={resetTest}
                                        className="flex-1 bg-white/10 text-white py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-white/20 transition-colors"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
