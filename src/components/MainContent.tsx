"use client";

import { motion } from "framer-motion";
import {
    ArrowRight, Code, Briefcase, Award, User,
    MapPin, Calendar, Mail, Phone, Send,
    CheckCircle2, Star, Github, ExternalLink,
    GraduationCap, Linkedin, HeartHandshake, Sparkles,
    MessageSquare, Gamepad2, Users, Clock, Target
} from "lucide-react";
import { InfiniteCarousel } from "./InfiniteCarousel";
import CardWrapper from "@/components/CardWrapper";
import DetailModal from "@/components/DetailModal";
import AboutHero from "@/components/AboutHero";
import Image from "next/image";
import { TrainingPrograms } from "./TrainingPrograms";
import { Tilt } from "./Tilt";
import { useEffect, useState, Suspense } from "react";
import FeedbackSection from "./FeedbackSection";
import dynamic from "next/dynamic";

const GamesCarousel = dynamic(() => import("@/components/GamesCarousel"), { ssr: false });
const GameOverlay = dynamic(() => import("@/components/GameOverlay"), { ssr: false });
import QuizGameOverlay from "@/components/QuizGameOverlay";
import TypingTestSection from "@/components/TypingTestSection";
import LiveSessionsCarousel from "./LiveSessionsCarousel";
import KnowAboutYouSection from "./KnowAboutYouSection";
const ClickEffect = dynamic(() => import("./ClickEffect"), { ssr: false });

interface Stat {
    icon: string;
    value: string | number;
    label: string;
}

interface Project {
    id: string;
    title: string;
    description: string;
    thumbnail?: string;
    imageUrl?: string;
    technologies?: string[];
    liveUrl?: string;
    repoUrl?: string;
    featured?: boolean;
}

interface Experience {
    id: string;
    role: string;
    company: string;
    duration: string;
    logo?: string;
}

interface Education {
    id: string;
    degree: string;
    institution: string;
    period: string;
    logo?: string;
}

interface Volunteering {
    id: string;
    role: string;
    organization: string;
    duration: string;
    logo?: string;
}

interface Profile {
    name: string | null;
    avatarUrl?: string | null;
    heroImageUrl?: string | null;
    about: string | null;
    location: string | null;
    aboutImageUrl?: string | null;
    audioUrl?: string | null;
    trainingStats?: Stat[];
    stats?: Stat[];
    // Visibility toggles
    showHeroSection?: boolean;
    showStatsSection?: boolean;
    showTrainingSection?: boolean;
    showExperienceSection?: boolean;
    showEducationSection?: boolean;
    showVolunteeringSection?: boolean;
    showAboutSection?: boolean;
    showProjectsSection?: boolean;
    showQuizzesSection?: boolean;
    showTypingTestSection?: boolean;
    showFeedbackSection?: boolean;
    showGamesSection?: boolean;
    showLiveSessionsSection?: boolean;
    showKnowAboutYouSection?: boolean;
    clickEffect?: string;
}

interface Partnership {
    id: string;
    name: string;
    logo: string | null;
    partnerType: string;
    isActive: boolean;
}

interface Quiz {
    id: string;
    title: string;
    description: string;
    category: string;
    coverImage: string;
    timeLimit: number;
    questions: any[];
}

interface LiveSession {
    id: string;
    title: string;
    description: string;
    price: number;
    startTime: string;
    duration: number;
    posterUrl: string;
    status: string;
}

interface Skill {
    id: string;
    name: string;
    icon: string | null;
}

interface MainContentProps {
    profile: Profile;
    stats: Stat[];
    projects: Project[];
    experiences: Experience[];
    educations: Education[];
    volunteerings: Volunteering[];
    partnerships?: Partnership[];
    skills?: Skill[];
    quizzes?: Quiz[];
    liveSessions?: LiveSession[];
    smileTask?: any;
    liveSmileTasks?: any[];
    clickEffect?: string;
}


export default function MainContent({
    profile: initialProfile,
    stats: initialStats,
    projects: initialProjects,
    experiences: initialExperiences,
    educations: initialEducations,
    volunteerings: initialVolunteerings,
    partnerships: initialPartnerships = [],
    skills: initialSkills = [],
    quizzes: initialQuizzes = [],
    liveSessions: initialLiveSessions = [],
    smileTask,
    liveSmileTasks = [],
    clickEffect = "none",
}: MainContentProps) {
    const [profile, setProfile] = useState(initialProfile);
    const [stats, setStats] = useState(initialStats || []);
    const [projects, setProjects] = useState(initialProjects || []);
    const [experiences, setExperiences] = useState(initialExperiences || []);
    const [educations, setEducations] = useState(initialEducations || []);
    const [volunteerings, setVolunteerings] = useState(initialVolunteerings || []);
    const [partnerships, setPartnerships] = useState(initialPartnerships || []);
    const [skills, setSkills] = useState(initialSkills || []);
    const [quizzes, setQuizzes] = useState(initialQuizzes || []);
    const [liveSessions, setLiveSessions] = useState(initialLiveSessions || []);

    const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
    const [isLiveJoin, setIsLiveJoin] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("All");

    const [loading, setLoading] = useState(!initialProfile || initialProjects?.length === 0);
    const [selectedItem, setSelectedItem] = useState<{ data: Project | Experience | Education | Volunteering, type: "project" | "experience" | "education" | "volunteering" } | null>(null);
    const [activeGameId, setActiveGameId] = useState<string | null>(null);

    useEffect(() => {
        if (!initialProfile || initialProjects?.length === 0) {
            const fetchHomeData = async () => {
                try {
                    const res = await fetch("/api/home");
                    const data = await res.json();
                    if (data.profile) setProfile(data.profile);
                    if (data.projects) setProjects(data.projects);
                    if (data.experiences) setExperiences(data.experiences);
                    if (data.educations) setEducations(data.educations);
                    if (data.volunteerings) setVolunteerings(data.volunteerings);
                    if (data.partnerships) setPartnerships(data.partnerships);
                    if (data.skills) setSkills(data.skills);
                    if (data.quizzes) setQuizzes(data.quizzes);
                    if (data.liveSessions) setLiveSessions(data.liveSessions);

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

    const iconMap: Record<string, React.ElementType> = { Briefcase, Code, Award, User };



    return (
        <div className="flex flex-col gap-4 pb-4 overflow-x-hidden">
            {/* Stats Section */}
            {profile.showStatsSection !== false && (
                <section id="stats" className="container mx-auto px-4 sm:px-6 py-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {loading ? (
                            [...Array(4)].map((_, i) => (
                                <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/10 shadow-sm animate-pulse h-32 flex flex-col justify-end">
                                    <div className="w-10 h-10 bg-white/10 rounded-2xl mb-4"></div>
                                    <div className="h-6 bg-white/10 rounded-md w-1/2 mb-1"></div>
                                    <div className="h-3 bg-white/5 rounded-md w-1/3"></div>
                                </div>
                            ))
                        ) : (
                            stats.map((stat: Stat, i: number) => {
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
                                        <div className="group p-6 bg-white/5 rounded-3xl border border-white/10 shadow-sm hover:shadow-2xl hover:border-white/20 transition-all duration-500 overflow-hidden relative h-full flex flex-col items-center text-center justify-center">
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
            )}

            {/* Know About You Section */}
            {profile.showKnowAboutYouSection !== false && (
                <KnowAboutYouSection smileTask={smileTask} smileTasks={liveSmileTasks} />
            )}

            {/* Live Sessions Carousel */}
            {profile.showLiveSessionsSection !== false && liveSessions.length > 0 && (
                <section id="live-sessions">
                    <Suspense fallback={null}>
                        <LiveSessionsCarousel sessions={liveSessions} />
                    </Suspense>
                </section>
            )}

            {/* Training Programs Section (Replaces Skill Carousel) */}
            {profile.showTrainingSection !== false && profile && (
                <section id="training">
                    <TrainingPrograms
                        trainingStats={profile.trainingStats as any}
                        partnerships={partnerships as any}
                        skills={skills as any}
                    />
                </section>
            )}


            {/* Experience Section */}
            {profile.showExperienceSection !== false && experiences.length > 0 && (
                <section id="experience" className="py-6 md:py-8 bg-white/5 border-y border-white/5 relative overflow-hidden backdrop-blur-sm">

                    <div className="flex flex-col items-center mb-4 text-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.35em] text-orange-500">Professional Journey</span>
                        <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter">Experience</h2>
                    </div>

                    <InfiniteCarousel
                        items={experiences.map((exp: any) => (
                            <div key={exp.id} className="flex flex-col md:flex-row items-center md:items-start gap-4 px-5 py-5 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-colors w-[82vw] sm:w-[60vw] md:w-[44vw] lg:w-[34vw] h-full min-h-[110px] justify-start text-left">
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
            {profile.showEducationSection !== false && educations.length > 0 && (
                <section id="education" className="py-6 md:py-8 bg-white/5 border-y border-white/5 relative overflow-hidden backdrop-blur-sm">

                    <div className="flex flex-col items-center mb-4 text-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.35em] text-orange-500">Academic Background</span>
                        <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter">Education</h2>
                    </div>

                    <InfiniteCarousel
                        items={educations.map((edu: Education) => (
                            <div key={edu.id} className="flex flex-col md:flex-row items-center md:items-start gap-4 px-5 py-5 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-colors w-[82vw] sm:w-[60vw] md:w-[44vw] lg:w-[34vw] h-full min-h-[110px] justify-start text-left">
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
            {profile.showVolunteeringSection !== false && volunteerings.length > 0 && (
                <section id="volunteering" className="py-6 md:py-8 bg-white/5 border-y border-white/5 relative overflow-hidden backdrop-blur-sm">

                    <div className="flex flex-col items-center mb-4 text-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.35em] text-orange-500">Community Impact</span>
                        <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter">Volunteering</h2>
                    </div>

                    <InfiniteCarousel
                        items={volunteerings.map((vol: Volunteering) => (
                            <div key={vol.id} className="flex flex-col md:flex-row items-center md:items-start gap-4 px-5 py-5 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-colors w-[82vw] sm:w-[60vw] md:w-[44vw] lg:w-[34vw] h-full min-h-[110px] justify-start text-left">
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
            {profile.showAboutSection !== false && (
                <section id="about" className="container mx-auto px-6 scroll-mt-20">
                    {profile && (
                        <AboutHero
                            name={profile.name as any}
                            about={profile.about as any}
                            location={profile.location as any}
                            imageUrl={profile.aboutImageUrl as any}
                            experience={profile.stats?.find((s: Stat) => s.label === "Years Experience")?.value?.toString() || "3+"}
                        />
                    )}

                </section>
            )}

            {/* Projects/Portfolio Section */}
            {profile.showProjectsSection !== false && (
                <section id="portfolio" className="container mx-auto px-6 scroll-mt-20 py-8">
                    <div className="flex flex-col items-center mb-6">
                        <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter">Featured <span className="text-orange-600">Projects</span></h2>
                        <div className="w-12 h-1 bg-orange-600 mt-2 rounded-full"></div>
                        <p className="mt-4 text-gray-400 text-base max-w-xl text-center font-bold">
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
                        <InfiniteCarousel
                            items={projects.map((project, i) => (
                                <div key={project.id} className="w-[85vw] md:w-[450px] h-full">
                                    <CardWrapper index={i}>
                                        <Tilt options={{ max: 10, speed: 400, glare: false }} className="h-full">
                                            <div
                                                className="group flex flex-col h-full bg-[#1a1a1a] rounded-3xl overflow-hidden border border-white/5 shadow-2xl hover:border-orange-600/30 transition-all duration-500 cursor-pointer"
                                                onClick={() => setSelectedItem({ data: project, type: "project" })}
                                            >
                                                <div className="relative h-64 overflow-hidden shrink-0">
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
                                                            <ExternalLink size={18} className="text-gray-600 hover:text-white transition-colors" />
                                                            <Github size={18} className="text-gray-600 hover:text-white transition-colors" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Tilt>
                                    </CardWrapper>
                                </div>
                            ))}
                        />
                    )}
                </section>
            )}

            {/* Feedback Section */}
            {/* Quiz Section */}
            {profile.showQuizzesSection !== false && quizzes.length > 0 && (
                <section id="quiz" className="py-8 md:py-12 bg-gradient-to-b from-transparent to-primary/5 relative overflow-hidden">

                    <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center mb-8 gap-6 relative z-10">
                        <div className="text-center md:text-left">
                            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-orange-500">Challenge Area</span>
                            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">Interactive <span className="text-primary italic">Quizzes</span></h2>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-4">
                            {/* Category Dropdown */}
                            <div className="relative group/dropdown">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="appearance-none bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pr-12 font-black text-xs uppercase tracking-[0.3em] text-white hover:border-primary/50 focus:border-primary transition-all outline-none cursor-pointer w-full sm:min-w-[200px]"
                                >
                                    <option value="All" className="bg-[#0e0e0e]">All Categories</option>
                                    {Array.from(new Set(quizzes.map(q => q.category))).filter(Boolean).map(cat => (
                                        <option key={cat} value={cat} className="bg-[#0e0e0e]">{cat}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 group-hover/dropdown:text-primary transition-colors">
                                    <ArrowRight size={16} className="rotate-90" />
                                </div>
                            </div>

                            <button
                                onClick={() => setIsLiveJoin(true)}
                                className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-black hover:text-white hover:border hover:border-white/20 transition-all shadow-xl shadow-white/5 group h-[58px]"
                            >
                                <Users size={18} className="group-hover:scale-110 transition-transform" /> Join Live Game
                            </button>
                        </div>
                    </div>

                    {/* Quizzes Carousel */}
                    {quizzes.length > 0 && (
                        <section className="w-full relative z-20 overflow-hidden">
                            <div className="container mx-auto px-6 mb-8">
                                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-primary">Slide to explore</span>
                                <h4 className="text-2xl font-black text-white uppercase tracking-tighter mt-1">Available <span className="text-blue-500">Challenges</span></h4>
                            </div>

                            <InfiniteCarousel
                                items={(() => {
                                    const filteredQuizzes = selectedCategory === "All"
                                        ? quizzes
                                        : quizzes.filter(q => q.category === selectedCategory);

                                    const count = filteredQuizzes.length;

                                    // If <= 5 quizzes, render in a single row
                                    if (count <= 5) {
                                        return filteredQuizzes.map((quiz) => (
                                            <div key={quiz.id} className="w-[280px] sm:w-[350px] md:w-[450px]">
                                                <div
                                                    onClick={() => setActiveQuiz(quiz)}
                                                    className="group relative bg-[#0e0e0e] rounded-[2rem] overflow-hidden border border-white/10 hover:border-primary/50 transition-all cursor-pointer flex flex-col shadow-2xl hover:-translate-y-1 duration-300 h-full"
                                                >
                                                    <div className="relative w-full aspect-[21/9] overflow-hidden">
                                                        {quiz.coverImage ? (
                                                            <Image src={quiz.coverImage} alt={quiz.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-60 group-hover:opacity-100" />
                                                        ) : (
                                                            <div className="w-full h-full bg-primary/10 flex items-center justify-center text-white/10">
                                                                <Gamepad2 size={40} />
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                                        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                                                            <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest text-primary border border-white/5">
                                                                {quiz.category || "General"}
                                                            </span>
                                                            <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/5 flex items-center gap-2">
                                                                <Clock size={12} className="text-primary" /> {quiz.timeLimit}s
                                                            </span>
                                                        </div>
                                                        <div className="absolute bottom-4 left-4 right-4 z-10">
                                                            <h3 className="text-lg font-black text-white group-hover:text-primary transition-colors leading-tight uppercase italic tracking-tighter line-clamp-1">
                                                                {quiz.title}
                                                            </h3>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ));
                                    }

                                    // If > 5 quizzes, distribute into two rows balanced
                                    // Example: 7 items -> 4 in first, 3 in second. 8 items -> 4 in first, 4 in second.
                                    const half = Math.ceil(count / 2);
                                    const firstRow = filteredQuizzes.slice(0, half);
                                    const secondRow = filteredQuizzes.slice(half);

                                    const columns = [];
                                    for (let i = 0; i < firstRow.length; i++) {
                                        columns.push({
                                            top: firstRow[i],
                                            bottom: secondRow[i] // Can be undefined if firstRow is longer
                                        });
                                    }

                                    return columns.map((col, colIdx) => (
                                        <div key={colIdx} className="flex flex-col gap-6 w-[280px] sm:w-[350px] md:w-[450px]">
                                            {/* Top Quiz */}
                                            <div
                                                onClick={() => setActiveQuiz(col.top)}
                                                className="group relative bg-[#0e0e0e] rounded-[2rem] overflow-hidden border border-white/10 hover:border-primary/50 transition-all cursor-pointer flex flex-col shadow-2xl hover:-translate-y-1 duration-300 h-full"
                                            >
                                                <div className="relative w-full aspect-[21/9] overflow-hidden">
                                                    {col.top.coverImage ? (
                                                        <Image src={col.top.coverImage} alt={col.top.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-60 group-hover:opacity-100" />
                                                    ) : (
                                                        <div className="w-full h-full bg-primary/10 flex items-center justify-center text-white/10">
                                                            <Gamepad2 size={40} />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                                                        <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest text-primary border border-white/5">
                                                            {col.top.category || "General"}
                                                        </span>
                                                        <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/5 flex items-center gap-2">
                                                            <Clock size={12} className="text-primary" /> {col.top.timeLimit}s
                                                        </span>
                                                    </div>
                                                    <div className="absolute bottom-4 left-4 right-4 z-10">
                                                        <h3 className="text-lg font-black text-white group-hover:text-primary transition-colors leading-tight uppercase italic tracking-tighter line-clamp-1">
                                                            {col.top.title}
                                                        </h3>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bottom Quiz (if exists) */}
                                            {col.bottom ? (
                                                <div
                                                    onClick={() => setActiveQuiz(col.bottom)}
                                                    className="group relative bg-[#0e0e0e] rounded-[2rem] overflow-hidden border border-white/10 hover:border-primary/50 transition-all cursor-pointer flex flex-col shadow-2xl hover:-translate-y-1 duration-300 h-full"
                                                >
                                                    <div className="relative w-full aspect-[21/9] overflow-hidden">
                                                        {col.bottom.coverImage ? (
                                                            <Image src={col.bottom.coverImage} alt={col.bottom.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-60 group-hover:opacity-100" />
                                                        ) : (
                                                            <div className="w-full h-full bg-primary/10 flex items-center justify-center text-white/10">
                                                                <Gamepad2 size={40} />
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                                        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                                                            <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest text-primary border border-white/5">
                                                                {col.bottom.category || "General"}
                                                            </span>
                                                            <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/5 flex items-center gap-2">
                                                                <Clock size={12} className="text-primary" /> {col.bottom.timeLimit}s
                                                            </span>
                                                        </div>
                                                        <div className="absolute bottom-4 left-4 right-4 z-10">
                                                            <h3 className="text-lg font-black text-white group-hover:text-primary transition-colors leading-tight uppercase italic tracking-tighter line-clamp-1">
                                                                {col.bottom.title}
                                                            </h3>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="invisible h-full min-h-[150px]" />
                                            )}
                                        </div>
                                    ));
                                })()}
                            />
                        </section>
                    )}
                </section>
            )}

            {/* Typing Test Section */}
            {profile.showTypingTestSection !== false && <section id="typing-test"><TypingTestSection /></section>}

            {profile.showFeedbackSection !== false && <section id="feedback"><FeedbackSection /></section>}

            {/* Games Section */}
            {profile.showGamesSection !== false && <section id="games"><GamesCarousel onPlayGame={setActiveGameId} /></section>}


            {
                activeQuiz && (
                    <QuizGameOverlay
                        quiz={activeQuiz}
                        onClose={() => setActiveQuiz(null)}
                    />
                )
            }

            {
                isLiveJoin && (
                    <QuizGameOverlay
                        quiz={null}
                        isLive={true}
                        onClose={() => setIsLiveJoin(false)}
                    />
                )
            }

            {
                selectedItem && (
                    <DetailModal
                        isOpen={!!selectedItem}
                        onClose={() => setSelectedItem(null)}
                        type={selectedItem.type}
                        data={selectedItem.data as any}
                    />
                )
            }

            {
                activeGameId && (
                    <GameOverlay
                        gameId={activeGameId}
                        onClose={() => setActiveGameId(null)}
                    />
                )
            }

            <ClickEffect style={clickEffect as any} />

        </div >
    );
}
