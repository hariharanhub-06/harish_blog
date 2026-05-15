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
            {/* Floating button */}
            <motion.button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black text-sm shadow-2xl shadow-rose-500/40 select-none"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 1.2, type: "spring", damping: 18 }}
                whileHover={{ scale: 1.07, boxShadow: "0 20px 40px rgba(244,63,94,0.45)" }}
                whileTap={{ scale: 0.95 }}
            >
                {/* Ping ring */}
                <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-30 pointer-events-none" />
                <span className="text-base">😊</span>
                <span className="hidden sm:inline">{task.title}</span>
                <span className="sm:hidden">Smile</span>
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
