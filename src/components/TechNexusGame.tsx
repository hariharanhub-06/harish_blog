"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Cpu,
    Bug,
    ShieldAlert,
    Terminal,
    Play,
    RefreshCw,
    Trophy,
    Heart,
    Skull,
    Target
} from "lucide-react";

interface Threat {
    id: number;
    x: number;
    y: number;
    type: "bug" | "virus" | "glitch";
    speed: number;
}

export default function TechNexusGame() {
    const [gameState, setGameState] = useState<"start" | "playing" | "gameover">("start");
    const [score, setScore] = useState(0);
    const [health, setHealth] = useState(100);
    const [threats, setThreats] = useState<Threat[]>([]);
    const [highScore, setHighScore] = useState(0);
    const [level, setLevel] = useState(1);
    const frameRef = useRef<number | null>(null);
    const lastSpawnRef = useRef<number>(0);

    // Speed and Spawn rate based on level
    const spawnRate = Math.max(400, 1500 - (level * 100));

    useEffect(() => {
        const stored = localStorage.getItem("nexus-high-score");
        if (stored) setHighScore(parseInt(stored));
        return () => {
            if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
        };
    }, []);

    const startGame = () => {
        setGameState("playing");
        setScore(0);
        setHealth(100);
        setThreats([]);
        setLevel(1);
        lastSpawnRef.current = performance.now();
        frameRef.current = requestAnimationFrame(updateGame);
    };

    const updateGame = (time: number) => {
        if (time - lastSpawnRef.current > spawnRate) {
            spawnThreat();
            lastSpawnRef.current = time;
        }

        setThreats(prev => {
            const next = prev.map(t => {
                const dist = Math.sqrt(t.x * t.x + t.y * t.y);
                if (dist < 50) {
                    setHealth(h => {
                        const newH = Math.max(0, h - 10);
                        if (newH <= 0) {
                            setGameState("gameover");
                            if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
                        }
                        return newH;
                    });
                    return null;
                }
                const dx = (t.x / dist) * t.speed;
                const dy = (t.y / dist) * t.speed;
                return { ...t, x: t.x - dx, y: t.y - dy };
            }).filter((t): t is Threat => t !== null);

            return next;
        });

        if (health > 0) {
            frameRef.current = requestAnimationFrame(updateGame);
        }
    };

    const spawnThreat = () => {
        const radius = 350;
        const angle = Math.random() * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        const types: ("bug" | "virus" | "glitch")[] = ["bug", "virus", "glitch"];
        const type = types[Math.floor(Math.random() * types.length)];

        setThreats(prev => [...prev.slice(-30), {
            id: Math.random(),
            x,
            y,
            type,
            speed: 1.5 + (level * 0.3) + Math.random()
        }]);
    };

    const handleDefuse = (id: number) => {
        setThreats(prev => prev.filter(t => t.id !== id));
        setScore(s => {
            const newScore = s + 10;
            if (newScore > 0 && newScore % 100 === 0) setLevel(l => l + 1);
            return newScore;
        });
    };

    useEffect(() => {
        if (gameState === "gameover") {
            if (score > highScore) {
                setHighScore(score);
                localStorage.setItem("nexus-high-score", score.toString());
            }
        }
    }, [gameState, score, highScore]);

    return (
        <section id="nexus-game" className="py-24 px-6 bg-[#030303] relative overflow-hidden flex flex-col items-center justify-center min-h-[850px]">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="container mx-auto max-w-7xl relative z-50 flex flex-col items-center">
                <div className="text-center mb-16 space-y-4">
                    <span className="text-blue-400 font-bold tracking-[0.4em] uppercase text-[10px]">Cyber Security Lab</span>
                    <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
                        Nexus <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Defender</span>
                    </h2>
                </div>

                <div className="relative w-full max-w-[650px] aspect-square flex items-center justify-center select-none">
                    <div className="absolute -top-12 -left-4 md:left-0 flex items-center gap-3 bg-white/5 backdrop-blur-3xl border border-white/10 px-6 py-3 rounded-2xl shadow-2xl">
                        <Target size={18} className="text-blue-400" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Threats Neutralized</span>
                            <span className="text-xl font-black text-white italic tracking-tighter tabular-nums">{score}</span>
                        </div>
                    </div>

                    <div className="absolute -top-12 -right-4 md:right-0 bg-white/5 backdrop-blur-3xl border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl text-right">
                        <Trophy size={18} className="text-yellow-400" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/30">System High Record</span>
                            <span className="text-xl font-black text-white italic tracking-tighter tabular-nums">{highScore}</span>
                        </div>
                    </div>

                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-full max-w-[300px]">
                        <div className="flex justify-between items-center mb-2 px-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                                <Heart size={10} className="text-rose-500" /> System Integrity
                            </span>
                            <span className="text-[10px] font-black text-white tabular-nums">{health}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                                className={`h-full shadow-[0_0_15px_rgba(244,63,94,0.3)] ${health < 40 ? 'bg-rose-500' : 'bg-blue-400'}`}
                                animate={{ width: `${health}%`, backgroundColor: health < 40 ? '#f43f5e' : '#60a5fa' }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>

                    <div className="relative w-full h-full flex items-center justify-center">
                        <div className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                        <div className="absolute inset-y-0 w-[1px] bg-gradient-to-b from-transparent via-white/5 to-transparent"></div>
                        <div className="absolute inset-[15%] border border-white/[0.03] rounded-full"></div>
                        <div className="absolute inset-[30%] border border-white/[0.03] rounded-full"></div>

                        <motion.div
                            animate={{
                                scale: health < 30 ? [1, 1.05, 1] : 1,
                                boxShadow: health < 30
                                    ? "0 0 60px rgba(244,63,94,0.4)"
                                    : "0 0 100px rgba(59,130,246,0.2)"
                            }}
                            transition={{ repeat: Infinity, duration: 0.6 }}
                            className={`relative z-20 w-32 h-32 md:w-44 md:h-44 bg-white/5 backdrop-blur-[40px] rounded-[3.5rem] border flex items-center justify-center transition-all duration-500 ${health < 30 ? 'border-rose-500/50' : 'border-white/10'
                                }`}
                        >
                            <Cpu size={64} className={`${health < 30 ? 'text-rose-500 animate-pulse' : 'text-blue-400'}`} />
                            <div className="absolute -bottom-10 whitespace-nowrap font-black uppercase tracking-[0.3em] text-[8px] text-white/20">Encryption Nexus Core</div>
                        </motion.div>

                        <AnimatePresence>
                            {threats.map((threat) => (
                                <motion.button
                                    key={threat.id}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{
                                        scale: 1,
                                        opacity: 1,
                                        y: threat.y,
                                        x: threat.x
                                    }}
                                    exit={{ scale: 1.5, opacity: 0 }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDefuse(threat.id);
                                    }}
                                    className="absolute z-30 p-4 md:p-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-2xl shadow-3xl group cursor-crosshair pointer-events-auto hover:bg-white/10 active:scale-90 transition-all"
                                >
                                    {threat.type === 'bug' && <Bug size={24} className="text-rose-400 group-hover:scale-110 transition-transform" />}
                                    {threat.type === 'virus' && <ShieldAlert size={24} className="text-amber-400 group-hover:scale-110 transition-transform" />}
                                    {threat.type === 'glitch' && <Skull size={24} className="text-purple-400 group-hover:scale-110 transition-transform" />}
                                </motion.button>
                            ))}
                        </AnimatePresence>

                        <AnimatePresence>
                            {gameState === "start" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 1.1 }}
                                    className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-[40px] rounded-[4rem] border border-white/10 p-12 text-center pointer-events-auto shadow-[0_0_100px_rgba(0,0,0,0.5)]"
                                >
                                    <div className="w-24 h-24 bg-blue-500/10 border border-blue-500/20 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner shadow-blue-500/20">
                                        <Terminal size={48} className="text-blue-400" />
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter mb-4 uppercase">System Defense</h2>
                                    <p className="text-gray-400 font-medium mb-10 max-w-sm uppercase text-[10px] tracking-widest leading-relaxed opacity-60">
                                        Security bypass attempt detected. Intercept incoming logical vulnerabilities to protect the matrix.
                                    </p>
                                    <button
                                        onClick={startGame}
                                        className="group flex items-center gap-4 px-12 py-5 bg-white text-black rounded-3xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-blue-500/20"
                                    >
                                        <Play size={18} className="fill-current text-black" /> <span className="text-black">Begin Simulation</span>
                                    </button>
                                </motion.div>
                            )}

                            {gameState === "gameover" && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-[40px] rounded-[4rem] border border-rose-500/20 p-12 text-center pointer-events-auto"
                                >
                                    <div className="w-24 h-24 bg-rose-500/10 border border-rose-500/20 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner shadow-rose-500/20">
                                        <Skull size={48} className="text-rose-500" />
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter mb-4 uppercase">System Compromised</h2>
                                    <div className="space-y-3 mb-10">
                                        <p className="text-rose-400 font-black uppercase tracking-widest text-[9px] animate-pulse">Critical Data Leakage</p>
                                        <div className="px-6 py-2 bg-white/5 rounded-full border border-white/5 text-xs text-white/60">
                                            Final Score: <span className="text-white font-black">{score}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={startGame}
                                        className="group flex items-center gap-4 px-12 py-5 bg-rose-500 text-white rounded-3xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-rose-500/30"
                                    >
                                        <RefreshCw size={18} /> Patch & Reboot
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
}
