"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import Image from "next/image";

interface GallerySectionProps {
    items: any[];
}

export default function GallerySection({ items }: GallerySectionProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    useEffect(() => {
        const timer = setInterval(handleNext, 5000);
        return () => clearInterval(timer);
    }, [items.length]);

    if (items.length === 0) return null;

    // Helper to get consistent indices for the 3-item display
    const getIndex = (offset: number) => {
        return (currentIndex + offset + items.length) % items.length;
    };

    const displayIndices = [-1, 0, 1];

    return (
        <section id="gallery" className="container mx-auto px-6 scroll-mt-20 overflow-hidden">
            <div className="flex flex-col items-center mb-12">
                <div className="flex items-center gap-4 mb-4">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase">Moment Gallery</h2>
                    <div className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-primary/20">
                        {items.length} Snaps
                    </div>
                </div>
                <div className="w-16 h-1.5 bg-pink-500 rounded-full"></div>
            </div>

            <div className="relative h-[350px] md:h-[500px] flex items-center justify-center">
                {/* Navigation Arrows */}
                {items.length > 1 && (
                    <>
                        <button
                            onClick={handlePrev}
                            className="absolute left-4 z-50 bg-white/90 backdrop-blur-md shadow-2xl p-4 rounded-full text-gray-900 hover:bg-white transition-all hover:scale-110 active:scale-95"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-4 z-50 bg-white/90 backdrop-blur-md shadow-2xl p-4 rounded-full text-gray-900 hover:bg-white transition-all hover:scale-110 active:scale-95"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}

                {/* 3D Carousel Container */}
                <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
                    <AnimatePresence initial={false}>
                        {displayIndices.map((offset) => {
                            const index = getIndex(offset);
                            const item = items[index];
                            if (!item) return null;

                            const isCenter = offset === 0;

                            return (
                                <motion.div
                                    key={`${item.id}-${offset}`}
                                    initial={{
                                        opacity: 0,
                                        scale: 0.6,
                                        x: offset * 300,
                                        zIndex: 0
                                    }}
                                    animate={{
                                        opacity: isCenter ? 1 : 0.4,
                                        scale: isCenter ? 1 : 0.75,
                                        x: offset * (typeof window !== 'undefined' && window.innerWidth < 768 ? 120 : 250),
                                        zIndex: isCenter ? 30 : 10,
                                        rotateY: offset * 15,
                                    }}
                                    exit={{
                                        opacity: 0,
                                        scale: 0.6,
                                        x: offset * -300
                                    }}
                                    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                                    className="absolute w-[85%] md:w-[60%] aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/20 group cursor-pointer"
                                    style={{
                                        filter: isCenter ? "none" : "blur(1px) grayscale(20%)",
                                    }}
                                    onClick={() => !isCenter && setCurrentIndex(index)}
                                >
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                        priority={isCenter}
                                    />

                                    {/* Overlay Gradient */}
                                    <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-500 ${isCenter ? 'opacity-100' : 'opacity-0'}`} />

                                    {/* Content Overlay */}
                                    {isCenter && (
                                        <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 text-left pointer-events-none">
                                            <motion.h3
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                className="text-xl md:text-3xl font-black text-white mb-2 tracking-tight drop-shadow-lg"
                                            >
                                                {item.title}
                                            </motion.h3>
                                            <motion.p
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.1 }}
                                                className="flex items-center gap-2 text-white/90 text-[10px] md:text-xs font-black uppercase tracking-widest px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 w-fit"
                                            >
                                                <MapPin size={14} className="text-pink-400" />
                                                {item.location}
                                            </motion.p>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* Pagination / Dots */}
            <div className="flex justify-center gap-2 mt-8 md:mt-12">
                {items.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`h-1.5 rounded-full transition-all duration-500 ${i === currentIndex ? 'bg-pink-500 w-10' : 'bg-gray-200 w-3 hover:bg-gray-300'
                            }`}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}
