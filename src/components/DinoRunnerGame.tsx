"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Cloud,
    Zap,
    RefreshCcw,
    Trophy,
    Gamepad2,
    Mountain,
    Flame,
    Play
} from "lucide-react";

interface Obstacle {
    id: number;
    x: number;
    type: "cactus";
    width: number;
    height: number;
}

export default function DinoRunnerGame() {
    const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">("idle");
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [dinoY, setDinoY] = useState(0);
    const [isJumping, setIsJumping] = useState(false);
    const [obstacles, setObstacles] = useState<Obstacle[]>([]);

    const requestRef = useRef<number | null>(null);
    const lastSpawnRef = useRef<number>(0);

    // Refs for high-frequency updates to avoid re-renders and closure staleness
    const dinoYRef = useRef(0);
    const velocityRef = useRef(0);
    const obstaclesRef = useRef<Obstacle[]>([]);
    const scoreRef = useRef(0);
    const gameStateRef = useRef<"idle" | "playing" | "gameover">("idle");

    const gravity = -0.8;
    const jumpPower = 15;
    const groundY = 0;
    const gameSpeed = 8;

    // Sync state ref
    useEffect(() => {
        gameStateRef.current = gameState;
    }, [gameState]);

    // High Score Persistence
    useEffect(() => {
        const stored = localStorage.getItem("dino-ultra-score");
        if (stored) setHighScore(parseInt(stored));
    }, []);

    const spawnObstacle = (time: number) => {
        const minGap = 1500;
        const randomGap = Math.random() * 1000;

        if (time - lastSpawnRef.current > minGap + randomGap) {
            const newObstacle: Obstacle = {
                id: Math.random(),
                x: 800,
                type: "cactus",
                width: 30 + Math.random() * 20,
                height: 40 + Math.random() * 40
            };
            obstaclesRef.current = [...obstaclesRef.current.slice(-10), newObstacle];
            lastSpawnRef.current = time;
        }
    };

    const jump = useCallback(() => {
        if (gameStateRef.current !== "playing" || dinoYRef.current > 0) return;
        setIsJumping(true);
        velocityRef.current = jumpPower;
    }, []);

    const update = (time: number) => {
        if (gameStateRef.current !== "playing") return;

        // Jump Physics
        velocityRef.current += gravity;
        dinoYRef.current += velocityRef.current;

        if (dinoYRef.current <= groundY) {
            dinoYRef.current = groundY;
            velocityRef.current = 0;
            setIsJumping(false);
        }

        // Score
        scoreRef.current += 1;

        // Obstacles & Collision
        const nextObstacles = obstaclesRef.current
            .map(o => ({ ...o, x: o.x - gameSpeed }))
            .filter(o => o.x > -100);

        // Collision logic
        const dinoWidth = 30; // Narrower hitbox for fairness
        const dinoHeight = 50;
        const dinoLeft = 50 + 5;
        const dinoRight = dinoLeft + dinoWidth;
        const dinoBottom = dinoYRef.current;
        const dinoTop = dinoBottom + dinoHeight;

        for (const o of nextObstacles) {
            const obsLeft = o.x + 5;
            const obsRight = o.x + o.width - 5;
            const obsTop = o.height - 5;

            if (
                dinoRight > obsLeft &&
                dinoLeft < obsRight &&
                dinoBottom < obsTop
            ) {
                setGameState("gameover");
                gameStateRef.current = "gameover";
                return;
            }
        }

        obstaclesRef.current = nextObstacles;
        spawnObstacle(time);

        // Efficient batch update to React state
        if (scoreRef.current % 5 === 0) {
            setScore(scoreRef.current);
        }
        setDinoY(dinoYRef.current);
        setObstacles([...obstaclesRef.current]);

        requestRef.current = requestAnimationFrame(update);
    };

    const startGame = () => {
        // Reset all refs
        dinoYRef.current = 0;
        velocityRef.current = 0;
        obstaclesRef.current = [];
        scoreRef.current = 0;
        lastSpawnRef.current = performance.now();

        // Update states
        setDinoY(0);
        setObstacles([]);
        setScore(0);
        setIsJumping(false);
        setGameState("playing");
        gameStateRef.current = "playing";

        // Kick off loop
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        requestRef.current = requestAnimationFrame(update);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't intercept if user is typing in an input or textarea
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement
            ) {
                return;
            }

            if (e.code === "Space" || e.code === "ArrowUp") {
                e.preventDefault();
                if (gameStateRef.current === "idle" || gameStateRef.current === "gameover") {
                    startGame();
                } else {
                    jump();
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [jump]);

    useEffect(() => {
        if (gameState === "gameover" && score > highScore) {
            setHighScore(score);
            localStorage.setItem("dino-ultra-score", score.toString());
        }
    }, [gameState, score, highScore]);

    return (
        <section id="dino-runner" className="py-16 md:py-24 px-4 md:px-6 bg-[#0a0a0a] relative overflow-hidden flex flex-col items-center justify-center min-h-[700px] md:min-h-[850px]">
            <div className="text-center mb-8 md:mb-12 space-y-2 md:space-y-4 px-4 w-full">
                <span className="text-emerald-500 font-bold tracking-[0.3em] md:tracking-[0.5em] uppercase text-[9px] md:text-[10px] animate-pulse block">Retro Arcade</span>
                <h2 className="text-[12vw] md:text-7xl font-black text-white tracking-widest uppercase italic leading-none">
                    Pixel <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Jump</span>
                </h2>
                <p className="text-gray-500 font-medium text-[8px] md:text-[10px] uppercase tracking-widest">A tribute to the classics • Jump over obstacles</p>
            </div>

            <div
                onClick={gameState === "playing" ? jump : startGame}
                className="relative w-full max-w-[800px] h-64 bg-[#111] rounded-3xl border border-white/10 overflow-hidden cursor-pointer shadow-2xl"
            >
                {/* Background Decoration */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <Cloud className="absolute top-10 left-20 text-white" size={40} />
                    <Cloud className="absolute top-5 left-[60%] text-white" size={30} />
                    <Mountain className="absolute bottom-0 left-0 text-white" size={100} />
                </div>

                <AnimatePresence>
                    {(gameState === "idle" || gameState === "gameover") && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md"
                        >
                            {gameState === "gameover" ? (
                                <>
                                    <h3 className="text-2xl md:text-4xl font-black text-rose-500 tracking-tighter mb-2 italic">GAME OVER</h3>
                                    <div className="flex gap-4 md:gap-6 mb-6 md:mb-8 mt-2">
                                        <div className="text-center">
                                            <p className="text-[8px] md:text-[9px] uppercase tracking-widest text-gray-400">Distance</p>
                                            <p className="text-xl md:text-2xl font-black text-white">{score}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[8px] md:text-[9px] uppercase tracking-widest text-gray-400">Record</p>
                                            <p className="text-xl md:text-2xl font-black text-emerald-400">{highScore}</p>
                                        </div>
                                    </div>
                                    <button className="flex items-center gap-2 px-6 md:px-8 py-2 md:py-3 bg-white text-black rounded-xl font-black uppercase text-[10px] md:text-xs tracking-widest active:scale-95 transition-transform">
                                        <RefreshCcw size={14} /> Try Again
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-6">
                                        <Gamepad2 size={32} className="text-emerald-400" />
                                    </div>
                                    <p className="text-xs text-white/60 mb-8 max-w-[250px] text-center uppercase tracking-widest leading-loose">
                                        Press <b>Space</b> or <b>Click</b> to jump and start the run.
                                    </p>
                                    <button className="flex items-center gap-2 px-10 py-4 bg-emerald-500 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-500/20">
                                        <Play size={16} className="fill-current" /> Start Run
                                    </button>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Game Track */}
                <div className="absolute bottom-10 left-0 w-full h-[2px] bg-white/20"></div>

                {/* Dino */}
                <motion.div
                    style={{
                        left: 50,
                        bottom: 40 + dinoY,
                        width: 40,
                        height: 60
                    }}
                    className="absolute z-40"
                >
                    <div className="w-full h-full bg-emerald-400 rounded-lg shadow-[0_0_20px_rgba(52,211,153,0.4)] flex flex-col items-center justify-end relative">
                        <div className="absolute top-2 right-2 w-2 h-2 bg-black rounded-full" />
                        <div className="absolute top-6 right-0 w-4 h-1 bg-black/20" />
                        <div className="flex gap-2 mb-[-5px]">
                            <motion.div
                                animate={gameState === "playing" && !isJumping ? { y: [0, -4, 0] } : {}}
                                transition={{ repeat: Infinity, duration: 0.1 }}
                                className="w-3 h-4 bg-emerald-600 rounded-sm"
                            />
                            <motion.div
                                animate={gameState === "playing" && !isJumping ? { y: [-4, 0, -4] } : {}}
                                transition={{ repeat: Infinity, duration: 0.1 }}
                                className="w-3 h-4 bg-emerald-600 rounded-sm"
                            />
                        </div>
                        {isJumping && <div className="absolute inset-[-10px] border border-emerald-400/30 rounded-full animate-pulse" />}
                    </div>
                </motion.div>

                {/* Obstacles (Cacti) */}
                {obstacles.map(o => (
                    <div
                        key={o.id}
                        style={{
                            left: o.x,
                            bottom: 42,
                            width: o.width,
                            height: o.height,
                        }}
                        className="absolute flex items-end gap-1"
                    >
                        <div className="w-full h-full bg-cyan-500 rounded-t-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] relative overflow-hidden">
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[2px] h-[70%] bg-black/10" />
                        </div>
                        {o.height > 60 && <div className="w-6 h-12 bg-cyan-600 rounded-t-md mb-2" />}
                    </div>
                ))}

                {/* Score */}
                {gameState === "playing" && (
                    <div className="absolute top-6 right-8 flex gap-6">
                        <div className="text-right">
                            <p className="text-[9px] font-black uppercase text-white/30 tracking-widest">Hi-Score</p>
                            <p className="text-xl font-black text-white tabular-nums opacity-50">{highScore}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black uppercase text-white/30 tracking-widest">Score</p>
                            <p className="text-xl font-black text-emerald-400 tabular-nums">{score}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 md:mt-12 flex flex-wrap justify-center gap-4 md:gap-8 px-6">
                <div className="px-4 md:px-6 py-2 md:py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                    <Flame className="text-orange-500" size={14} />
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/60">Fast Paced</span>
                </div>
                <div className="px-4 md:px-6 py-2 md:py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                    <Trophy className="text-yellow-500" size={14} />
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/60">Skill Based</span>
                </div>
                <div className="px-4 md:px-6 py-2 md:py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                    <Zap className="text-blue-500" size={14} />
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/60">Infinite Run</span>
                </div>
            </div>
        </section>
    );
}
