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

            {/* Process / Journey Section (Digital Circuit) */}
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
                        <h2 className="text-5xl md:text-7xl font-black mt-4 tracking-tight text-white">The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Flow</span></h2>
                    </motion.div>

                    <div className="relative">
                        {/* Digital Circuit Line (Center) */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-[40px] md:w-[100px] pointer-events-none z-0">
                            {/* Glowing Core Line */}
                            <div className="absolute inset-x-0 top-0 bottom-0 w-[2px] mx-auto bg-gradient-to-b from-blue-500/20 via-purple-500/50 to-blue-500/20 blur-sm"></div>
                            <div className="absolute inset-x-0 top-0 bottom-0 w-[1px] mx-auto bg-gradient-to-b from-blue-400/10 via-white/50 to-blue-400/10"></div>

                            {/* Moving Data Packet */}
                            <motion.div
                                className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-20 bg-gradient-to-b from-transparent via-cyan-400 to-transparent blur-md z-10"
                                animate={{
                                    top: ["0%", "100%"],
                                    opacity: [0, 1, 1, 0]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "linear",
                                    repeatDelay: 0.5
                                }}
                            />
                            <motion.div
                                className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-10 bg-white z-20"
                                animate={{
                                    top: ["0%", "100%"]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "linear",
                                    repeatDelay: 0.5
                                }}
                            />
                        </div>

                        {/* Steps (Server Nodes) */}
                        <div className="space-y-24 relative z-10 pt-10">
                            {steps.map((step, index) => (
                                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'justify-start md:justify-end md:pr-16' : 'justify-end md:justify-start md:pl-16'} relative`}>

                                    {/* Central Node Marker (Absolute Center) */}
                                    <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
                                        <div className="w-6 h-6 rounded-full bg-[#050505] border-2 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.5)] z-20 flex items-center justify-center">
                                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                        </div>
                                        {/* Connector Line to Card */}
                                        <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 w-16 h-[1px] bg-blue-500/30 ${index % 2 === 0 ? 'right-full bg-gradient-to-l' : 'left-full bg-gradient-to-r'} from-blue-500 to-transparent`}></div>
                                    </div>

                                    {/* Content Card */}
                                    <motion.div
                                        initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true, margin: "-50px" }}
                                        whileHover={{ scale: 1.02 }}
                                        className={`w-[calc(50%-20px)] md:w-[45%] relative group ${index % 2 === 0 ? 'mr-auto md:mr-0' : 'ml-auto md:ml-0'}`}
                                    >
                                        <div className="absolute inset-0 bg-blue-500/5 rounded-2xl blur-xl group-hover:bg-blue-500/10 transition-colors"></div>
                                        <div className="relative p-6 md:p-8 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl hover:border-blue-500/50 transition-all duration-300">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="text-[10px] font-mono text-blue-400 uppercase tracking-widest">
                                                    Node_0{index + 1}
                                                </div>
                                                <div className="flex gap-1">
                                                    <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                                                    <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                                                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                                                </div>
                                            </div>
                                            <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-blue-200 transition-colors font-mono">
                                                {step}
                                            </h3>
                                        </div>
                                    </motion.div>
                                </div>
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
