"use client";

import { useState } from "react";
import { X, Star, Plus, MessageSquare, Info, Calculator, Trophy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SCORING_CRITERIA, getEfficiencyStatus } from "@/constants/meetingData";

interface ScoringModalProps {
    meeting: any;
    onClose: () => void;
    onSave: (data: any) => void;
}

export default function MeetingScoringModal({ meeting, onClose, onSave }: ScoringModalProps) {
    const [data, setData] = useState(meeting.scoringData || {});
    const [activeComment, setActiveComment] = useState<string | null>(null);

    const toggleUnit = (id: string, unitIndex: number, unitValue: number) => {
        setData((prev: any) => {
            const currentUnits = prev[id]?.checkedUnits || [];
            const newUnits = currentUnits.includes(unitIndex)
                ? currentUnits.filter((u: number) => u !== unitIndex)
                : [...currentUnits, unitIndex];

            return {
                ...prev,
                [id]: {
                    ...prev[id],
                    checkedUnits: newUnits,
                    points: newUnits.length * unitValue
                }
            };
        });
    };

    const updatePoints = (id: string, val: string, max: number) => {
        let points = parseInt(val) || 0;
        if (points > max) points = max;
        if (points < 0) points = 0;

        setData((prev: any) => ({
            ...prev,
            [id]: { ...prev[id], points }
        }));
    };

    const updateComment = (id: string, comment: string) => {
        setData((prev: any) => ({
            ...prev,
            [id]: { ...prev[id], comment }
        }));
    };

    const totalPoints = Object.values(data).reduce((acc: number, curr: any) => acc + (curr.points || 0), 0);
    const status = getEfficiencyStatus(totalPoints);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-yellow-50 to-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-600">
                            <Star size={24} fill="currentColor" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">{meeting.clubName} Efficiency</h2>
                            <p className="text-xs font-black text-gray-400 tracking-widest uppercase">Tenure: July 2025 - June 2026</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <span className={`text-xs font-black px-3 py-1 rounded-full ${status === 'HYPERACTIVE' ? 'bg-purple-100 text-purple-700' :
                                    status === 'SUPERACTIVE' ? 'bg-blue-100 text-blue-700' :
                                        status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                                            'bg-gray-100 text-gray-500'
                                    }`}>
                                    {status}
                                </span>
                            </div>
                            <div className="flex flex-col items-center border-l border-gray-100 pl-4">
                                <span className="text-3xl font-black text-gray-900">{totalPoints}</span>
                                <span className="text-[10px] font-black text-gray-400 uppercase leading-none">Total Points</span>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-2">
                        {SCORING_CRITERIA.map((item, index) => (
                            <div key={item.id} className="group relative flex items-center justify-between py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 rounded-xl px-4 transition-all">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black text-gray-300 w-4">{index + 1}</span>
                                    <span className="text-sm font-bold text-gray-700">{item.label}</span>
                                </div>

                                <div className="flex items-center gap-4">
                                    {/* Score Input or Checkboxes */}
                                    {item.type === "checkbox" ? (
                                        <div className="flex flex-wrap gap-1 max-w-[200px] justify-end">
                                            {Array.from({ length: item.units || 0 }).map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => toggleUnit(item.id, i, item.unitValue || 0)}
                                                    className={`w-5 h-5 rounded border transition-all flex items-center justify-center
                                                        ${data[item.id]?.checkedUnits?.includes(i)
                                                            ? 'bg-yellow-500 border-yellow-500 text-white'
                                                            : 'bg-white border-gray-200 hover:border-yellow-200'}`}
                                                >
                                                    {data[item.id]?.checkedUnits?.includes(i) && <Check size={10} strokeWidth={4} />}
                                                </button>
                                            ))}
                                            <span className="text-[10px] font-black text-gray-400 uppercase ml-2">/ {item.maxPoints}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                className="w-16 h-10 bg-gray-50 border-none rounded-xl text-center text-sm font-black focus:ring-2 ring-yellow-500/20"
                                                value={data[item.id]?.points || 0}
                                                onChange={(e) => updatePoints(item.id, e.target.value, item.maxPoints)}
                                                min={0}
                                                max={item.maxPoints}
                                            />
                                            <span className="text-[10px] font-black text-gray-400 uppercase w-10">/ {item.maxPoints}</span>
                                        </div>
                                    )}

                                    {/* Comment Toggle */}
                                    <button
                                        onClick={() => setActiveComment(activeComment === item.id ? null : item.id)}
                                        className={`p-2 rounded-lg transition-all ${data[item.id]?.comment ? 'bg-yellow-100 text-yellow-600' : 'text-gray-300 hover:text-yellow-600'}`}
                                    >
                                        <MessageSquare size={16} fill={data[item.id]?.comment ? "currentColor" : "none"} />
                                    </button>
                                </div>

                                {/* Inline Comment */}
                                <AnimatePresence>
                                    {activeComment === item.id && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="absolute right-0 top-full mt-2 w-64 z-20 p-4 bg-white border border-gray-100 rounded-2xl shadow-2xl"
                                        >
                                            <textarea
                                                className="w-full h-24 p-3 bg-gray-50 border-none rounded-xl text-xs font-medium focus:ring-2 ring-yellow-500/20"
                                                placeholder="Add scoring note..."
                                                value={data[item.id]?.comment || ""}
                                                onChange={(e) => updateComment(item.id, e.target.value)}
                                                autoFocus
                                            />
                                            <div className="flex justify-end mt-2">
                                                <button
                                                    onClick={() => setActiveComment(null)}
                                                    className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-xs font-bold"
                                                >
                                                    Done
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>

                    {/* Efficiency Thresholds Info */}
                    <div className="mt-12 p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-start gap-4">
                        <Info className="text-blue-600 shrink-0" size={20} />
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-blue-700 mb-2">Efficiency Thresholds</h4>
                            <div className="flex flex-wrap gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-purple-600" />
                                    <span className="text-[10px] font-black text-gray-500 uppercase">96+ Hyperactive</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                                    <span className="text-[10px] font-black text-gray-500 uppercase">76-95 Superactive</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-600" />
                                    <span className="text-[10px] font-black text-gray-500 uppercase">51-75 Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-2 text-gray-400">
                        <Trophy size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Total Obtainable: 164 Points</span>
                    </div>
                    <button
                        onClick={() => onSave(data)}
                        className="px-10 py-4 bg-gray-900 text-white rounded-[1.25rem] font-black tracking-tight shadow-xl hover:bg-black transition-all"
                    >
                        Save Efficiency Score
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
