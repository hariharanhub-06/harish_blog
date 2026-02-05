"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw, X, Circle, Trophy, User } from "lucide-react";

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
        <div className="flex flex-col items-center justify-center p-4 md:p-8 h-full min-h-[500px]">
            <div className="text-center mb-12">
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-8 italic">
                    Tic <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500">Tac</span> Toe
                </h3>

                <div className="flex items-center justify-center gap-4">
                    <div className={`px-5 py-3 rounded-2xl transition-all border ${isXNext && !winner ? "bg-orange-500/10 border-orange-500 text-orange-500 scale-110" : "bg-white/5 border-white/10 text-white/40 opacity-50"}`}>
                        <div className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest">
                            <X size={16} /> Player X
                        </div>
                    </div>
                    <div className={`px-5 py-3 rounded-2xl transition-all border ${!isXNext && !winner ? "bg-blue-500/10 border-blue-500 text-blue-500 scale-110" : "bg-white/5 border-white/10 text-white/40 opacity-50"}`}>
                        <div className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest">
                            <Circle size={16} /> Player O
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 relative">
                {board.map((square, i) => (
                    <motion.button
                        key={i}
                        whileHover={{ scale: square ? 1 : 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleClick(i)}
                        className={`w-20 h-20 md:w-28 md:h-28 rounded-[2rem] bg-[#111] border-2 transition-all flex items-center justify-center text-4xl font-black ${square === "X" ? "text-orange-500 border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.1)]" : square === "O" ? "text-blue-500 border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]" : "border-white/5 hover:border-white/20"}`}
                    >
                        <AnimatePresence mode="wait">
                            {square === "X" && (
                                <motion.div
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    className="drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                                >
                                    <X size={48} strokeWidth={3} />
                                </motion.div>
                            )}
                            {square === "O" && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                >
                                    <Circle size={40} strokeWidth={4} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>
                ))}
            </div>

            <AnimatePresence>
                {winner && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="mt-10 p-8 rounded-[2.5rem] bg-black/80 backdrop-blur-xl border border-white/10 text-center w-full max-w-sm absolute z-50 shadow-2xl"
                    >
                        {winner === "Draw" ? (
                            <div className="space-y-6">
                                <p className="text-3xl font-black text-white uppercase tracking-tighter italic">Stalemate!</p>
                                <button onClick={resetGame} className="w-full py-4 bg-white text-black rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-orange-500 hover:text-white transition-all">
                                    <RefreshCcw size={16} className="inline mr-2" /> Rematch
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex justify-center">
                                    <div className={`p-5 rounded-full ${winner === "X" ? "bg-orange-500/20 text-orange-500" : "bg-blue-500/20 text-blue-500"}`}>
                                        <Trophy size={48} />
                                    </div>
                                </div>
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">
                                    Player {winner} Victory!
                                </h3>

                                <button
                                    onClick={resetGame}
                                    className="w-full py-4 bg-white text-black rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-orange-500 hover:text-white transition-all"
                                >
                                    New Game
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {!winner && board.some(s => s !== null) && (
                <button
                    onClick={resetGame}
                    className="mt-12 flex items-center gap-2 text-white/20 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
                >
                    <RefreshCcw size={14} /> Reset Match
                </button>
            )}
        </div>
    );
}
