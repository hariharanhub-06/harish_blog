"use client";

import { useState } from "react";
import { X, Check, MessageSquare, Plus, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CHECKLIST_ITEMS } from "@/constants/meetingData";

interface ChecklistModalProps {
    meeting: any;
    onClose: () => void;
    onSave: (data: any) => void;
}

export default function MeetingChecklistModal({ meeting, onClose, onSave }: ChecklistModalProps) {
    const [data, setData] = useState(meeting.checklistData || {});
    const [activeComment, setActiveComment] = useState<string | null>(null);

    const toggleItem = (id: string) => {
        setData((prev: any) => ({
            ...prev,
            [id]: { ...prev[id], checked: !prev[id]?.checked, na: false }
        }));
    };

    const toggleNA = (id: string) => {
        setData((prev: any) => ({
            ...prev,
            [id]: { ...prev[id], na: !prev[id]?.na, checked: false }
        }));
    };

    const updateComment = (id: string, comment: string) => {
        setData((prev: any) => ({
            ...prev,
            [id]: { ...prev[id], comment }
        }));
    };

    const applicableItems = CHECKLIST_ITEMS.filter(item => !data[item.id]?.na);
    const totalItems = applicableItems.length;
    const checkedCount = applicableItems.filter(item => data[item.id]?.checked).length;
    const percentage = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

    const categories = Array.from(new Set(CHECKLIST_ITEMS.map(i => i.category)));

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
                className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <AlertCircle size={24} />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight">{meeting.clubName} Checklist</h2>
                        </div>
                        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">{meeting.meetingType} Documentation</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-3xl font-black text-primary">{percentage}%</span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Complete</span>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-12">
                    {categories.map(cat => (
                        <div key={cat} className="space-y-6">
                            <div className="flex items-center gap-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">{cat}</h3>
                                <div className="h-px w-full bg-gray-100" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {CHECKLIST_ITEMS.filter(i => i.category === cat).map(item => (
                                    <div
                                        key={item.id}
                                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${data[item.id]?.checked ? 'bg-primary/5 border-primary/20' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={() => toggleItem(item.id)}
                                                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${data[item.id]?.checked ? 'bg-primary border-primary text-white' : 'border-gray-200 bg-gray-50'}`}
                                                >
                                                    {data[item.id]?.checked && <Check size={14} strokeWidth={4} />}
                                                </button>
                                                <button
                                                    onClick={() => toggleNA(item.id)}
                                                    className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border transition-all ${data[item.id]?.na ? 'bg-gray-900 border-gray-900 text-white' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                                                >
                                                    N/A
                                                </button>
                                            </div>
                                            <span className={`text-sm font-bold transition-opacity ${data[item.id]?.na ? 'opacity-40 line-through' : 'opacity-100'} ${data[item.id]?.checked ? 'text-gray-900' : 'text-gray-500'}`}>{item.label}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {data[item.id]?.comment ? (
                                                <button
                                                    onClick={() => setActiveComment(activeComment === item.id ? null : item.id)}
                                                    className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 shadow-sm shadow-red-100"
                                                >
                                                    <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setActiveComment(item.id)}
                                                    className="p-2 text-gray-300 hover:text-primary transition-colors"
                                                >
                                                    <Plus size={18} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Inline Comment Editor */}
                                        <AnimatePresence>
                                            {activeComment === item.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="absolute mt-16 left-0 right-0 z-10 p-4 bg-white border border-gray-100 rounded-2xl shadow-xl mx-8"
                                                >
                                                    <textarea
                                                        className="w-full h-24 p-3 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 ring-primary/20"
                                                        placeholder="Add observation..."
                                                        value={data[item.id]?.comment || ""}
                                                        onChange={(e) => updateComment(item.id, e.target.value)}
                                                        autoFocus
                                                    />
                                                    <div className="flex justify-end mt-2">
                                                        <button
                                                            onClick={() => setActiveComment(null)}
                                                            className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold"
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
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-gray-100 flex justify-end bg-gray-50/50">
                    <button
                        onClick={() => onSave(data)}
                        className="px-8 py-3 bg-primary text-white rounded-2xl font-black tracking-tight shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Save Documentation
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
