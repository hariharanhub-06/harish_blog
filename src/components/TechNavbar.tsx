"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TechNavbar() {
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Services", href: "#services" },
        { name: "Process", href: "#process" }, // Note: Section ID needs to be added to Process section in page.tsx if not present. I'll simply link to top or approximate if ID missing, but better to add ID in page.
        { name: "Projects", href: "#portfolio" },
        { name: "Contact", href: "#contact" },
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4`}>
            <div className={`container mx-auto max-w-7xl h-20 rounded-3xl flex justify-between items-center transition-all duration-500 ${scrolled ? "bg-white/95 backdrop-blur-xl shadow-2xl border border-white/50 px-10" : "bg-white/40 backdrop-blur-md px-6 border border-white/20"}`}>

                {/* Logo */}
                <Link href="/business/hm-tech" className="flex flex-col items-center group">
                    <span className="text-3xl font-black tracking-tighter text-gray-900 leading-none group-hover:scale-105 transition-transform">
                        HM<span className="text-blue-600 italic">Tech</span>
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-[0.4em] text-blue-600/60 mt-1">Test Design</span>
                </Link>

                {/* Right Actions */}
                <div className="flex items-center space-x-2 md:space-x-8">
                    {/* Desktop Links (Removed) */}

                    <Link
                        href="#contact"
                        className="hidden md:block px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/40 transition-all hover:-translate-y-0.5"
                    >
                        HIRE US
                    </Link>

                    {/* Mobile Toggle */}
                    <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-3 text-gray-900 bg-white/50 rounded-xl hover:bg-white transition-colors">
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="absolute top-28 left-6 right-6 bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-gray-100 p-8 md:hidden overflow-hidden origin-top"
                    >
                        <div className="flex flex-col space-y-2">
                            {/* Links removed as per request */}
                            <Link
                                href="#contact"
                                onClick={() => setIsOpen(false)}
                                className="p-4 rounded-2xl bg-blue-600 text-white text-xl font-black text-center shadow-lg shadow-blue-500/20"
                            >
                                HIRE US
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
