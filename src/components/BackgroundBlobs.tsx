"use client";

import React from "react";
import { motion } from "framer-motion";

export function BackgroundBlobs() {
    return (
        <div className="fixed inset-0 -z-40 overflow-hidden pointer-events-none bg-[#f1f5f9]">
            {/* Primary Blob - Vibrant Blue */}
            <motion.div
                animate={{
                    x: [0, 150, -100, 0],
                    y: [0, -150, 100, 0],
                    scale: [1, 1.2, 0.9, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute top-[-5%] left-[-5%] w-[55%] h-[55%] bg-blue-600/30 rounded-full blur-[100px]"
            />

            {/* Accent Blob - Vibrant Amber/Orange */}
            <motion.div
                animate={{
                    x: [0, -200, 100, 0],
                    y: [0, 200, -100, 0],
                    scale: [1, 1.1, 0.8, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/35 rounded-full blur-[90px]"
            />

            {/* Secondary Blob - Cyan/Teal */}
            <motion.div
                animate={{
                    x: [0, 100, -150, 0],
                    y: [0, 150, -100, 0],
                    scale: [1, 0.9, 1.1, 1],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute top-[15%] right-[5%] w-[45%] h-[45%] bg-cyan-400/25 rounded-full blur-[80px]"
            />

            {/* Center Glow - Soft Purple */}
            <motion.div
                animate={{
                    opacity: [0.3, 0.5, 0.3],
                    scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute top-[35%] left-[15%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[110px]"
            />

            {/* Prominent High-Tech Mesh */}
            <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_2px,transparent_2px)] [background-size:40px_40px] opacity-[0.35]" />
        </div>
    );
}
