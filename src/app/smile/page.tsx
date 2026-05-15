"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const SmileModal = dynamic(() => import("@/components/SmileModal"), { ssr: false });

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

export default function SmilePage() {
    const [task, setTask] = useState<SmileTask | null>(null);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        fetch("/api/smile/task")
            .then(r => r.json())
            .then(data => {
                setTask(data);
                if (data?.status === "live") setModalOpen(true);
            })
            .catch(() => setTask(null))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-pink-600/8 rounded-full blur-3xl" />
            </div>

            <motion.div
                className="relative z-10 max-w-sm w-full"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                {task?.status === "live" ? (
                    <>
                        <div className="text-6xl mb-6">😊</div>
                        <h1 className="text-3xl font-black text-white mb-3">
                            Someone sent you a smile
                        </h1>
                        <p className="text-white/50 text-sm mb-8">
                            Tap below to reveal your smile and share it with others
                        </p>
                        <motion.button
                            onClick={() => setModalOpen(true)}
                            className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-rose-500/30"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            Reveal my smile →
                        </motion.button>
                    </>
                ) : (
                    <>
                        <div className="text-5xl mb-6">💫</div>
                        <h1 className="text-2xl font-black text-white mb-3">
                            This smile has expired
                        </h1>
                        <p className="text-white/40 text-sm">
                            Check back later — more smiles are on the way.
                        </p>
                    </>
                )}
            </motion.div>

            <AnimatePresence>
                {modalOpen && task && (
                    <SmileModal
                        task={task}
                        onClose={() => setModalOpen(false)}
                        autoStart={true}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
