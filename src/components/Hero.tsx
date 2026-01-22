"use client";

import { motion } from "framer-motion";
import { Youtube, Twitter, Instagram, MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { MagneticButton } from "./MagneticButton";
import { Tilt } from "./Tilt";
import { cn } from "@/lib/utils";

interface HeroProps {
    profile: {
        name: string;
        headline: string | null;
        avatarUrl: string | null;
        heroImageUrl: string | null;
    };
    className?: string;
}

export default function Hero({ profile, className }: HeroProps) {
    const socialLinks = [
        { icon: MessageCircle, href: "#", color: "hover:bg-blue-500" },
        { icon: Twitter, href: "#", color: "hover:bg-blue-400" },
        { icon: Instagram, href: "#", color: "hover:bg-pink-500" },
        { icon: Youtube, href: "#", color: "hover:bg-red-600" },
    ];

    return (
        <section className={cn("relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#0e0e0e] pt-20", className)}>
            {/* Large Background Outline Text */}
            <div className="absolute inset-0 flex items-center justify-start pointer-events-none select-none overflow-hidden z-0 pl-[10%] opacity-10">
                <motion.h2
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="text-[10vw] font-black text-outline uppercase leading-none whitespace-nowrap"
                >
                    {profile.name.split(" ").slice(0, 1).join(" ")}
                </motion.h2>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
                    {/* Character/Portrait Side */}
                    <div className="order-2 lg:order-1 flex justify-center lg:justify-end">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, type: "spring" }}
                            className="relative"
                        >
                            {/* Decorative circular element */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-transparent rounded-full blur-3xl -z-10" />

                            <Tilt options={{ max: 10, speed: 400, glare: true, "max-glare": 0.2 }}>
                                <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-[380px] lg:h-[380px] rounded-full overflow-hidden border-4 md:border-8 border-white/5 shadow-2xl">
                                    {profile.avatarUrl ? (
                                        <Image
                                            src={profile.avatarUrl}
                                            alt={profile.name}
                                            fill
                                            className="object-cover"
                                            priority
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                            <span className="text-white text-6xl font-black">{profile.name.charAt(0)}</span>
                                        </div>
                                    )}
                                </div>
                            </Tilt>
                        </motion.div>
                    </div>

                    {/* Content Side */}
                    <div className="order-1 lg:order-2 space-y-6 lg:space-y-8 text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="text-orange-500 font-black uppercase tracking-[0.4em] text-[10px] md:text-xs">Hello, my name is</span>
                            <h1 className="flex flex-col mt-4 font-black tracking-tighter text-white">
                                <span className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl leading-none whitespace-nowrap">Hari Haran</span>
                                <span className="text-[6.5vw] md:text-6xl lg:text-7xl xl:text-8xl leading-none text-orange-600 whitespace-nowrap">Jeyaramamoorthy</span>
                            </h1>
                            <p className="max-w-2xl mx-auto mt-6 text-xs font-bold leading-relaxed tracking-widest text-gray-400 uppercase md:text-sm lg:text-base lg:mx-0">
                                {profile.headline || "I'm a Developer & Creative"}
                            </p>
                        </motion.div>

                        {/* Social Icons Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="flex items-center justify-center lg:justify-start gap-4"
                        >
                            {socialLinks.map((social, i) => (
                                <Link
                                    key={i}
                                    href={social.href}
                                    className={cn(
                                        "w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/60 transition-all duration-300 border border-white/10 shadow-lg",
                                        social.color,
                                        "hover:text-white hover:scale-110 hover:border-transparent"
                                    )}
                                >
                                    <social.icon size={20} />
                                </Link>
                            ))}
                        </motion.div>

                        {/* CTA Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-4"
                        >
                            <MagneticButton>
                                <Link
                                    href="#contact"
                                    className="px-10 py-4 bg-orange-600 text-white font-black rounded-lg uppercase tracking-widest text-sm hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 flex items-center gap-3 group"
                                >
                                    Let&apos;s Talk
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </MagneticButton>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Bottom Gradient Fade */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0e0e0e] to-transparent pointer-events-none" />
        </section>
    );
}
