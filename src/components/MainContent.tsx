"use client";

import { motion } from "framer-motion";
import {
    ArrowRight, Code, Briefcase, Award, User,
    MapPin, Calendar, Mail, Phone, Send,
    CheckCircle2, Star, Github, ExternalLink,
    GraduationCap, Linkedin, HeartHandshake, Play, Sparkles, MessageSquare
} from "lucide-react";
import { InfiniteCarousel } from "./InfiniteCarousel";
import CardWrapper from "@/components/CardWrapper";
import DetailModal from "@/components/DetailModal";
import AboutHero from "@/components/AboutHero";
import Image from "next/image";
import { TrainingPrograms } from "./TrainingPrograms";
import { Tilt } from "./Tilt";
import { useEffect, useState } from "react";
import FeedbackSection from "./FeedbackSection";
import DinoRunnerGame from "./DinoRunnerGame";

interface MainContentProps {
    profile: any;
    stats: any[];
    projects: any[];
    videos: any[];
    experiences: any[];
    educations: any[];
    volunteerings: any[];
    partnerships?: any[];
    skills?: any[];
}

const SKILLS = [
    "Next.js", "React", "Typescript", "Tailwind CSS", "Node.js",
    "PostgreSQL", "Prisma", "Drizzle", "Framer Motion", "Three.js",
    "Digital Marketing", "Automation", "CRM Solutions", "Brand Identity"
];

export default function MainContent({
    profile: initialProfile,
    stats: initialStats,
    projects: initialProjects,
    videos: initialVideos,
    experiences: initialExperiences,
    educations: initialEducations,
    volunteerings: initialVolunteerings,
    partnerships: initialPartnerships = [],
    skills: initialSkills = []
}: MainContentProps) {
    const [profile, setProfile] = useState(initialProfile);
    const [stats, setStats] = useState(initialStats || []);
    const [projects, setProjects] = useState(initialProjects || []);
    const [videos, setVideos] = useState(initialVideos || []);
    const [experiences, setExperiences] = useState(initialExperiences || []);
    const [educations, setEducations] = useState(initialEducations || []);
    const [volunteerings, setVolunteerings] = useState(initialVolunteerings || []);
    const [partnerships, setPartnerships] = useState(initialPartnerships || []);
    const [skills, setSkills] = useState(initialSkills || []);

    const [loading, setLoading] = useState(!initialProfile || initialProjects?.length === 0);
    const [selectedItem, setSelectedItem] = useState<{ data: any, type: "project" | "experience" | "education" | "volunteering" } | null>(null);

    useEffect(() => {
        if (!initialProfile || initialProjects?.length === 0) {
            const fetchHomeData = async () => {
                try {
                    const res = await fetch("/api/home");
                    const data = await res.json();
                    if (data.profile) setProfile(data.profile);
                    if (data.projects) setProjects(data.projects);
                    if (data.videos) setVideos(data.videos);
                    if (data.experiences) setExperiences(data.experiences);
                    if (data.educations) setEducations(data.educations);
                    if (data.volunteerings) setVolunteerings(data.volunteerings);
                    if (data.partnerships) setPartnerships(data.partnerships);
                    if (data.skills) setSkills(data.skills);

                    if (data.profile && data.profile.stats) {
                        setStats(data.profile.stats);
                    }
                } catch (error) {
                    console.error("Failed to fetch home data:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchHomeData();
        }
    }, [initialProfile, initialProjects]);

    const iconMap: any = { Briefcase, Code, Award, User };



    return (
        <div className="flex flex-col gap-8 pb-4 overflow-x-hidden">
            {/* Stats Section */}
            <section className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {loading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/10 shadow-sm animate-pulse h-32 flex flex-col justify-end">
                                <div className="w-10 h-10 bg-white/10 rounded-2xl mb-4"></div>
                                <div className="h-6 bg-white/10 rounded-md w-1/2 mb-1"></div>
                                <div className="h-3 bg-white/5 rounded-md w-1/3"></div>
                            </div>
                        ))
                    ) : (
                        stats.map((stat: any, i: number) => {
                            const Icon = iconMap[stat.icon] || User;
                            const colors = [
                                { color: "text-blue-400", bg: "bg-blue-500/10" },
                                { color: "text-orange-500", bg: "bg-orange-500/10" },
                                { color: "text-purple-400", bg: "bg-purple-500/10" },
                                { color: "text-pink-400", bg: "bg-pink-500/10" },
                            ];
                            const color = colors[i % colors.length];

                            return (
                                <CardWrapper key={i} index={i}>
                                    <div className="group p-6 bg-white/5 rounded-3xl border border-white/10 shadow-sm hover:shadow-2xl hover:border-white/20 transition-all duration-500 overflow-hidden relative h-full">
                                        <span className="absolute -bottom-4 -right-2 text-8xl font-black text-white/5 group-hover:text-white/10 transition-colors -z-10">
                                            {String(stat.value).replace('+', '')}
                                        </span>

                                        <div className={`${color.bg} ${color.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
                                            <Icon size={24} />
                                        </div>
                                        <h3 className="text-3xl font-black text-white mb-1 tracking-tighter">{stat.value}</h3>
                                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest leading-none">{stat.label}</p>
                                    </div>
                                </CardWrapper>
                            );
                        })
                    )}
                </div>
            </section>

            {/* Training Programs Section (Replaces Skill Carousel) */}
            <TrainingPrograms
                trainingStats={profile.trainingStats}
                partnerships={partnerships}
                skills={skills}
            />

            {/* Experience Section */}
            {experiences.length > 0 && (
                <section className="py-12 bg-white/5 border-y border-white/5 relative overflow-hidden backdrop-blur-sm">
                    <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-[#0e0e0e] to-transparent z-10" />
                    <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-[#0e0e0e] to-transparent z-10" />

                    <div className="flex flex-col items-center mb-8 text-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500/80">Professional Journey</span>
                        <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Experience</h4>
                    </div>

                    <InfiniteCarousel
                        items={experiences.map((exp: any) => (
                            <div key={exp.id} className="flex flex-col md:flex-row items-center md:items-start gap-4 px-6 py-6 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-colors w-[85vw] md:w-[32vw] h-full min-h-[140px] justify-start text-left">
                                {exp.logo ? (
                                    <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-white p-1 shadow-sm">
                                        <Image src={exp.logo} alt={exp.company} fill className="object-contain" />
                                    </div>
                                ) : (
                                    <div className="w-12 h-12 shrink-0 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-500 shadow-sm shadow-blue-500/10">
                                        <Briefcase size={20} />
                                    </div>
                                )}
                                <div className="flex flex-col text-center md:text-left flex-1 min-w-0 w-full">
                                    <h4 className="text-sm font-black text-white uppercase tracking-tight leading-snug break-words whitespace-normal">{exp.role}</h4>
                                    <p className="text-[10px] md:text-xs font-bold text-white/50 uppercase tracking-wide mt-1.5 leading-relaxed break-words whitespace-normal">{exp.company}</p>
                                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-2">{exp.duration}</span>
                                </div>
                            </div>
                        ))}
                    />
                </section>
            )}

            {/* Education Section */}
            {educations.length > 0 && (
                <section className="py-12 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-[#0e0e0e] to-transparent z-10" />
                    <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-[#0e0e0e] to-transparent z-10" />

                    <div className="flex flex-col items-center mb-8 text-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/80">Academic Background</span>
                        <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Education</h4>
                    </div>

                    <InfiniteCarousel
                        items={educations.map((edu: any) => (
                            <div key={edu.id} className="flex flex-col md:flex-row items-center md:items-start gap-4 px-6 py-6 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-colors w-[85vw] md:w-[32vw] h-full min-h-[140px] justify-start text-left">
                                {edu.logo ? (
                                    <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-white p-1 shadow-sm">
                                        <Image src={edu.logo} alt={edu.institution} fill className="object-contain" />
                                    </div>
                                ) : (
                                    <div className="w-12 h-12 shrink-0 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-500 shadow-sm shadow-amber-500/10">
                                        <GraduationCap size={20} />
                                    </div>
                                )}
                                <div className="flex flex-col text-center md:text-left flex-1 min-w-0 w-full">
                                    <h4 className="text-sm font-black text-white uppercase tracking-tight leading-snug break-words whitespace-normal">{edu.degree}</h4>
                                    <p className="text-[10px] md:text-xs font-bold text-white/50 uppercase tracking-wide mt-1.5 leading-relaxed break-words whitespace-normal">{edu.institution}</p>
                                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-2">{edu.period}</span>
                                </div>
                            </div>
                        ))}
                    />
                </section>
            )}

            {/* Volunteering Section */}
            {volunteerings.length > 0 && (
                <section className="py-12 bg-white/5 border-y border-white/5 relative overflow-hidden backdrop-blur-sm">
                    <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-[#0e0e0e] to-transparent z-10" />
                    <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-[#0e0e0e] to-transparent z-10" />

                    <div className="flex flex-col items-center mb-8 text-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-500/80">Community Impact</span>
                        <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Volunteering</h4>
                    </div>

                    <InfiniteCarousel
                        items={volunteerings.map((vol: any) => (
                            <div key={vol.id} className="flex flex-col md:flex-row items-center md:items-start gap-4 px-6 py-6 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-colors w-[85vw] md:w-[32vw] h-full min-h-[140px] justify-start text-left">
                                {vol.logo ? (
                                    <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-white p-1 shadow-sm">
                                        <Image src={vol.logo} alt={vol.organization} fill className="object-contain" />
                                    </div>
                                ) : (
                                    <div className="w-12 h-12 shrink-0 bg-teal-500/20 rounded-xl flex items-center justify-center text-teal-500 shadow-sm shadow-teal-500/10">
                                        <HeartHandshake size={20} />
                                    </div>
                                )}
                                <div className="flex flex-col text-center md:text-left flex-1 min-w-0 w-full">
                                    <h4 className="text-sm font-black text-white uppercase tracking-tight leading-snug break-words whitespace-normal">{vol.role}</h4>
                                    <p className="text-[10px] md:text-xs font-bold text-white/50 uppercase tracking-wide mt-1.5 leading-relaxed break-words whitespace-normal">{vol.organization}</p>
                                    <span className="text-[10px] font-black text-teal-500 uppercase tracking-widest mt-2">{vol.duration}</span>
                                </div>
                            </div>
                        ))}
                    />
                </section>
            )}

            {/* About Section */}
            <section id="about" className="container mx-auto px-6 scroll-mt-20">
                <AboutHero
                    name={profile.name}
                    about={profile.about}
                    location={profile.location}
                    imageUrl={profile.aboutImageUrl}
                    experience={profile.stats?.find((s: any) => s.label === "Years Experience")?.value || "3+"}
                />

                {/* YouTube Videos Section */}
                {videos.length > 0 && (
                    <section className="container mx-auto px-6 py-20 bg-black/20 rounded-[3rem] border border-white/5 my-12 overflow-hidden relative">
                        <div className="flex flex-col items-center mb-16">
                            <h2 className="text-[12vw] font-black text-outline absolute opacity-10 pointer-events-none select-none uppercase tracking-tighter -mt-20">STUDIO</h2>
                            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter text-center relative z-10">
                                Watch My <span className="text-orange-600">Videos</span>
                            </h2>
                            <div className="w-24 h-2 bg-orange-600 mt-6 rounded-full" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {videos.map((video, i) => (
                                <CardWrapper key={video.id} index={i}>
                                    <div className="group relative bg-[#1a1a1a] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl hover:border-orange-600/40 transition-all duration-500 flex flex-col h-full">
                                        <div className="relative aspect-video overflow-hidden">
                                            <img
                                                src={`https://img.youtube.com/vi/${video.youtubeVideoId}/maxresdefault.jpg`}
                                                alt={video.title}
                                                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
                                                <div className="bg-orange-600 p-6 rounded-full shadow-[0_0_40px_rgba(234,88,12,0.5)]">
                                                    <Play size={36} fill="white" className="text-white ml-1" />
                                                </div>
                                            </div>
                                            <div className="absolute top-4 left-4">
                                                <div className="bg-orange-600/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-lg">
                                                    <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">{video.category || "Main"}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-8 flex flex-col flex-grow">
                                            <h3 className="text-2xl font-black text-white line-clamp-2 leading-tight group-hover:text-orange-500 transition-colors mb-4">
                                                {video.title}
                                            </h3>
                                            <p className="text-gray-400 text-sm font-bold line-clamp-2 mb-8 leading-relaxed italic opacity-60">
                                                {video.description || "Check out this video on my channel where I explore digital excellence and innovation."}
                                            </p>
                                            <div className="mt-auto pt-6 border-t border-white/5">
                                                <a
                                                    href={`https://youtube.com/watch?v=${video.youtubeVideoId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 text-orange-600 font-black text-xs uppercase tracking-[0.2em] group-hover:gap-5 transition-all"
                                                >
                                                    Watch Now <ArrowRight size={16} />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </CardWrapper>
                            ))}
                        </div>
                    </section>
                )}
            </section>

            {/* Projects/Portfolio Section */}
            <section id="portfolio" className="container mx-auto px-6 scroll-mt-20 py-20">
                <div className="flex flex-col items-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">Featured <span className="text-orange-600">Projects</span></h2>
                    <div className="w-20 h-1.5 bg-orange-600 mt-4 rounded-full"></div>
                    <p className="mt-6 text-gray-400 text-base max-w-xl text-center font-bold">
                        Building digital products that combine stunning design with robust business logic.
                    </p>
                </div>

                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white/5 rounded-3xl overflow-hidden border border-white/10 h-80 animate-pulse">
                                <div className="h-56 bg-white/10"></div>
                                <div className="p-5 flex flex-col gap-2">
                                    <div className="w-1/2 h-4 bg-white/10 rounded"></div>
                                    <div className="w-full h-8 bg-white/5 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project, i) => (
                            <CardWrapper key={project.id} index={i}>
                                <Tilt options={{ max: 10, speed: 400, glare: false }} className="h-full">
                                    <div
                                        className="group flex flex-col h-full bg-[#1a1a1a] rounded-3xl overflow-hidden border border-white/5 shadow-2xl hover:border-orange-600/30 transition-all duration-500 cursor-pointer"
                                        onClick={() => setSelectedItem({ data: project, type: "project" })}
                                    >
                                        <div className="relative h-64 overflow-hidden">
                                            {project.thumbnail ? (
                                                <Image src={project.thumbnail} alt={project.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100" />
                                            ) : (
                                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                                                    <span className="text-white font-black text-4xl opacity-20 uppercase tracking-widest">{project.title.charAt(0)}</span>
                                                </div>
                                            )}
                                            <div className="absolute top-4 right-4 flex gap-2">
                                                {project.featured && (
                                                    <span className="bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">Featured</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-6 flex flex-col flex-grow text-left">
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {project.technologies?.slice(0, 3).map((tech: string) => (
                                                    <span key={tech} className="text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-500/10 px-3 py-1.5 rounded-md">{tech}</span>
                                                ))}
                                            </div>

                                            <h3 className="text-2xl font-black text-white mb-2 group-hover:text-orange-500 transition-colors leading-tight">{project.title}</h3>
                                            <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-2 font-bold">{project.description}</p>

                                            <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                                <span className="text-orange-600 font-black text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                                                    View Case Study <ArrowRight size={16} />
                                                </span>
                                                <div className="flex gap-4">
                                                    {project.liveUrl && <ExternalLink size={18} className="text-gray-600 hover:text-white transition-colors" />}
                                                    {project.repoUrl && <Github size={18} className="text-gray-600 hover:text-white transition-colors" />}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Tilt>
                            </CardWrapper>
                        ))}
                    </div>
                )}
            </section>

            {/* Feedback Section */}
            <FeedbackSection />

            {/* DinoRunnerGame Section */}
            <DinoRunnerGame />


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
