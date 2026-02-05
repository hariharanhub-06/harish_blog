"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw, Trophy, Brain, Flame, Star, Zap, Heart, Music } from "lucide-react";
import Image from "next/image";

interface Card {
    id: number;
    icon?: React.ElementType;
    imageUrl?: string;
    isFlipped: boolean;
    isMatched: boolean;
    color: string;
}

const ICONS = [Brain, Flame, Star, Zap, Heart, Music, Trophy, RefreshCcw];
const COLORS = [
    "text-blue-500", "text-orange-500", "text-purple-500",
    "text-emerald-500", "text-pink-500", "text-amber-500",
    "text-cyan-500", "text-indigo-500"
];

export default function MemoryCard() {
    const [assets, setAssets] = useState<string[]>([]);
    const [cards, setCards] = useState<Card[]>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [matches, setMatches] = useState(0);
    const [isLocked, setIsLocked] = useState(false);

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

        if (assets.length >= 8) {
            // Use custom images
            cardBase = assets.slice(0, 8).map((url, index) => ({
                imageUrl: url,
                color: COLORS[index % COLORS.length]
            }));
        } else {
            // Use icons fallback
            cardBase = ICONS.map((Icon, index) => ({
                icon: Icon,
                color: COLORS[index]
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
    }, [assets]);

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
                // Match found
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
                // No match
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

    const isGameComplete = matches === ICONS.length;

    return (
        <div className="flex flex-col items-center justify-center p-4 md:p-8 h-full">
            <div className="text-center mb-6">
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
                    Memory <span className="text-emerald-500">Card</span>
                </h3>
                <div className="flex gap-6 justify-center">
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Moves</p>
                        <p className="text-2xl font-black text-white">{moves}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Matches</p>
                        <p className="text-2xl font-black text-emerald-500">{matches}/{ICONS.length}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-3 max-w-sm md:max-w-md">
                {cards.map((card) => (
                    <div
                        key={card.id}
                        className="relative w-16 h-16 md:w-24 md:h-24 perspective-1000 cursor-pointer"
                        onClick={() => handleCardClick(card.id)}
                    >
                        <motion.div
                            animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                            transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                            style={{ transformStyle: "preserve-3d" }}
                            className="w-full h-full relative"
                        >
                            {/* Card Front (Back of game card) */}
                            <div className="absolute inset-0 backface-hidden bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                                <Brain size={24} className="text-white/10" />
                            </div>

                            {/* Card Back (Icon or Image of game card) */}
                            <div
                                className={`absolute inset-0 backface-hidden rotateY-180 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center overflow-hidden ${card.isMatched ? "bg-emerald-500/10 border-emerald-500/30" : ""}`}
                            >
                                {card.imageUrl ? (
                                    <Image src={card.imageUrl} alt="Card" fill className="object-cover" />
                                ) : (
                                    card.icon && <card.icon size={32} className={card.color} strokeWidth={3} />
                                )}
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {isGameComplete && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-8 text-center"
                    >
                        <div className="flex flex-col items-center gap-2 mb-6">
                            <Trophy size={48} className="text-emerald-500 animate-bounce" />
                            <p className="text-2xl font-black text-white uppercase tracking-tighter italic">Well Done!</p>
                            <p className="text-sm font-bold text-white/60">You completed it in {moves} moves.</p>
                        </div>
                        <button
                            onClick={initializeGame}
                            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black rounded-xl font-black uppercase text-xs tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-xl shadow-white/5"
                        >
                            <RefreshCcw size={16} /> Play Again
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isGameComplete && moves > 0 && (
                <button
                    onClick={initializeGame}
                    className="mt-8 flex items-center gap-2 text-white/40 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em]"
                >
                    <RefreshCcw size={12} /> Restart Game
                </button>
            )}

            <style jsx global>{`
                .perspective-1000 {
                    perspective: 1000px;
                }
                .backface-hidden {
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                }
                .rotateY-180 {
                    transform: rotateY(180deg);
                }
            `}</style>
        </div>
    );
}
