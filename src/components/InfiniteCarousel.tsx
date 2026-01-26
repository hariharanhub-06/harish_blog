"use client";

import React from "react";
import { motion } from "framer-motion";

export function InfiniteCarousel({
    items,
    speed = 12, // Default to 12s per pass (5 RPM: 60s / 12s = 5 revolutions per minute)
    className = "",
}: {
    items: React.ReactNode[];
    speed?: number;
    className?: string;
}) {
    // Speed is duration in seconds for one full pass
    return (
        <div className={`overflow-hidden whitespace-nowrap relative flex ${className}`}>
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0e0e0e] via-[#0e0e0e]/80 to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0e0e0e] via-[#0e0e0e]/80 to-transparent z-10" />

            <motion.div
                className="flex gap-12 items-center px-6 shrink-0"
                animate={{
                    x: ["0%", "-50%"],
                }}
                transition={{
                    x: {
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: speed,
                        ease: "linear",
                    },
                }}
            >
                {/* Render items twice for a perfect loop */}
                {items.map((item, idx) => (
                    <div key={`idx-${idx}`} className="shrink-0">
                        {item}
                    </div>
                ))}
                {items.map((item, idx) => (
                    <div key={`dup-${idx}`} className="shrink-0">
                        {item}
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
