"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

    if (!task || task.status !== "live") return null;

    return (
        <>
            {/* Floating button — sits above AI chat (bottom-[88px]) */}
            <motion.button
                onClick={() => setIsOpen(true)}
                className="fixed top-24 left-4 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black text-sm shadow-2xl shadow-rose-500/40 select-none max-w-[220px]"
                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 1.2, type: "spring", damping: 18 }}
                whileHover={{ scale: 1.06, boxShadow: "0 16px 32px rgba(244,63,94,0.45)" }}
                whileTap={{ scale: 0.95 }}
            >
                {/* Ping ring */}
                <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-25 pointer-events-none" />
                <span className="text-sm flex-shrink-0">😊</span>
                <span className="truncate text-xs leading-tight">{task.title}</span>
            </motion.button>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <SmileModal task={task} onClose={() => setIsOpen(false)} />
                )}
            </AnimatePresence>
        </>
    );
}
