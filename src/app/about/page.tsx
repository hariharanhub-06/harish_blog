"use client";

import { motion } from "framer-motion";
import { Briefcase, GraduationCap, MapPin, Calendar, ArrowRight } from "lucide-react";

const timeline = [
    {
        type: "work",
        title: "Partnerships Manager",
        company: "Handyman Technologies",
        period: "2022 – 2025",
        description: "Led team of 17; established partnerships with 42 colleges, dramatically expanding market reach.",
        icon: Briefcase,
        color: "bg-blue-500",
    },
    {
        type: "work",
        title: "Branch Manager (Freelance)",
        company: "ICA Edu Skills",
        period: "2024 – 2025",
        description: "Spearheaded branch operations and strategic growth via aggressive marketing and mentorship.",
        icon: Briefcase,
        color: "bg-emerald-500",
    },
    {
        type: "education",
        title: "Bachelor of Engineering (Mechanical)",
        company: "Kathir College of Engineering",
        period: "2017 – 2021",
        description: "Grade A; Basketball Captain; Class Representative. Developed strong leadership foundation.",
        icon: GraduationCap,
        color: "bg-amber-500",
    },
];

export default function About() {
    return (
        <div className="container mx-auto px-6 py-24 max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tight">
                        The Journey of <br />
                        <span className="text-primary italic">Innovation</span> and <span className="text-accent underline decoration-8 underline-offset-8">Growth</span>.
                    </h1>
                    <p className="text-xl text-secondary leading-relaxed mb-8 font-medium">
                        I specialize in bridges. Whether it&apos;s bridging the gap between business needs and technical solutions,
                        or connecting talent with opportunity, I drive results through strategic management and direct technical expertise.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center space-x-2 text-primary font-black bg-blue-50 px-4 py-2 rounded-xl">
                            <MapPin size={18} />
                            <span>Tamil Nadu, India</span>
                        </div>
                        <div className="flex items-center space-x-2 text-accent font-black bg-amber-50 px-4 py-2 rounded-xl">
                            <Briefcase size={18} />
                            <span>3+ Years Experience</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative"
                >
                    <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 rounded-[4rem] relative overflow-hidden flex items-center justify-center p-12">
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />
                        <div className="text-primary font-black text-[12vw] opacity-20">HHJ</div>
                        {/* Decorative floating cards */}
                        <div className="absolute top-10 right-0 glass p-6 rounded-3xl shadow-xl animate-bounce-slow">
                            <p className="text-xs font-black uppercase text-secondary mb-1 tracking-widest">Colleges</p>
                            <p className="text-2xl font-black text-primary">42+</p>
                        </div>
                        <div className="absolute bottom-10 left-0 glass p-6 rounded-3xl shadow-xl animate-bounce-slow-delayed">
                            <p className="text-xs font-black uppercase text-secondary mb-1 tracking-widest">Team size</p>
                            <p className="text-2xl font-black text-accent">17</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            <section>
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-6xl font-black mb-4">Career Timeline</h2>
                    <div className="w-24 h-2 bg-primary mx-auto rounded-full"></div>
                </div>

                <div className="relative space-y-12">
                    {/* Vertical Line */}
                    <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-100 hidden md:block" />

                    {timeline.map((item, i) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="relative md:pl-24 group"
                        >
                            {/* Icon marker */}
                            <div className={`absolute left-0 md:left-4 top-0 w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center text-white shadow-xl z-10 group-hover:scale-110 transition-transform`}>
                                <item.icon size={28} />
                            </div>

                            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm group-hover:shadow-2xl transition-all">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900">{item.title}</h3>
                                        <p className="text-primary font-bold text-lg">{item.company}</p>
                                    </div>
                                    <div className="flex items-center space-x-2 text-secondary font-black bg-gray-50 px-4 py-2 rounded-xl text-sm">
                                        <Calendar size={16} />
                                        <span>{item.period}</span>
                                    </div>
                                </div>
                                <p className="text-secondary text-lg leading-relaxed font-normal">{item.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            <section className="mt-40 text-center">
                <h2 className="text-3xl md:text-5xl font-black mb-12">Want the full picture?</h2>
                <Link href="/resume" className="inline-flex items-center space-x-4 bg-gray-900 text-white px-12 py-6 rounded-3xl font-black text-xl hover:bg-black transition-all shadow-2xl hover:-translate-y-2">
                    <span>Download Resume</span>
                    <ArrowRight size={24} />
                </Link>
            </section>
        </div>
    );
}
