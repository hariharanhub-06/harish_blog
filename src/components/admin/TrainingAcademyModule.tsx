"use client";

import { useState } from "react";
import { GraduationCap, BookOpen, Settings2, Sparkles, Layout } from "lucide-react";
import ProfileModule from "./ProfileModule";
import PartnershipsModule from "./PartnershipsModule";
import SkillsModule from "./SkillsModule";
import ProjectsModule from "./ProjectsModule";

type SubTab = "portfolio" | "colleges" | "skills";

export default function TrainingAcademyModule() {
    const [activeSubTab, setActiveSubTab] = useState<SubTab>("portfolio");

    const tabs = [
        { id: "portfolio", title: "Portfolio Projects", icon: Layout, color: "text-amber-600", bg: "bg-amber-50" },
        { id: "colleges", title: "Academic Partners", icon: GraduationCap, color: "text-blue-500", bg: "bg-blue-50" },
        { id: "skills", title: "Domain Skills", icon: BookOpen, color: "text-purple-500", bg: "bg-purple-50" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32" />
                <div className="relative z-10">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="p-4 bg-primary/10 text-primary rounded-2xl shadow-inner">
                            <GraduationCap size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Training <span className="text-primary italic">Academy</span></h2>
                            <p className="text-secondary font-medium text-xs uppercase tracking-[0.2em]">The Central Command for your Education & Mentorship Impact.</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveSubTab(tab.id as SubTab)}
                                className={`flex items-center space-x-3 px-6 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${activeSubTab === tab.id
                                    ? "bg-gray-900 text-white shadow-xl shadow-gray-900/20 translate-y-[-2px]"
                                    : "bg-gray-50 text-secondary hover:bg-gray-100 hover:text-gray-900"
                                    }`}
                            >
                                <div className={`p-1.5 rounded-lg ${activeSubTab === tab.id ? "bg-white/10" : tab.bg}`}>
                                    <tab.icon size={14} className={activeSubTab === tab.id ? "text-white" : tab.color} />
                                </div>
                                <span>{tab.title}</span>
                                {activeSubTab === tab.id && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary ml-1 shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Dynamic Content Area */}
            <div className="relative">
                {activeSubTab === "portfolio" && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <ProjectsModule />
                    </div>
                )}

                {activeSubTab === "colleges" && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <PartnershipsModule allowedTypes={['Academic Partner']} />
                    </div>
                )}

                {activeSubTab === "skills" && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <SkillsModule />
                    </div>
                )}
            </div>
        </div>
    );
}
