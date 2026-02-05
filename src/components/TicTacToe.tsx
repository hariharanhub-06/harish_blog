"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw, X, Circle, Trophy } from "lucide-react";

type Player = "X" | "O" | null;

export default function TicTacToe() {
    const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [winner, setWinner] = useState<Player | "Draw">(null);
    const [winningLine, setWinningLine] = useState<number[] | null>(null);

    const calculateWinner = (squares: Player[]) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
            [0, 4, 8], [2, 4, 6]             // diagonals
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return { winner: squares[a], line: lines[i] };
            }
        }
        if (squares.every(s => s !== null)) return { winner: "Draw" as const, line: null };
        return null;
    };

    const handleClick = (i: number) => {
        if (winner || board[i]) return;

        const newBoard = [...board];
        newBoard[i] = isXNext ? "X" : "O";
        setBoard(newBoard);
        setIsXNext(!isXNext);

        const winInfo = calculateWinner(newBoard);
        if (winInfo) {
            setWinner(winInfo.winner);
            setWinningLine(winInfo.line);
        }
    };

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setIsXNext(true);
        setWinner(null);
        setWinningLine(null);
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 md:p-8 h-full">
            <div className="text-center mb-8">
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
                    Tic <span className="text-orange-500">Tac</span> Toe
                </h3>
                <div className="flex items-center justify-center gap-4">
                    <div className={`px-4 py-2 rounded-xl transition-all ${isXNext && !winner ? "bg-orange-500 text-white scale-110 shadow-lg shadow-orange-500/20" : "bg-white/5 text-white/40"}`}>
                        <div className="flex items-center gap-2 font-black uppercase text-xs tracking-widest">
                            <X size={16} /> Player X
                        </div>
                    </div>
                    <div className={`px-4 py-2 rounded-xl transition-all ${!isXNext && !winner ? "bg-blue-500 text-white scale-110 shadow-lg shadow-blue-500/20" : "bg-white/5 text-white/40"}`}>
                        <div className="flex items-center gap-2 font-black uppercase text-xs tracking-widest">
                            <Circle size={16} /> Player O
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 relative">
                {board.map((square, i) => (
                    <motion.button
                        key={i}
                        whileHover={{ scale: square ? 1 : 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleClick(i)}
                        className={`w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl font-black transition-colors ${square === "X" ? "text-orange-500" : "text-blue-500"} ${winningLine?.includes(i) ? "bg-white/10 border-white/30" : "hover:bg-white/10"}`}
                    >
                        <AnimatePresence mode="wait">
                            {square === "X" && (
                                <motion.div
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0 }}
                                >
                                    <X size={48} strokeWidth={3} />
                                </motion.div>
                            )}
                            {square === "O" && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                >
                                    <Circle size={48} strokeWidth={3} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>
                ))}
            </div>

            <AnimatePresence>
                {winner && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 text-center"
                    >
                        <div className="flex flex-col items-center gap-2 mb-6">
                            {winner === "Draw" ? (
                                <p className="text-2xl font-black text-white uppercase tracking-tighter italic">It's a Draw!</p>
                            ) : (
                                <>
                                    <Trophy size={48} className={winner === "X" ? "text-orange-500" : "text-blue-500"} />
                                    <p className="text-2xl font-black text-white uppercase tracking-tighter italic">
                                        Player <span className={winner === "X" ? "text-orange-500" : "text-blue-500"}>{winner}</span> Wins!
                                    </p>
                                </>
                            )}
                        </div>
                        <button
                            onClick={resetGame}
                            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black rounded-xl font-black uppercase text-xs tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-xl shadow-white/5"
                        >
                            <RefreshCcw size={16} /> Play Again
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {!winner && board.some(s => s !== null) && (
                <button
                    onClick={resetGame}
                    className="mt-8 flex items-center gap-2 text-white/40 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em]"
                >
                    <RefreshCcw size={12} /> Reset Match
                </button>
            )}
        </div>
    );
}
