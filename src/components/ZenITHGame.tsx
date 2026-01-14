"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Maximize2,
    RefreshCcw,
    Compass,
    Activity,
    Zap
} from "lucide-react";

interface Particle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    type: "shard" | "pulse" | "beam";
    life: number;
}

export default function ZenITHGame() {
    const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">("idle");
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [particles, setParticles] = useState<Particle[]>([]);
    const [playerPos, setPlayerPos] = useState({ x: 300, y: 300 });

    const containerRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number | null>(null);
    const lastSpawnRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);

    // Load High Score
    useEffect(() => {
        const stored = localStorage.getItem("zenith-ultra-score");
        if (stored) setHighScore(parseInt(stored));
    }, []);

    const spawnParticle = useCallback((time: number) => {
        const elapsed = (time - startTimeRef.current) / 1000;
        const difficulty = 1 + elapsed * 0.1;
        const spawnRate = Math.max(50, 200 - elapsed * 5);

        if (time - lastSpawnRef.current > spawnRate) {
            const side = Math.floor(Math.random() * 4);
            let x = 0, y = 0, vx = 0, vy = 0;
            const speed = 2 + Math.random() * 3 * difficulty;

            if (side === 0) { x = Math.random() * 600; y = -20; vy = speed; vx = (Math.random() - 0.5) * 2; }
            else if (side === 1) { x = 620; y = Math.random() * 600; vx = -speed; vy = (Math.random() - 0.5) * 2; }
            else if (side === 2) { x = Math.random() * 600; y = 620; vy = -speed; vx = (Math.random() - 0.5) * 2; }
            else { x = -20; y = Math.random() * 600; vx = speed; vy = (Math.random() - 0.5) * 2; }

            const colors = ["#ff0055", "#00f2ff", "#7000ff", "#ffae00"];
            const newParticle: Particle = {
                id: Math.random(),
                x, y, vx, vy,
                size: 6 + Math.random() * 6,
                color: colors[Math.floor(Math.random() * colors.length)],
                type: "shard",
                life: 1
            };

            setParticles(prev => [...prev.slice(-40), newParticle]);
            lastSpawnRef.current = time;
        }
    }, [startTimeRef]);

    const endGame = useCallback(() => {
        setGameState("gameover");
        if (requestRef.current !== null) {
            cancelAnimationFrame(requestRef.current);
            requestRef.current = null;
        }
    }, []);

    const update = useCallback((time: number) => {
        if (gameState !== "playing") return;

        setScore(Math.floor((time - startTimeRef.current) / 100));

        setParticles(prev => {
            const next = prev.map(p => ({
                ...p,
                x: p.x + p.vx,
                y: p.y + p.vy
            })).filter(p => p.x > -50 && p.x < 650 && p.y > -50 && p.y < 650);

            // Collision Detection
            for (const p of next) {
                const dx = p.x - playerPos.x;
                const dy = p.y - playerPos.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < (p.size / 2 + 8)) {
                    endGame();
                    return next;
                }
            }
            return next;
        });

        spawnParticle(time);
        requestRef.current = requestAnimationFrame(update);
    }, [gameState, playerPos, spawnParticle, endGame]);

    const startGame = () => {
        setGameState("playing");
        setScore(0);
        setParticles([]);
        setPlayerPos({ x: 300, y: 300 });
        startTimeRef.current = performance.now();
        lastSpawnRef.current = performance.now();
        requestRef.current = requestAnimationFrame(update);
    };

    useEffect(() => {
        if (gameState === "gameover" && score > highScore) {
            setHighScore(score);
            localStorage.setItem("zenith-ultra-score", score.toString());
        }
    }, [gameState, score, highScore]);

    useEffect(() => {
        return () => {
            if (requestRef.current !== null) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, []);

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (gameState !== "playing" || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        let clientX: number, clientY: number;

        if ('touches' in e && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else if ('clientX' in (e as React.MouseEvent)) {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        } else {
            return;
        }

        setPlayerPos({
            x: clientX - rect.left,
            y: clientY - rect.top
        });
    };

    return (
        <section id="zenith-survival" className="py-24 px-6 bg-[#020202] relative overflow-hidden flex flex-col items-center justify-center min-h-[900px]">
            <div className="text-center mb-16 space-y-4">
                <span className="text-pink-500 font-bold tracking-[0.6em] uppercase text-[10px] animate-pulse">Survival Protocol</span>
                <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter">
                    Zen<span className="text-transparent bg-clip-text bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 italic">ITH</span>
                </h2>
                <p className="text-gray-500 font-medium tracking-widest text-[10px] uppercase">Geometric Void Survival • Critical Difficulty</p>
            </div>

            <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onTouchMove={handleMouseMove}
                className="relative w-full max-w-[600px] aspect-square bg-[#050505] rounded-[3rem] border border-white/10 overflow-hidden cursor-none shadow-2xl selection:bg-transparent"
            >
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)`,
                    backgroundSize: '30px 30px'
                }}></div>

                <AnimatePresence>
                    {gameState === "idle" && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 flex flex-col items-center justify-center p-12 bg-black/80 backdrop-blur-xl"
                        >
                            <div className="w-20 h-20 rounded-full border border-pink-500/30 flex items-center justify-center mb-8">
                                <Maximize2 size={32} className="text-pink-500 animate-pulse" />
                            </div>
                            <h3 className="text-3xl font-black text-white tracking-tighter mb-4 italic uppercase">Enter the Void</h3>
                            <p className="text-xs text-gray-500 max-w-[280px] mb-10 leading-relaxed tracking-widest uppercase font-bold">
                                Avoid every geometric fragment. Survive as long as possible. The void is unforgiving.
                            </p>
                            <button
                                onClick={startGame}
                                className="px-12 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-pink-500 hover:text-white transition-all shadow-xl active:scale-95"
                            >
                                Start Sequence
                            </button>
                        </motion.div>
                    )}

                    {gameState === "gameover" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 z-50 flex flex-col items-center justify-center p-12 bg-black/90 backdrop-blur-3xl"
                        >
                            <h3 className="text-6xl font-black text-white tracking-tighter mb-2 italic">ERASED</h3>
                            <div className="flex gap-8 mb-12 mt-4 text-center">
                                <div>
                                    <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1">Score</p>
                                    <p className="text-3xl font-black text-white">{score}</p>
                                </div>
                                <div className="w-[1px] h-10 bg-white/10 mt-2"></div>
                                <div>
                                    <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1">Record</p>
                                    <p className="text-3xl font-black text-pink-500">{highScore}</p>
                                </div>
                            </div>
                            <button
                                onClick={startGame}
                                className="flex items-center gap-3 px-10 py-5 bg-pink-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-pink-500 transition-all shadow-2xl shadow-pink-500/20 active:scale-95"
                            >
                                <RefreshCcw size={16} /> Re-materialize
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Game Field */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Player */}
                    {gameState === "playing" && (
                        <motion.div
                            animate={{ x: playerPos.x - 10, y: playerPos.y - 10 }}
                            transition={{ type: "spring", damping: 15, stiffness: 200, mass: 0.5 }}
                            className="absolute w-5 h-5 z-40"
                        >
                            <div className="w-full h-full bg-white rounded-full shadow-[0_0_20px_white] relative">
                                <div className="absolute inset-[-4px] border border-white/30 rounded-full animate-ping"></div>
                            </div>
                        </motion.div>
                    )}

                    {/* Shards */}
                    {particles.map(p => (
                        <div
                            key={p.id}
                            style={{
                                left: p.x,
                                top: p.y,
                                width: p.size,
                                height: p.size,
                                backgroundColor: p.color,
                                boxShadow: `0 0 15px ${p.color}`,
                                transform: `translate(-50%, -50%) rotate(${p.x + p.y}deg)`
                            }}
                            className="absolute rounded-sm transition-transform duration-75"
                        />
                    ))}
                </div>

                {/* Score HUD */}
                {gameState === "playing" && (
                    <div className="absolute top-8 left-8 z-30 flex items-center gap-4">
                        <div className="px-4 py-2 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
                            <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">Void Time</p>
                            <p className="text-xl font-black text-white tabular-nums">{score}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-12 flex gap-12 text-center opacity-40">
                <div className="space-y-1">
                    <Activity size={20} className="mx-auto text-blue-400 mb-2" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-white">Dynamic scaling</p>
                </div>
                <div className="space-y-1">
                    <Zap size={20} className="mx-auto text-yellow-400 mb-2" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-white">Pixel perfect</p>
                </div>
                <div className="space-y-1">
                    <Compass size={20} className="mx-auto text-pink-400 mb-2" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-white">Inertial physics</p>
                </div>
            </div>
        </section>
    );
}
