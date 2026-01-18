"use client";

import { motion } from "framer-motion";
import {
    ArrowRight, Code, Briefcase, Award, User,
    MapPin, Calendar, Mail, Phone, Send,
    CheckCircle2, Star, Github, ExternalLink,
    GraduationCap, Linkedin, HeartHandshake
} from "lucide-react";
import CardWrapper from "@/components/CardWrapper";
import DetailModal from "@/components/DetailModal";
import AboutHero from "@/components/AboutHero";
import TimelineCarousel from "@/components/TimelineCarousel";
import Image from "next/image";
import { InfiniteCarousel } from "./InfiniteCarousel";
import { Tilt } from "./Tilt";
import { useEffect, useState } from "react";

interface MainContentProps {
    profile: any;
    stats: any[];
    projects: any[];
    experiences: any[];
    educations: any[];
    volunteerings: any[];
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
    experiences: initialExperiences,
    educations: initialEducations,
    volunteerings: initialVolunteerings
}: MainContentProps) {
    const [profile, setProfile] = useState(initialProfile);
    const [stats, setStats] = useState(initialStats || []);
    const [projects, setProjects] = useState(initialProjects || []);
    const [experiences, setExperiences] = useState(initialExperiences || []);
    const [educations, setEducations] = useState(initialEducations || []);
    const [volunteerings, setVolunteerings] = useState(initialVolunteerings || []);

    const [loading, setLoading] = useState(!initialProfile || initialProjects?.length === 0);
    const [selectedItem, setSelectedItem] = useState<{ data: any, type: "project" | "experience" | "education" | "volunteering" } | null>(null);
    const [contactStatus, setContactStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

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

                    // Re-calculate stats if profile changed
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

    const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setContactStatus("loading");

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name"),
            company: formData.get("company"),
            email: formData.get("email"), // Mail ID
            mobile: formData.get("mobile"),
            website: formData.get("website"),
            socialMedia: formData.get("socialMedia"),
            subject: "Portfolio Contact Form",
            message: formData.get("message"),
        };

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                setContactStatus("success");
            } else {
                setContactStatus("error");
            }
        } catch (error) {
            console.error("Contact form error:", error);
            setContactStatus("error");
        }
    };



    return (
        <div className="flex flex-col gap-8 pb-4">
            {/* Stats Section */}
            <section className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {loading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm animate-pulse h-32 flex flex-col justify-end">
                                <div className="w-10 h-10 bg-gray-100 rounded-2xl mb-4"></div>
                                <div className="h-6 bg-gray-100 rounded-md w-1/2 mb-1"></div>
                                <div className="h-3 bg-gray-50 rounded-md w-1/3"></div>
                            </div>
                        ))
                    ) : (
                        stats.map((stat: any, i: number) => {
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
                                    <div className="group p-5 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:border-white transition-all duration-500 overflow-hidden relative h-full">
                                        <span className="absolute -bottom-4 -right-2 text-8xl font-black text-gray-50 group-hover:text-gray-100 transition-colors -z-10">
                                            {String(stat.value).replace('+', '')}
                                        </span>

                                        <div className={`${color.bg} ${color.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
                                            <Icon size={20} />
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900 mb-1">{stat.value}</h3>
                                        <p className="text-secondary text-[9px] font-black uppercase tracking-widest leading-none">{stat.label}</p>
                                    </div>
                                </CardWrapper>
                            );
                        })
                    )}
                </div>
            </section>

            {/* Infinite Skill Carousel */}
            <div className="py-2 border-y border-gray-50 bg-white/50 backdrop-blur-sm">
                <InfiniteCarousel
                    speed={120}
                    items={SKILLS.map(skill => (
                        <span key={skill} className="text-sm font-black uppercase tracking-[0.3em] text-gray-400/60 hover:text-primary transition-colors cursor-default select-none">
                            {skill}
                        </span>
                    ))}
                />
            </div>

            {/* About Section */}
            <section id="about" className="container mx-auto px-6 scroll-mt-20">
                <AboutHero
                    name={profile.name}
                    about={profile.about}
                    location={profile.location}
                    imageUrl={profile.aboutImageUrl}
                    experience={profile.stats?.find((s: any) => s.label === "Years Experience")?.value || "3+"}
                />

                {/* Professional Experience Section */}
                {experiences.length > 0 && (
                    <div className="mt-6 md:mt-8">
                        <div className="text-center mb-8 px-4">
                            <h2 className="text-xl md:text-3xl font-black mb-3 tracking-tight uppercase break-words px-2 leading-tight">Professional Experience</h2>
                            <div className="w-12 md:w-16 h-1 md:h-1.5 bg-blue-500 mx-auto rounded-full"></div>
                        </div>
                        <TimelineCarousel
                            items={[...experiences].sort((a, b) => {
                                const getYear = (p: string) => {
                                    if (!p) return 0;
                                    if (p.includes("Present")) return 9999;
                                    const years = p.match(/\b20\d{2}\b/g);
                                    return years ? Math.max(...years.map(Number)) : 0;
                                };
                                return getYear(b.duration) - getYear(a.duration) || (b.order || 0) - (a.displayOrder || 0);
                            })}
                            type="experience"
                            onItemClick={(item) => setSelectedItem({ data: item, type: 'experience' })}
                            colorClass="bg-blue-500"
                            Icon={Briefcase}
                        />
                    </div>
                )}

                {/* Education Section */}
                {educations.length > 0 && (
                    <div className="mt-6 md:mt-8">
                        <div className="text-center mb-8 px-4">
                            <h2 className="text-xl md:text-3xl font-black mb-3 tracking-tight uppercase break-words px-2 leading-tight">Education</h2>
                            <div className="w-12 md:w-16 h-1 md:h-1.5 bg-amber-500 mx-auto rounded-full"></div>
                        </div>
                        <TimelineCarousel
                            items={[...educations].sort((a, b) => {
                                const getYear = (p: string) => {
                                    if (!p) return 0;
                                    if (p.includes("Present")) return 9999;
                                    const years = p.match(/\b20\d{2}\b/g);
                                    return years ? Math.max(...years.map(Number)) : 0;
                                };
                                return getYear(b.period) - getYear(a.period) || (b.displayOrder || 0) - (a.displayOrder || 0);
                            })}
                            type="education"
                            onItemClick={(item) => setSelectedItem({ data: item, type: 'education' })}
                            colorClass="bg-amber-500"
                            Icon={GraduationCap}
                        />
                    </div>
                )}

                {/* Volunteering Section */}
                {volunteerings && volunteerings.length > 0 && (
                    <div className="mt-6 md:mt-8">
                        <div className="text-center mb-8 px-4">
                            <h2 className="text-xl md:text-3xl font-black mb-3 tracking-tight uppercase break-words px-2 leading-tight">Volunteering</h2>
                            <div className="w-12 md:w-16 h-1 md:h-1.5 bg-teal-500 mx-auto rounded-full"></div>
                        </div>
                        <TimelineCarousel
                            items={[...volunteerings].sort((a, b) => {
                                const getYear = (p: string) => {
                                    if (!p) return 0;
                                    if (p.includes("Present")) return 9999;
                                    const years = p.match(/\b20\d{2}\b/g);
                                    return years ? Math.max(...years.map(Number)) : 0;
                                };
                                return getYear(b.duration) - getYear(a.duration) || (b.order || 0) - (a.displayOrder || 0);
                            })}
                            type="volunteering"
                            onItemClick={(item) => setSelectedItem({ data: item, type: 'volunteering' })}
                            colorClass="bg-teal-500"
                            Icon={HeartHandshake}
                        />
                    </div>
                )}
            </section>

            {/* Projects Section */}
            <section id="portfolio" className="container mx-auto px-6 scroll-mt-20">
                <div className="flex flex-col items-center mb-8">
                    <h2 className="text-xl md:text-3xl font-black mb-3 tracking-tight uppercase">Featured Projects</h2>
                    <div className="w-16 h-1.5 bg-accent rounded-full"></div>
                    <p className="mt-4 text-secondary text-sm max-w-xl text-center font-medium">
                        Building digital products that combine stunning design with robust business logic.
                    </p>
                </div>

                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-3xl overflow-hidden border border-gray-100 h-80 animate-pulse">
                                <div className="h-56 bg-gray-100"></div>
                                <div className="p-5 flex flex-col gap-2">
                                    <div className="w-1/2 h-4 bg-gray-100 rounded"></div>
                                    <div className="w-full h-8 bg-gray-50 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project, i) => (
                            <CardWrapper key={project.id} index={i}>
                                <Tilt options={{ max: 10, speed: 400, glare: true, "max-glare": 0.2 }} className="h-full">
                                    <div
                                        className="group flex flex-col h-full bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer"
                                        onClick={() => setSelectedItem({ data: project, type: "project" })}
                                    >
                                        <div className="relative h-56 overflow-hidden">
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

                                        <div className="p-5 flex flex-col flex-grow text-left">
                                            <div className="flex flex-wrap gap-1.5 mb-3">
                                                {project.technologies?.slice(0, 3).map((tech: string) => (
                                                    <span key={tech} className="text-[9px] font-black uppercase tracking-widest text-primary bg-blue-50 px-2.5 py-1 rounded-md">{tech}</span>
                                                ))}
                                            </div>

                                            <h3 className="text-lg font-black mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                                            <p className="text-secondary text-xs leading-relaxed mb-4 line-clamp-2">{project.description}</p>

                                            <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
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
                                </Tilt>
                            </CardWrapper>
                        ))}
                    </div>
                )}
            </section>


            {/* Contact Section */}
            <section id="contact" className="container mx-auto px-6 scroll-mt-20">
                <div className="bg-primary rounded-3xl p-6 md:p-8 text-center relative overflow-hidden shadow-2xl shadow-primary/30">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    <div className="grid lg:grid-cols-2 gap-8 items-center text-left">
                        <div className="space-y-6">
                            <h2 className="text-2xl md:text-4xl font-black text-white leading-tight tracking-tighter">
                                Let&apos;s Build <br /> Something <span className="text-accent italic">Extraordinary</span> Together.
                            </h2>
                            <p className="text-white/70 text-base leading-relaxed max-w-lg">
                                I assist startups and established businesses in building scalable digital identities and automated workflows.
                            </p>

                            <div className="flex flex-col gap-4">
                                <a href="mailto:hariharanjeyaramoorthy@gmail.com" className="flex items-center space-x-4 group">
                                    <div className="bg-white/10 p-3 rounded-2xl text-accent border border-white/10 group-hover:bg-white/20 transition-colors">
                                        <Mail size={20} />
                                    </div>
                                    <p className="text-lg font-bold text-white break-all">hariharanjeyaramoorthy@gmail.com</p>
                                </a>

                                <a href="https://wa.me/919042387152" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-4 group">
                                    <div className="bg-white/10 p-3 rounded-2xl text-green-400 border border-white/10 group-hover:bg-white/20 transition-colors">
                                        <Phone size={20} />
                                    </div>
                                    <p className="text-lg font-bold text-white">+91 90423 87152</p>
                                </a>

                                <a href="https://www.linkedin.com/in/hari-haran-jeyaramamoorthy/" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-4 group">
                                    <div className="bg-white/10 p-3 rounded-2xl text-blue-400 border border-white/10 group-hover:bg-white/20 transition-colors">
                                        <Linkedin size={20} />
                                    </div>
                                    <p className="text-lg font-bold text-white">LinkedIn</p>
                                </a>

                                <a href="https://www.instagram.com/_mr_vibrant/" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-4 group">
                                    <div className="bg-white/10 p-3 rounded-2xl text-pink-400 border border-white/10 group-hover:bg-white/20 transition-colors">
                                        <div className="w-5 h-5 flex items-center justify-center font-black">IG</div>
                                    </div>
                                    <p className="text-lg font-bold text-white">Instagram</p>
                                </a>

                                <a href="https://www.facebook.com/profile.php?id=61573749598737" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-4 group">
                                    <div className="bg-white/10 p-3 rounded-2xl text-blue-600 border border-white/10 group-hover:bg-white/20 transition-colors">
                                        <div className="w-5 h-5 flex items-center justify-center font-black">FB</div>
                                    </div>
                                    <p className="text-lg font-bold text-white">Facebook</p>
                                </a>
                            </div>
                        </div>

                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl relative">
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
                                <form className="space-y-4 md:space-y-6" onSubmit={handleContactSubmit}>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Name</label>
                                        <input name="name" required placeholder="Your Name or Organization" className="w-full bg-gray-50 border-0 rounded-2xl p-4 md:p-5 focus:ring-2 focus:ring-primary transition-all font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Company Name <span className="text-gray-300 lowercase text-[9px]">(optional)</span></label>
                                        <input name="company" placeholder="Ex: Acme Corp" className="w-full bg-gray-50 border-0 rounded-2xl p-4 md:p-5 focus:ring-2 focus:ring-primary transition-all font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Mail ID</label>
                                        <input name="email" required type="email" placeholder="example@email.com" className="w-full bg-gray-50 border-0 rounded-2xl p-4 md:p-5 focus:ring-2 focus:ring-primary transition-all font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Mobile Number</label>
                                        <input name="mobile" required type="tel" placeholder="+91 90423 87152" className="w-full bg-gray-50 border-0 rounded-2xl p-4 md:p-5 focus:ring-2 focus:ring-primary transition-all font-bold" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Website <span className="text-gray-300 lowercase text-[9px]">(opt)</span></label>
                                            <input name="website" placeholder="https://" className="w-full bg-gray-50 border-0 rounded-2xl p-4 md:p-5 focus:ring-2 focus:ring-primary transition-all font-bold text-sm" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Social Media <span className="text-gray-300 lowercase text-[9px]">(opt)</span></label>
                                            <input name="socialMedia" placeholder="@handle" className="w-full bg-gray-50 border-0 rounded-2xl p-4 md:p-5 focus:ring-2 focus:ring-primary transition-all font-bold text-sm" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Message</label>
                                        <textarea name="message" required rows={4} placeholder="How can I help you grow?" className="w-full bg-gray-50 border-0 rounded-2xl p-4 md:p-5 focus:ring-2 focus:ring-primary transition-all font-bold" />
                                    </div>
                                    <button
                                        disabled={contactStatus === "loading"}
                                        className="w-full bg-primary text-white py-4 rounded-xl font-black text-lg md:text-xl flex items-center justify-center space-x-3 shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50"
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
