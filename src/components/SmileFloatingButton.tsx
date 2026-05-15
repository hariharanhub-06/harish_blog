"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import dynamic from "next/dynamic";

const SmileModal = dynamic(() => import("./SmileModal"), { ssr: false });

interface SmileTask {
    id: string;
    title: string;
    status: string;
    link: string;
    lines: string[];
    rareLines?: string[];
    rareChance?: number;
    posterBgGradient?: string;
    shareText?: string;
}

interface Props {
    task: SmileTask;
}

export default function SmileFloatingButton({ task }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    if (!task || task.status !== "live" || dismissed) return null;

    return (
        <>
            {/* Floating pill */}
            <motion.div
                className="fixed top-32 left-3 z-[100] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black shadow-xl shadow-rose-500/40 select-none max-w-[160px] group"
                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -20 }}
                transition={{ delay: 1.2, type: "spring", damping: 18 }}
                whileHover={{ scale: 1.06, boxShadow: "0 16px 32px rgba(244,63,94,0.45)" }}
                whileTap={{ scale: 0.95 }}
            >
                {/* Ping ring */}
                <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-25 pointer-events-none" />

                {/* Clickable label area */}
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-1.5 min-w-0"
                >
                    <span className="text-xs flex-shrink-0">😊</span>
                    <span className="truncate text-[10px] leading-tight">{task.title}</span>
                </button>

                {/* Dismiss X — visible on hover/focus */}
                <button
                    onClick={() => setDismissed(true)}
                    className="flex-shrink-0 ml-0.5 w-4 h-4 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors sm:opacity-0 sm:group-hover:opacity-100"
                    aria-label="Dismiss"
                >
                    <X size={9} strokeWidth={3} />
                </button>
            </motion.div>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <SmileModal task={task} onClose={() => setIsOpen(false)} />
                )}
            </AnimatePresence>
        </>
    );
}
