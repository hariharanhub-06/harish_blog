"use client";

import { useState, useEffect, useRef } from "react";
import { FileText, Download, Mic, MicOff, Pin, Users } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Minute {
    id: string;
    content: string;
    speakerName?: string | null;
    type: "transcript" | "pinned" | "manual";
    createdAt: string;
}

interface Props {
    sessionId: string;
    isAdmin: boolean;
}

export default function LiveMinutesSidebar({ sessionId, isAdmin }: Props) {
    const [minutes, setMinutes] = useState<Minute[]>([]);

    useEffect(() => {
        fetchMinutes();
        const interval = setInterval(fetchMinutes, 2000); // Poll every 2 seconds

        return () => {
            clearInterval(interval);
        };
    }, [sessionId]);

    const fetchMinutes = async () => {
        try {
            const res = await fetch(`/api/sessions/${sessionId}/minutes`);
            if (res.ok) {
                const data = await res.json();
                setMinutes(data);
            }
        } catch (error) {
            console.error("Error fetching minutes:", error);
        }
    };

    const exportPDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.text("Meeting Minutes", 14, 22);

        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Session ID: ${sessionId}`, 14, 30);
        doc.text(`Date: ${format(new Date(), "PPpp")}`, 14, 36);

        // Content
        const tableData = minutes.map(m => [
            format(new Date(m.createdAt), "hh:mm a"),
            m.speakerName || "Unknown",
            m.content
        ]);

        autoTable(doc, {
            head: [['Time', 'Speaker', 'Content']],
            body: tableData,
            startY: 45,
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
            columnStyles: {
                0: { cellWidth: 25 }, // Time
                1: { cellWidth: 30 }, // Speaker
                2: { cellWidth: 'auto' } // Content
            }
        });

        doc.save(`Meeting_Minutes_${format(new Date(), "yyyy-MM-dd")}.pdf`);
    };

    // Generate color for speaker based on name
    const getSpeakerColor = (name: string | null | undefined) => {
        if (!name) return "text-gray-400";
        const colors = [
            "text-blue-400",
            "text-green-400",
            "text-yellow-400",
            "text-purple-400",
            "text-pink-400",
            "text-orange-400",
            "text-cyan-400"
        ];
        const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    const getSpeakerBg = (name: string | null | undefined) => {
        if (!name) return "bg-gray-900/40";
        const colors = [
            "bg-blue-900/40",
            "bg-green-900/40",
            "bg-yellow-900/40",
            "bg-purple-900/40",
            "bg-pink-900/40",
            "bg-orange-900/40",
            "bg-cyan-900/40"
        ];
        const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    return (
        <div className="w-[300px] md:w-[350px] bg-[#09090b] border-l border-white/10 flex flex-col h-full shadow-2xl z-20">
            {/* Header */}
            <div className="p-3 border-b border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="p-1.5 rounded-xl bg-emerald-500/10 shrink-0">
                        <Users size={16} className="text-emerald-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="text-xs font-black text-white uppercase tracking-wider truncate">Live Minutes</h2>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest truncate">Auto-Capturing</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={exportPDF}
                    disabled={minutes.length === 0}
                    className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0 ml-2"
                    title="Export PDF"
                >
                    <Download size={14} />
                </button>
            </div>

            {/* Minutes List (Chat Style) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-gradient-to-b from-[#09090b] to-black">
                {minutes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-40">
                        <Mic size={32} className="mb-3 text-white/20" />
                        <p className="text-xs font-bold text-white uppercase tracking-widest">No transcripts yet</p>
                        <p className="text-[10px] text-gray-500 mt-1">Participants' speech will appear here automatically</p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {minutes.map((m) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                key={m.id}
                                className="group flex flex-col items-start"
                            >
                                <div className="flex items-center gap-2 mb-1 px-1">
                                    <span className={`text-[9px] font-black uppercase tracking-wider ${getSpeakerColor(m.speakerName)}`}>
                                        {m.speakerName || 'Unknown'}
                                    </span>
                                    <span className="text-[9px] text-gray-600 font-medium">
                                        {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </span>
                                </div>

                                <div className={`relative p-3 rounded-2xl w-full text-sm font-medium leading-relaxed shadow-sm transition-all
                                        ${m.type === 'pinned'
                                        ? 'bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border border-orange-500/30 text-orange-100 shadow-[0_0_15px_rgba(249,115,22,0.1)]'
                                        : `${getSpeakerBg(m.speakerName)} border border-white/5 text-gray-300 rounded-tl-sm`
                                    }`}>

                                    {m.type === 'pinned' && (
                                        <span className="absolute -top-2 -right-2 bg-orange-600 text-white p-1 rounded-full shadow-lg">
                                            <Pin size={10} fill="currentColor" />
                                        </span>
                                    )}

                                    {m.content}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
}
