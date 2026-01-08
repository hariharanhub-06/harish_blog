"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import Image from "next/image";
import { Tilt } from "./Tilt";

interface GallerySectionProps {
    items: any[];
}

export default function GallerySection({ items }: GallerySectionProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
    }, [items.length]);

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    }, [items.length]);

    if (items.length === 0) return null;

    return (
        <section id="gallery" className="container mx-auto px-6 scroll-mt-20 overflow-hidden py-20">
            <div className="flex flex-col items-center mb-16">
                <div className="flex items-center gap-4 mb-4">
                    <h2 className="text-2xl md:text-5xl font-black tracking-tight uppercase">Moment Gallery</h2>
                    <div className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-primary/20">
                        {items.length} Snaps
                    </div>
                </div>
                <div className="w-16 md:w-20 h-1.5 md:h-2 bg-pink-500 rounded-full"></div>
            </div>

            <div className="relative group/gallery">
                {/* Navigation Arrows */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-2 md:px-4 z-30 pointer-events-none">
                    <button
                        onClick={handlePrev}
                        className="w-10 h-10 md:w-14 md:h-14 bg-white/90 backdrop-blur-md shadow-2xl rounded-full flex items-center justify-center text-gray-900 hover:bg-white hover:scale-110 transition-all pointer-events-auto opacity-100 md:opacity-0 md:group-hover/gallery:opacity-100"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={handleNext}
                        className="w-10 h-10 md:w-14 md:h-14 bg-white/90 backdrop-blur-md shadow-2xl rounded-full flex items-center justify-center text-gray-900 hover:bg-white hover:scale-110 transition-all pointer-events-auto opacity-100 md:opacity-0 md:group-hover/gallery:opacity-100"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>

                <div className="relative overflow-hidden px-0">
                    <motion.div
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        onDragEnd={(e, info) => {
                            const threshold = 50;
                            if (info.offset.x < -threshold) handleNext();
                            else if (info.offset.x > threshold) handlePrev();
                        }}
                        animate={{
                            x: `-${currentIndex * 100}%`,
                        }}
                        transition={{ type: "spring", stiffness: 200, damping: 25 }}
                        className="flex cursor-grab active:cursor-grabbing"
                    >
                        {items.map((item, i) => (
                            <div
                                key={i}
                                className="w-full md:min-w-[45%] lg:min-w-[30%] aspect-[4/5] md:aspect-square relative flex-shrink-0 px-4"
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
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 30vw"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />
                                    <div className="absolute bottom-6 left-6 right-6 text-left z-20">
                                        <h3 className="text-sm md:text-2xl font-black text-white mb-1.5 tracking-tight drop-shadow-xl line-clamp-1 leading-none uppercase">
                                            {item.title}
                                        </h3>
                                        <p className="flex items-center gap-2 text-white/95 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 w-fit">
                                            <MapPin size={10} className="text-pink-400" />
                                            {item.location}
                                        </p>
                                    </div>
                                </Tilt>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-3 mt-16">
                {items.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`h-2 rounded-full transition-all duration-500 ${currentIndex === i ? 'bg-pink-500 w-12' : 'bg-gray-200 w-3 hover:bg-gray-300'}`}
                    />
                ))}
            </div>
        </section>
    );
}
