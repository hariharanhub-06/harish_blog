"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { MagneticButton } from "./MagneticButton";
import { Tilt } from "./Tilt";

interface HeroProps {
    profile: {
        name: string;
        headline: string | null;
        avatarUrl: string | null;
        heroImageUrl: string | null;
    };
}

export default function Hero({ profile }: HeroProps) {
    return (
        <section className="relative container mx-auto px-6 pt-24 pb-32 flex flex-col items-center text-center overflow-hidden">
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
                        {/* Gradient overlay for text readability (Very Minimal) */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/40" />
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10" />
                    </>
                ) : (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full blur-[100px] opacity-20">
                        <div className="absolute top-10 left-10 w-72 h-72 bg-primary rounded-full" />
                        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent rounded-full" />
                    </div>
                )}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center space-x-2 glass text-primary px-5 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-10 shadow-sm border-white/50"
            >
                <Sparkles size={14} className="text-accent" />
                <span>Available for new opportunities</span>
            </motion.div>

            {/* Profile Picture */}
            {profile.avatarUrl && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="relative mb-12"
                >
                    {/* Glowing background ring */}
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-125" />

                    <Tilt options={{ max: 15, speed: 400, glare: true, "max-glare": 0.3 }} className="relative z-10">
                        <div className="relative w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-8 border-white shadow-[0_20px_50px_rgba(30,64,175,0.2)] group transition-all duration-500">
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-6xl md:text-8xl font-black font-poppins text-gray-900 mb-8 tracking-tight leading-[1.05]"
            >
                Crafting Digital <br />
                <span className="text-primary italic relative">
                    Excellence
                    <span className="absolute bottom-2 left-0 w-full h-3 bg-accent/20 -z-10 rotate-1" />
                </span>
                <span className="text-gray-900">.</span>
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg md:text-xl text-gray-900 max-w-3xl mb-12 leading-relaxed font-bold"
                style={{ textShadow: '0 2px 4px rgba(255,255,255,0.8)' }}
            >
                Hi, I&apos;m <span className="text-gray-900 font-black">{profile.name}</span>.
                <span className="block mt-2 text-gray-800 font-semibold">{profile.headline}</span>
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-5"
            >
                <MagneticButton strength={25}>
                    <Link
                        href="#portfolio"
                        className="group bg-primary text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-blue-800 transition-all flex items-center justify-center space-x-3 shadow-xl shadow-primary/25 hover:shadow-primary/40"
                    >
                        <span>Explore My Work</span>
                        <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </MagneticButton>

                <MagneticButton strength={25}>
                    <Link
                        href="#contact"
                        className="bg-white text-gray-900 border-2 border-gray-100 px-10 py-5 rounded-2xl font-black text-lg hover:border-primary/20 hover:bg-gray-50 transition-all text-center flex items-center justify-center shadow-sm hover:shadow-lg"
                    >
                        Let&apos;s Talk
                    </Link>
                </MagneticButton>
            </motion.div>
        </section>
    );
}
