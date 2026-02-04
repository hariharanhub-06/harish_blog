"use client";

import { useState, useEffect, useRef } from "react";
import { ScrollText, Clock, Trash2, Save, Mic, MicOff, ChevronRight, ChevronLeft, Download } from "lucide-react";
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
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Stable refs for speech recognition
    const recognitionRef = useRef<any>(null);
    const isListeningRef = useRef(false);

    useEffect(() => {
        fetchMinutes();
        const interval = setInterval(fetchMinutes, 1000); // Poll every 1 second for "real-time" feel

        // Initialize Speech Recognition once
        if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = "en-US";

            recognition.onstart = () => {
                console.log("Speech Recognition: Started");
            };
            recognition.onaudiostart = () => console.log("Speech Recognition: Audio Started");
            recognition.onsoundstart = () => console.log("Speech Recognition: Sound Started");
            recognition.onspeechstart = () => console.log("Speech Recognition: Speech Started");

            recognition.onresult = (event: any) => {
                console.log("Speech Recognition: Result", event.results);
                let interimTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        const finalTranscript = event.results[i][0].transcript.trim();
                        console.log("Speech Recognition: Final Transcript", finalTranscript);
                        if (finalTranscript && finalTranscript.length > 5) {
                            saveMinute(finalTranscript, "transcript", "Host");
                        }
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                setTranscript(interimTranscript);
            };

            recognition.onerror = (event: any) => {
                if (event.error === 'network') {
                    // Common non-fatal error, suppress spam
                    return;
                }
                console.error("Speech recognition error:", event.error);
                if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    setIsListening(false);
                    isListeningRef.current = false;
                }
            };

            recognition.onend = () => {
                // Auto-restart if we are still supposed to be listening
                if (isListeningRef.current) {
                    try {
                        recognition.start();
                    } catch (e) {
                        console.error("Failed to restart recognition:", e);
                    }
                } else {
                    setIsListening(false);
                }
            };

            recognitionRef.current = recognition;
        }

        return () => {
            clearInterval(interval);
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const fetchMinutes = async () => {
        try {
            const res = await fetch(`/api/sessions/${sessionId}/minutes`);
            if (res.ok) {
                const data = await res.json();
                setMinutes(data);
            } else {
                console.error("Fetch minutes failed:", res.status, res.statusText, await res.text());
            }
        } catch (error) {
            console.error("Error fetching minutes:", error);
        }
    };

    const saveMinute = async (content: string, type: "transcript" | "pinned" | "manual" = "transcript", speakerName?: string) => {
        try {
            const res = await fetch(`/api/sessions/${sessionId}/minutes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, type, speakerName }),
            });
            if (res.ok) {
                const newMinute = await res.json();
                setMinutes((prev) => [newMinute, ...prev]);
            } else {
                console.error("Save minute failed:", res.status, res.statusText, await res.text());
            }
        } catch (error) {
            console.error("Error saving minute:", error);
        }
    };

    const toggleListening = () => {
        if (isListening) {
            if (recognitionRef.current) recognitionRef.current.stop();
            setIsListening(false);
            isListeningRef.current = false;
        } else {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.start();
                    setIsListening(true);
                    isListeningRef.current = true;
                } catch (e) {
                    console.error("Failed to start recognition:", e);
                }
            }
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
            m.type.toUpperCase(),
            m.speakerName ? `${m.speakerName}: ${m.content}` : m.content
        ]);

        autoTable(doc, {
            head: [['Time', 'Type', 'Content']],
            body: tableData,
            startY: 45,
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
            columnStyles: {
                0: { cellWidth: 25 }, // Time
                1: { cellWidth: 25 }, // Type
                2: { cellWidth: 'auto' } // Content
            }
        });

        doc.save(`Meeting_Minutes_${format(new Date(), "yyyy-MM-dd")}.pdf`);
    };

    return (
        <div className={`h-full flex flex-col transition-all duration-300 ${isSidebarOpen ? "w-80" : "w-12"} bg-[#0a0a0a] border-l border-white/5`}>
            {/* Header / Toggle */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between overflow-hidden">
                {isSidebarOpen ? (
                    <>
                        <div className="flex items-center gap-2">
                            <ScrollText size={16} className="text-orange-500" />
                            <span className="text-xs font-black uppercase tracking-widest text-white">Live Minutes</span>
                        </div>
                        <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-white/5 rounded-lg text-gray-500">
                            <ChevronRight size={16} />
                        </button>
                    </>
                ) : (
                    <button onClick={() => setIsSidebarOpen(true)} className="w-full flex justify-center py-2 text-gray-500 hover:text-white">
                        <ChevronLeft size={16} />
                    </button>
                )}
            </div>

            {isSidebarOpen && (
                <>
                    {/* Controls (Admin Only) */}
                    {isAdmin && (
                        <div className="p-4 border-b border-white/5 bg-white/[0.02] space-y-3">
                            <button
                                onClick={toggleListening}
                                className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${isListening
                                    ? "bg-red-500/10 text-red-500 border border-red-500/20"
                                    : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
                                    }`}
                            >
                                {isListening ? <Mic size={14} className="animate-pulse" /> : <MicOff size={14} />}
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                    {isListening ? "Listening..." : "Auto-Minutes Off"}
                                </span>
                            </button>

                            <button
                                onClick={exportPDF}
                                className="w-full py-2 rounded-xl flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                            >
                                <Download size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Export All PDF</span>
                            </button>

                            {transcript && (
                                <div className="text-[10px] text-gray-500 italic px-2 py-1 bg-black/40 rounded border border-white/5">
                                    "{transcript}..."
                                </div>
                            )}
                        </div>
                    )}

                    {/* Timeline */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        <AnimatePresence mode="popLayout">
                            {minutes.map((minute) => (
                                <motion.div
                                    key={minute.id}
                                    layout
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`group relative p-3 rounded-xl border ${minute.type === 'pinned'
                                        ? "bg-orange-500/5 border-orange-500/20"
                                        : "bg-white/[0.02] border-white/5"
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <Clock size={10} className="text-gray-600" />
                                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">
                                                {format(new Date(minute.createdAt), "hh:mm a")}
                                            </span>
                                        </div>
                                        {isAdmin && (
                                            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-600 hover:text-red-500">
                                                <Trash2 size={10} />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-gray-300 leading-relaxed font-medium">
                                        {minute.speakerName && (
                                            <span className="text-orange-500 font-bold mr-1">{minute.speakerName}:</span>
                                        )}
                                        {minute.content}
                                    </p>

                                    {minute.type === 'transcript' && isAdmin && (
                                        <button
                                            onClick={() => saveMinute(minute.content, 'pinned')}
                                            className="mt-2 text-[9px] font-black uppercase tracking-widest text-orange-500/60 hover:text-orange-500 transition-colors flex items-center gap-1"
                                        >
                                            <Save size={10} /> Pin to Minutes
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {minutes.length === 0 && !transcript && (
                            <div className="h-full flex flex-col items-center justify-center opacity-50 py-20 text-center">
                                <ScrollText size={32} />
                                <p className="text-[10px] font-black uppercase mt-4 tracking-widest text-gray-400">No minutes yet</p>
                                <p className="text-[9px] text-gray-600 mt-2 max-w-[150px]">Minutes will appear here as you speak or type.</p>
                            </div>
                        )}
                    </div>
                </>
            )}

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
