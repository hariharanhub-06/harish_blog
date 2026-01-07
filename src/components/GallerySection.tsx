"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import Image from "next/image";
import { Tilt } from "./Tilt";

interface GallerySectionProps {
    items: any[];
}

export default function GallerySection({ items }: GallerySectionProps) {

    // Triple the items to create a seamless infinite loop
    const duplicatedItems = [...items, ...items, ...items];
    const [currentIndex, setCurrentIndex] = useState(items.length); // Start at the middle set
    const [isHovered, setIsHovered] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const autoScrollRef = useRef<NodeJS.Timeout | null>(null);

    const slideWidth = typeof window !== 'undefined' && window.innerWidth < 768 ? 90 : (window.innerWidth < 1024 ? 50 : 33.33);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => prev + 1);
    }, []);

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => prev - 1);
    }, []);

    // Jump back to the middle set when reaching the boundaries to keep it infinite
    useEffect(() => {
        if (currentIndex >= items.length * 2) {
            const timer = setTimeout(() => {
                setCurrentIndex(currentIndex - items.length);
            }, 300); // Wait for transition
            return () => clearTimeout(timer);
        }
        if (currentIndex < items.length) {
            const timer = setTimeout(() => {
                setCurrentIndex(currentIndex + items.length);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [currentIndex, items.length]);

    const stopAutoScroll = useCallback(() => {
        if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    }, []);

    const startAutoScroll = useCallback(() => {
        stopAutoScroll();
        autoScrollRef.current = setInterval(() => {
            handleNext();
        }, 3000);
    }, [handleNext, stopAutoScroll]);

    useEffect(() => {
        if (!isHovered) startAutoScroll();
        return () => stopAutoScroll();
    }, [isHovered, startAutoScroll, stopAutoScroll]);

    if (items.length === 0) return null;

    return (
        <section id="gallery" className="container mx-auto px-6 scroll-mt-20 overflow-hidden py-20">
            <div className="flex flex-col items-center mb-16">
                <div className="flex items-center gap-4 mb-4">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase">Moment Gallery</h2>
                    <div className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-primary/20">
                        {items.length} Snaps
                    </div>
                </div>
                <div className="w-20 h-2 bg-pink-500 rounded-full"></div>
            </div>

            <div
                className="relative"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Navigation Arrows */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-4 z-30 pointer-events-none">
                    <button
                        onClick={handlePrev}
                        className="w-14 h-14 bg-white/90 backdrop-blur-md shadow-2xl rounded-full flex items-center justify-center text-gray-900 hover:bg-white hover:scale-110 transition-all pointer-events-auto"
                    >
                        <ChevronLeft size={28} />
                    </button>
                    <button
                        onClick={handleNext}
                        className="w-14 h-14 bg-white/90 backdrop-blur-md shadow-2xl rounded-full flex items-center justify-center text-gray-900 hover:bg-white hover:scale-110 transition-all pointer-events-auto"
                    >
                        <ChevronRight size={28} />
                    </button>
                </div>

                {/* Carousel Container */}
                <div className="relative overflow-visible px-4">
                    <motion.div
                        animate={{
                            x: `-${currentIndex * slideWidth}%`,
                        }}
                        transition={{ type: "spring", stiffness: 200, damping: 25 }}
                        className="flex gap-6 md:gap-8"
                    >
                        {duplicatedItems.map((item, i) => (
                            <div
                                key={i}
                                className="min-w-[85%] md:min-w-[45%] lg:min-w-[30%] aspect-[4/5] md:aspect-square relative flex-shrink-0"
                            >
                                <Tilt
                                    options={{ max: 15, speed: 400, glare: true, "max-glare": 0.4 }}
                                    className="w-full h-full relative rounded-[2.5rem] overflow-hidden shadow-xl border border-white/20 select-none cursor-pointer"
                                >
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.title}
                                        fill
                                        className="object-cover transition-transform duration-700 hover:scale-110"
                                        unoptimized
                                        sizes="(max-width: 768px) 85vw, (max-width: 1200px) 45vw, 30vw"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                    <div className="absolute bottom-8 left-8 right-8 text-left z-20">
                                        <h3 className="text-xl md:text-2xl font-black text-white mb-3 tracking-tight drop-shadow-xl line-clamp-2">
                                            {item.title}
                                        </h3>
                                        <p className="flex items-center gap-2 text-white/95 text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-white/15 backdrop-blur-xl rounded-2xl border border-white/20 w-fit">
                                            <MapPin size={12} className="text-pink-400" />
                                            {item.location}
                                        </p>
                                    </div>
                                </Tilt>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Pagination - only for visible items subset */}
            <div className="flex justify-center gap-3 mt-16">
                {items.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentIndex(i + items.length)}
                        className={`h-2 rounded-full transition-all duration-500 ${(currentIndex % items.length) === i ? 'bg-pink-500 w-12' : 'bg-gray-200 w-3 hover:bg-gray-300'
                            }`}
                    />
                ))}
            </div>
        </section>
    );
}
