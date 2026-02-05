"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw, Trophy, Brain, Flame, Star, Zap, Heart, Music, Rocket, Globe, Cpu, Cloud, Database, Send, CheckCircle2, Loader2 } from "lucide-react";
import Image from "next/image";

interface Card {
    id: number;
    icon?: React.ElementType;
    imageUrl?: string;
    isFlipped: boolean;
    isMatched: boolean;
    color: string;
}

const ICONS = [Brain, Flame, Star, Zap, Heart, Music, Rocket, Globe, Cpu, Cloud, Database, Trophy];
const COLORS = [
    "text-blue-500", "text-orange-500", "text-purple-500",
    "text-emerald-500", "text-pink-500", "text-amber-500",
    "text-cyan-500", "text-indigo-500", "text-rose-500",
    "text-teal-500", "text-violet-500", "text-yellow-500"
];

export default function MemoryCard() {
    const [assets, setAssets] = useState<string[]>([]);
    const [cards, setCards] = useState<Card[]>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [matches, setMatches] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [userName, setUserName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [startTime, setStartTime] = useState<number>(Date.now());

    const totalPairs = 12; // Intermediate level: 24 cards

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const res = await fetch("/api/admin/game-assets?gameId=memory");
                if (res.ok) {
                    const data = await res.json();
                    setAssets(data.map((a: any) => a.assetUrl));
                }
            } catch (error) {
                console.error("Failed to fetch memory assets", error);
            }
        };
        fetchAssets();
    }, []);

    const initializeGame = useCallback(() => {
        let cardBase: any[] = [];

        if (assets.length >= totalPairs) {
            // Use custom images
            cardBase = assets.slice(0, totalPairs).map((url, index) => ({
                imageUrl: url,
                color: COLORS[index % COLORS.length]
            }));
        } else {
            // Use icons fallback
            cardBase = ICONS.slice(0, totalPairs).map((Icon, index) => ({
                icon: Icon,
                color: COLORS[index % COLORS.length]
            }));
        }

        const doubled = [...cardBase, ...cardBase];
        const shuffled = doubled
            .sort(() => Math.random() - 0.5)
            .map((item, index) => ({
                id: index,
                ...item,
                isFlipped: false,
                isMatched: false,
            }));
        setCards(shuffled);
        setFlippedCards([]);
        setMoves(0);
        setMatches(0);
        setIsLocked(false);
        setSubmitted(false);
        setUserName("");
        setStartTime(Date.now());
    }, [assets, totalPairs]);

    useEffect(() => {
        initializeGame();
    }, [initializeGame]);

    const handleCardClick = (id: number) => {
        if (isLocked || cards[id].isFlipped || cards[id].isMatched || flippedCards.includes(id)) return;

        const newCards = [...cards];
        newCards[id].isFlipped = true;
        setCards(newCards);

        const newFlipped = [...flippedCards, id];
        setFlippedCards(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(m => m + 1);
            setIsLocked(true);

            const [firstId, secondId] = newFlipped;
            const isMatch = cards[firstId].imageUrl
                ? cards[firstId].imageUrl === cards[secondId].imageUrl
                : cards[firstId].icon === cards[secondId].icon;

            if (isMatch) {
                setTimeout(() => {
                    setCards(prev => {
                        const updated = [...prev];
                        updated[firstId].isMatched = true;
                        updated[secondId].isMatched = true;
                        return updated;
                    });
                    setMatches(m => m + 1);
                    setFlippedCards([]);
                    setIsLocked(false);
                }, 300);
            } else {
                setTimeout(() => {
                    setCards(prev => {
                        const updated = [...prev];
                        updated[firstId].isFlipped = false;
                        updated[secondId].isFlipped = false;
                        return updated;
                    });
                    setFlippedCards([]);
                    setIsLocked(false);
                }, 1000);
            }
        }
    };

    const submitScore = async () => {
        if (!userName.trim() || submitting || submitted) return;
        setSubmitting(true);
        try {
            const timeTaken = Math.floor((Date.now() - startTime) / 1000);
            // Score formula: Base (5000) - moves penalty - time penalty
            const score = Math.max(100, 5000 - (moves * 20) - timeTaken);

            await fetch("/api/games/leaderboard", {
                method: "POST",
                body: JSON.stringify({
                    gameId: "memory",
                    userName,
                    score,
                    moves,
                    timeTaken
                })
            });
            setSubmitted(true);
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const isGameComplete = matches === totalPairs;

    return (
        <div className="flex flex-col items-center justify-center p-4 md:p-8 h-full">
            <div className="text-center mb-6">
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
                    Memory <span className="text-primary italic">Expert</span>
                </h3>
                <div className="flex gap-8 justify-center items-center">
                    <div className="text-center">
                        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">Moves</p>
                        <p className="text-xl font-black text-white">{moves}</p>
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="text-center">
                        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">Matches</p>
                        <p className="text-xl font-black text-primary">{matches}<span className="text-white/20">/{totalPairs}</span></p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 md:gap-3 max-w-2xl mx-auto p-3 bg-white/5 border border-white/10 rounded-[2.5rem] shadow-2xl backdrop-blur-xl">
                {cards.map((card) => (
                    <div
                        key={card.id}
                        className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 perspective-1000 cursor-pointer"
                        onClick={() => handleCardClick(card.id)}
                    >
                        <motion.div
                            animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                            transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                            style={{ transformStyle: "preserve-3d" }}
                            className="w-full h-full relative"
                        >
                            <div className="absolute inset-0 backface-hidden bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden">
                                <Brain size={24} className="text-white/5" />
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                            </div>

                            <div
                                className={`absolute inset-0 backface-hidden rotateY-180 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center overflow-hidden ${card.isMatched ? "ring-2 ring-emerald-500/50" : ""}`}
                            >
                                {card.imageUrl ? (
                                    <Image src={card.imageUrl} alt="Card" fill className="object-cover" />
                                ) : (
                                    card.icon && <card.icon size={32} className={card.color} strokeWidth={3} />
                                )}
                                {card.isMatched && <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                                    <CheckCircle2 size={24} className="text-emerald-500 opacity-40" />
                                </div>}
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {isGameComplete && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
                    >
                        <div className="bg-[#1a1a1a] border border-white/10 p-10 rounded-[3rem] max-w-sm w-full text-center shadow-2xl relative">
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center border border-primary/20 backdrop-blur-xl">
                                <Trophy size={48} className="text-primary animate-bounce" />
                            </div>

                            <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2 mt-4">Brainiac!</h4>
                            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-8">Cleared {totalPairs} pairs in {moves} moves</p>

                            {!submitted ? (
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Enter Player Name"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-black text-sm uppercase tracking-widest outline-none focus:border-primary transition-all text-center"
                                    />
                                    <button
                                        onClick={submitScore}
                                        disabled={!userName.trim() || submitting}
                                        className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                                        Submit Score
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4 text-emerald-400">
                                    <CheckCircle2 size={48} />
                                    <span className="text-xs font-black uppercase tracking-widest">Global Ranking Updated!</span>
                                    <button
                                        onClick={initializeGame}
                                        className="mt-6 w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-primary hover:text-white transition-all"
                                    >
                                        <RefreshCcw size={16} className="inline mr-2" /> Play Again
                                    </button>
                                </div>
                            )}

                            {!submitted && (
                                <button
                                    onClick={initializeGame}
                                    className="mt-6 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-all"
                                >
                                    Dismiss
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .perspective-1000 { perspective: 1000px; }
                .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
                .rotateY-180 { transform: rotateY(180deg); }
            `}</style>
        </div>
    );
}
