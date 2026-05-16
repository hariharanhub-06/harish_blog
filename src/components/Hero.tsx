"use client";

import { motion } from "framer-motion";
import { Mail, Instagram, MessageCircle, ArrowRight, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { MagneticButton } from "./MagneticButton";
import { Tilt } from "./Tilt";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { Play } from "lucide-react";

interface HeroProps {
    profile: {
        name: any;
        headline: any;
        avatarUrl: any;
        heroImageUrl: any;
        audioUrl: any;
    };
    experiences?: any[];
    className?: string;
}

export default function Hero({ profile, experiences, className }: HeroProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const toggleAudio = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(videoRef.current.muted);
        }
    };

    const socialLinks = [
        { icon: MessageCircle, href: "https://wa.me/919042387152", color: "hover:bg-green-500" },
        { icon: Instagram, href: "https://instagram.com/_mr_vibrant", color: "hover:bg-pink-500" },
        { icon: Mail, href: "mailto:hariharanjeyaramamoorthy@gmail.com", color: "hover:bg-orange-600" },
    ];

    const isVideoBackground = profile.heroImageUrl?.match(/\.(mp4|webm|ogg)$/i) || profile.heroImageUrl?.includes("video");

    return (
        <section className={cn("relative min-h-[90vh] lg:min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#0e0e0e] pt-20 md:pt-28", className)}>
            {/* Hero Background Media */}
            {profile.heroImageUrl && (
                <div className="absolute inset-0 z-0">
                    {isVideoBackground ? (
                        <video
                            ref={videoRef}
                            src={profile.heroImageUrl}
                            autoPlay
                            loop
                            muted={isMuted}
                            playsInline
                            className="w-full h-full object-cover opacity-40 transition-opacity duration-1000"
                        />
                    ) : (
                        <Image
                            src={profile.heroImageUrl}
                            alt="Hero background"
                            fill
                            unoptimized
                            className="object-cover opacity-30"
                            priority
                        />
                    )}
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

            {/* Media Controls Corner */}
            {isVideoBackground && (
                <div className="absolute top-28 right-6 md:right-12 z-30 flex flex-col gap-4">
                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={toggleMute}
                        className="p-4 md:p-5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all shadow-2xl group flex items-center gap-3"
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden md:block">
                            {isMuted ? "Unmute Background" : "Mute Background"}
                        </span>
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} className="text-orange-500 animate-pulse" />}
                    </motion.button>
                </div>
            )}

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
                                <div className="relative w-48 h-48 md:w-60 md:h-60 lg:w-[340px] lg:h-[340px] rounded-full flex items-center justify-center">

                                    {/* Pulsing Glow Effect */}
                                    <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
                                        {isPlaying && (
                                            <>
                                                {/* Outer Pulse */}
                                                <motion.div
                                                    className="absolute rounded-full bg-gradient-to-br from-cyan-400/40 via-purple-500/40 to-blue-500/40 blur-3xl"
                                                    initial={{ width: "100%", height: "100%", opacity: 0.5 }}
                                                    animate={{
                                                        width: ["100%", "120%", "100%"],
                                                        height: ["100%", "120%", "100%"],
                                                        opacity: [0.5, 0.85, 0.5],
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        ease: "easeInOut",
                                                    }}
                                                />
                                                {/* Inner Pulse */}
                                                <motion.div
                                                    className="absolute rounded-full bg-gradient-to-br from-cyan-400/50 via-purple-500/50 to-blue-500/50 blur-2xl"
                                                    initial={{ width: "90%", height: "90%", opacity: 0.6 }}
                                                    animate={{
                                                        width: ["90%", "110%", "90%"],
                                                        height: ["90%", "110%", "90%"],
                                                        opacity: [0.6, 0.9, 0.6],
                                                    }}
                                                    transition={{
                                                        duration: 1.5,
                                                        repeat: Infinity,
                                                        ease: "easeInOut",
                                                        delay: 0.3,
                                                    }}
                                                />
                                            </>
                                        )}
                                        {/* Static White Ring */}
                                        {!isPlaying && profile.audioUrl && (
                                            <div className="absolute inset-[-10px] md:inset-[-12px] rounded-full border border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.1)]" />
                                        )}
                                    </div>

                                    <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl z-10 border-4 border-[#0e0e0e]">
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

                                    {/* Creative Play Button on Edge */}
                                    {profile.audioUrl && (
                                        <div className="absolute bottom-[10%] right-[5%] z-20">
                                            <button
                                                onClick={toggleAudio}
                                                className={`
                                                    relative w-16 h-16 rounded-full flex items-center justify-center
                                                    transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.5)]
                                                    ${isPlaying ? 'bg-red-600 scale-95' : 'bg-white hover:scale-110 animate-bounce-subtle'}
                                                `}
                                            >
                                                {/* Button Pulse Effect */}
                                                {!isPlaying && (
                                                    <span className="absolute inset-0 rounded-full bg-white opacity-20 animate-ping" />
                                                )}

                                                {isPlaying ? (
                                                    <div className="flex gap-1">
                                                        <motion.div
                                                            animate={{ height: [8, 16, 8] }}
                                                            transition={{ repeat: Infinity, duration: 0.5 }}
                                                            className="w-1.5 bg-white rounded-full"
                                                        />
                                                        <motion.div
                                                            animate={{ height: [12, 24, 12] }}
                                                            transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }}
                                                            className="w-1.5 bg-white rounded-full"
                                                        />
                                                        <motion.div
                                                            animate={{ height: [8, 16, 8] }}
                                                            transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }}
                                                            className="w-1.5 bg-white rounded-full"
                                                        />
                                                    </div>
                                                ) : (
                                                    <Play fill="black" className="ml-1 text-black" size={24} />
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    {/* Audio Element */}
                                    {profile.audioUrl && (
                                        <audio
                                            ref={audioRef}
                                            src={profile.audioUrl}
                                            onEnded={() => setIsPlaying(false)}
                                            className="hidden"
                                        />
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
                            className="w-full pr-4"
                        >
                            <span className="text-orange-500 font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-[8px] md:text-xs">Hello, my name is</span>
                            <h1 className="flex flex-col mt-2 font-black tracking-tighter text-white w-full">
                                <span className="text-[clamp(2rem,10vw,5rem)] leading-[1] whitespace-nowrap block">Hari Haran</span>
                                <span className="text-[clamp(1.2rem,7.5vw,3.8rem)] leading-[1] text-orange-600 whitespace-nowrap block mt-1 md:mt-1.5">Jeyaramamoorthy</span>
                            </h1>

                            {/* Current Position Display */}
                            {experiences && experiences.find(e => e.isCurrent) && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.8 }}
                                    className="flex items-center justify-center lg:justify-start gap-2 mt-4"
                                >
                                    <div className="px-4 py-2 bg-orange-600/10 border border-orange-600/20 rounded-full flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
                                        <span className="text-[10px] md:text-xs font-black text-orange-500 uppercase tracking-widest">
                                            {experiences.find(e => e.isCurrent).role} @ {experiences.find(e => e.isCurrent).company}
                                        </span>
                                    </div>
                                </motion.div>
                            )}

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
                                    LET&apos;S TALK <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
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
