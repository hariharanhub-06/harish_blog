"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, ImageIcon } from "lucide-react";
import Image from "next/image";

interface GallerySectionProps {
    items: any[];
}

export default function GallerySection({ items }: GallerySectionProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const autoScrollRef = useRef<NodeJS.Timeout | null>(null);

    const scrollToIndex = (index: number) => {
        if (containerRef.current) {
            const itemWidth = containerRef.current.offsetWidth;
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
    };

    const handlePrev = () => {
        const prevIndex = (currentIndex - 1 + items.length) % items.length;
        scrollToIndex(prevIndex);
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

    useEffect(() => {
        if (items.length > 1) {
            startAutoScroll();
        }
        return () => stopAutoScroll();
    }, [items.length]);

    if (items.length === 0) return null;

    return (
        <section id="gallery" className="container mx-auto px-6 scroll-mt-20">
            <div className="flex flex-col items-center mb-10">
                <div className="flex items-center gap-4 mb-4">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase">Project Gallery</h2>
                    <div className="bg-primary text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-primary/20">
                        {items.length} Pictures
                    </div>
                </div>
                <div className="w-20 h-2 bg-pink-500 rounded-full"></div>
                <p className="mt-6 text-secondary text-base max-w-2xl text-center font-medium">
                    A collection of moments from various projects, events, and fieldwork.
                </p>
            </div>

            <div
                className="relative group"
                onMouseEnter={stopAutoScroll}
                onMouseLeave={startAutoScroll}
            >
                {/* Navigation Arrows */}
                {items.length > 1 && (
                    <>
                        <button
                            onClick={handlePrev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-md shadow-xl p-4 rounded-full text-gray-900 hover:bg-white transition-all opacity-0 group-hover:opacity-100 hidden md:block"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-md shadow-xl p-4 rounded-full text-gray-900 hover:bg-white transition-all opacity-0 group-hover:opacity-100 hidden md:block"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}

                {/* Carousel Container */}
                <div
                    ref={containerRef}
                    className="overflow-hidden rounded-[3rem] shadow-2xl shadow-gray-200"
                >
                    <div className="flex transition-transform duration-500 ease-in-out">
                        {items.map((item, i) => (
                            <div key={item.id} className="min-w-full relative aspect-[16/9] md:aspect-[21/9] overflow-hidden">
                                <Image
                                    src={item.imageUrl}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                    priority={i === 0}
                                />

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                                {/* Content Overlay - Left Down */}
                                <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 text-left pointer-events-none">
                                    <h3 className="text-2xl md:text-4xl font-black text-white mb-2 md:mb-4 tracking-tight drop-shadow-lg">
                                        {item.title}
                                    </h3>
                                    <p className="flex items-center gap-2 text-white/80 text-sm md:text-lg font-bold drop-shadow-lg uppercase tracking-widest px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 w-fit">
                                        <MapPin size={18} className="text-pink-400" />
                                        {item.location}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile Indicators */}
                {items.length > 1 && (
                    <div className="flex justify-center gap-3 mt-8">
                        {items.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => scrollToIndex(i)}
                                className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-pink-500 w-12' : 'bg-gray-200 w-3 hover:bg-gray-300'
                                    }`}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
