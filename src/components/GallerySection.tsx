"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import Image from "next/image";

interface GallerySectionProps {
    items: any[];
}

export default function GallerySection({ items }: GallerySectionProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const autoScrollRef = useRef<NodeJS.Timeout | null>(null);
    const inactivityRef = useRef<NodeJS.Timeout | null>(null);

    const scrollToIndex = (index: number) => {
        if (containerRef.current) {
            const containerWidth = containerRef.current.offsetWidth;
            const scrollWidth = containerRef.current.scrollWidth;
            const itemWidth = scrollWidth / items.length;

            containerRef.current.scrollTo({
                left: itemWidth * index,
                behavior: 'smooth'
            });
            setCurrentIndex(index);
        }
    };

    const handleNext = () => {
        const nextIndex = (currentIndex + 1) % items.length;
        scrollToIndex(nextIndex);
        resetInactivityTimer();
    };

    const handlePrev = () => {
        const prevIndex = (currentIndex - 1 + items.length) % items.length;
        scrollToIndex(prevIndex);
        resetInactivityTimer();
    };

    const startAutoScroll = () => {
        if (autoScrollRef.current) clearInterval(autoScrollRef.current);
        autoScrollRef.current = setInterval(() => {
            setCurrentIndex((prev) => {
                const next = (prev + 1) % items.length;
                scrollToIndex(next);
                return next;
            });
        }, 3000);
    };

    const stopAutoScroll = () => {
        if (autoScrollRef.current) {
            clearInterval(autoScrollRef.current);
            autoScrollRef.current = null;
        }
    };

    const resetInactivityTimer = () => {
        stopAutoScroll();
        if (inactivityRef.current) clearTimeout(inactivityRef.current);
        inactivityRef.current = setTimeout(() => {
            startAutoScroll();
        }, 5000);
    };

    useEffect(() => {
        startAutoScroll();
        return () => {
            stopAutoScroll();
            if (inactivityRef.current) clearTimeout(inactivityRef.current);
        };
    }, [items.length]);

    if (items.length === 0) return null;

    return (
        <section id="gallery" className="container mx-auto px-6 scroll-mt-20">
            <div className="flex flex-col items-center mb-12">
                <div className="flex items-center gap-4 mb-4">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase">Moment Gallery</h2>
                    <div className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-primary/20">
                        {items.length} Snaps
                    </div>
                </div>
                <div className="w-16 h-1.5 bg-pink-500 rounded-full"></div>
            </div>

            <div
                className="relative group"
                onMouseEnter={() => {
                    setIsHovered(true);
                    resetInactivityTimer();
                }}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Navigation Arrows */}
                {items.length > 1 && (
                    <>
                        <button
                            onClick={handlePrev}
                            className={`absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-2xl p-4 rounded-full text-gray-900 hover:bg-gray-50 transition-all ${isHovered ? 'opacity-100' : 'opacity-0'
                                }`}
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={handleNext}
                            className={`absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-2xl p-4 rounded-full text-gray-900 hover:bg-gray-50 transition-all ${isHovered ? 'opacity-100' : 'opacity-0'
                                }`}
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}

                {/* Carousel Container */}
                <div
                    ref={containerRef}
                    className="overflow-hidden cursor-grab active:cursor-grabbing"
                    onMouseDown={resetInactivityTimer}
                >
                    <div className="flex gap-6 md:gap-8 transition-transform duration-500 ease-in-out">
                        {items.map((item, i) => (
                            <div
                                key={i}
                                className="min-w-[85%] md:min-w-[45%] lg:min-w-[30%] aspect-square relative rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100 flex-shrink-0"
                            >
                                <Image
                                    src={item.imageUrl}
                                    alt={item.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    unoptimized
                                    sizes="(max-width: 768px) 85vw, (max-width: 1200px) 45vw, 30vw"
                                />

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

                                {/* Content Overlay */}
                                <div className="absolute bottom-6 left-6 right-6 text-left pointer-events-none">
                                    <h3 className="text-xl md:text-2xl font-black text-white mb-2 tracking-tight drop-shadow-lg line-clamp-2">
                                        {item.title}
                                    </h3>
                                    <p className="flex items-center gap-2 text-white/90 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 w-fit">
                                        <MapPin size={12} className="text-pink-400" />
                                        {item.location}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Pagination Indicators */}
            {items.length > 1 && (
                <div className="flex justify-center gap-2 mt-8 md:mt-12">
                    {items.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                scrollToIndex(i);
                                resetInactivityTimer();
                            }}
                            className={`h-1.5 rounded-full transition-all duration-500 ${i === currentIndex ? 'bg-pink-500 w-10' : 'bg-gray-200 w-3 hover:bg-gray-300'
                                }`}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
