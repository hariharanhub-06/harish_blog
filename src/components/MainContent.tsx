"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    ArrowRight, Code, Briefcase, Award, User,
    MapPin, Calendar, Mail, Phone, Send,
    CheckCircle2, Star, Github, ExternalLink,
    GraduationCap, Linkedin
} from "lucide-react";
import CardWrapper from "@/components/CardWrapper";
import DetailModal from "@/components/DetailModal";
import AboutHero from "@/components/AboutHero";
import Image from "next/image";

interface MainContentProps {
    profile: any;
    stats: any[];
    projects: any[];
    experiences: any[];
    educations: any[];
}

export default function MainContent({ profile, stats, projects, experiences, educations }: MainContentProps) {
    const [selectedItem, setSelectedItem] = useState<{ data: any, type: "project" | "experience" | "education" } | null>(null);
    const [contactStatus, setContactStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const iconMap: any = { Briefcase, Code, Award, User };

    const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setContactStatus("loading");
        // Simulate API call
        setTimeout(() => setContactStatus("success"), 2000);
    };

    const timeline = [
        ...experiences.map(exp => ({ ...exp, displayType: 'experience' as const })),
        ...educations.map(edu => ({ ...edu, displayType: 'education' as const }))
    ].sort((a, b) => (b.order || 0) - (a.order || 0));

    return (
        <div className="flex flex-col gap-32 pb-32">
            {/* Stats Section */}
            <section className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {stats.map((stat: any, i: number) => {
                        const Icon = iconMap[stat.icon] || User;
                        const colors = [
                            { color: "text-blue-600", bg: "bg-blue-50" },
                            { color: "text-emerald-600", bg: "bg-emerald-50" },
                            { color: "text-amber-600", bg: "bg-amber-50" },
                            { color: "text-purple-600", bg: "bg-purple-50" },
                        ];
                        const color = colors[i % colors.length];

                        return (
                            <CardWrapper key={i} index={i}>
                                <div className="group p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-white transition-all duration-500 overflow-hidden relative h-full">
                                    <span className="absolute -bottom-4 -right-2 text-9xl font-black text-gray-50 group-hover:text-gray-100 transition-colors -z-10">
                                        {String(stat.value).replace('+', '')}
                                    </span>

                                    <div className={`${color.bg} ${color.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform`}>
                                        <Icon size={28} />
                                    </div>
                                    <h3 className="text-4xl font-black text-gray-900 mb-2">{stat.value}</h3>
                                    <p className="text-secondary text-xs font-black uppercase tracking-widest leading-none">{stat.label}</p>
                                </div>
                            </CardWrapper>
                        );
                    })}
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="container mx-auto px-6 scroll-mt-32">
                <AboutHero
                    name={profile.name}
                    about={profile.about}
                    location={profile.location}
                />

                <div className="mt-32">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight uppercase">Career Timeline</h2>
                        <div className="w-24 h-2 bg-primary mx-auto rounded-full"></div>
                    </div>

                    <div className="relative space-y-12">
                        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-100 hidden md:block" />

                        {timeline.slice(0, 4).map((item, i) => (
                            <CardWrapper key={i} index={i}>
                                <div className="relative md:pl-24 group cursor-pointer" onClick={() => setSelectedItem({ data: item, type: item.displayType })}>
                                    <div className={`absolute left-0 md:left-4 top-0 w-16 h-16 ${item.displayType === 'experience' ? 'bg-blue-500' : 'bg-amber-500'} rounded-2xl flex items-center justify-center text-white shadow-xl z-10 group-hover:scale-110 transition-transform`}>
                                        {item.displayType === 'experience' ? <Briefcase size={28} /> : <GraduationCap size={28} />}
                                    </div>

                                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm group-hover:shadow-2xl transition-all">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                            <div>
                                                <h3 className="text-2xl font-black text-gray-900">{item.displayType === 'experience' ? item.role : item.degree}</h3>
                                                <p className="text-primary font-bold text-lg">{item.displayType === 'experience' ? item.company : item.institution}</p>
                                            </div>
                                            <div className="flex items-center space-x-2 text-secondary font-black bg-gray-50 px-4 py-2 rounded-xl text-sm">
                                                <Calendar size={16} />
                                                <span>{item.displayType === 'experience' ? item.duration : item.period}</span>
                                            </div>
                                        </div>
                                        <p className="text-secondary text-lg leading-relaxed font-normal line-clamp-2">{item.displayType === 'experience' ? item.description : item.details}</p>
                                        <div className="mt-6 flex items-center text-primary font-black text-sm uppercase tracking-widest gap-2 group-hover:gap-4 transition-all">
                                            <span>Read More</span>
                                            <ArrowRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            </CardWrapper>
                        ))}
                    </div>
                </div>
            </section>

            {/* Projects Section */}
            <section id="portfolio" className="container mx-auto px-6 scroll-mt-32">
                <div className="flex flex-col items-center mb-20">
                    <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight uppercase">Featured Projects</h2>
                    <div className="w-24 h-2 bg-accent rounded-full"></div>
                    <p className="mt-8 text-secondary text-lg max-w-2xl text-center font-medium">
                        Building digital products that combine stunning design with robust business logic.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {projects.map((project, i) => (
                        <CardWrapper key={project.id} index={i}>
                            <div
                                className="group flex flex-col h-full bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                                onClick={() => setSelectedItem({ data: project, type: "project" })}
                            >
                                <div className="relative h-64 overflow-hidden">
                                    {project.thumbnail ? (
                                        <Image src={project.thumbnail} alt={project.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                            <span className="text-primary font-black text-4xl opacity-20 uppercase tracking-widest">{project.title.charAt(0)}</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        {project.featured && (
                                            <span className="bg-accent text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">Featured</span>
                                        )}
                                    </div>
                                </div>

                                <div className="p-10 flex flex-col flex-grow text-left">
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {project.technologies?.slice(0, 3).map((tech: string) => (
                                            <span key={tech} className="text-[10px] font-black uppercase tracking-widest text-primary bg-blue-50 px-3 py-1 rounded-md">{tech}</span>
                                        ))}
                                    </div>

                                    <h3 className="text-2xl font-black mb-4 group-hover:text-primary transition-colors">{project.title}</h3>
                                    <p className="text-secondary text-base leading-relaxed mb-8 line-clamp-2">{project.description}</p>

                                    <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                                        <span className="text-primary font-black text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                                            View Case Study <ArrowRight size={14} />
                                        </span>
                                        <div className="flex gap-3">
                                            {project.liveUrl && <ExternalLink size={16} className="text-gray-300" />}
                                            {project.repoUrl && <Github size={16} className="text-gray-300" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardWrapper>
                    ))}
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="container mx-auto px-6 scroll-mt-32">
                <div className="bg-primary rounded-[4rem] p-12 md:p-32 text-center relative overflow-hidden shadow-2xl shadow-primary/30">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    <div className="grid lg:grid-cols-2 gap-20 items-center text-left">
                        <div className="space-y-12">
                            <h2 className="text-4xl md:text-7xl font-black text-white leading-tight tracking-tighter">
                                Let&apos;s Build <br /> Something <span className="text-accent italic">Extraordinary</span> Together.
                            </h2>
                            <p className="text-white/70 text-xl leading-relaxed max-w-xl">
                                I assist startups and established businesses in building scalable digital identities and automated workflows.
                            </p>

                            <div className="flex flex-col gap-6">
                                <div className="flex items-center space-x-6">
                                    <div className="bg-white/10 p-4 rounded-2xl text-accent border border-white/10">
                                        <Mail size={24} />
                                    </div>
                                    <p className="text-xl font-bold text-white">{profile.email || 'hariharan@example.com'}</p>
                                </div>
                                <div className="flex items-center space-x-6">
                                    <div className="bg-white/10 p-4 rounded-2xl text-blue-400 border border-white/10">
                                        <Linkedin size={24} />
                                    </div>
                                    <p className="text-xl font-bold text-white">LinkedIn Profile</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-2xl relative">
                            {contactStatus === "success" ? (
                                <div className="py-12 flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
                                    <div className="bg-green-50 text-green-600 p-8 rounded-full mb-8">
                                        <CheckCircle2 size={64} />
                                    </div>
                                    <p className="text-2xl font-black text-gray-900 mb-4">Message Sent!</p>
                                    <p className="text-secondary font-medium mb-8">I&apos;ll get back to you within 24 hours.</p>
                                    <button onClick={() => setContactStatus("idle")} className="text-primary font-black uppercase tracking-widest text-sm hover:underline">
                                        Send another
                                    </button>
                                </div>
                            ) : (
                                <form className="space-y-6" onSubmit={handleContactSubmit}>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Your Identity</label>
                                        <input required placeholder="Name or Organization" className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-primary transition-all font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Contact Method</label>
                                        <input required type="email" placeholder="Email Address" className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-primary transition-all font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Message</label>
                                        <textarea required rows={4} placeholder="How can I help you grow?" className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-primary transition-all font-bold" />
                                    </div>
                                    <button
                                        disabled={contactStatus === "loading"}
                                        className="w-full bg-primary text-white py-6 rounded-[2rem] font-black text-xl flex items-center justify-center space-x-3 shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50"
                                    >
                                        {contactStatus === "loading" ? <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <span>Start Conversation</span>}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {selectedItem && (
                <DetailModal
                    isOpen={!!selectedItem}
                    onClose={() => setSelectedItem(null)}
                    type={selectedItem.type}
                    data={selectedItem.data}
                />
            )}
        </div>
    );
}
