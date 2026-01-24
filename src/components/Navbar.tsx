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
    const isSnacksPage = pathname?.startsWith("/business/hm-snacks");
    const isTechPage = pathname?.startsWith("/business/hm-tech");
    const isDarkTheme = isHomePage || isTechPage;

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
                        <span className={`${isDarkTheme ? "text-white" : (isSnacksPage ? "text-pink-500" : "text-primary")} group-hover:text-orange-500 transition-colors`}>Hari</span>
                        <span className={`${isDarkTheme ? "text-white" : "text-gray-900"} font-black opacity-80 group-hover:opacity-100 transition-opacity`}>Haran</span>
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
                    <div className={`ml-4 pl-4 border-l flex gap-4 ${isDarkTheme ? "border-white/10" : "border-gray-200"}`}>
                        {/* Business Dropdown */}
                        <div className="relative group">
                            <button
                                className={`px-5 py-2.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest border flex items-center gap-3 ${isDarkTheme ? "bg-white/5 text-white border-white/10 hover:bg-white/10" : "bg-gray-100 text-gray-900 border-gray-200 hover:bg-gray-200"}`}
                            >
                                Ventures
                                <motion.div
                                    animate={{ rotate: 0 }}
                                    className="group-hover:rotate-180 transition-transform opacity-50"
                                >
                                    <svg width="8" height="5" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </motion.div>
                            </button>

                            {/* Dropdown Menu */}
                            <div className="absolute top-full left-0 mt-3 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 transform group-hover:translate-y-0 translate-y-2 z-[60]">
                                <div className={`rounded-2xl shadow-2xl border p-2 ${isDarkTheme ? "bg-[#1a1a1a] border-white/10" : "bg-white border-gray-100"}`}>
                                    <Link
                                        href="/business/hm-snacks"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center space-x-3 p-3 rounded-xl transition-all group/item ${isDarkTheme ? "hover:bg-white/5" : "hover:bg-primary/5"}`}
                                    >
                                        <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white shadow-sm border border-gray-100 p-0.5">
                                            <Image src="/hm-snacks-logo.png" alt="HM Snacks" fill className="object-contain" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-xs font-black ${isDarkTheme ? "text-white" : "text-gray-900"} group-hover/item:text-orange-500`}>HM Snacks</span>
                                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Tradition</span>
                                        </div>
                                    </Link>
                                    <Link
                                        href="/business/haripicks"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center space-x-3 p-3 rounded-xl transition-all group/item mt-1 ${isDarkTheme ? "hover:bg-white/5" : "hover:bg-primary/5"}`}
                                    >
                                        <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500 to-orange-500 shadow-sm border border-gray-100 p-0.5 flex items-center justify-center">
                                            <span className="text-white font-black text-xs">H</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-xs font-black ${isDarkTheme ? "text-white" : "text-gray-900"} group-hover/item:text-orange-500`}>HariPicks</span>
                                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Deals</span>
                                        </div>
                                    </Link>
                                    <Link
                                        href="/business/hm-tech"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center space-x-3 p-3 rounded-xl transition-all group/item mt-1 ${isDarkTheme ? "hover:bg-white/5" : "hover:bg-primary/5"}`}
                                    >
                                        <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white shadow-sm border border-gray-100 p-0.5">
                                            <Image src="/hm-tech-logo.png" alt="HM Tech" fill className="object-contain" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-xs font-black ${isDarkTheme ? "text-white" : "text-gray-900"} group-hover/item:text-orange-500`}>HM Tech</span>
                                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Tech</span>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="#contact"
                            className={`${isDarkTheme ? "bg-orange-600 text-white hover:bg-orange-700 shadow-orange-600/30" : "bg-primary text-white hover:bg-blue-800 shadow-primary/20"} px-6 py-2.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-lg`}
                        >
                            Hire Me
                        </Link>
                    </div>
                </div>

                {/* Mobile Toggle */}
                <button
                    className={`md:hidden p-3 rounded-xl border transition-all ${isDarkTheme ? "text-white bg-white/5 border-white/10" : "text-gray-900 bg-gray-100 border-gray-200"}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className={`absolute top-28 left-6 right-6 rounded-3xl shadow-2xl overflow-hidden md:hidden border transition-all z-50 ${isDarkTheme ? "bg-[#0e0e0e]/95 border-white/10" : "bg-white border-gray-100"}`}
                    >
                        <div className="flex flex-col p-6 space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`flex items-center space-x-4 p-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all ${isDarkTheme ? "text-white/60 hover:text-orange-500 hover:bg-white/5" : "text-gray-600 hover:text-primary hover:bg-primary/5"}`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <link.icon size={18} className="text-orange-600/60" />
                                    <span>{link.name}</span>
                                </Link>
                            ))}
                            <div className="flex flex-col gap-3 mt-4 pt-6 border-t border-white/5">
                                <Link
                                    href="/business/hm-snacks"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-full px-6 py-4 rounded-2xl font-black shadow-sm border flex items-center justify-between transition-colors ${isDarkTheme ? "bg-white/5 text-white border-white/10" : "bg-gray-50 text-gray-900 border-gray-100"}`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100 p-1">
                                            <Image src="/hm-snacks-logo.png" alt="HM Snacks" fill className="object-contain" />
                                        </div>
                                        <span className="text-xs uppercase tracking-widest">HM Snacks</span>
                                    </div>
                                    <span className="text-[9px] bg-pink-500 text-white px-3 py-1 rounded-full font-black">SHOP</span>
                                </Link>
                                <Link
                                    href="/business/haripicks"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-full px-6 py-4 rounded-2xl font-black shadow-sm border flex items-center justify-between transition-colors ${isDarkTheme ? "bg-white/5 text-white border-white/10" : "bg-gray-50 text-gray-900 border-gray-100"}`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-purple-500 to-orange-500 shadow-sm flex items-center justify-center">
                                            <span className="text-white font-black text-lg">H</span>
                                        </div>
                                        <span className="text-xs uppercase tracking-widest">HariPicks</span>
                                    </div>
                                    <span className="text-[9px] bg-purple-500 text-white px-3 py-1 rounded-full font-black">DEALS</span>
                                </Link>
                                <Link
                                    href="#contact"
                                    className={`w-full text-center py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-lg transition-all ${isDarkTheme ? "bg-orange-600 text-white shadow-orange-600/20" : "bg-primary text-white shadow-primary/20"}`}
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
