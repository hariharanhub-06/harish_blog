
"use client";

import { useState, useEffect } from "react";
import { X, Trophy, Calendar, Clock, Search, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Submission {
    id: string;
    userName: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    attempts: number;
    timeTaken: number;
    completedAt: string;
}

interface QuizResultsModalProps {
    quizId: string;
    quizTitle: string;
    onClose: () => void;
}

export default function QuizResultsModal({ quizId, quizTitle, onClose }: QuizResultsModalProps) {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchResults();
    }, [quizId]);

    const fetchResults = async () => {
        try {
            const res = await fetch(`/api/admin/quiz-results?quizId=${quizId}`);
            if (res.ok) {
                const data = await res.json();
                setSubmissions(data);
            }
        } catch (error) {
            console.error("Failed to fetch results", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const filteredSubmissions = submissions.filter(s =>
        s.userName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-[70]"
                >
                    <X size={24} className="text-gray-400" />
                </button>
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">Quiz Analytics</h2>
                        <p className="text-sm font-bold text-gray-400">{quizTitle}</p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="p-6 border-b border-gray-100 flex gap-4 items-center">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search participants..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2">
                            <Trophy size={16} />
                            {submissions.length} Players
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                        </div>
                    ) : filteredSubmissions.length > 0 ? (
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                                    <th className="pb-4 pl-4">Rank</th>
                                    <th className="pb-4">Participant</th>
                                    <th className="pb-4">Score</th>
                                    <th className="pb-4">Correctness</th>
                                    <th className="pb-4 text-right pr-4">Date & Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredSubmissions.map((sub, index) => (
                                    <tr key={sub.id} className="group hover:bg-gray-50 transition-colors">
                                        <td className="py-4 pl-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                index === 1 ? 'bg-gray-200 text-gray-700' :
                                                    index === 2 ? 'bg-orange-100 text-orange-700' :
                                                        'bg-white border border-gray-100 text-gray-500'
                                                }`}>
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <p className="font-bold text-gray-900">{sub.userName}</p>
                                            <p className="text-xs text-gray-400 font-medium">Attempt #{sub.attempts}</p>
                                        </td>
                                        <td className="py-4">
                                            <span className="font-black text-lg text-primary">{sub.score}</span>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-700">{sub.correctAnswers} / {sub.totalQuestions}</span>
                                                <span className="text-xs text-gray-400 font-medium">
                                                    {Math.round((sub.correctAnswers / sub.totalQuestions) * 100)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-right pr-4">
                                            <div className="flex flex-col items-end">
                                                <span className="font-bold text-gray-700">{formatDate(sub.completedAt)}</span>
                                                <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {new Date(sub.completedAt).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-20 text-gray-400">
                            <p className="font-bold">No submissions yet.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
