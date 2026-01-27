"use client";

import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, Users, Presentation, Layers } from "lucide-react";
import { InfiniteCarousel } from "./InfiniteCarousel";

interface TrainingStatProps {
    icon: React.ElementType;
    value: string;
    label: string;
    color: string;
}

const TrainingStat = ({ icon: Icon, value, label, color }: TrainingStatProps) => (
    <div className="flex flex-col items-center justify-center p-4 md:p-6 bg-white/5 rounded-2xl md:rounded-3xl border border-white/10 hover:border-orange-500/30 transition-all duration-500 group">
        <div className={`w-10 h-10 md:w-12 md:h-12 ${color} rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform`}>
            <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
        <h3 className="text-2xl md:text-3xl font-black text-white mb-0.5 md:mb-1 tracking-tighter">{value}</h3>
        <p className="text-gray-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-center">{label}</p>
    </div>
);

const COLLEGES = [];
const SKILLS = [];

interface TrainingProgramsProps {
    trainingStats?: any[];
    partnerships: any[];
    skills: any[];
}

export function TrainingPrograms({ trainingStats = [], partnerships, skills }: TrainingProgramsProps) {
    // Filter for academic partners
    const academicPartners = partnerships.filter(p => p.partnerType === "Academic Partner" && p.isActive);

    // Find training-specific stats or use defaults if not found
    const sessionsStat = trainingStats.find(s => s.icon === "Presentation") || { value: "150+", label: "Expert Sessions" };
    const collegesStat = trainingStats.find(s => s.icon === "GraduationCap") || { value: "42+", label: "Partnered Colleges" };
    const studentsStat = trainingStats.find(s => s.icon === "Users") || { value: "5000+", label: "Minds Empowered" };

    return (
        <div className="w-full flex flex-col gap-4 md:gap-8 py-6 md:py-10">
            {/* Main Section Header */}
            <div className="flex flex-col items-center mb-2 md:mb-6 relative overflow-hidden w-full">
                <h2 className="text-[12vw] font-black text-outline absolute opacity-10 pointer-events-none select-none uppercase tracking-tighter -mt-8 md:-mt-12">ACADEMY</h2>
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter text-center relative z-10">
                    Training <span className="text-orange-600">Programs</span>
                </h2>
                <div className="w-16 md:w-20 h-1.5 md:h-2 bg-orange-600 mt-3 md:mt-4 rounded-full" />
            </div>

            {/* Stats Section */}
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
                    <TrainingStat
                        icon={Presentation}
                        value={sessionsStat.value}
                        label={sessionsStat.label}
                        color="bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                    />
                    <TrainingStat
                        icon={GraduationCap}
                        value={collegesStat.value}
                        label={collegesStat.label}
                        color="bg-orange-600 shadow-[0_0_20px_rgba(234,88,12,0.3)]"
                    />
                    <TrainingStat
                        icon={Users}
                        value={studentsStat.value}
                        label={studentsStat.label}
                        color="bg-purple-600 shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                    />
                </div>
            </div>

            {/* Marquees Section */}
            <div className="space-y-4 md:space-y-6">
                {/* College Logos */}
                {academicPartners.length > 0 && (
                    <div className="py-4 md:py-6 bg-white/5 border-y border-white/5 relative overflow-hidden backdrop-blur-sm">
                        <div className="absolute top-0 left-0 h-full w-8 md:w-20 bg-gradient-to-r from-[#0e0e0e] to-transparent z-10" />
                        <div className="absolute top-0 right-0 h-full w-8 md:w-20 bg-gradient-to-l from-[#0e0e0e] to-transparent z-10" />

                        <div className="flex flex-col gap-1 md:gap-2 px-6 mb-3 md:mb-4 text-center">
                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-orange-500/80">Collaborations</span>
                            <h4 className="text-lg md:text-xl font-black text-white uppercase tracking-tighter">Institution Experienced</h4>
                        </div>

                        <InfiniteCarousel
                            items={academicPartners.map((partner) => (
                                <div key={partner.id} className="flex items-center gap-3 md:gap-4 px-3 md:px-6 py-3 md:py-4 bg-white/5 rounded-xl md:rounded-2xl border border-white/10 hover:border-white/20 transition-colors w-[60vw] md:w-[20vw] h-full min-h-[80px]">
                                    {partner.logo && (
                                        <div className="relative w-8 h-8 md:w-10 md:h-10 shrink-0">
                                            <img src={partner.logo} alt={partner.name} className="object-contain w-full h-full" />
                                        </div>
                                    )}
                                    <span className="text-xs md:text-sm font-black text-white/70 uppercase tracking-widest whitespace-normal leading-tight">
                                        {partner.name}
                                    </span>
                                </div>
                            ))}
                        />
                    </div>
                )}

                <div className="py-4 md:py-6 bg-white/5 border-y border-white/5 relative overflow-hidden backdrop-blur-sm">
                    <div className="absolute top-0 left-0 h-full w-8 md:w-20 bg-gradient-to-r from-[#0e0e0e] to-transparent z-10" />
                    <div className="absolute top-0 right-0 h-full w-8 md:w-20 bg-gradient-to-l from-[#0e0e0e] to-transparent z-10" />

                    <div className="flex flex-col gap-1 md:gap-2 px-6 mb-3 md:mb-4 text-center">
                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-blue-500/80">Expertise Sharing</span>
                        <h4 className="text-lg md:text-xl font-black text-white uppercase tracking-tighter">Domain Skills</h4>
                    </div>

                    <InfiniteCarousel
                        items={skills.map((skill) => (
                            <div key={skill.id} className="flex items-center gap-3 md:gap-4 px-3 md:px-6 py-3 md:py-4 bg-white/5 rounded-xl md:rounded-2xl border border-white/10 hover:border-white/20 transition-colors w-[45vw] md:w-[16vw] h-full min-h-[70px]">
                                <span className="text-lg md:text-2xl w-8 h-8 md:w-10 md:h-10 flex items-center justify-center overflow-hidden shrink-0">
                                    {skill.icon && skill.icon.startsWith('http') ? (
                                        <img src={skill.icon} alt="" className="w-full h-full object-contain" />
                                    ) : (
                                        <span>{skill.icon || "⚙️"}</span>
                                    )}
                                </span>
                                <span className="text-xs md:text-sm font-black text-white/70 uppercase tracking-widest whitespace-normal leading-tight">
                                    {skill.name}
                                </span>
                            </div>
                        ))}
                    />
                </div>
            </div>
        </div>
    );
}
