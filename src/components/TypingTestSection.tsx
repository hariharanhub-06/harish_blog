"use client";

import { useState, useEffect, useRef } from "react";
import { Timer, Zap, Trophy, RefreshCcw, Keyboard, X } from "lucide-react";

export default function TypingTestSection() {
    const [duration, setDuration] = useState<2 | 5 | 30>(2);
    const [difficulty, setDifficulty] = useState<'basic' | 'intermediate' | 'expert'>('basic');
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

    const difficultyPools = {
        basic: [
            "The sun rises in the east every single morning. Walking in the park is a very relaxing activity. A healthy diet and regular exercise are important for a long life. Books are a great way to learn new things and expand your mind.",
            "Water is essential for all living things on Earth. Learning a new language can be a challenging but rewarding experience. The quick brown fox jumps over the lazy dog.",
            "Music has the power to bring people together from all walks of life. Small acts of kindness can make a big difference in someone's day.",
            "Exploring new places allows us to see the world from different perspectives. Persistence and hard work are the keys to achieving your goals.",
            "Nature offers a peaceful escape from the hustle and bustle of city life. The ocean is home to millions of diverse and fascinating creatures.",
            "Cooking a healthy meal for your family is a great way to show you care. Reading stories to children helps stimulate their imagination and growth.",
            "A warm cup of tea on a rainy afternoon is a simple but pure joy. Every day is a new opportunity to learn something and improve yourself.",
            "The stars in the night sky have inspired dreamers for thousands of years. Gardening is a wonderful hobby that connects you with the soil.",
            "Taking a deep breath can help you find calm in a stressful situation. Friendship is a treasure that should be cherished and protected.",
            "Laughter is the best medicine for a tired soul and a heavy heart. Setting small goals makes the journey to success feel much easier."
        ],
        intermediate: [
            "Programming is the art of telling another human what one wants the computer to do. Clean code always looks like it was written by someone who cares. Success is not final, failure is not fatal: it is the courage to continue that counts.",
            "In the middle of difficulty lies opportunity. The best way to predict the future is to create it. Innovation distinguishes between a leader and a follower. Stay hungry, stay foolish.",
            "Artificial intelligence is not a substitute for human intelligence but an extension of it. The complexity of modern software requires a disciplined approach to development.",
            "Photography is more than just capturing images; it is about telling a story through a single frame. The lens allows us to see beauty in the mundane.",
            "Effective communication is the cornerstone of a successful team and a healthy relationship. Listening is just as important as speaking our minds.",
            "The laws of physics govern everything from the smallest atoms to the largest galaxies in the universe. Science is a continuous journey of discovery.",
            "Philosophy encourages us to question the nature of existence and the values we hold dear. Thinking deeply is a rare and precious skill nowadays.",
            "Economic theories attempt to explain how resources are allocated in a global marketplace. Understanding financial trends requires both data and intuition.",
            "The history of civilization is a testament to human resilience and our desire for progress. Each era brings its own unique set of challenges.",
            "Writing a novel requires a blend of creative inspiration and rigorous technical craftsmanship. Characters come to life through their choices and actions."
        ],
        expert: [
            "async function fetchUserData(id: string) { const response = await fetch(`/api/users/${id}`); const data = await response.json(); return data; }",
            "const calculateRisk = (assets: number, liabilities: number) => { const ratio = assets / liabilities; return ratio > 1.5 ? 'low' : 'high'; };",
            "class PortfolioManager extends BaseService { constructor(db: Database) { super(db); } async sync() { await this.db.profiles.updateMany(); } }",
            "SELECT u.name, SUM(o.total) as total_spent FROM users u JOIN orders o ON u.id = o.user_id WHERE o.status = 'completed' GROUP BY u.id ORDER BY total_spent DESC LIMIT 10;",
            "export const useDebounce = <T,>(value: T, delay: number): T => { const [debounced, set] = useState(value); useEffect(() => { const h = setTimeout(() => set(value), delay); return () => clearTimeout(h); }, [value, delay]); return debounced; };",
            "def quick_sort(arr): if len(arr) <= 1: return arr; pivot = arr[len(arr) // 2]; left = [x for x in arr if x < pivot]; middle = [x for x in arr if x == pivot]; right = [x for x in arr if x > pivot]; return quick_sort(left) + middle + quick_sort(right)",
            "interface User { id: string; settings: { theme: 'dark' | 'light'; notifications: boolean; }; roles: ('admin' | 'user')[]; }",
            "background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05)); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px;",
            "const { data, error, isLoading } = useSWR('/api/analytics', fetcher); if (error) return <div>Failed to load</div>; if (isLoading) return <Spinner />;",
            "git commit -m \"Refactor: improve memory management in worker threads\" && git push origin main && echo \"Deployment pipeline initiated successfully.\""
        ]
    };

    useEffect(() => {
        resetTest();
    }, [duration, difficulty]);

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

        const pool = [...difficultyPools[difficulty]];

        // Fisher-Yates shuffle
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }

        // Join items uniquely until we have enough length (approx 4000 chars for a 30 min test)
        let longText = "";
        let usedItems = 0;

        while (longText.length < 4000) {
            const index = usedItems % pool.length;
            // If we've used everything, reshuffle to avoid the same sequence
            if (usedItems > 0 && index === 0) {
                for (let i = pool.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [pool[i], pool[j]] = [pool[j], pool[i]];
                }
            }
            longText += pool[index] + " ";
            usedItems++;
        }
        setText(longText.trim());
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        if (isFinished) return;
        if (!isActive) setIsActive(true);

        setUserInput(value);
        calculateStats(value);
    };

    const calculateStats = (input: string) => {
        const words = input.trim().split(/\s+/).length;
        const timeElapsedInSecs = (duration * 60 - timeLeft);
        const timeElapsed = timeElapsedInSecs / 60; // in minutes
        const currentWpm = timeElapsed > 0.05 ? Math.round(words / timeElapsed) : 0;

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

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                    duration,
                    difficulty
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

    return (
        <section id="typing-test" className="py-20 bg-[#0e0e0e] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -z-10" />

            <div className="container mx-auto px-6 text-center">
                <div className="flex flex-col items-center mb-12">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Master Your Speed</span>
                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mt-2">
                        Speed <span className="text-blue-500">Typing</span> Challenge
                    </h2>
                </div>

                <div className="max-w-4xl mx-auto bg-white/5 rounded-[3rem] border border-white/10 p-8 md:p-12 relative backdrop-blur-md shadow-2xl">
                    {/* Setup Controls */}
                    <div className="flex flex-wrap justify-center gap-8 mb-10">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-black">Time:</span>
                            {[2, 5, 30].map((mins) => (
                                <button
                                    key={mins}
                                    onClick={() => !isActive && setDuration(mins as any)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${duration === mins ? "bg-blue-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
                                    disabled={isActive}
                                >
                                    {mins}M
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-black">Level:</span>
                            {(['basic', 'intermediate', 'expert'] as const).map((lvl) => (
                                <button
                                    key={lvl}
                                    onClick={() => !isActive && setDifficulty(lvl)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${difficulty === lvl ? "bg-purple-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
                                    disabled={isActive}
                                >
                                    {lvl}
                                </button>
                            ))}
                        </div>
                    </div>

                    {!isFinished ? (
                        <>
                            {/* Stats Bar */}
                            <div className="grid grid-cols-3 gap-4 mb-10">
                                <div className="bg-black/40 p-5 rounded-2xl border border-white/5 backdrop-blur-xl">
                                    <div className="text-blue-500 mb-1 flex justify-center"><Timer size={20} /></div>
                                    <div className="text-2xl font-black text-white font-mono">{formatTime(timeLeft)}</div>
                                    <div className="text-[8px] uppercase tracking-[0.2em] text-gray-500 font-black">Remaining</div>
                                </div>
                                <div className="bg-black/40 p-5 rounded-2xl border border-white/5 backdrop-blur-xl">
                                    <div className="text-green-500 mb-1 flex justify-center"><Zap size={20} /></div>
                                    <div className="text-2xl font-black text-white font-mono">{wpm}</div>
                                    <div className="text-[8px] uppercase tracking-[0.2em] text-gray-500 font-black">Words/Min</div>
                                </div>
                                <div className="bg-black/40 p-5 rounded-2xl border border-white/5 backdrop-blur-xl">
                                    <div className="text-purple-500 mb-1 flex justify-center"><Trophy size={20} /></div>
                                    <div className="text-2xl font-black text-white font-mono">{accuracy}%</div>
                                    <div className="text-[8px] uppercase tracking-[0.2em] text-gray-500 font-black">Accuracy</div>
                                </div>
                            </div>

                            {/* Enhanced Typing Area */}
                            <div
                                className="relative mb-10 h-[280px] md:h-[400px] p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-black/40 border border-white/10 overflow-y-auto cursor-text group selection:bg-blue-500/30"
                                onClick={() => inputRef.current?.focus()}
                            >
                                {/* Start Overlay */}
                                {!isActive && !userInput && (
                                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm transition-all group-hover:bg-black/40">
                                        <Keyboard className="text-blue-500 mb-4 animate-bounce" size={48} />
                                        <p className="text-white font-black uppercase tracking-[0.3em] text-sm animate-pulse">Start typing here to begin...</p>
                                    </div>
                                )}

                                {/* Hidden Textarea for Input */}
                                <textarea
                                    ref={inputRef}
                                    value={userInput}
                                    onChange={handleInputChange}
                                    spellCheck={false}
                                    className="absolute inset-0 opacity-0 cursor-default resize-none"
                                />

                                {/* Rendered Text with Feedback */}
                                <div className="text-lg md:text-xl font-mono leading-[1.8] text-left select-none relative z-10">
                                    {text.split('').map((char, index) => {
                                        let colorClass = "text-gray-600"; // Upcoming
                                        if (index < userInput.length) {
                                            colorClass = userInput[index] === char ? "text-white" : "text-red-500 bg-red-500/20 rounded-sm";
                                        }
                                        return (
                                            <span
                                                key={index}
                                                className={`transition-colors duration-200 ${colorClass} ${index === userInput.length && isActive ? "border-l-2 border-blue-500 animate-pulse" : ""}`}
                                            >
                                                {char}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={resetTest}
                                    className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95 border border-white/5 shadow-xl"
                                >
                                    <RefreshCcw size={14} /> Restart Simulation
                                </button>
                                {isActive && (
                                    <button
                                        onClick={finishTest}
                                        className="px-8 py-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95 border border-red-500/20 shadow-xl"
                                    >
                                        Stop & Finish
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="space-y-10 py-10">
                            {timeLeft === 0 ? (
                                <>
                                    <div className="relative inline-block">
                                        <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full" />
                                        <div className="relative p-8 bg-green-500/10 rounded-full border border-green-500/20">
                                            <Trophy size={80} className="text-green-500" />
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Mission Accomplished</h3>
                                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">{difficulty} Level | {duration} Minutes</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-10 max-w-sm mx-auto">
                                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                            <div className="text-5xl font-black text-white mb-2">{wpm}</div>
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">WPM Rate</span>
                                        </div>
                                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                            <div className="text-5xl font-black text-white mb-2">{accuracy}%</div>
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Precision</span>
                                        </div>
                                    </div>

                                    <div className="bg-black/40 p-10 rounded-[2.5rem] border border-white/10 max-w-lg mx-auto space-y-6 backdrop-blur-2xl transition-all">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-4 mb-2 block">Identity Signature</label>
                                            <input
                                                type="text"
                                                placeholder="Type your name..."
                                                value={userName}
                                                onChange={(e) => setUserName(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-blue-500 transition-all font-bold placeholder:text-white/10"
                                            />
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <button
                                                onClick={submitResult}
                                                disabled={submitting}
                                                className="flex-1 bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/20 disabled:opacity-50 active:scale-95"
                                            >
                                                {submitting ? "Transmitting..." : "Sync to Leaderboard"}
                                            </button>
                                            <button
                                                onClick={resetTest}
                                                className="flex-1 bg-white/10 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/20 transition-all active:scale-95"
                                            >
                                                Initiate Again
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="py-20 animate-in zoom-in duration-500">
                                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                                        <X className="text-red-500" size={40} />
                                    </div>
                                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Incomplete Session</h3>
                                    <p className="text-gray-400 max-w-sm mx-auto mb-8 font-bold">
                                        Sorry, you have not completed the test. Results are only generated if you utilize the full {duration} minutes.
                                    </p>
                                    <button
                                        onClick={resetTest}
                                        className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-900/20"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
