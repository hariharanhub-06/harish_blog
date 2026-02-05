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
    Play,
    Send,
    CheckCircle2,
    Loader2
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
    const [userName, setUserName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

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
        gameSpeed: 10, // Intermediate speed
        lastSpawn: 0,
        isJumping: false,
        obstacles: [] as Obstacle[], // Logic source of truth
        status: "idle" as "idle" | "playing" | "gameover",
        lastFrameTime: 0
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
        const minGap = 1000;
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

            stateRef.current.obstacles.push(newObstacle);
            stateRef.current.lastSpawn = time;

            setObstacles(prev => [...prev, newObstacle]);
        }
    };

    const update = (time: number) => {
        if (stateRef.current.status !== "playing") return;

        const state = stateRef.current;
        const now = time;
        const lastTime = state.lastFrameTime || now;
        const dt = Math.min((now - lastTime) / 16.67, 2.0);
        state.lastFrameTime = now;

        state.velocity += gravity * dt;
        state.dinoY += state.velocity * dt;

        if (state.dinoY <= groundY) {
            state.dinoY = groundY;
            state.velocity = 0;
            if (state.isJumping) {
                state.isJumping = false;
                setIsJumping(false);
            }
        }

        state.obstacles.forEach(o => {
            o.x -= state.gameSpeed * dt;
        });

        if (state.obstacles.length > 0 && state.obstacles[0].x < -100) {
            const removed = state.obstacles.shift();
            setObstacles(prev => prev.filter(o => o.id !== removed?.id));
            obstacleRefs.current.delete(removed!.id);
        }

        const dinoRect = {
            left: 50 + 10,
            right: 50 + 30,
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

        if (dinoRef.current) {
            dinoRef.current.style.transform = `translateY(${-state.dinoY}px)`;
        }

        state.obstacles.forEach(o => {
            const el = obstacleRefs.current.get(o.id);
            if (el) {
                el.style.transform = `translate3d(${o.x}px, 0, 0)`;
            }
        });

        state.score += 1 * dt;
        if (scoreElemRef.current && Math.floor(state.score) % 5 === 0) {
            scoreElemRef.current.textContent = Math.floor(state.score).toString();
        }

        spawnObstacle(time);
        requestRef.current = requestAnimationFrame(update);
    };

    const jump = useCallback(() => {
        if (stateRef.current.status !== "playing") return;
        if (stateRef.current.dinoY <= groundY + 1) {
            stateRef.current.velocity = jumpPower;
            stateRef.current.isJumping = true;
            setIsJumping(true);
        }
    }, []);

    const startGame = () => {
        stateRef.current = {
            dinoY: 0,
            velocity: 0,
            score: 0,
            gameSpeed: 10,
            lastSpawn: performance.now(),
            isJumping: false,
            obstacles: [],
            status: "playing",
            lastFrameTime: performance.now()
        };

        obstacleRefs.current.clear();
        setObstacles([]);
        setScore(0);
        setGameState("playing");
        setSubmitted(false);
        setUserName("");

        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        requestRef.current = requestAnimationFrame(update);
    };

    const gameOver = () => {
        setGameState("gameover");
        stateRef.current.status = "gameover";
        setScore(Math.floor(stateRef.current.score));

        if (requestRef.current) cancelAnimationFrame(requestRef.current);

        if (stateRef.current.score > highScore) {
            setHighScore(Math.floor(stateRef.current.score));
            localStorage.setItem("dino-ultra-score", Math.floor(stateRef.current.score).toString());
        }
    };

    const submitScore = async () => {
        if (!userName.trim() || submitting || submitted) return;
        setSubmitting(true);
        try {
            await fetch("/api/games/leaderboard", {
                method: "POST",
                body: JSON.stringify({
                    gameId: "dino",
                    userName,
                    score: Math.floor(stateRef.current.score),
                })
            });
            setSubmitted(true);
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.code === "Space" || e.code === "ArrowUp") {
                e.preventDefault();
                if (stateRef.current.status === "playing") {
                    jump();
                } else if (stateRef.current.status === "idle" || (stateRef.current.status === "gameover" && !submitted)) {
                    startGame();
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [jump, submitted]);

    return (
        <section id="dino-runner" className="py-12 md:py-16 px-4 md:px-6 bg-[#0a0a0a] relative overflow-hidden flex flex-col items-center justify-center min-h-[600px] md:min-h-[750px]">
            <div className="text-center mb-4 md:mb-8 space-y-2 md:space-y-4 px-4 w-full">
                <span className="text-emerald-500 font-bold tracking-[0.3em] md:tracking-[0.5em] uppercase text-[9px] md:text-[10px] animate-pulse block">Retro Arcade</span>
                <h2 className="text-[10vw] md:text-6xl font-black text-white tracking-widest uppercase italic leading-none">
                    Pixel <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Jump</span>
                </h2>
                <p className="text-gray-500 font-medium text-[8px] md:text-[10px] uppercase tracking-widest">Speed Level: <span className="text-white">Intermediate</span></p>
            </div>

            <div
                onClick={gameState === "playing" ? jump : undefined}
                className="relative w-full max-w-[800px] h-64 bg-[#111] rounded-[2.5rem] border border-white/10 overflow-hidden cursor-pointer shadow-2xl"
            >
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
                            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl p-8"
                        >
                            {gameState === "gameover" ? (
                                <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="w-full max-w-sm text-center">
                                    <h3 className="text-4xl font-black text-rose-500 tracking-tighter mb-4 italic">CRASHED!</h3>
                                    <div className="flex gap-10 justify-center mb-8 bg-white/5 border border-white/10 p-4 rounded-2xl">
                                        <div className="text-center">
                                            <p className="text-[8px] uppercase tracking-widest text-white/30 mb-1">Score</p>
                                            <p className="text-3xl font-black text-white">{score}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[8px] uppercase tracking-widest text-white/30 mb-1">Best</p>
                                            <p className="text-3xl font-black text-emerald-400">{highScore}</p>
                                        </div>
                                    </div>

                                    {!submitted ? (
                                        <div className="space-y-4">
                                            <input
                                                type="text"
                                                placeholder="Player Name"
                                                value={userName}
                                                onChange={(e) => setUserName(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-black text-xs uppercase text-center outline-none focus:border-primary transition-all"
                                            />
                                            <div className="flex gap-3">
                                                <button onClick={startGame} className="flex-1 px-4 py-3 bg-white/5 text-white rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 border border-white/10">
                                                    <RefreshCcw size={14} /> Retry
                                                </button>
                                                <button
                                                    onClick={submitScore}
                                                    disabled={!userName.trim() || submitting}
                                                    className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    {submitting ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />} Post
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-4 text-emerald-400">
                                            <CheckCircle2 size={40} />
                                            <p className="font-black uppercase tracking-widest text-xs">Ranked on Leaderboard!</p>
                                            <button onClick={startGame} className="mt-4 px-10 py-3 bg-white text-black rounded-xl font-black uppercase text-xs tracking-widest hover:bg-emerald-500 hover:text-white transition-all">New Run</button>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <>
                                    <div className="w-20 h-20 rounded-[2rem] bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-8">
                                        <Gamepad2 size={40} className="text-emerald-400" />
                                    </div>
                                    <p className="text-xs text-white/60 mb-10 max-w-[250px] text-center uppercase tracking-[0.2em] leading-loose">
                                        <b>Space</b> to Jump • <b>Click</b> to Play
                                    </p>
                                    <button onClick={startGame} className="flex items-center gap-2 px-12 py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all">
                                        <Play size={18} className="fill-current" /> Start Run
                                    </button>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="absolute bottom-10 left-0 w-full h-[2px] bg-white/10"></div>

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
                            <motion.div animate={{ height: isJumping ? 4 : [4, 6, 4] }} transition={{ repeat: Infinity, duration: 0.2 }} className="w-3 bg-emerald-600 rounded-sm" />
                            <motion.div animate={{ height: isJumping ? 4 : [6, 4, 6] }} transition={{ repeat: Infinity, duration: 0.2 }} className="w-3 bg-emerald-600 rounded-sm" />
                        </div>
                    </div>
                </div>

                {obstacles.map(o => (
                    <div
                        key={o.id}
                        ref={(el) => {
                            if (el) obstacleRefs.current.set(o.id, el);
                            else obstacleRefs.current.delete(o.id);
                        }}
                        style={{
                            position: 'absolute',
                            left: 0,
                            bottom: 41,
                            width: o.width,
                            height: o.height,
                            willChange: 'transform',
                            transform: `translate3d(${o.x}px, 0, 0)`
                        }}
                        className="flex items-end gap-1"
                    >
                        <div className="w-full h-full bg-cyan-500 rounded-t-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] relative overflow-hidden">
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[2px] h-[70%] bg-black/10" />
                        </div>
                        {o.height > 60 && <div className="w-6 h-12 bg-cyan-600 rounded-t-md mb-2" />}
                    </div>
                ))}

                {gameState !== "idle" && (
                    <div className="absolute top-6 right-8 flex gap-8 p-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5">
                        <div className="text-right">
                            <p className="text-[8px] font-black uppercase text-white/30 tracking-widest">Hi-Score</p>
                            <p className="text-lg font-black text-white tabular-nums opacity-50">{highScore}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[8px] font-black uppercase text-white/30 tracking-widest">Distance</p>
                            <p ref={scoreElemRef} className="text-lg font-black text-emerald-400 tabular-nums">0</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-6 px-6">
                <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                    <Flame className="text-orange-500" size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Fast Paced</span>
                </div>
                <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                    <Trophy className="text-yellow-500" size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Skill Based</span>
                </div>
                <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                    <Zap className="text-blue-500" size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Infinite Run</span>
                </div>
            </div>
        </section>
    );
}
