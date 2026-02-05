"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MicOff, AlertCircle } from "lucide-react";

interface Props {
    sessionId: string;
    liveInterimText?: string;
    liveSpeakerName?: string;
    error?: string | null;
}

export default function LiveSubtitles({ sessionId, liveInterimText, liveSpeakerName, error }: Props) {
    const [latestMinute, setLatestMinute] = useState<{ content: string; speakerName: string; createdAt: string } | null>(null);
    const [isVisible, setIsVisible] = useState(true);

    // Poll for the latest committed transcript
    useEffect(() => {
        const fetchLatest = async () => {
            try {
                const res = await fetch(`/api/sessions/${sessionId}/minutes`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        setLatestMinute(data[0]); // First item is latest
                    }
                }
            } catch (e) {
                console.error(e);
            }
        };

        fetchLatest();
        const interval = setInterval(fetchLatest, 2000);
        return () => clearInterval(interval);
    }, [sessionId]);

    // Error Handling Overlay
    if (error) {
        return (
            <div className="absolute bottom-20 left-0 right-0 px-6 flex justify-center z-50 pointer-events-none">
                <div className="bg-red-900/90 backdrop-blur-md text-white px-4 py-3 rounded-lg border border-red-500/50 shadow-lg flex items-center gap-3 max-w-sm pointer-events-auto">
                    <AlertCircle className="text-red-400 shrink-0" size={20} />
                    <div className="text-xs font-medium">
                        <p className="uppercase font-black text-red-200 tracking-wider mb-0.5">Transcription Error</p>
                        <p className="opacity-90">{error === 'network' ? 'Network blocked (use Chrome/Edge)' : error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!isVisible) {
        // Show small "Show Subtitles" button if hidden
        return (
            <div className="absolute bottom-24 right-4 z-50">
                <button
                    onClick={() => setIsVisible(true)}
                    className="bg-black/50 backdrop-blur text-white/50 hover:text-white p-2 rounded-full border border-white/10"
                >
                    <span className="text-[10px] uppercase font-bold tracking-widest">CC</span>
                </button>
            </div>
        );
    }

    // Determine what to show
    const isInterim = !!liveInterimText?.trim();

    // Check if latest minute is "stale" (older than 5 seconds)
    const isLatestFresh = latestMinute
        ? (Date.now() - new Date(latestMinute.createdAt).getTime() < 5000)
        : false;

    // Show interim text OR fresh confirmed text
    const contentToShow = isInterim ? liveInterimText : (isLatestFresh ? latestMinute?.content : null);
    const speakerToShow = isInterim ? liveSpeakerName : latestMinute?.speakerName;

    if (!contentToShow) return null;

    return (
        <div className="absolute bottom-20 left-0 right-0 px-6 flex justify-center pointer-events-none z-50">
            <AnimatePresence mode="wait">
                <motion.div
                    key={contentToShow}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-black/70 backdrop-blur-md text-white px-6 py-4 rounded-2xl max-w-2xl text-center shadow-xl border border-white/10 relative group pointer-events-auto"
                >
                    {/* Close Button */}
                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                        <X size={12} />
                    </button>

                    <div className="flex flex-col items-center gap-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isInterim ? 'text-yellow-400 animate-pulse' : 'text-emerald-400'}`}>
                            {speakerToShow || 'Unknown'} {isInterim && '(Speaking...)'}
                        </span>
                        <p className="text-sm md:text-lg font-medium leading-relaxed">
                            {contentToShow}
                        </p>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
