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
    const [scrollLeftState, setScrollLeftState] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            const { scrollWidth } = containerRef.current;
            containerRef.current.scrollLeft = scrollWidth / 4; // Start in the middle of set 1/2
        }
    }, [items]);

    const handleScroll = () => {
        if (!containerRef.current) return;
        const { scrollLeft, scrollWidth } = containerRef.current;
        const halfWidth = scrollWidth / 2;

        if (scrollLeft <= 0) {
            containerRef.current.scrollLeft = halfWidth;
        } else if (scrollLeft >= halfWidth) {
            containerRef.current.scrollLeft = 1; // 1 to avoid sticking at 0 if multiple scroll events fire
        }
    };

    // Drag Handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - containerRef.current.offsetLeft);
        setScrollLeftState(containerRef.current.scrollLeft);
        setIsPaused(true);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
        setIsPaused(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsPaused(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !containerRef.current) return;
        e.preventDefault();
        const x = e.pageX - containerRef.current.offsetLeft;
        const walk = (x - startX) * 1.5;
        containerRef.current.scrollLeft = scrollLeftState - walk;
    };

    // Drift Engine
    useEffect(() => {
        let animationFrameId: number;
        const drift = () => {
            if (containerRef.current && !isPaused && !isDragging) {
                containerRef.current.scrollLeft += 0.8;
            }
            animationFrameId = requestAnimationFrame(drift);
        };
        animationFrameId = requestAnimationFrame(drift);
        return () => cancelAnimationFrame(animationFrameId);
    }, [isPaused, isDragging]);

    const handleTouchStart = () => {
        setIsPaused(true);
    };

    const handleTouchEnd = () => {
        // Keep paused for 2 seconds after touch to allow momentum to settle
        setTimeout(() => setIsPaused(false), 2000);
    };

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
                className={`overflow-x-auto whitespace-nowrap flex scrollbar-hide ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={handleMouseLeave}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
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
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
