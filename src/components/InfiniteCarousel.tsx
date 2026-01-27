
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
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - containerRef.current.offsetLeft);
        setScrollLeft(containerRef.current.scrollLeft);
        setIsPaused(true);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !containerRef.current) return;
        e.preventDefault();
        const x = e.pageX - containerRef.current.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed multiplier
        containerRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsPaused(false);
    };

    const handleMouseLeave = () => {
        if (isDragging) {
            setIsDragging(false);
            setIsPaused(false);
        }
    };

    return (
        <div className={`relative ${className} group overflow-hidden`}>
            <div
                ref={containerRef}
                className={`overflow-x-auto whitespace-nowrap flex ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} scrollbar-hide`}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={handleMouseLeave}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{
                    scrollBehavior: isDragging ? 'auto' : 'smooth'
                }}
            >
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

            <style jsx>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}

