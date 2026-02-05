"use client";

import { motion } from "framer-motion";
import { Gamepad2, Play, Brain, Trophy } from "lucide-react";
import Image from "next/image";
import { InfiniteCarousel } from "./InfiniteCarousel";

interface Game {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    image?: string;
}

const GAMES: Game[] = [
    {
        id: "dino",
        title: "Dino Runner",
        description: "Retro pixel adventure",
        icon: Gamepad2,
        color: "from-emerald-400 to-cyan-500",
    },
    {
        id: "tictactoe",
        title: "Tic Tac Toe",
        description: "Classic strategy duel",
        icon: Trophy,
        color: "from-orange-400 to-rose-500",
    },
    {
        id: "memory",
        title: "Memory Card",
        description: "Train your brain",
        icon: Brain,
        color: "from-blue-400 to-indigo-500",
    }
];

interface GamesCarouselProps {
    onPlayGame: (gameId: string) => void;
}

export default function GamesCarousel({ onPlayGame }: GamesCarouselProps) {
    return (
        <section id="games" className="py-12 md:py-16 bg-[#0a0a0a] relative overflow-hidden">
            <div className="container mx-auto px-6 mb-8 text-center md:text-left">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Retro Arcade</span>
                <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mt-1">
                    Play <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 italic">Mini Games</span>
                </h2>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">Take a break and challenge yourself</p>
            </div>

            <div className="w-full relative">
                {/* Horizontal Carousel */}
                <div className="flex overflow-x-auto gap-6 px-6 py-4 scrollbar-hide snap-x snap-mandatory justify-center">
                    {GAMES.map((game) => (
                        <motion.div
                            key={game.id}
                            whileHover={{ y: -10 }}
                            className="shrink-0 w-[280px] md:w-[350px] snap-center"
                        >
                            <div className="group relative bg-[#1a1a1a] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl hover:border-white/20 transition-all duration-500 flex flex-col h-full">
                                <div className={`h-40 bg-gradient-to-br ${game.color} opacity-20 group-hover:opacity-40 transition-opacity flex items-center justify-center`}>
                                    <game.icon size={64} className="text-white drop-shadow-2xl" />
                                </div>

                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-1">{game.title}</h3>
                                    <p className="text-gray-400 text-xs font-bold mb-6">{game.description}</p>

                                    <div className="mt-auto">
                                        <button
                                            onClick={() => onPlayGame(game.id)}
                                            className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2 group/btn"
                                        >
                                            <Play size={16} className="group-hover/btn:scale-110 transition-transform fill-current" />
                                            Play Now
                                        </button>
                                    </div>
                                </div>

                                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                    <span className="text-[9px] font-black text-white uppercase tracking-widest">Free Play</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    );
}
