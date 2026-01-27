
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import imageKitLoader from "@/lib/imagekitLoader";

interface Partnership {
    id: string;
    name: string;
    logo: string;
    partnerType: string;
}

export default function PartnershipCarousel() {
    const [partnerships, setPartnerships] = useState<Partnership[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch("/api/snacks/partnerships")
            .then((res) => res.json())
            .then((data) => {
                // Filter out academic partners to keep them exclusive to Training Academy
                const brandPartners = data.filter((p: Partnership) => p.partnerType !== "Academic Partner");
                setPartnerships(brandPartners);
            })
            .catch((err) => console.error("Failed to load partnerships:", err));
    }, []);

    // Function to handle seamless loop reset
    const handleScroll = useCallback(() => {
        if (!containerRef.current || isDragging) return;

        const { scrollLeft, scrollWidth } = containerRef.current;
        const oneThird = scrollWidth / 3;

        if (scrollLeft <= 0) {
            containerRef.current.scrollLeft = oneThird;
        } else if (scrollLeft >= oneThird * 2) {
            containerRef.current.scrollLeft = oneThird;
        }
    }, [isDragging]);

    // Initial positioning to the middle set
    useEffect(() => {
        if (containerRef.current && partnerships.length > 0) {
            const { scrollWidth } = containerRef.current;
            containerRef.current.scrollLeft = scrollWidth / 3;
        }
    }, [partnerships.length]);

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
        const walk = (x - startX) * 2;
        const newScrollLeft = scrollLeft - walk;

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
        }
        setIsPaused(false);
    };

    if (partnerships.length === 0) return null;

    // For a seamless infinite scroll, we need enough items to fill the width.
    // We'll duplicate the list multiple times if it's very short.
    const basePartners = partnerships.length > 0
        ? (partnerships.length < 6 ? [...partnerships, ...partnerships] : partnerships)
        : [];

    return (
        <section className="py-12 bg-white overflow-hidden border-b border-gray-50">
            <div className="container mx-auto px-6 mb-8">
                <div className="flex flex-col items-center">
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight text-center">Partnered <span className="text-primary italic">By</span></h2>
                    <div className="w-16 h-1 bg-gradient-to-r from-primary to-pink-500 rounded-full mt-3"></div>
                </div>
            </div>

            <div
                ref={containerRef}
                className={`relative group flex overflow-x-auto scrollbar-hide ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={handleMouseLeave}
                onScroll={handleScroll}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{
                    scrollBehavior: isDragging ? 'auto' : 'smooth'
                }}
            >
                {/* Render three tracks for infinite manual dragging */}
                {[1, 2, 3].map((setIdx) => (
                    <div
                        key={`set-${setIdx}`}
                        className="flex whitespace-nowrap"
                        style={{
                            animation: `scroll 50s linear infinite`,
                            animationPlayState: isPaused ? 'paused' : 'running'
                        }}
                    >
                        {basePartners.map((partner, idx) => (
                            <div
                                key={`${setIdx}-${partner.id}-${idx}`}
                                className="flex-shrink-0 w-[240px] md:w-[300px] mx-3"
                            >
                                <div className="bg-white rounded-[1.5rem] p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group/card">
                                    <div className="relative h-20 md:h-24 w-full flex items-center justify-center">
                                        <Image
                                            loader={imageKitLoader}
                                            src={partner.logo}
                                            alt={partner.name}
                                            fill
                                            className="object-contain group-hover/card:scale-110 transition-transform duration-700"
                                        />
                                    </div>
                                    <div className="mt-6 text-center italic">
                                        <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">{partner.name}</h3>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-primary opacity-60 mt-1">{partner.partnerType}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <style jsx>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-100%); }
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    );
}
