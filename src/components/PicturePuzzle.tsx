"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { RefreshCcw, Trophy, LayoutGrid, ImageIcon, Loader2 } from "lucide-react";

interface PuzzlePiece {
    id: number;
    originalIndex: number;
    currentIndex: number;
}

export default function PicturePuzzle() {
    const [puzzleImageUrl, setPuzzleImageUrl] = useState<string>("");
    const [allPuzzleUrls, setAllPuzzleUrls] = useState<string[]>([]);
    const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
    const [isComplete, setIsComplete] = useState(false);
    const [moves, setMoves] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selecting, setSelecting] = useState(false);
    const gridCount = 3; // 3x3 grid
    const totalPieces = gridCount * gridCount;

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const res = await fetch("/api/admin/game-assets?gameId=puzzle");
                if (res.ok) {
                    const data = await res.json();
                    if (data.length > 0) {
                        const urls = data.map((a: any) => a.assetUrl);
                        setAllPuzzleUrls(urls);
                        setPuzzleImageUrl(urls[0]);
                        if (urls.length > 1) {
                            setSelecting(true);
                        }
                    } else {
                        const fallback = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop";
                        setPuzzleImageUrl(fallback);
                        setAllPuzzleUrls([fallback]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch puzzle asset", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAssets();
    }, []);

    const initPuzzle = useCallback(() => {
        const initialPieces = Array.from({ length: totalPieces }, (_, i) => ({
            id: i,
            originalIndex: i,
            currentIndex: i
        }));

        // Shuffle
        let shuffled;
        do {
            shuffled = [...initialPieces].sort(() => Math.random() - 0.5);
        } while (shuffled.every((p, i) => p.originalIndex === i));

        setPieces(shuffled);
        setIsComplete(false);
        setMoves(0);
    }, [totalPieces]);

    useEffect(() => {
        if (!loading && !selecting) {
            initPuzzle();
        }
    }, [loading, selecting, initPuzzle]);

    const handleReorder = (newOrder: PuzzlePiece[]) => {
        if (isComplete) return;
        setPieces(newOrder);
        setMoves(m => m + 1);

        const solved = newOrder.every((p, i) => p.originalIndex === i);
        if (solved) {
            setIsComplete(true);
        }
    };

    const selectPuzzle = (url: string) => {
        setPuzzleImageUrl(url);
        setSelecting(false);
        initPuzzle();
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

    if (selecting) {
        return (
            <div className="flex flex-col items-center justify-center p-8 h-full">
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-8 text-center">
                    Select Your <span className="text-primary">Puzzle</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl w-full">
                    {allPuzzleUrls.map((url, idx) => (
                        <motion.div
                            key={url}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => selectPuzzle(url)}
                            className="relative aspect-square rounded-[2rem] overflow-hidden border-4 border-white/10 hover:border-primary transition-all cursor-pointer group shadow-2xl"
                        >
                            <img src={url} alt={`Puzzle ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <span className="text-white font-black uppercase text-xs tracking-widest bg-black/60 px-4 py-2 rounded-full border border-white/20">Puzzle {idx + 1}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-4 md:p-8 h-full">
            <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-4 mb-2">
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">
                        Picture <span className="text-primary">Puzzle</span>
                    </h3>
                    {allPuzzleUrls.length > 1 && (
                        <button
                            onClick={() => setSelecting(true)}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all shadow-lg border border-white/5"
                            title="Change Puzzle"
                        >
                            <ImageIcon size={18} />
                        </button>
                    )}
                </div>
                <div className="flex gap-6 justify-center">
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Moves</p>
                        <p className="text-2xl font-black text-white">{moves}</p>
                    </div>
                </div>
            </div>

            <div className="relative p-2 bg-white/5 border border-white/10 rounded-[2.5rem] shadow-2xl backdrop-blur-xl max-w-sm md:max-w-md w-full">
                <Reorder.Group
                    axis="y"
                    values={pieces}
                    onReorder={handleReorder}
                    className="grid grid-cols-3 gap-1 overflow-hidden rounded-2xl aspect-square"
                >
                    {pieces.map((piece) => (
                        <Reorder.Item
                            key={piece.id}
                            value={piece}
                            className="relative cursor-grab active:cursor-grabbing w-full h-full"
                        >
                            <div
                                className="w-full h-full border border-black/20"
                                style={{
                                    backgroundImage: `url(${puzzleImageUrl})`,
                                    backgroundSize: `${gridCount * 100}% ${gridCount * 100}%`,
                                    backgroundPosition: `${(piece.originalIndex % gridCount) * (100 / (gridCount - 1))}% ${Math.floor(piece.originalIndex / gridCount) * (100 / (gridCount - 1))}%`,
                                }}
                            />
                        </Reorder.Item>
                    ))}
                </Reorder.Group>

                <AnimatePresence>
                    {isComplete && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md rounded-[2.5rem] flex flex-col items-center justify-center text-center p-6 z-10"
                        >
                            <Trophy size={64} className="text-primary mb-4 animate-bounce" />
                            <h4 className="text-3xl font-black text-white uppercase italic mb-2">Solved!</h4>
                            <p className="text-white/60 font-bold mb-8">Completed in {moves} moves</p>
                            <div className="flex gap-4">
                                <button
                                    onClick={initPuzzle}
                                    className="px-6 py-3 bg-white text-black rounded-xl font-black uppercase text-xs tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl shadow-white/5"
                                >
                                    <RefreshCcw size={16} className="inline mr-2" /> Again
                                </button>
                                {allPuzzleUrls.length > 1 && (
                                    <button
                                        onClick={() => setSelecting(true)}
                                        className="px-6 py-3 bg-primary text-white rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20"
                                    >
                                        Change
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                <LayoutGrid size={12} /> Drag and drop pieces to solve
            </p>

            {!isComplete && moves > 0 && (
                <button
                    onClick={initPuzzle}
                    className="mt-6 flex items-center gap-2 text-white/40 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em]"
                >
                    <RefreshCcw size={12} /> Reset Puzzle
                </button>
            )}
        </div>
    );
}
