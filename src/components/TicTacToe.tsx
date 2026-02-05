"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw, X, Circle, Trophy, User, Cpu, Send, CheckCircle2, Loader2, Play } from "lucide-react";

type Player = "X" | "O" | null;

export default function TicTacToe() {
    const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [winner, setWinner] = useState<Player | "Draw">(null);
    const [winningLine, setWinningLine] = useState<number[] | null>(null);
    const [gameMode, setGameMode] = useState<"PvP" | "PvE">("PvE");
    const [userName, setUserName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

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

    const minimax = (squares: Player[], depth: number, isMaximizing: boolean): number => {
        const winInfo = calculateWinner(squares);
        if (winInfo?.winner === "O") return 10 - depth;
        if (winInfo?.winner === "X") return depth - 10;
        if (winInfo?.winner === "Draw") return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (!squares[i]) {
                    squares[i] = "O";
                    const score = minimax(squares, depth + 1, false);
                    squares[i] = null;
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (!squares[i]) {
                    squares[i] = "X";
                    const score = minimax(squares, depth + 1, true);
                    squares[i] = null;
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    };

    const makeAIMove = useCallback((currentBoard: Player[]) => {
        // Intermediate AI: Sometimes makes a random move instead of optimal (80% optimal)
        const isOptimal = Math.random() > 0.2;

        if (!isOptimal) {
            const emptyIndices = currentBoard.map((s, i) => s === null ? i : null).filter(i => i !== null) as number[];
            if (emptyIndices.length > 0) {
                const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
                handleClick(randomIndex, currentBoard);
                return;
            }
        }

        let bestScore = -Infinity;
        let move = -1;
        for (let i = 0; i < 9; i++) {
            if (!currentBoard[i]) {
                currentBoard[i] = "O";
                const score = minimax(currentBoard, 0, false);
                currentBoard[i] = null;
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        if (move !== -1) handleClick(move, currentBoard);
    }, []);

    useEffect(() => {
        if (gameMode === "PvE" && !isXNext && !winner) {
            const timer = setTimeout(() => makeAIMove([...board]), 600);
            return () => clearTimeout(timer);
        }
    }, [isXNext, gameMode, winner, board, makeAIMove]);

    const handleClick = (i: number, currentBoard: Player[] = board) => {
        if (winner || currentBoard[i]) return;

        const newBoard = [...currentBoard];
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
        setSubmitted(false);
    };

    const submitScore = async () => {
        if (!userName.trim() || submitting || submitted || winner !== "X" || gameMode !== "PvE") return;
        setSubmitting(true);
        try {
            await fetch("/api/games/leaderboard", {
                method: "POST",
                body: JSON.stringify({
                    gameId: "tictactoe",
                    userName,
                    score: 100, // Fixed score for winning against AI
                    moves: board.filter(s => s !== null).length
                })
            });
            setSubmitted(true);
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 md:p-8 h-full min-h-[500px]">
            <div className="text-center mb-8">
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 italic">
                    Tic <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500">Tac</span> Toe
                </h3>

                <div className="flex flex-col gap-6">
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 self-center">
                        <button
                            onClick={() => { setGameMode("PvP"); resetGame(); }}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${gameMode === "PvP" ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"}`}
                        >
                            PvP
                        </button>
                        <button
                            onClick={() => { setGameMode("PvE"); resetGame(); }}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${gameMode === "PvE" ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"}`}
                        >
                            vs AI
                        </button>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                        <div className={`px-5 py-3 rounded-2xl transition-all border ${isXNext && !winner ? "bg-orange-500/10 border-orange-500 text-orange-500 scale-110" : "bg-white/5 border-white/10 text-white/40 opacity-50"}`}>
                            <div className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest">
                                <X size={16} /> Player X
                            </div>
                        </div>
                        <div className={`px-5 py-3 rounded-2xl transition-all border ${!isXNext && !winner ? "bg-blue-500/10 border-blue-500 text-blue-500 scale-110" : "bg-white/5 border-white/10 text-white/40 opacity-50"}`}>
                            <div className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest">
                                {gameMode === "PvE" ? <Cpu size={16} /> : <Circle size={16} />}
                                {gameMode === "PvE" ? "AI (O)" : "Player O"}
                            </div>
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
                        disabled={gameMode === "PvE" && !isXNext && !winner}
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
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">
                                    {winner === "O" && gameMode === "PvE" ? "AI Dominance!" : `Player ${winner} wins!`}
                                </h3>

                                {winner === "X" && gameMode === "PvE" && !submitted && (
                                    <div className="space-y-4 pt-4 border-t border-white/5">
                                        <div className="bg-white/5 p-3 rounded-2xl flex items-center gap-3 border border-white/10 group focus-within:border-orange-500 transition-all">
                                            <User size={18} className="text-white/20 group-focus-within:text-orange-500" />
                                            <input
                                                type="text"
                                                placeholder="Enter Name"
                                                value={userName}
                                                onChange={(e) => setUserName(e.target.value)}
                                                className="bg-transparent border-none outline-none text-white font-black text-[10px] uppercase tracking-widest w-full"
                                            />
                                        </div>
                                        <button
                                            onClick={submitScore}
                                            disabled={!userName.trim() || submitting}
                                            className="w-full py-4 bg-orange-500 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-orange-400 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                        >
                                            {submitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} className="group-hover:translate-x-1 transition-transform" />} Submit Score
                                        </button>
                                    </div>
                                )}

                                {submitted && (
                                    <div className="flex flex-col items-center gap-2 text-emerald-400 pt-4">
                                        <CheckCircle2 size={32} />
                                        <p className="font-black uppercase tracking-widest text-[10px]">Score Recorded!</p>
                                    </div>
                                )}

                                <button
                                    onClick={resetGame}
                                    className={`w-full py-4 rounded-[2rem] font-black uppercase text-[10px] tracking-widest transition-all ${winner === "X" && gameMode === "PvE" ? "bg-white/5 text-white/40 hover:text-white" : "bg-white text-black hover:bg-orange-500 hover:text-white"}`}
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
                    <RefreshCcw size={14} /> Clear Board
                </button>
            )}
        </div>
    );
}
