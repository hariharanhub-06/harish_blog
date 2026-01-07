"use client";

import {
    Layout,
    Smartphone,
    Box,
    Video,
    ShoppingCart,
    Database,
    FileText,
    Users,
    PieChart,
    Calculator,
    ArrowRight,
    Send
} from "lucide-react";
import Image from "next/image";
import TechParticles from "@/components/TechParticles";
import { motion } from "framer-motion";

interface HMTechViewProps {
    projects: any[];
}

// Animation Variants
const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeOut" as const }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const scaleIn = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: { duration: 0.6, ease: "backOut" as const }
    }
};

export default function HMTechView({ projects }: HMTechViewProps) {
    const services = [
        { title: "Static/Dynamic Web", icon: Layout, desc: "High-performance websites tailored to your brand." },
        { title: "3D Animated", icon: Box, desc: "Immersive 3D experiences that captivate users." },
        { title: "Video Animated", icon: Video, desc: "Engaging video-driven storytelling interfaces." },
        { title: "E-Commerce", icon: ShoppingCart, desc: "Robust online stores with seamless payment integration." },
        { title: "Backend Integration", icon: Database, desc: "Secure and scalable server-side solutions." },
        { title: "Billing Software", icon: FileText, desc: "Automated invoicing and inventory management." },
        { title: "CRM Software", icon: Users, desc: "Customer relationship tools to boost sales." },
        { title: "ERP Software", icon: PieChart, desc: "Comprehensive enterprise resource planning." },
        { title: "Auditing/Accounting", icon: Calculator, desc: "Precision tools for financial management." },
    ];

    const steps = [
        "Project Initiation",
        "Requirement Gathering",
        "UI/UX Design Proposal",
        "Design Finalization",
        "Asset & Content Collection",
        "Development & Deployment",
        "Post-Launch Monitoring",
        "1-Year Technical Warranty",
        "Lifetime Affordable Support"
    ];

    return (
        <main className="min-h-screen bg-[#050505] overflow-x-hidden pt-20 text-white selection:bg-purple-500/30 font-sans">
            {/* Ambient Background Glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[150px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[150px] rounded-full animate-pulse animation-delay-2000"></div>
            </div>

            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center p-6 overflow-hidden">
                {/* Particle Background */}
                <div className="absolute inset-0 z-0 bg-[#050505]">
                    <TechParticles />
                    {/* Dark Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/30"></div>
                </div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="relative z-10 text-center max-w-6xl mx-auto space-y-10"
                >
                    <motion.div variants={fadeInUp} className="inline-flex items-center gap-3 px-8 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-white font-bold text-lg tracking-[0.15em] uppercase mb-4 hover:bg-white/10 transition-colors shadow-2xl">
                        <div className="relative w-8 h-8">
                            <Image src="/hm-tech-logo.png" alt="HM Tech Logo" fill className="object-contain" />
                        </div>
                        HM Tech
                    </motion.div>

                    <motion.h1 variants={fadeInUp} className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-[0.9] drop-shadow-2xl mix-blend-overlay">
                        Digital <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Evolution</span>
                    </motion.h1>

                    <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-medium leading-relaxed">
                        We craft <span className="text-white">Fluid Web Experiences</span> & <span className="text-white">Enterprise Solutions</span>. <br />
                        Reasonable Pricing. Unmatched Speed.
                    </motion.p>

                    <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-6 pt-10">
                        <a href="#contact" className="group px-12 py-5 bg-white text-black rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3 shadow-[0_0_50px_-10px_rgba(255,255,255,0.4)]">
                            Start Project <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </a>
                        <a href="#services" className="px-12 py-5 bg-white/5 border border-white/10 text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all backdrop-blur-md">
                            Our Services
                        </a>
                    </motion.div>
                </motion.div>
            </section>

            {/* Services Grid */}
            <section id="services" className="py-32 px-6 relative z-10">
                <div className="container mx-auto max-w-7xl">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUp}
                        className="text-center mb-24 space-y-6"
                    >
                        <span className="text-purple-400 font-bold tracking-[0.2em] uppercase text-sm">Capabilities</span>
                        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight">Our Expertise</h2>
                        <p className="text-xl text-gray-400 font-medium max-w-2xl mx-auto">
                            High-impact digital solutions tailored to your unique business needs.
                        </p>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {services.map((service, index) => (
                            <motion.div
                                key={index}
                                variants={scaleIn}
                                className="group p-10 bg-white/[0.03] backdrop-blur-sm rounded-[2rem] border border-white/[0.05] hover:border-purple-500/30 hover:bg-white/[0.08] transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors"></div>
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-800 to-black border border-white/10 text-white flex items-center justify-center mb-8 group-hover:scale-110 group-hover:border-purple-500/50 transition-all duration-500 shadow-2xl">
                                    <service.icon size={32} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">{service.title}</h3>
                                <p className="text-gray-400 font-medium leading-relaxed group-hover:text-gray-300">{service.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Travel Route (Bus Journey) */}
            <section className="py-32 px-6 relative z-10 overflow-hidden">
                <div className="container mx-auto max-w-6xl relative">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="text-center mb-32 relative z-20"
                    >
                        <span className="text-blue-400 font-bold tracking-[0.2em] uppercase text-sm">Process</span>
                        <h2 className="text-5xl md:text-7xl font-black mt-4 tracking-tight text-white">The Journey</h2>
                    </motion.div>

                    <div className="relative">
                        {/* Winding Road SVG */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-[300px] md:w-[600px] pointer-events-none opacity-40">
                            <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 600 1200">
                                <motion.path
                                    d="M 300 0 C 300 100 100 200 100 300 S 500 400 500 500 S 100 600 100 700 S 500 800 500 900 S 300 1100 300 1200"
                                    fill="none"
                                    stroke="url(#roadGradient)"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    initial={{ pathLength: 0 }}
                                    whileInView={{ pathLength: 1 }}
                                    viewport={{ once: true }} // Animate only once
                                    transition={{ duration: 2.5, ease: "easeInOut" }}
                                />
                                <defs>
                                    <linearGradient id="roadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                                        <stop offset="20%" stopColor="#3b82f6" />
                                        <stop offset="80%" stopColor="#a855f7" />
                                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>

                        {/* Moving Bus */}
                        {/* Note: True scroll-linked path animation requires complex motion value mapping. 
                            For this implementation, we will use a simplified sticky bus or timed animation 
                            as true scroll path following is complex in standard Framer Motion without custom hooks.
                            We will use a central floating bus that 'travels' as elements move up. */}
                        {/* Moving Bus */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] md:w-[600px] h-full pointer-events-none z-50 overflow-visible hidden md:block">
                            <motion.div
                                initial={{ offsetDistance: "0%" }}
                                whileInView={{ offsetDistance: "100%" }}
                                viewport={{ once: true }} // Animate once when in view
                                transition={{
                                    duration: 10, // Takes 10 seconds to drive down
                                    ease: "easeInOut"
                                }}
                                style={{
                                    offsetPath: "path('M 300 0 C 300 100 100 200 100 300 S 500 400 500 500 S 100 600 100 700 S 500 800 500 900 S 300 1100 300 1200')",
                                    position: 'absolute',
                                    top: 0,
                                    left: 0
                                }}
                                className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(234,179,8,0.6)] border-2 border-white/50"
                            >
                                <motion.div
                                    animate={{ rotate: [-2, 2, -2] }}
                                    transition={{ duration: 0.5, repeat: Infinity }}
                                >
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/80">
                                        <path d="M8 6v6" />
                                        <path d="M15 6v6" />
                                        <path d="M2 12h19.6" />
                                        <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" />
                                        <circle cx="7" cy="18" r="2" />
                                        <path d="M9 18h5" />
                                        <circle cx="17" cy="18" r="2" />
                                    </svg>
                                </motion.div>
                            </motion.div>
                        </div>

                        {/* Steps along the road */}
                        <div className="space-y-32 relative z-10 pt-20">
                            {steps.map((step, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className={`flex items-center ${index % 2 === 0 ? 'justify-start md:justify-start' : 'justify-end md:justify-end'} relative`}
                                >
                                    {/* Stop Sign / Marker */}
                                    <div className={`absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center ${index % 2 === 0 ? 'md:-translate-x-[200px]' : 'md:translate-x-[200px]'}`}>
                                        <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_10px_white] animate-pulse"></div>
                                        <div className="h-20 w-[1px] bg-gradient-to-b from-white/50 to-transparent"></div>
                                    </div>

                                    {/* Content Card */}
                                    <div className={`w-full md:w-[40%] ${index % 2 === 0 ? 'md:pr-20' : 'md:pl-20'}`}>
                                        <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] hover:border-blue-500/50 hover:bg-white/10 transition-all duration-300 shadow-2xl group">
                                            <div className="mb-4 text-xs font-black text-blue-500 uppercase tracking-widest">Stop {index + 1}</div>
                                            <h3 className="text-2xl md:text-3xl font-bold text-white group-hover:text-blue-300 transition-colors">{step}</h3>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Projects Gallery */}
            <section className="py-32 px-6 relative z-10">
                <div className="container mx-auto max-w-7xl">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="text-center mb-20"
                    >
                        <span className="text-pink-500 font-extrabold tracking-[0.3em] uppercase text-sm drop-shadow-md">WORK</span>
                        <h2 className="text-6xl md:text-8xl font-black text-white mt-4 tracking-tighter drop-shadow-2xl">Selected Projects</h2>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {projects.map((project: any) => (
                            <motion.div
                                key={project.id}
                                variants={scaleIn}
                                className="group bg-[#0A0A0A] rounded-[2rem] overflow-hidden border border-white/5 hover:border-pink-500/30 transition-all duration-500 flex flex-col hover:-translate-y-2 hover:shadow-2xl"
                            >
                                <div className="relative h-64 overflow-hidden">
                                    {project.thumbnail ? (
                                        <Image
                                            src={project.thumbnail}
                                            alt={project.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-800 bg-gray-900">
                                            <Layout size={40} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent opacity-80"></div>
                                    <div className="absolute bottom-4 left-4 flex gap-2 flex-wrap">
                                        {project.technologies?.slice(0, 3).map((tech: string, i: number) => (
                                            <span key={i} className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] text-white font-bold border border-white/5 uppercase tracking-wide">{tech}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-8 flex-1 flex flex-col">
                                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-pink-400 transition-colors">{project.title}</h3>
                                    <p className="text-gray-500 font-medium text-sm line-clamp-3 mb-8 flex-1 leading-relaxed">{project.description}</p>
                                    <a href={project.liveUrl || project.repoUrl || "#"} target="_blank" className="inline-flex items-center gap-2 text-white font-bold uppercase tracking-widest text-xs hover:text-pink-400 transition-all">
                                        View Case Study <ArrowRight size={14} />
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Contact Form */}
            <section id="contact" className="py-32 px-6 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="container mx-auto max-w-4xl relative z-10">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="bg-white/[0.02] backdrop-blur-2xl rounded-[3rem] p-8 md:p-16 border border-white/10 shadow-2xl relative overflow-hidden"
                    >
                        <div className="text-center mb-12">
                            <span className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white mb-6 shadow-lg shadow-purple-500/20">
                                <Send size={28} />
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Let's Build the Future</h2>
                            <p className="text-gray-400">Get a response within 24 hours.</p>
                        </div>

                        <form action="/api/contact" method="POST" className="space-y-6">
                            <input type="hidden" name="category" value="HM Tech" />

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 pl-4">Name</label>
                                    <input required name="name" type="text" placeholder="John Doe" className="w-full bg-black/50 border border-white/10 focus:border-purple-500 focus:bg-black/80 rounded-2xl p-4 text-white placeholder:text-gray-700 outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 pl-4">Mobile</label>
                                    <input required name="mobile" type="tel" placeholder="+91 00000 00000" className="w-full bg-black/50 border border-white/10 focus:border-purple-500 focus:bg-black/80 rounded-2xl p-4 text-white placeholder:text-gray-700 outline-none transition-all" />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 pl-4">Email</label>
                                    <input required name="email" type="email" placeholder="john@example.com" className="w-full bg-black/50 border border-white/10 focus:border-purple-500 focus:bg-black/80 rounded-2xl p-4 text-white placeholder:text-gray-700 outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 pl-4">Website</label>
                                    <input name="website" type="url" placeholder="https://" className="w-full bg-black/50 border border-white/10 focus:border-purple-500 focus:bg-black/80 rounded-2xl p-4 text-white placeholder:text-gray-700 outline-none transition-all" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 pl-4">Requirement</label>
                                <textarea required name="message" rows={4} placeholder="Tell us about your project..." className="w-full bg-black/50 border border-white/10 focus:border-purple-500 focus:bg-black/80 rounded-2xl p-4 text-white placeholder:text-gray-700 outline-none transition-all resize-none" />
                            </div>

                            <button type="submit" className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                                Send Request
                            </button>
                        </form>
                    </motion.div>
                </div>
            </section>
        </main>
    );
}
