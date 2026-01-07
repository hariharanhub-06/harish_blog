"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
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
    const containerRef = useRef<HTMLDivElement>(null);
    const autoScrollRef = useRef<NodeJS.Timeout | null>(null);
    const inactivityRef = useRef<NodeJS.Timeout | null>(null);

    const title = type === 'experience' ? 'role' : type === 'education' ? 'degree' : 'role';
    const subtitle = type === 'experience' ? 'company' : type === 'education' ? 'institution' : 'organization';
    const period = type === 'education' ? 'period' : 'duration';
    const description = type === 'education' ? 'details' : 'description';

    const scrollToIndex = (index: number) => {
        if (containerRef.current) {
            const itemWidth = containerRef.current.scrollWidth / items.length;
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
        }, 2000);
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
        <div
            className="relative"
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
                        className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-xl p-3 rounded-full text-gray-900 hover:bg-gray-50 transition-all ${isHovered ? 'opacity-100' : 'opacity-0 md:opacity-60'
                            }`}
                        aria-label="Previous"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={handleNext}
                        className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-xl p-3 rounded-full text-gray-900 hover:bg-gray-50 transition-all ${isHovered ? 'opacity-100' : 'opacity-0 md:opacity-60'
                            }`}
                        aria-label="Next"
                    >
                        <ChevronRight size={24} />
                    </button>
                </>
            )}

            {/* Carousel Container */}
            <div
                ref={containerRef}
                className="overflow-hidden px-12"
                onMouseDown={resetInactivityTimer}
            >
                <div className="flex gap-6 md:gap-8">
                    {items.map((item, i) => (
                        <div key={i} className="min-w-full md:min-w-[500px] lg:min-w-[600px]">
                            <CardWrapper index={i}>
                                <div
                                    className="relative group cursor-pointer h-full"
                                    onClick={() => {
                                        onItemClick(item);
                                        resetInactivityTimer();
                                    }}
                                >
                                    {/* Icon */}
                                    <div className={`absolute -left-8 top-0 w-16 h-16 ${colorClass} rounded-2xl hidden md:flex items-center justify-center text-white shadow-xl z-10 group-hover:scale-110 transition-transform`}>
                                        <Icon size={28} />
                                    </div>

                                    {/* Mobile Icon & Header */}
                                    <div className="md:hidden flex items-center mb-4 gap-4">
                                        <div className={`w-14 h-14 shrink-0 ${colorClass} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                                            <Icon size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 leading-tight">{item[title]}</h3>
                                            <p className="text-primary font-bold text-sm mt-1">{item[subtitle]}</p>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="bg-white p-6 md:p-8 md:pl-24 rounded-[2rem] border border-gray-100 shadow-sm group-hover:shadow-2xl transition-all">
                                        {/* Desktop Header */}
                                        <div className="hidden md:flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <h3 className="text-2xl font-black text-gray-900">{item[title]}</h3>
                                                <p className="text-primary font-bold text-lg">{item[subtitle]}</p>
                                            </div>
                                            <div className="flex items-center space-x-2 text-secondary font-black bg-gray-50 px-4 py-2 rounded-xl text-sm">
                                                <Calendar size={16} />
                                                <span>{(() => {
                                                    const p = item[period] || "";
                                                    const years = p.match(/\b20\d{2}\b/g);
                                                    return years ? years.join(' - ') : p;
                                                })()}</span>
                                            </div>
                                        </div>

                                        {/* Mobile Date */}
                                        <div className="md:hidden flex items-center gap-2 text-secondary font-bold text-xs bg-gray-50 p-2 rounded-lg w-fit">
                                            <Calendar size={14} />
                                            <span>{(() => {
                                                const p = item[period] || "";
                                                const years = p.match(/\b20\d{2}\b/g);
                                                return years ? years.join(' - ') : p;
                                            })()}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardWrapper>
                        </div>
                    ))}
                </div>
            </div>

            {/* Scroll Indicators */}
            {items.length > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    {items.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                scrollToIndex(i);
                                resetInactivityTimer();
                            }}
                            className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? `${colorClass} w-8` : 'bg-gray-300'
                                }`}
                            aria-label={`Go to item ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
