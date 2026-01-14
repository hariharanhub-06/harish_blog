"use client";

import { motion } from "framer-motion";
import { MapPin, Briefcase } from "lucide-react";

import Image from "next/image";

interface AboutHeroProps {
    name: string;
    about: string;
    location: string;
    imageUrl?: string;
    experience?: string;
}

export default function AboutHero({ name, about, location, imageUrl, experience = "3+" }: AboutHeroProps) {
    return (
        <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                <h1 className="text-3xl md:text-5xl font-black mb-6 leading-tight tracking-tight">
                    The Journey of <br />
                    <span className="text-primary italic">Innovation</span> and <span className="text-accent underline decoration-4 underline-offset-4">Growth</span>.
                </h1>
                <p className="text-base text-secondary leading-relaxed mb-6 font-medium">
                    {about}
                </p>
                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center space-x-2 text-primary font-black bg-blue-50 px-3 py-1.5 rounded-lg text-xs">
                        <MapPin size={14} />
                        <span>{location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-accent font-black bg-amber-50 px-3 py-1.5 rounded-lg text-xs">
                        <Briefcase size={14} />
                        <span>{experience} Years Experience</span>
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
                <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 rounded-full relative overflow-hidden flex items-center justify-center p-12 shadow-inner group">
                    {imageUrl ? (
                        <div className="absolute inset-2 rounded-full overflow-hidden border-4 border-white shadow-lg">
                            <Image src={imageUrl} alt="About" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                        </div>
                    ) : (
                        <>
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />
                            <div className="text-primary font-black text-[12vw] opacity-20">{name.split(' ').map(n => n[0]).join('')}</div>
                        </>
                    )}

                    {!imageUrl && (
                        <>
                            <div className="absolute top-10 right-0 glass p-4 rounded-2xl shadow-xl animate-bounce-slow">
                                <p className="text-[10px] font-black uppercase text-secondary mb-0.5 tracking-widest">Colleges</p>
                                <p className="text-xl font-black text-primary">42+</p>
                            </div>
                            <div className="absolute bottom-10 left-0 glass p-4 rounded-2xl shadow-xl animate-bounce-slow-delayed">
                                <p className="text-[10px] font-black uppercase text-secondary mb-0.5 tracking-widest">Team size</p>
                                <p className="text-xl font-black text-accent">17</p>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
