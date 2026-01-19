"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
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
    return (
        <section className={cn("relative container mx-auto px-6 pt-12 md:pt-14 pb-8 md:pb-10 flex flex-col items-center text-center overflow-hidden", className)}>
            {/* Background decorative elements */}
            {/* Background Image */}
            <div className="absolute inset-0 -z-10 pointer-events-none">
                {profile.heroImageUrl ? (
                    <>
                        <Image
                            src={profile.heroImageUrl}
                            alt="Background"
                            fill
                            className="object-cover opacity-20"
                            priority
                        />
                        {/* Gradient overlay for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/40" />
                    </>
                ) : (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full blur-[100px] opacity-20">
                        <div className="absolute top-10 left-10 w-60 h-60 bg-primary rounded-full" />
                        <div className="absolute bottom-10 right-10 w-72 h-72 bg-accent rounded-full" />
                    </div>
                )}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center space-x-2 glass text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-5 shadow-sm border-white/50"
            >
                <Sparkles size={12} className="text-accent" />
                <span>Available for new opportunities</span>
            </motion.div>

            {/* Profile Picture */}
            {profile.avatarUrl && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="relative mb-6"
                >
                    {/* Glowing background ring */}
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-125" />

                    <Tilt options={{ max: 15, speed: 400, glare: true, "max-glare": 0.3 }} className="relative z-10">
                        <div className="relative w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-white shadow-[0_15px_40px_rgba(30,64,175,0.15)] group transition-all duration-500">
                            <Image
                                src={profile.avatarUrl}
                                alt={profile.name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                priority
                            />
                        </div>
                    </Tilt>
                </motion.div>
            )}

            <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-5xl font-black font-poppins text-gray-900 mb-4 tracking-tight leading-[1.1]"
            >
                Crafting Digital <br />
                <span className="text-primary italic relative">
                    Excellence
                    <span className="absolute bottom-1.5 left-0 w-full h-2 bg-accent/20 -z-10 rotate-1" />
                </span>
                <span className="text-gray-900">.</span>
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base md:text-lg text-gray-900 max-w-2xl mb-6 leading-relaxed font-bold"
                style={{ textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}
            >
                Hi, I&apos;m <span className="text-gray-900 font-black">{profile.name}</span>.
                <span className="block mt-1 text-gray-800 font-semibold">{profile.headline}</span>
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4"
            >
                <MagneticButton strength={20}>
                    <Link
                        href="#portfolio"
                        className="group bg-primary text-white px-6 py-3 rounded-lg font-black text-base hover:bg-blue-800 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-primary/20 hover:shadow-primary/30"
                    >
                        <span>Explore My Work</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </MagneticButton>

                <MagneticButton strength={20}>
                    <Link
                        href="#contact"
                        className="bg-white text-gray-900 border-2 border-gray-100 px-6 py-3 rounded-lg font-black text-base hover:border-primary/20 hover:bg-gray-50 transition-all text-center flex items-center justify-center shadow-sm hover:shadow-md"
                    >
                        Let&apos;s Talk
                    </Link>
                </MagneticButton>
            </motion.div>
        </section>
    );
}
