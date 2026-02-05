"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw, Trophy, Loader2, Image as ImageIcon, ChevronLeft, Send, CheckCircle2 } from "lucide-react";

interface PuzzlePiece {
    id: number;
    originalIndex: number; // The correct position
    currentIndex: number; // Current position in the grid
}

export default function PicturePuzzle() {
    const [puzzleImageUrl, setPuzzleImageUrl] = useState<string>("");
    const [allPuzzleUrls, setAllPuzzleUrls] = useState<string[]>([]);
    const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
    const [isComplete, setIsComplete] = useState(false);
    const [moves, setMoves] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selecting, setSelecting] = useState(false);
    const [userName, setUserName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);

    const gridCount = 4; // Intermediate Level: 4x4 Grid
    const totalSlots = gridCount * gridCount;

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
        let initialIndices = Array.from({ length: totalSlots - 1 }, (_, i) => i);

        // Shuffle logic that guarantees solvability: Start from solved and perform random valid moves
        const getAdjacentIndices = (idx: number) => {
            const adj = [];
            const r = Math.floor(idx / gridCount);
            const c = idx % gridCount;
            if (r > 0) adj.push(idx - gridCount);
            if (r < gridCount - 1) adj.push(idx + gridCount);
            if (c > 0) adj.push(idx - 1);
            if (c < gridCount - 1) adj.push(idx + 1);
            return adj;
        };

        const shuffle = (indices: number[]) => {
            let current = [...indices, -1]; // -1 represents the hole
            let holePos = totalSlots - 1;

            for (let i = 0; i < 200; i++) {
                const adj = getAdjacentIndices(holePos);
                const randomAdj = adj[Math.floor(Math.random() * adj.length)];
                // Swap
                [current[holePos], current[randomAdj]] = [current[randomAdj], current[holePos]];
                holePos = randomAdj;
            }
            return current;
        };

        const shuffledIndices = shuffle(initialIndices);

        const initialPieces = shuffledIndices.map((originalIdx, currentIdx) => ({
            id: originalIdx === -1 ? 999 : originalIdx, // 999 is hole
            originalIndex: originalIdx,
            currentIndex: currentIdx
        }));

        setPieces(initialPieces);
        setIsComplete(false);
        setMoves(0);
        setSubmitted(false);
        setUserName("");
        setStartTime(Date.now());
    }, [totalSlots, gridCount]);

    useEffect(() => {
        if (!loading && !selecting) {
            initPuzzle();
        }
    }, [loading, selecting, initPuzzle]);

    const handlePieceClick = (piece: PuzzlePiece) => {
        if (isComplete || piece.originalIndex === -1) return;

        const holePiece = pieces.find(p => p.originalIndex === -1)!;
        const pR = Math.floor(piece.currentIndex / gridCount);
        const pC = piece.currentIndex % gridCount;
        const hR = Math.floor(holePiece.currentIndex / gridCount);
        const hC = holePiece.currentIndex % gridCount;

        // Check if adjacent
        const isAdjacent = Math.abs(pR - hR) + Math.abs(pC - hC) === 1;

        if (isAdjacent) {
            const newPieces = pieces.map(p => {
                if (p.id === piece.id) return { ...p, currentIndex: holePiece.currentIndex };
                if (p.id === holePiece.id) return { ...p, currentIndex: piece.currentIndex };
                return p;
            });

            setPieces(newPieces);
            setMoves(m => m + 1);

            // Check if solved
            const sortedPieces = [...newPieces].sort((a, b) => a.currentIndex - b.currentIndex);
            const solved = sortedPieces.every((p, i) => {
                if (i === totalSlots - 1) return p.originalIndex === -1;
                return p.originalIndex === i;
            });

            if (solved) {
                setIsComplete(true);
            }
        }
    };

    const submitScore = async () => {
        if (!userName.trim() || submitting || submitted) return;
        setSubmitting(true);
        try {
            const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
            const calculatedScore = Math.max(100, 10000 - (moves * 10) - timeTaken);

            await fetch("/api/games/leaderboard", {
                method: "POST",
                body: JSON.stringify({
                    gameId: "puzzle",
                    userName,
                    score: calculatedScore,
                    moves,
                    timeTaken
                })
            });
            setSubmitted(true);
        } catch (error) {
            console.error("Failed to submit score", error);
        } finally {
            setSubmitting(false);
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
            <div className="flex flex-col items-center justify-center p-8 h-full bg-black/40 backdrop-blur-md rounded-[2.5rem]">
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-8 text-center flex items-center gap-3">
                    <ImageIcon className="text-primary" />
                    Select Your <span className="text-primary italic">Puzzle</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl w-full">
                    {allPuzzleUrls.map((url, idx) => (
                        <motion.div
                            key={url}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => selectPuzzle(url)}
                            className="relative aspect-square rounded-[2rem] overflow-hidden border-4 border-white/5 hover:border-primary transition-all cursor-pointer group shadow-2xl"
                        >
                            <img src={url} alt={`Puzzle ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80" />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <span className="text-white font-black uppercase text-xs tracking-widest bg-black/60 px-4 py-2 rounded-full border border-white/20">Challenge {idx + 1}</span>
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
                    <button
                        onClick={() => setSelecting(true)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all border border-white/5"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">
                        Sliding <span className="text-primary">Puzzle</span>
                    </h3>
                </div>
                <div className="flex gap-8 justify-center items-center">
                    <div className="text-center">
                        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">Grid</p>
                        <p className="text-lg font-black text-white/60">4x4 <span className="text-[10px] text-primary">Pro</span></p>
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="text-center">
                        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">Moves</p>
                        <p className="text-xl font-black text-white">{moves}</p>
                    </div>
                </div>
            </div>

            <div className="relative p-3 bg-white/5 border border-white/10 rounded-[2.5rem] shadow-2xl backdrop-blur-xl max-w-sm md:max-w-md w-full aspect-square">
                <div className="grid grid-cols-4 gap-2 w-full h-full">
                    {pieces
                        .sort((a, b) => a.currentIndex - b.currentIndex)
                        .map((piece) => (
                            <motion.div
                                layout
                                key={piece.id}
                                onClick={() => handlePieceClick(piece)}
                                className={`relative w-full h-full rounded-xl overflow-hidden cursor-pointer ${piece.originalIndex === -1 ? 'bg-black/60 opacity-20' : 'bg-white/10 border border-white/5'}`}
                            >
                                {piece.originalIndex !== -1 && (
                                    <div
                                        className="w-full h-full"
                                        style={{
                                            backgroundImage: `url(${puzzleImageUrl})`,
                                            backgroundSize: `${gridCount * 100}% ${gridCount * 100}%`,
                                            backgroundPosition: `${(piece.originalIndex % gridCount) * (100 / (gridCount - 1))}% ${Math.floor(piece.originalIndex / gridCount) * (100 / (gridCount - 1))}%`,
                                        }}
                                    />
                                )}
                                {piece.originalIndex !== -1 && (
                                    <div className="absolute bottom-1 right-2 text-[8px] font-black text-white/20 uppercase">{piece.originalIndex + 1}</div>
                                )}
                            </motion.div>
                        ))}
                </div>

                <AnimatePresence>
                    {isComplete && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 bg-[#0a0a0a]/95 backdrop-blur-xl rounded-[2.5rem] flex flex-col items-center justify-center text-center p-8 z-20 border border-primary/20 shadow-2xl"
                        >
                            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                                <Trophy size={40} className="text-primary animate-pulse" />
                            </div>
                            <h4 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">Grand Master!</h4>
                            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-6">Cleared 4x4 sliding puzzle in {moves} moves</p>

                            {!submitted ? (
                                <div className="w-full space-y-4 max-w-[240px]">
                                    <input
                                        type="text"
                                        placeholder="Enter your name"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-black text-sm uppercase tracking-widest outline-none focus:border-primary transition-all"
                                    />
                                    <button
                                        onClick={submitScore}
                                        disabled={!userName.trim() || submitting}
                                        className="w-full py-4 bg-primary text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                                        Post Score
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4 text-emerald-400">
                                    <CheckCircle2 size={32} />
                                    <span className="text-xs font-black uppercase tracking-widest">Score Shared!</span>
                                    <button
                                        onClick={initPuzzle}
                                        className="mt-4 px-8 py-3 bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all"
                                    >
                                        <RefreshCcw size={14} className="inline mr-2" /> Play Again
                                    </button>
                                </div>
                            )}

                            {!submitted && (
                                <button
                                    onClick={initPuzzle}
                                    className="mt-6 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-all underline underline-offset-8"
                                >
                                    Try Again
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
