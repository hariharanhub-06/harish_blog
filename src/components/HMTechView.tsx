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
        transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
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
        transition: { duration: 0.6, ease: "backOut" }
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
        <main className="min-h-screen bg-black overflow-x-hidden pt-20 text-white selection:bg-blue-500/30">
            {/* Global Background Animation */}
            <TechParticles />

            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center p-6 overflow-hidden bg-transparent perspective-1000">
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/40 via-transparent to-black"></div>
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 mix-blend-overlay"></div>
                </div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="relative z-10 text-center max-w-5xl mx-auto space-y-8"
                >
                    <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-blue-500/30 bg-blue-900/20 backdrop-blur-md text-blue-300 font-bold text-sm tracking-[0.2em] uppercase mb-4 hover:bg-blue-900/40 transition-colors cursor-default hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                        HM Tech (Test Design)
                    </motion.div>

                    <motion.h1 variants={fadeInUp} className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-100 to-blue-900/50 tracking-tighter leading-[0.9] drop-shadow-2xl">
                        Building Digital <br />
                        <span className="text-white drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">Masterpieces.</span>
                    </motion.h1>

                    <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-blue-200/70 max-w-3xl mx-auto font-medium leading-relaxed">
                        Web • App • Software • Solutions form Coimbatore. <br />
                        <span className="text-blue-400 font-bold">200% Reasonable Pricing.</span> <span className="text-white">Faster delivery than you think.</span>
                    </motion.p>

                    <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-6 pt-8">
                        <a href="#contact" className="group px-10 py-5 bg-white text-black rounded-full font-black text-sm uppercase tracking-widest shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:scale-105 hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] transition-all flex items-center gap-3">
                            Start Project <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </a>
                        <a href="#services" className="px-10 py-5 bg-transparent border border-white/20 text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all backdrop-blur-sm">
                            Explore Services
                        </a>
                    </motion.div>
                </motion.div>
            </section>

            {/* Services Grid */}
            <section id="services" className="py-32 px-6 relative z-10 bg-transparent">
                <div className="container mx-auto max-w-7xl">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUp}
                        className="text-center mb-20 space-y-4"
                    >
                        <span className="text-blue-600 font-black tracking-widest uppercase text-sm">Our Capabilities</span>
                        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight">Our Expertise</h2>
                        <p className="text-xl text-blue-200/60 font-medium max-w-2xl mx-auto">
                            From simple static sites to complex ERP systems, we craft solutions that drive growth.
                        </p>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {services.map((service, index) => (
                            <motion.div
                                key={index}
                                variants={scaleIn}
                                className="group p-10 bg-white/5 backdrop-blur-sm rounded-[3rem] shadow-lg border border-white/5 hover:border-blue-500/30 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2"
                            >
                                <div className="w-20 h-20 rounded-3xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 shadow-inner group-hover:bg-blue-600 group-hover:text-white">
                                    <service.icon size={40} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-4 group-hover:text-blue-400 transition-colors">{service.title}</h3>
                                <p className="text-blue-100/50 font-medium leading-relaxed text-lg group-hover:text-blue-100/80">{service.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Travel Route (Process) */}
            <section className="py-32 px-6 bg-transparent text-white relative overflow-hidden">
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] mix-blend-screen animate-pulse"></div>
                    <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] mix-blend-screen animate-pulse animation-delay-2000"></div>
                </div>

                <div className="container mx-auto max-w-6xl relative z-10">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="text-center mb-24"
                    >
                        <span className="text-blue-400 font-black tracking-widest uppercase text-sm">Workflow</span>
                        <h2 className="text-5xl md:text-7xl font-black mt-4 tracking-tight">The Travel Route</h2>
                    </motion.div>

                    <div className="relative">
                        {/* Vertical Line */}
                        <motion.div
                            initial={{ height: 0 }}
                            whileInView={{ height: "100%" }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            className="absolute left-8 md:left-1/2 top-0 w-1 bg-gradient-to-b from-blue-500/0 via-blue-500 to-blue-500/0 rounded-full md:-translate-x-1/2 opacity-50"
                        ></motion.div>

                        <div className="space-y-16">
                            {steps.map((step, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''} group`}
                                >
                                    {/* Content */}
                                    <div className="flex-1 ml-24 md:ml-0 md:px-16">
                                        <div className={`p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300 ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'} group-hover:transform group-hover:scale-105`}>
                                            <h3 className="text-2xl md:text-3xl font-bold relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:from-blue-400 group-hover:to-purple-400 transition-all">{step}</h3>
                                        </div>
                                    </div>

                                    {/* Dot */}
                                    <div className="absolute left-8 md:left-1/2 w-12 h-12 md:-ml-6 rounded-full border-[6px] border-black bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.6)] z-20 flex items-center justify-center group-hover:scale-125 transition-transform duration-300">
                                        <div className="w-3 h-3 bg-white rounded-full group-hover:bg-blue-200 transition-colors"></div>
                                    </div>

                                    {/* Spacer for layout balance */}
                                    <div className="flex-1 hidden md:block"></div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Projects Gallery */}
            <section className="py-32 px-6 bg-transparent">
                <div className="container mx-auto max-w-7xl">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="text-center mb-20"
                    >
                        <span className="text-blue-600 font-black tracking-widest uppercase text-sm">Portfolio</span>
                        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight">Projects Done</h2>
                        <p className="text-blue-200/60 font-bold mt-4 text-xl">Selected works from our portfolio</p>
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
                                className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 border border-transparent hover:border-blue-500/30 flex flex-col hover:-translate-y-2"
                            >
                                <div className="relative h-72 overflow-hidden bg-gray-900">
                                    {project.thumbnail ? (
                                        <Image
                                            src={project.thumbnail}
                                            alt={project.title}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-700">
                                            <Layout size={48} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-100 group-hover:opacity-90 transition-opacity duration-300 flex items-end p-8">
                                        <div className="flex gap-2 flex-wrap transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                            {project.technologies?.slice(0, 3).map((tech: string, i: number) => (
                                                <span key={i} className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs text-white font-bold border border-white/10 shadow-sm">{tech}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 flex-1 flex flex-col bg-white">
                                    <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{project.title}</h3>
                                    <p className="text-gray-500 font-medium text-sm line-clamp-3 mb-8 flex-1 leading-relaxed">{project.description}</p>
                                    <a href={project.liveUrl || project.repoUrl || "#"} target="_blank" className="inline-flex items-center gap-2 text-gray-900 font-black uppercase tracking-widest text-xs hover:text-blue-600 hover:gap-4 transition-all">
                                        View Case Study <ArrowRight size={16} />
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Contact Form */}
            <section id="contact" className="py-32 px-6 bg-transparent relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none"></div>
                <div className="container mx-auto max-w-5xl relative z-10">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="bg-white/95 backdrop-blur-xl rounded-[3.5rem] p-8 md:p-20 shadow-2xl shadow-blue-900/20 border border-white/20 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                        <div className="text-center mb-16 relative z-10">
                            <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-6 animate-bounce-slow">
                                <Send size={32} />
                            </span>
                            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-4 tracking-tight">Start Your Project</h2>
                            <p className="text-xl text-gray-500 font-bold">1 Month Free Support • Faster Delivery • Premium Quality</p>
                        </div>

                        <form action="/api/contact" method="POST" className="space-y-8 relative z-10">
                            {/* Hidden Category Field */}
                            <input type="hidden" name="category" value="HM Tech" />

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-3 group">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-4 group-focus-within:text-blue-600 transition-colors">Name</label>
                                    <input required name="name" type="text" placeholder="John Doe" className="w-full bg-gray-50 border-2 border-transparent hover:bg-white hover:border-gray-200 focus:bg-white focus:border-blue-500 rounded-3xl p-5 font-bold text-gray-900 transition-all outline-none" />
                                </div>
                                <div className="space-y-3 group">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-4 group-focus-within:text-blue-600 transition-colors">Mobile Number</label>
                                    <input required name="mobile" type="tel" placeholder="+91 90423 87152" className="w-full bg-gray-50 border-2 border-transparent hover:bg-white hover:border-gray-200 focus:bg-white focus:border-blue-500 rounded-3xl p-5 font-bold text-gray-900 transition-all outline-none" />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-3 group">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-4 group-focus-within:text-blue-600 transition-colors">Email ID</label>
                                    <input required name="email" type="email" placeholder="john@example.com" className="w-full bg-gray-50 border-2 border-transparent hover:bg-white hover:border-gray-200 focus:bg-white focus:border-blue-500 rounded-3xl p-5 font-bold text-gray-900 transition-all outline-none" />
                                </div>
                                <div className="space-y-3 group">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-4 group-focus-within:text-blue-600 transition-colors">Website (Optional)</label>
                                    <input name="website" type="url" placeholder="https://yourbrand.com" className="w-full bg-gray-50 border-2 border-transparent hover:bg-white hover:border-gray-200 focus:bg-white focus:border-blue-500 rounded-3xl p-5 font-bold text-gray-900 transition-all outline-none" />
                                </div>
                            </div>

                            <div className="space-y-3 group">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-4 group-focus-within:text-blue-600 transition-colors">Social Media (Optional)</label>
                                <input name="socialMedia" type="text" placeholder="LinkedIn / Instagram URL" className="w-full bg-gray-50 border-2 border-transparent hover:bg-white hover:border-gray-200 focus:bg-white focus:border-blue-500 rounded-3xl p-5 font-bold text-gray-900 transition-all outline-none" />
                            </div>

                            <div className="space-y-3 group">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-4 group-focus-within:text-blue-600 transition-colors">Requirement</label>
                                <textarea required name="message" rows={4} placeholder="Describe your project needs..." className="w-full bg-gray-50 border-2 border-transparent hover:bg-white hover:border-gray-200 focus:bg-white focus:border-blue-500 rounded-3xl p-5 font-bold text-gray-900 transition-all resize-none outline-none" />
                            </div>

                            <button type="submit" className="w-full bg-gray-900 text-white py-6 rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-blue-600 transition-all shadow-xl shadow-gray-200 hover:shadow-blue-200 hover:-translate-y-1">
                                Send Request
                            </button>
                        </form>
                    </motion.div>
                </div>
            </section>
        </main>
    );
}
