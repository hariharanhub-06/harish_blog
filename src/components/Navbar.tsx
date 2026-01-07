"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, User, Briefcase, FileText, Mail, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "About", href: "/#about", icon: User },
    { name: "Portfolio", href: "/#portfolio", icon: Briefcase },
    { name: "Blog", href: "/#blog", icon: FileText },
    { name: "Contact", href: "/#contact", icon: Mail },
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
            <div className={`container mx-auto max-w-7xl h-16 rounded-2xl flex justify-between items-center transition-all duration-300 ${scrolled ? "glass shadow-lg px-8" : "bg-transparent px-4"
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
                            className="px-4 py-2 text-secondary hover:text-primary font-bold text-sm transition-all rounded-lg hover:bg-primary/5"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="ml-4 pl-4 border-l border-gray-200">
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
                        className="absolute top-24 left-6 right-6 glass rounded-2xl shadow-2xl overflow-hidden md:hidden border border-white/50"
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
                            <Link
                                href="#contact"
                                className="w-full bg-primary text-white text-center py-4 rounded-xl font-black mt-4 shadow-lg shadow-primary/20"
                                onClick={() => setIsOpen(false)}
                            >
                                Hire Me
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
