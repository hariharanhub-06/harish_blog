"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, User, Briefcase, FileText, Mail, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const navLinks = [
    { name: "Home", href: "/", icon: Home },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4`}
        >
            <div className={`container mx-auto max-w-7xl h-16 rounded-2xl flex justify-between items-center transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-xl border border-gray-100 px-8" : "bg-transparent px-4"
                }`}>
                <Link href="/" className="text-2xl font-bold tracking-tight">
                    <span className="text-primary">Hari</span>
                    <span className="text-gray-900 font-black">Haran</span>
                    <span className="text-accent underline decoration-4 decoration-accent/30 underline-offset-4">.</span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex space-x-1 items-center">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="px-4 py-2 text-gray-900 hover:text-primary font-bold text-sm transition-all rounded-lg hover:bg-primary/5"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="ml-4 pl-4 border-l border-gray-200 flex gap-3">
                        {/* Business Dropdown */}
                        <div className="relative group">
                            <button
                                className="bg-gray-100 text-gray-900 px-6 py-2.5 rounded-xl transition-all font-bold text-sm shadow-sm border border-gray-200 flex items-center gap-2 group-hover:bg-gray-200"
                            >
                                Business
                                <motion.div
                                    animate={{ rotate: 0 }}
                                    className="group-hover:rotate-180 transition-transform"
                                >
                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </motion.div>
                            </button>

                            {/* Dropdown Menu */}
                            <div className="absolute top-full left-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-[60]">
                                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-2">
                                    <Link
                                        href="/business/hm-snacks"
                                        className="flex items-center space-x-3 p-3 rounded-xl hover:bg-primary/5 transition-all group/item"
                                    >
                                        <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white shadow-sm border border-gray-100 p-0.5">
                                            <Image src="/hm-snacks-logo.png" alt="HM Snacks" fill className="object-contain" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-gray-900 group-hover/item:text-primary">HM Snacks</span>
                                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Tradition Taste</span>
                                        </div>
                                    </Link>
                                    <Link
                                        href="/business/hm-tech"
                                        className="flex items-center space-x-3 p-3 rounded-xl hover:bg-primary/5 transition-all group/item mt-1"
                                    >
                                        <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white shadow-sm border border-gray-100 p-0.5">
                                            <Image src="/hm-tech-logo.png" alt="HM Tech" fill className="object-contain" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-gray-900 group-hover/item:text-primary">HM Tech</span>
                                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Test Design</span>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="#contact"
                            className="bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-blue-800 transition-all font-bold text-sm shadow-lg shadow-primary/20"
                        >
                            Hire Me
                        </Link>
                    </div>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-gray-900 bg-gray-100 p-2.5 rounded-xl border border-gray-200 shadow-sm"
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
                        className="absolute top-24 left-6 right-6 bg-white rounded-2xl shadow-2xl overflow-hidden md:hidden border border-gray-100"
                    >
                        <div className="flex flex-col p-4 space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="flex items-center space-x-3 text-secondary hover:text-primary p-4 text-base font-bold rounded-xl hover:bg-primary/5 transition-all"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <link.icon size={18} className="text-primary/60" />
                                    <span>{link.name}</span>
                                </Link>
                            ))}
                            <div className="flex flex-col gap-2 mt-2">
                                <Link
                                    href="/business/hm-snacks"
                                    className="w-full bg-gray-50 text-gray-900 px-6 py-4 rounded-xl font-black shadow-sm border border-gray-100 flex items-center justify-between"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <span>HM Snacks</span>
                                    <span className="text-[10px] bg-pink-500 text-white px-2 py-0.5 rounded-lg">SHOP</span>
                                </Link>
                                <Link
                                    href="/business/hm-tech"
                                    className="w-full bg-gray-50 text-gray-900 px-6 py-4 rounded-xl font-black shadow-sm border border-gray-100 flex items-center justify-between"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <span>HM Tech</span>
                                    <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-lg">TECH</span>
                                </Link>
                                <Link
                                    href="#contact"
                                    className="w-full bg-primary text-white text-center py-4 rounded-xl font-black shadow-lg shadow-primary/20"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Hire Me
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
