"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import CardWrapper from "@/components/CardWrapper";
import { LucideIcon } from "lucide-react";

interface TimelineCarouselProps {
    items: any[];
    type: 'experience' | 'education' | 'volunteering';
    onItemClick: (item: any) => void;
    colorClass: string;
    Icon: LucideIcon;
}

export default function TimelineCarousel({ items, type, onItemClick, colorClass, Icon }: TimelineCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const dragX = useMotionValue(0);
    const autoScrollRef = useRef<NodeJS.Timeout | null>(null);
    const inactivityRef = useRef<NodeJS.Timeout | null>(null);

    const title = type === 'experience' ? 'role' : type === 'education' ? 'degree' : 'role';
    const subtitle = type === 'experience' ? 'company' : type === 'education' ? 'institution' : 'organization';
    const period = type === 'education' ? 'period' : 'duration';

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
        resetInactivityTimer();
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
        resetInactivityTimer();
    };

    const startAutoScroll = () => {
        if (autoScrollRef.current) clearInterval(autoScrollRef.current);
        autoScrollRef.current = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length);
        }, 2000); // 2s auto swipe
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
        }, 5000); // 5s silence before auto
    };

    useEffect(() => {
        startAutoScroll();
        return () => {
            stopAutoScroll();
            if (inactivityRef.current) clearTimeout(inactivityRef.current);
        };
    }, [items.length]);

    const onDragEnd = (event: any, info: any) => {
        const threshold = 100;
        const velocity = info.velocity.x;
        const offset = info.offset.x;

        if (offset < -threshold || velocity < -500) {
            handleNext();
        } else if (offset > threshold || velocity > 500) {
            handlePrev();
        }
        resetInactivityTimer();
    };

    if (items.length === 0) return null;

    return (
        <div
            className="relative overflow-hidden"
            onMouseEnter={() => {
                setIsHovered(true);
                stopAutoScroll();
                if (inactivityRef.current) clearTimeout(inactivityRef.current);
            }}
            onMouseLeave={() => {
                setIsHovered(false);
                resetInactivityTimer();
            }}
        >
            {/* Navigation Arrows */}
            {items.length > 1 && (
                <>
                    <button
                        onClick={handlePrev}
                        className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-xl p-3 rounded-full text-gray-900 hover:bg-gray-50 transition-all ${isHovered ? 'opacity-100' : 'opacity-0 md:opacity-60'
                            }`}
                        aria-label="Previous"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={handleNext}
                        className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white shadow-xl p-3 rounded-full text-gray-900 hover:bg-gray-50 transition-all ${isHovered ? 'opacity-100' : 'opacity-0 md:opacity-60'
                            }`}
                        aria-label="Next"
                    >
                        <ChevronRight size={24} />
                    </button>
                </>
            )}

            {/* Carousel Container */}
            <div className="relative overflow-visible px-4 md:px-12">
                <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    style={{ x: dragX }}
                    onDragStart={stopAutoScroll}
                    onDragEnd={onDragEnd}
                    animate={{
                        x: `-${currentIndex * (typeof window !== 'undefined' && window.innerWidth < 768 ? 100 : 50)}%`
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="flex gap-6 md:gap-8 cursor-grab active:cursor-grabbing"
                >
                    {items.map((item, i) => (
                        <div key={i} className="min-w-full md:min-w-[50%] flex flex-shrink-0 select-none">
                            <CardWrapper index={i}>
                                <div
                                    className="relative group h-full flex flex-col w-full"
                                    onClick={() => {
                                        onItemClick(item);
                                        resetInactivityTimer();
                                    }}
                                >
                                    {/* Card Content */}
                                    <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm group-hover:shadow-2xl transition-all flex flex-col flex-1 h-full w-full pointer-events-none md:pointer-events-auto">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight mb-2">{item[title]}</h3>
                                                <p className="text-primary font-bold text-lg md:text-xl">{item[subtitle]}</p>
                                            </div>
                                            <div className="flex items-center space-x-2 text-secondary font-black bg-gray-50 px-4 py-2 rounded-2xl text-sm w-fit shrink-0">
                                                <Calendar size={18} />
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
                            onClick={() => {
                                setCurrentIndex(i);
                                resetInactivityTimer();
                            }}
                            className={`h-2 rounded-full transition-all ${i === currentIndex ? `${colorClass} w-8` : 'bg-gray-300 w-2'
                                }`}
                            aria-label={`Go to item ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
