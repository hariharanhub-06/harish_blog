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
    <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-3xl border border-white/10 hover:border-orange-500/30 transition-all duration-500 group">
        <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
            <Icon size={24} className="text-white" />
        </div>
        <h3 className="text-3xl font-black text-white mb-1 tracking-tighter">{value}</h3>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest text-center">{label}</p>
    </div>
);

const COLLEGES = [
    "IIT Madras", "Anna University", "PSG Tech", "Sathyabama", "VIT Vellore",
    "SRM University", "Loyola College", "Christ University", "MIT Manipal", "SSN College"
];

const SKILLS = [
    { name: "Next.js", icon: "⚡" },
    { name: "React", icon: "⚛️" },
    { name: "Node.js", icon: "🟢" },
    { name: "TypeScript", icon: "📘" },
    { name: "Tailwind", icon: "🎨" },
    { name: "Prisma", icon: "💎" },
    { name: "Drizzle", icon: "💧" },
    { name: "Automation", icon: "🤖" },
    { name: "CRM", icon: "🤝" },
    { name: "Strategy", icon: "📈" }
];

export function TrainingPrograms() {
    return (
        <div className="w-full flex flex-col gap-12 py-12">
            {/* Stats Section */}
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <TrainingStat
                        icon={Presentation}
                        value="150+"
                        label="Expert Sessions"
                        color="bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                    />
                    <TrainingStat
                        icon={GraduationCap}
                        value="42+"
                        label="Partnered Colleges"
                        color="bg-orange-600 shadow-[0_0_20px_rgba(234,88,12,0.3)]"
                    />
                    <TrainingStat
                        icon={Users}
                        value="5000+"
                        label="Future Leaders Mentored"
                        color="bg-purple-600 shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                    />
                </div>
            </div>

            {/* Marquees Section */}
            <div className="space-y-6">
                {/* College Logos */}
                <div className="py-8 bg-white/5 border-y border-white/5 relative overflow-hidden backdrop-blur-sm">
                    <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-[#0e0e0e] to-transparent z-10" />
                    <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-[#0e0e0e] to-transparent z-10" />

                    <div className="flex flex-col gap-2 px-6 mb-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500/80">Collaborations</span>
                        <h4 className="text-xl font-black text-white uppercase tracking-tighter">Trusted Institutions</h4>
                    </div>

                    <InfiniteCarousel
                        speed={30}
                        items={COLLEGES.map((college) => (
                            <div key={college} className="flex items-center gap-4 px-8 py-4 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
                                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xl font-bold text-white/40">
                                    {college.charAt(0)}
                                </div>
                                <span className="text-lg font-black text-white/60 uppercase tracking-widest whitespace-nowrap">
                                    {college}
                                </span>
                            </div>
                        ))}
                    />
                </div>

                {/* Skills Logos */}
                <div className="py-8 bg-white/5 border-y border-white/5 relative overflow-hidden backdrop-blur-sm">
                    <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-[#0e0e0e] to-transparent z-10" />
                    <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-[#0e0e0e] to-transparent z-10" />

                    <div className="flex flex-col gap-2 px-6 mb-4 text-right">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500/80">Skillset Sharing</span>
                        <h4 className="text-xl font-black text-white uppercase tracking-tighter">Domain Expertise</h4>
                    </div>

                    <InfiniteCarousel
                        speed={30}
                        items={SKILLS.map((skill) => (
                            <div key={skill.name} className="flex items-center gap-4 px-8 py-4 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
                                <span className="text-2xl">{skill.icon}</span>
                                <span className="text-lg font-black text-white/60 uppercase tracking-widest whitespace-nowrap">
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
