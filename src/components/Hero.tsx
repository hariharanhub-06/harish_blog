"use client";

import { motion } from "framer-motion";
import { Mail, Instagram, MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { MagneticButton } from "./MagneticButton";
import { Tilt } from "./Tilt";
import { cn } from "@/lib/utils";

interface HeroProps {
    profile: {
        name: any;
        headline: any;
        avatarUrl: any;
        heroImageUrl: any;
    };
    className?: string;
}

export default function Hero({ profile, className }: HeroProps) {
    const socialLinks = [
        { icon: MessageCircle, href: "https://wa.me/919042387152", color: "hover:bg-green-500" },
        { icon: Instagram, href: "https://instagram.com/_mr_vibrant", color: "hover:bg-pink-500" },
        { icon: Mail, href: "mailto:hariharanjeyaramamoorthy@gmail.com", color: "hover:bg-orange-600" },
    ];

    return (
        <section className={cn("relative min-h-[90vh] lg:min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#0e0e0e] pt-5", className)}>
            {/* Hero Background Image */}
            {profile.heroImageUrl && (
                <div className="absolute inset-0 z-0">
                    <Image
                        src={profile.heroImageUrl}
                        alt="Hero background"
                        fill
                        className="object-cover opacity-30"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0e0e0e]/80 via-[#0e0e0e]/60 to-[#0e0e0e]" />
                </div>
            )}

            {/* Large Background Outline Text */}
            <div className="absolute inset-0 flex items-center justify-start pointer-events-none select-none overflow-hidden z-0 pl-[5%] opacity-5">
                <motion.h2
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="text-[20vw] md:text-[12vw] font-black text-outline uppercase leading-none whitespace-nowrap"
                >
                    {(profile.name || "").split(" ").slice(0, 1).join(" ")}
                </motion.h2>
            </div>

            <div className="container mx-auto px-4 relative z-10 w-full max-w-[1400px]">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
                    {/* Character/Portrait Side */}
                    <div className="w-full lg:w-1/2 flex justify-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, type: "spring" }}
                            className="relative"
                        >
                            {/* Decorative circular element */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-transparent rounded-full blur-3xl -z-10" />

                            <Tilt options={{ max: 10, speed: 400, glare: false }}>
                                <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-[480px] lg:h-[480px] rounded-full overflow-hidden shadow-2xl">
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
                                            <span className="text-white text-6xl font-black">{(profile.name || "").charAt(0)}</span>
                                        </div>
                                    )}
                                </div>
                            </Tilt>
                        </motion.div>
                    </div>

                    {/* Content Side */}
                    <div className="w-full lg:w-1/2 space-y-8 text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="w-full"
                        >
                            <span className="text-orange-500 font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-[8px] md:text-xs">Hello, my name is</span>
                            <h1 className="flex flex-col mt-2 font-black tracking-tighter text-white w-full overflow-visible">
                                <span className="text-[clamp(2rem,10vw,5rem)] leading-[1] whitespace-nowrap block">Hari Haran</span>
                                <span className="text-[clamp(1.2rem,8.5vw,4.5rem)] leading-[1] text-orange-600 whitespace-nowrap block mt-1 md:mt-1.5">Jeyaramamoorthy</span>
                            </h1>
                            <p className="max-w-2xl mx-auto mt-4 md:mt-6 text-[8px] md:text-sm font-bold leading-relaxed tracking-[0.1em] md:tracking-[0.2em] text-gray-400 uppercase lg:mx-0 opacity-80">
                                {profile.headline?.replace(/ PRO$/i, "") || "Web/App Developer | Business Consultant | Job Placement Expert | Operations & Partnerships Manager | Snack Business Owner | Project Management"}
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
                                    target="_blank"
                                    rel="noopener noreferrer"
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
                            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-2"
                        >
                            <MagneticButton>
                                <button
                                    onClick={() => window.dispatchEvent(new CustomEvent("open-ai-chat"))}
                                    className="flex items-center gap-3 px-10 py-5 rounded-2xl bg-orange-600 text-white font-black text-sm uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(234,88,12,0.3)] hover:scale-110 active:scale-95 transition-all group"
                                >
                                    Let&apos;s Talk <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
                                </button>
                            </MagneticButton>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Bottom Gradient Fade */}
            <div className="absolute bottom-0 left-0 w-full h-16 md:h-32 bg-gradient-to-t from-[#0e0e0e] to-transparent pointer-events-none" />
        </section>
    );
}
