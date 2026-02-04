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
    const [obstacles, setObstacles] = useState<Obstacle[]>([]);
    const [isJumping, setIsJumping] = useState(false);

    // Refs for Game Loop (No Re-renders)
    const dinoRef = useRef<HTMLDivElement>(null);
    const obstacleRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    const scoreElemRef = useRef<HTMLParagraphElement>(null);
    const requestRef = useRef<number | null>(null);

    // Game Logic Refs
    const stateRef = useRef({
        dinoY: 0,
        velocity: 0,
        score: 0,
        gameSpeed: 8,
        lastSpawn: 0,
        isJumping: false,
        obstacles: [] as Obstacle[], // Logic source of truth
        status: "idle" as "idle" | "playing" | "gameover"
    });

    const gravity = -0.8;
    const jumpPower = 15;
    const groundY = 0;

    // Load High Score
    useEffect(() => {
        const stored = localStorage.getItem("dino-ultra-score");
        if (stored) setHighScore(parseInt(stored));
    }, []);

    // Sync React State changes to Ref
    useEffect(() => {
        stateRef.current.status = gameState;
    }, [gameState]);

    const spawnObstacle = (time: number) => {
        const minGap = 1200;
        const randomGap = Math.random() * 800;
        const { lastSpawn } = stateRef.current;

        if (time - lastSpawn > minGap + randomGap) {
            const newObstacle: Obstacle = {
                id: Math.random(),
                x: 800, // Start just off-screen
                type: "cactus",
                width: 30 + Math.random() * 20,
                height: 40 + Math.random() * 40
            };

            // Update Logic Ref
            stateRef.current.obstacles.push(newObstacle);
            stateRef.current.lastSpawn = time;

            // Trigger React Render for DOM mount only
            setObstacles(prev => [...prev, newObstacle]);
        }
    };

    const update = (time: number) => {
        if (stateRef.current.status !== "playing") return;

        const state = stateRef.current;

        // 1. Physics (Dino)
        state.velocity += gravity;
        state.dinoY += state.velocity;

        if (state.dinoY <= groundY) {
            state.dinoY = groundY;
            state.velocity = 0;
            if (state.isJumping) {
                state.isJumping = false;
                setIsJumping(false);
            }
        }

        // 2. Physics (Obstacles)
        // Move logical positions
        state.obstacles.forEach(o => {
            o.x -= state.gameSpeed;
        });

        // 3. Cleanup Off-screen
        if (state.obstacles.length > 0 && state.obstacles[0].x < -100) {
            const removed = state.obstacles.shift();
            // Trigger React Render to remove from DOM
            setObstacles(prev => prev.filter(o => o.id !== removed?.id));
            obstacleRefs.current.delete(removed!.id);
        }

        // 4. Collision Detection
        const dinoRect = {
            left: 50 + 10,
            right: 50 + 30, // Narrower hitbox
            bottom: state.dinoY,
            top: state.dinoY + 50
        };

        for (const o of state.obstacles) {
            const obsRect = {
                left: o.x + 5,
                right: o.x + o.width - 5,
                top: o.height,
                bottom: 0
            };

            if (
                dinoRect.right > obsRect.left &&
                dinoRect.left < obsRect.right &&
                dinoRect.bottom < obsRect.top
            ) {
                gameOver();
                return;
            }
        }

        // 5. Render Updates (Direct DOM - No React Render)
        // Dino
        if (dinoRef.current) {
            dinoRef.current.style.transform = `translateY(${-state.dinoY}px)`;
            // Simple squash/stretch effect based on velocity can be added here
        }

        // Obstacles
        state.obstacles.forEach(o => {
            const el = obstacleRefs.current.get(o.id);
            if (el) {
                el.style.transform = `translate3d(${o.x}px, 0, 0)`;
            }
        });

        // Score
        state.score += 1;
        if (scoreElemRef.current && state.score % 5 === 0) {
            scoreElemRef.current.textContent = state.score.toString();
        }

        // Loop
        spawnObstacle(time);
        requestRef.current = requestAnimationFrame(update);
    };

    const jump = useCallback(() => {
        if (stateRef.current.status !== "playing") return;
        if (stateRef.current.dinoY <= groundY + 1) { // Tolerance
            stateRef.current.velocity = jumpPower;
            stateRef.current.isJumping = true;
            setIsJumping(true);
        }
    }, []);

    const startGame = () => {
        // Reset State Ref
        stateRef.current = {
            dinoY: 0,
            velocity: 0,
            score: 0,
            gameSpeed: 8,
            lastSpawn: performance.now(),
            isJumping: false,
            obstacles: [],
            status: "playing"
        };

        // Reset Logic
        obstacleRefs.current.clear();
        setObstacles([]); // Clear DOM
        setScore(0);
        setGameState("playing");

        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        requestRef.current = requestAnimationFrame(update);
    };

    const gameOver = () => {
        setGameState("gameover");
        stateRef.current.status = "gameover";
        setScore(stateRef.current.score); // Sync final score

        if (requestRef.current) cancelAnimationFrame(requestRef.current);

        if (stateRef.current.score > highScore) {
            setHighScore(stateRef.current.score);
            localStorage.setItem("dino-ultra-score", stateRef.current.score.toString());
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.code === "Space" || e.code === "ArrowUp") {
                e.preventDefault();
                if (stateRef.current.status === "playing") {
                    jump();
                } else {
                    startGame();
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [jump]);

    return (
        <section id="dino-runner" className="py-12 md:py-16 px-4 md:px-6 bg-[#0a0a0a] relative overflow-hidden flex flex-col items-center justify-center min-h-[600px] md:min-h-[750px]">
            <div className="text-center mb-4 md:mb-8 space-y-2 md:space-y-4 px-4 w-full">
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
                                    <h3 className="text-2xl md:text-4xl font-black text-rose-500 tracking-tighter mb-1 italic">GAME OVER</h3>
                                    <div className="flex gap-4 md:gap-6 mb-4 md:mb-6 mt-1">
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

                {/* Dino - Hardware Accelerated */}
                <div
                    ref={dinoRef}
                    style={{
                        position: 'absolute',
                        left: 50,
                        bottom: 40,
                        width: 40,
                        height: 60,
                        willChange: 'transform'
                    }}
                    className="z-40"
                >
                    <div className="w-full h-full bg-emerald-400 rounded-lg shadow-[0_0_20px_rgba(52,211,153,0.4)] flex flex-col items-center justify-end relative">
                        <div className="absolute top-2 right-2 w-2 h-2 bg-black rounded-full" />
                        <div className="absolute top-6 right-0 w-4 h-1 bg-black/20" />
                        <div className="flex gap-2 mb-[-5px]">
                            <div className="w-3 h-4 bg-emerald-600 rounded-sm" />
                            <div className="w-3 h-4 bg-emerald-600 rounded-sm" />
                        </div>
                    </div>
                </div>

                {/* Obstacles (Cacti) - DOM Nodes managed by React, Positions managed by Ref/Loop */}
                {obstacles.map(o => (
                    <div
                        key={o.id}
                        ref={(el) => {
                            if (el) obstacleRefs.current.set(o.id, el);
                            else obstacleRefs.current.delete(o.id);
                        }}
                        style={{
                            position: 'absolute',
                            left: 0, // Reset default left, use transform
                            bottom: 42,
                            width: o.width,
                            height: o.height,
                            willChange: 'transform',
                            transform: `translate3d(${o.x}px, 0, 0)` // Initial position
                        }}
                        className="flex items-end gap-1"
                    >
                        <div className="w-full h-full bg-cyan-500 rounded-t-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] relative overflow-hidden">
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[2px] h-[70%] bg-black/10" />
                        </div>
                        {o.height > 60 && <div className="w-6 h-12 bg-cyan-600 rounded-t-md mb-2" />}
                    </div>
                ))}

                {/* Score - Direct DOM Update */}
                {gameState !== "idle" && (
                    <div className="absolute top-6 right-8 flex gap-6">
                        <div className="text-right">
                            <p className="text-[9px] font-black uppercase text-white/30 tracking-widest">Hi-Score</p>
                            <p className="text-xl font-black text-white tabular-nums opacity-50">{highScore}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black uppercase text-white/30 tracking-widest">Score</p>
                            <p ref={scoreElemRef} className="text-xl font-black text-emerald-400 tabular-nums">0</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-4 md:mt-8 flex flex-wrap justify-center gap-4 md:gap-8 px-6">
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
