"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
    sessionId: string;
    liveInterimText?: string;
    liveSpeakerName?: string;
}

export default function LiveSubtitles({ sessionId, liveInterimText, liveSpeakerName }: Props) {
    const [latestMinute, setLatestMinute] = useState<{ content: string; speakerName: string } | null>(null);

    // Poll for the latest committed transcript
    useEffect(() => {
        const fetchLatest = async () => {
            try {
                const res = await fetch(`/api/sessions/${sessionId}/minutes`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        setLatestMinute(data[0]); // First item is latest due to desc ordering
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

    // Determine what to show: Live typing takes precedence, otherwise show latest committed text
    const contentToShow = liveInterimText?.trim() ? liveInterimText : latestMinute?.content;
    const speakerToShow = liveInterimText?.trim() ? liveSpeakerName : latestMinute?.speakerName;
    const isInterim = !!liveInterimText?.trim();

    if (!contentToShow) return null;

    return (
        <div className="absolute bottom-20 left-0 right-0 px-6 flex justify-center pointer-events-none z-50">
            <AnimatePresence mode="wait">
                <motion.div
                    key={contentToShow} // Animation triggers on text change
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-black/60 backdrop-blur-md text-white px-6 py-4 rounded-2xl max-w-2xl text-center shadow-xl border border-white/10"
                >
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
