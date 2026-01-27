
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

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

    // Function to handle seamless loop reset
    const handleScroll = useCallback(() => {
        if (!containerRef.current || isDragging) return;

        const { scrollLeft, scrollWidth } = containerRef.current;
        const oneThird = scrollWidth / 3;

        // If we scroll into the first third, jump forward
        if (scrollLeft <= 0) {
            containerRef.current.scrollLeft = oneThird;
        }
        // If we scroll too far into the last third, jump back
        else if (scrollLeft >= oneThird * 2) {
            containerRef.current.scrollLeft = oneThird;
        }
    }, [isDragging]);

    // Initial positioning to the middle set
    useEffect(() => {
        if (containerRef.current) {
            const { scrollWidth } = containerRef.current;
            containerRef.current.scrollLeft = scrollWidth / 3;
        }
    }, [items.length]);

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
        const { scrollWidth } = containerRef.current;
        const oneThird = scrollWidth / 3;
        const x = e.pageX - containerRef.current.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed multiplier
        const newScrollLeft = scrollLeft - walk;

        // Apply scroll with seamless jump logic during drag
        if (newScrollLeft <= 0) {
            const wrappedScroll = oneThird + newScrollLeft;
            containerRef.current.scrollLeft = wrappedScroll;
            setScrollLeft(wrappedScroll);
            setStartX(e.pageX - containerRef.current.offsetLeft);
        } else if (newScrollLeft >= oneThird * 2) {
            const wrappedScroll = newScrollLeft - oneThird;
            containerRef.current.scrollLeft = wrappedScroll;
            setScrollLeft(wrappedScroll);
            setStartX(e.pageX - containerRef.current.offsetLeft);
        } else {
            containerRef.current.scrollLeft = newScrollLeft;
        }
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
                onScroll={handleScroll}
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
                        animationDuration: `${items.length * 5}s`, // 5 seconds per item (approx 20% speed of previous 1s)
                        animationIterationCount: 'infinite',
                        animationTimingFunction: 'linear',
                        animationPlayState: isPaused ? 'paused' : 'running',
                        width: 'max-content'
                    }}
                >
                    {/* Render items three times for a perfect infinite loop even during drag */}
                    {items.map((item, idx) => (
                        <div key={`idx1-${idx}`} className="shrink-0">
                            {item}
                        </div>
                    ))}
                    {items.map((item, idx) => (
                        <div key={`idx2-${idx}`} className="shrink-0">
                            {item}
                        </div>
                    ))}
                    {items.map((item, idx) => (
                        <div key={`idx3-${idx}`} className="shrink-0">
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

