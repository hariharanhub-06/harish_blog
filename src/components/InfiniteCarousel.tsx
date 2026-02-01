"use client";

import React, { useState, useRef, useEffect } from "react";

export function InfiniteCarousel({
    items,
    speed = 20,
    className = "",
}: {
    items: React.ReactNode[];
    speed?: number;
    className?: string;
}) {
    const [isPaused, setIsPaused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        if (!containerRef.current) return;
        const { scrollLeft, scrollWidth } = containerRef.current;
        const halfWidth = scrollWidth / 2;

        if (scrollLeft <= 0) {
            containerRef.current.scrollLeft = halfWidth;
        } else if (scrollLeft >= halfWidth) {
            containerRef.current.scrollLeft = 0;
        }
    };

    // Drift Engine
    useEffect(() => {
        let animationFrameId: number;
        const drift = () => {
            if (containerRef.current && !isPaused) {
                containerRef.current.scrollLeft += 0.8; // Smooth slow drift
            }
            animationFrameId = requestAnimationFrame(drift);
        };
        animationFrameId = requestAnimationFrame(drift);
        return () => cancelAnimationFrame(animationFrameId);
    }, [isPaused]);

    // Base items repeated enough to fill width
    const displayItems = items.length > 0
        ? (items.length < 6 ? [...items, ...items, ...items] : items)
        : [];

    if (displayItems.length === 0) return null;

    return (
        <div className={`relative ${className} group overflow-hidden`}>
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="overflow-x-auto whitespace-nowrap flex scrollbar-hide"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
                style={{
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                <div
                    className="flex gap-12 items-center px-6 shrink-0"
                    style={{ width: 'max-content' }}
                >
                    {/* Render items twice for a perfect infinite loop */}
                    {[1, 2].map((setIdx) => (
                        <div key={`set-${setIdx}`} className="flex gap-12 items-center">
                            {displayItems.map((item, idx) => (
                                <div key={`idx-${setIdx}-${idx}`} className="shrink-0">
                                    {item}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                    touch-action: pan-y;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
