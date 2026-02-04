"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Plus, FileText, Download, Mic, MicOff, Pin, Send, Play, Pause, Settings2 } from "lucide-react";
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
    // const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Removed
    // const scrollRef = useRef<HTMLDivElement>(null); // Removed

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
                        // Filter out empty or single-character noise
                        if (finalTranscript && finalTranscript.length > 1) {
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

    // Auto-scroll to bottom on new minutes - DISABLED to allow manual scrolling
    const messagesEndRef = useRef<HTMLDivElement>(null);
    // useEffect(() => {
    //     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // }, [minutes]);

    return (
        <div className="w-[300px] md:w-[350px] bg-[#09090b] border-l border-white/10 flex flex-col h-full shadow-2xl z-20">
            {/* Header with Pulse Indicator */}
            <div className="p-4 border-b border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl transition-all duration-500 ${isListening ? "bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.4)]" : "bg-white/5"}`}>
                        {isListening ? (
                            <div className="flex gap-0.5 items-end h-4 w-4 justify-center">
                                <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-red-500 rounded-full" />
                                <motion.div animate={{ height: [4, 16, 4] }} transition={{ repeat: Infinity, duration: 0.4, delay: 0.1 }} className="w-1 bg-red-500 rounded-full" />
                                <motion.div animate={{ height: [4, 10, 4] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1 bg-red-500 rounded-full" />
                            </div>
                        ) : (
                            <MicOff size={16} className="text-gray-500" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-wider">Live Minutes</h2>
                        <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${isListening ? "bg-emerald-500 animate-pulse" : "bg-gray-600"}`} />
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{isListening ? "Recording Audio" : "Paused"}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-1">
                    <button
                        onClick={exportPDF}
                        disabled={minutes.length === 0}
                        className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Export PDF"
                    >
                        <Download size={16} />
                    </button>
                    <button
                        onClick={toggleListening}
                        className={`p-2 rounded-lg transition-all ${isListening ? "text-red-500 bg-red-500/10 hover:bg-red-500/20" : "text-white/60 hover:text-white hover:bg-white/10"}`}
                        title={isListening ? "Stop Recording" : "Start Recording"}
                    >
                        {isListening ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                </div>
            </div>

            {/* Minutes List (Chat Style) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-to-b from-[#09090b] to-black">
                {minutes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-40">
                        <FileText size={32} className="mb-3 text-white/20" />
                        <p className="text-xs font-bold text-white uppercase tracking-widest">No minutes yet</p>
                        <p className="text-[10px] text-gray-500 mt-1">Start speaking or monitoring to generate transcript</p>
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
                                className={`group flex flex-col ${m.type === 'manual' ? 'items-end' : 'items-start'}`}
                            >
                                <div className="flex items-center gap-2 mb-1 px-1">
                                    <span className={`text-[9px] font-black uppercase tracking-wider ${m.speakerName === 'Host' ? 'text-blue-400' : 'text-orange-400'}`}>
                                        {m.speakerName || 'Unknown'}
                                    </span>
                                    <span className="text-[9px] text-gray-600 font-medium">
                                        {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </span>
                                </div>

                                <div className={`relative p-3 rounded-2xl max-w-[90%] text-sm font-medium leading-relaxed shadow-sm transition-all
                                        ${m.type === 'pinned'
                                        ? 'bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border border-orange-500/30 text-orange-100 shadow-[0_0_15px_rgba(249,115,22,0.1)]'
                                        : m.type === 'manual'
                                            ? 'bg-white/10 border border-white/5 text-white rounded-tr-sm'
                                            : 'bg-[#18181b] border border-white/5 text-gray-300 rounded-tl-sm'
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
                <div ref={messagesEndRef} />
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
