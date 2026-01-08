"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import CardWrapper from "@/components/CardWrapper";
import { LucideIcon } from "lucide-react";
import { Tilt } from "./Tilt";

interface TimelineCarouselProps {
    items: any[];
    type: 'experience' | 'education' | 'volunteering';
    onItemClick: (item: any) => void;
    colorClass: string;
    Icon: LucideIcon;
}

export default function TimelineCarousel({ items, type, onItemClick, colorClass, Icon }: TimelineCarouselProps) {
    if (items.length === 0) return null;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const dragX = useMotionValue(0);

    const title = type === 'experience' ? 'role' : type === 'education' ? 'degree' : 'role';
    const subtitle = type === 'experience' ? 'company' : type === 'education' ? 'institution' : 'organization';
    const period = type === 'education' ? 'period' : 'duration';

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    const onDragEnd = (event: any, info: any) => {
        const threshold = 50;
        const velocity = info.velocity.x;
        const offset = info.offset.x;

        if (offset < -threshold || velocity < -300) {
            handleNext();
        } else if (offset > threshold || velocity > 300) {
            handlePrev();
        }
    };

    return (
        <div
            className="relative overflow-visible pb-12 md:pb-0"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Navigation Arrows */}
            {items.length > 1 && (
                <>
                    <button
                        onClick={handlePrev}
                        className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-xl p-3 rounded-full text-gray-900 hover:bg-gray-50 transition-all ${isHovered ? 'opacity-100' : 'opacity-0 md:opacity-60'}`}
                        aria-label="Previous"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={handleNext}
                        className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white shadow-xl p-3 rounded-full text-gray-900 hover:bg-gray-50 transition-all ${isHovered ? 'opacity-100' : 'opacity-0 md:opacity-60'}`}
                        aria-label="Next"
                    >
                        <ChevronRight size={24} />
                    </button>
                </>
            )}

            {/* Carousel Container */}
            <div className="relative overflow-hidden px-0 md:px-12">
                <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    style={{ x: dragX }}
                    onDragEnd={onDragEnd}
                    animate={{
                        x: `-${currentIndex * 100}%`
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="flex cursor-grab active:cursor-grabbing"
                >
                    {items.map((item, i) => (
                        <div key={i} className="w-full flex-shrink-0 flex justify-center px-4 select-none">
                            <CardWrapper index={i}>
                                <div
                                    className="relative group h-full flex flex-col w-full"
                                    onClick={() => onItemClick(item)}
                                >
                                    {/* Card Content */}
                                    <Tilt options={{ max: 10, speed: 400, glare: true, "max-glare": 0.2 }} className="h-full w-full max-w-2xl mx-auto">
                                        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm group-hover:shadow-2xl transition-all flex flex-col flex-1 h-full w-full items-center text-center">
                                            <div className="flex flex-col items-center gap-6 mb-4">
                                                <div className="flex flex-col items-center">
                                                    <h3 className="text-xl md:text-3xl font-black text-gray-900 leading-tight mb-2 break-words uppercase tracking-tight">
                                                        {item[title]}
                                                    </h3>
                                                    <p className="text-primary font-bold text-base md:text-xl break-words">{item[subtitle]}</p>
                                                </div>
                                                <div className="flex items-center space-x-2 text-secondary font-black bg-gray-50 px-4 py-2 rounded-xl text-xs w-fit shrink-0">
                                                    <Calendar size={14} />
                                                    <span>{(() => {
                                                        const p = item[period] || "";
                                                        const years = p.match(/\b20\d{2}\b/g);
                                                        if (!years) return p;
                                                        const uniqueYears = Array.from(new Set(years));
                                                        return uniqueYears.join(' - ');
                                                    })()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Tilt>
                                </div>
                            </CardWrapper>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Scroll Indicators */}
            {items.length > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    {items.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`h-2 rounded-full transition-all ${i === currentIndex ? `${colorClass} w-8` : 'bg-gray-300 w-2'}`}
                            aria-label={`Go to item ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
