"use client";

import { motion } from "framer-motion";
import { MapPin, Briefcase, Zap, Target, Rocket } from "lucide-react";
import Image from "next/image";
import { Tilt } from "./Tilt";
import { cn } from "@/lib/utils";

interface AboutHeroProps {
    name: string;
    about: string;
    location: string;
    imageUrl?: string;
    experience?: string;
}

export default function AboutHero({ name, about, location, imageUrl, experience = "3+" }: AboutHeroProps) {
    const features = [
        { icon: Zap, text: "High Performance Solutions", color: "text-orange-500" },
        { icon: Target, text: "Business-Centric Logic", color: "text-blue-500" },
        { icon: Rocket, text: "Scalable Architecture", color: "text-purple-500" },
    ];

    return (
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center py-12 md:py-16">
            {/* Image Side (Left) */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative order-2 lg:order-1"
            >
                <div className="relative group">
                    {/* Decorative Background Elements */}
                    <div className="absolute -inset-4 bg-orange-600/20 rounded-[3rem] blur-2xl group-hover:bg-orange-600/30 transition-all duration-700 -z-10" />

                    <Tilt options={{ max: 10, speed: 400, "max-glare": 0.2 }}>
                        <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden border-4 border-white/5 shadow-2x shadow-black/50 bg-[#1a1a1a]">
                            {imageUrl ? (
                                <Image
                                    src={imageUrl}
                                    alt="About Me"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-1000 opacity-90 group-hover:opacity-100"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                    <span className="text-[15vw] font-black text-white/5">{name.charAt(0)}</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent opacity-60" />
                        </div>
                    </Tilt>

                    {/* Quick Stats Floating Card */}
                    <div className="absolute -bottom-10 right-0 md:-right-10 bg-white/5 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] border border-white/10 shadow-2xl animate-in fade-in slide-in-from-right-10 duration-1000 delay-500">
                        <div className="text-orange-600 font-black text-4xl mb-1">{experience}</div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Years <br />Experience</div>
                    </div>
                </div>
            </motion.div>

            {/* Text Side (Right) */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="space-y-8 order-1 lg:order-2"
            >
                <div className="space-y-4">
                    <span className="text-orange-600 font-black uppercase tracking-[0.3em] text-xs">My Background</span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1] tracking-tighter">
                        Innovating <br /> The <span className="text-outline-vibrant">Digital</span> <br /> Frontier.
                    </h2>
                </div>

                <p className="text-gray-400 text-base md:text-lg leading-relaxed font-bold max-w-xl">
                    {about}
                </p>

                <div className="grid gap-6 pt-4">
                    {features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-6 group">
                            <div className={cn("p-4 rounded-2xl bg-white/5 border border-white/10 transition-all duration-300 group-hover:scale-110", feature.color)}>
                                <feature.icon size={24} />
                            </div>
                            <span className="text-white font-black uppercase tracking-widest text-sm group-hover:text-orange-500 transition-colors">
                                {feature.text}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="flex flex-wrap gap-4 pt-6">
                    <div className="flex items-center space-x-3 text-white font-black bg-white/5 border border-white/10 px-6 py-3 rounded-full text-xs uppercase tracking-widest">
                        <MapPin size={16} className="text-orange-600" />
                        <span>{location}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-white font-black bg-white/5 border border-white/10 px-6 py-3 rounded-full text-xs uppercase tracking-widest">
                        <Briefcase size={16} className="text-blue-500" />
                        <span>Available for Hire</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
