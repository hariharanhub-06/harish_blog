
"use client";

import React, { useState } from "react";

export function InfiniteCarousel({
    items,
    speed = 12,
    className = "",
}: {
    items: React.ReactNode[];
    speed?: number;
    className?: string;
}) {
    const [isPaused, setIsPaused] = useState(false);

    return (
        <div
            className={`overflow-hidden whitespace-nowrap relative flex ${className}`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
        >
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0e0e0e] via-[#0e0e0e]/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0e0e0e] via-[#0e0e0e]/80 to-transparent z-10 pointer-events-none" />

            <div
                className="flex gap-12 items-center px-6 shrink-0"
                style={{
                    animationName: 'marquee',
                    animationDuration: `${speed}s`,
                    animationIterationCount: 'infinite',
                    animationTimingFunction: 'linear',
                    animationPlayState: isPaused ? 'paused' : 'running',
                    width: 'max-content'
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
            </div>
        </div>
    );
}

