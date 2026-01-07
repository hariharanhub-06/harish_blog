"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Github, Calendar, MapPin, Briefcase, GraduationCap, HeartHandshake } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

interface DetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
    type: "project" | "experience" | "education" | "volunteering";
}

export default function DetailModal({ isOpen, onClose, data, type }: DetailModalProps) {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!data) return null;

    const getColor = (t: string) => {
        if (t === 'experience') return 'bg-blue-500';
        if (t === 'education') return 'bg-amber-500';
        return 'bg-teal-500';
    };

    const getIcon = (t: string) => {
        if (t === 'experience') return <Briefcase size={32} />;
        if (t === 'education') return <GraduationCap size={32} />;
        return <HeartHandshake size={32} />;
    };

    const getTitle = (t: string, d: any) => {
        if (t === 'experience') return d.role;
        if (t === 'education') return d.degree;
        return d.role;
    };

    const getSubtitle = (t: string, d: any) => {
        if (t === 'experience') return d.company;
        if (t === 'education') return d.institution;
        return d.organization;
    };

    const getPeriod = (t: string, d: any) => {
        if (t === 'education') return d.period;
        return d.duration;
    };

    const getDescription = (t: string, d: any) => {
        if (t === 'education') return d.details;
        return d.description;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-gray-900/80 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 z-10 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white md:text-gray-900 md:bg-gray-100 md:hover:bg-gray-200 rounded-full transition-all"
                        >
                            <X size={24} />
                        </button>

                        <div className="overflow-y-auto custom-scrollbar">
                            {type === "project" ? (
                                <div className="flex flex-col">
                                    <div className="relative h-64 md:h-96 w-full">
                                        {data.thumbnail ? (
                                            <Image src={data.thumbnail} alt={data.title} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-primary/20 text-8xl font-black">
                                                {data.title.charAt(0)}
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <div className="absolute bottom-8 left-8 right-8">
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {data.technologies?.map((tech: string) => (
                                                    <span key={tech} className="text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full border border-white/20">{tech}</span>
                                                ))}
                                            </div>
                                            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">{data.title}</h2>
                                        </div>
                                    </div>
                                    <div className="p-8 md:p-12 space-y-8">
                                        <div className="prose prose-lg max-w-none text-secondary">
                                            <p className="whitespace-pre-wrap leading-relaxed">{data.description}</p>
                                        </div>

                                        <div className="flex flex-wrap gap-4 pt-8 border-t border-gray-100">
                                            {data.liveUrl && (
                                                <a href={data.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 bg-primary text-white px-8 py-4 rounded-2xl font-black transition-all hover:bg-blue-800 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-1">
                                                    <ExternalLink size={20} />
                                                    <span>View Live Site</span>
                                                </a>
                                            )}
                                            {data.repoUrl && (
                                                <a href={data.repoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black transition-all hover:bg-black hover:shadow-xl hover:-translate-y-1">
                                                    <Github size={20} />
                                                    <span>View Code</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 md:p-16">
                                    <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12">
                                        <div className={`w-20 h-20 rounded-3xl ${getColor(type)} flex items-center justify-center text-white shadow-xl flex-shrink-0`}>
                                            {getIcon(type)}
                                        </div>
                                        <div>
                                            <h2 className="text-4xl font-black text-gray-900 mb-2">{getTitle(type, data)}</h2>
                                            <p className="text-xl font-bold text-primary">{getSubtitle(type, data)}</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                                        <div className="bg-gray-50 p-6 rounded-3xl flex items-center space-x-4">
                                            <Calendar className="text-primary" size={24} />
                                            <div>
                                                <p className="text-xs font-black uppercase text-secondary tracking-widest">Period</p>
                                                <p className="text-lg font-bold text-gray-900">{getPeriod(type, data)}</p>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 p-6 rounded-3xl flex items-center space-x-4">
                                            <MapPin className="text-accent" size={24} />
                                            <div>
                                                <p className="text-xs font-black uppercase text-secondary tracking-widest">Location</p>
                                                <p className="text-lg font-bold text-gray-900">{data.location || "Remote"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="prose prose-lg max-w-none text-secondary">
                                        <h3 className="text-gray-900 font-black mb-4">Description & Achievements</h3>
                                        <p className="whitespace-pre-wrap leading-relaxed">
                                            {getDescription(type, data)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
