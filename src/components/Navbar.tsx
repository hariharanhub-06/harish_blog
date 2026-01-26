"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, Briefcase, FileText, Mail, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const navLinks = [
    { name: "About", href: "#about", icon: User },
    { name: "Portfolio", href: "#portfolio", icon: Briefcase },
    { name: "Videos", href: "#videos", icon: FileText },
    { name: "Contact", href: "#contact", icon: Mail },
];

export default function Navbar() {
    const pathname = usePathname();
    const isHomePage = pathname === "/";
    const isDarkTheme = true; // Always dark theme for the main blog

    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 py-6`}
        >
            <div className={`container mx-auto max-w-5xl h-14 rounded-2xl flex justify-between items-center transition-all duration-500 border ${scrolled
                ? (isDarkTheme ? "bg-black/80 backdrop-blur-md border-white/10 px-6 shadow-2xl" : "bg-white/95 backdrop-blur-md border-gray-100 px-6 shadow-xl")
                : (isDarkTheme ? "bg-white/5 backdrop-blur-sm border-white/10 px-5" : "bg-white/80 backdrop-blur-sm border-gray-100 px-5 shadow-sm")
                }`}>
                <Link href="/" className="flex items-center gap-2 text-xl font-black tracking-tighter group">
                    <div className="flex items-baseline">
                        <span className="text-white group-hover:text-orange-500 transition-colors">Hari</span>
                        <span className="text-white font-black opacity-80 group-hover:opacity-100 transition-opacity">Haran</span>
                        <span className="text-orange-600 animate-pulse ml-0.5">.</span>
                    </div>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex space-x-2 items-center">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`px-4 py-2 font-black text-[10px] uppercase tracking-[0.2em] transition-all rounded-xl hover:bg-white/5 ${isDarkTheme ? "text-white/60 hover:text-orange-500" : "text-gray-600 hover:text-primary"}`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Mobile Toggle */}
            <button
                className="md:hidden p-3 rounded-xl border transition-all text-white bg-white/5 border-white/10"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="absolute top-28 left-6 right-6 rounded-3xl shadow-2xl overflow-hidden md:hidden border transition-all z-50 bg-[#0e0e0e]/95 border-white/10"
                    >
                        <div className="flex flex-col p-6 space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="flex items-center space-x-4 p-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all text-white/60 hover:text-orange-500 hover:bg-white/5"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <link.icon size={18} className="text-orange-600/60" />
                                    <span>{link.name}</span>
                                </Link>
                            ))}
                            <div className="flex flex-col gap-3 mt-4 pt-6 border-t border-white/5">
                                <Link
                                    href="#contact"
                                    className="w-full text-center py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-lg transition-all bg-orange-600 text-white shadow-orange-600/20"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Hire Me
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav >
    );
}
