"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, Minimize2, Gamepad2 } from "lucide-react";
import dynamic from "next/dynamic";

const DinoRunnerGame = dynamic(() => import("./DinoRunnerGame"), { ssr: false });
const TicTacToe = dynamic(() => import("./TicTacToe"), { ssr: false });
const MemoryCard = dynamic(() => import("./MemoryCard"), { ssr: false });
const PicturePuzzle = dynamic(() => import("./PicturePuzzle"), { ssr: false });
const WordScramble = dynamic(() => import("./WordScramble"), { ssr: false });

interface GameOverlayProps {
    gameId: string | null;
    onClose: () => void;
}

export default function GameOverlay({ gameId, onClose }: GameOverlayProps) {
    const [isFullScreen, setIsFullScreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const toggleFullScreen = () => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleFullScreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };

        document.addEventListener("fullscreenchange", handleFullScreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullScreenChange);
    }, []);

    if (!gameId) return null;

    const renderGame = () => {
        switch (gameId) {
            case "dino":
                return <DinoRunnerGame />;
            case "tictactoe":
                return <TicTacToe />;
            case "memory":
                return <MemoryCard />;
            case "puzzle":
                return <PicturePuzzle />;
            case "scramble":
                return <WordScramble />;
            default:
                return (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <Gamepad2 size={64} className="text-white/20 mb-4" />
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Game Not Found</h3>
                    </div>
                );
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
            >
                <motion.div
                    ref={containerRef}
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className={`relative w-full max-w-4xl bg-[#0e0e0e] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl flex flex-col ${isFullScreen ? 'max-w-none h-full rounded-none border-none' : 'max-h-[90vh]'}`}
                >
                    {/* Header/Controls */}
                    <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/40 backdrop-blur-md z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/20 rounded-xl">
                                <Gamepad2 size={20} className="text-emerald-500" />
                            </div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">
                                {gameId === 'dino' ? 'Dino Runner' :
                                    gameId === 'tictactoe' ? 'Tic Tac Toe' :
                                        gameId === 'memory' ? 'Memory Card' :
                                            gameId === 'puzzle' ? 'Picture Puzzle' :
                                                'Word Scramble'}
                            </h3>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleFullScreen}
                                className="p-3 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl transition-all flex items-center gap-2 group"
                                title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                            >
                                {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                                <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">
                                    {isFullScreen ? "Minimize" : "Full Screen"}
                                </span>
                            </button>

                            <button
                                onClick={onClose}
                                className="p-3 bg-white text-black hover:bg-rose-500 hover:text-white rounded-xl transition-all flex items-center gap-2 group"
                                title="Close Game"
                            >
                                <X size={18} />
                                <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Exit Game</span>
                            </button>
                        </div>
                    </div>

                    {/* Game Content */}
                    <div className="flex-1 overflow-y-auto bg-grid-pattern">
                        {renderGame()}
                    </div>

                    {/* Footer Info */}
                    {!isFullScreen && (
                        <div className="p-4 border-t border-white/5 text-center bg-black/20">
                            <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]">
                                High-End Digital Experience • {new Date().getFullYear()}
                            </p>
                        </div>
                    )}
                </motion.div>
            </motion.div>

            <style jsx>{`
                .bg-grid-pattern {
                    background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0);
                    background-size: 32px 32px;
                }
            `}</style>
        </AnimatePresence>
    );
}
