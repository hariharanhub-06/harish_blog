"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, GraduationCap, FileText, Mail, Home, Gamepad2, Briefcase, ChevronDown, Monitor, Keyboard, Calendar, Video, Code, Database, IndianRupee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface NavLinkItem {
    name: string;
    href: string;
    icon: any;
    color: string;
    creative?: boolean;
}

interface NavLink {
    name: string;
    href: string;
    icon: any;
    isDropdown?: boolean;
    items?: NavLinkItem[];
}

const navLinks: NavLink[] = [
    {
        name: "About",
        href: "#",
        icon: User,
        isDropdown: true,
        items: [
            { name: "Biography", href: "#about", icon: User, color: "text-orange-500" },
            { name: "Portfolio", href: "#portfolio", icon: Briefcase, color: "text-blue-500" },
            { name: "Academy", href: "#academy", icon: GraduationCap, color: "text-purple-500" },
        ]
    },
    {
        name: "Activities",
        href: "#",
        icon: Gamepad2,
        isDropdown: true,
        items: [
            { name: "Quiz", href: "/#quiz", icon: Gamepad2, color: "text-blue-500" },
            { name: "Game Arena", href: "/#games", icon: Monitor, color: "text-emerald-500" },
            { name: "Type Test", href: "/#typing-test", icon: Keyboard, color: "text-orange-500", creative: true }
        ]
    },
    {
        name: "Services",
        href: "/services",
        icon: Briefcase,
        isDropdown: true,
        items: [
            { name: "Business Digital Solution", href: "/services", icon: Code, color: "text-blue-500" },
            { name: "Financial Logistics", href: "/financial-logistics", icon: IndianRupee, color: "text-emerald-500" },
        ]
    },
    { name: "Live Session", href: "/#sessions", icon: Video },
    { name: "Contact", href: "#contact", icon: Mail },
];

export default function Navbar() {
    const pathname = usePathname();
    const isHomePage = pathname === "/";
    const isDarkTheme = true; // Always dark theme for the main blog

    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 py-4 md:py-6`}
        >
            <div className={`container mx-auto max-w-4xl h-12 rounded-2xl flex justify-between items-center transition-all duration-500 border ${scrolled
                ? (isDarkTheme ? "bg-black/80 backdrop-blur-md border-white/10 px-6 shadow-2xl" : "bg-white/95 backdrop-blur-md border-gray-100 px-6 shadow-xl")
                : (isDarkTheme ? "bg-white/5 backdrop-blur-sm border-white/10 px-5" : "bg-white/80 backdrop-blur-sm border-gray-100 px-5 shadow-sm")
                }`}>
                <Link href="/" className="flex items-center gap-2 text-lg md:text-xl font-black tracking-tighter group shrink-0">
                    <div className="flex items-baseline">
                        <span className="text-white group-hover:text-orange-500 transition-colors">Hari</span>
                        <span className="text-white font-black opacity-80 group-hover:opacity-100 transition-opacity">Haran</span>
                        <span className="text-orange-600 animate-pulse ml-0.5">.</span>
                    </div>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex space-x-1 items-center">
                    {navLinks.map((link) => (
                        <div
                            key={link.name}
                            className="relative group/nav-item"
                            onMouseEnter={() => link.isDropdown && setActiveDropdown(link.name)}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <button
                                onClick={() => {
                                    if (link.name === "Contact") {
                                        window.dispatchEvent(new CustomEvent("open-ai-chat"));
                                    } else if (!link.isDropdown) {
                                        window.location.href = link.href;
                                    }
                                }}
                                className={`px-4 py-2 font-black text-[10px] uppercase tracking-[0.2em] transition-all rounded-xl hover:bg-white/5 flex items-center gap-1.5 ${isDarkTheme ? "text-white/60 hover:text-orange-500" : "text-gray-600 hover:text-primary"} ${activeDropdown === link.name ? "text-orange-500 bg-white/5" : ""}`}
                            >
                                {link.name}
                                {link.isDropdown && <ChevronDown size={12} className={`transition-transform duration-300 ${activeDropdown === link.name ? "rotate-180" : ""}`} />}
                            </button>

                            {/* Dropdown Menu */}
                            {link.isDropdown && (
                                <AnimatePresence>
                                    {activeDropdown === link.name && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                            className="absolute top-full left-0 mt-2 w-48 bg-[#0e0e0e] border border-white/10 rounded-2xl shadow-2xl p-2 z-[60]"
                                        >
                                            {link.items?.map((item) => (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    className={`flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/5 group/drop-item ${item.creative ? "relative overflow-hidden" : ""}`}
                                                >
                                                    <div className={`p-2 rounded-lg bg-white/5 group-hover/drop-item:scale-110 transition-transform ${item.color}`}>
                                                        <item.icon size={14} />
                                                    </div>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest text-white/70 group-hover/drop-item:text-white`}>
                                                        {item.name}
                                                    </span>
                                                    {item.creative && (
                                                        <span className="absolute -right-1 -top-1 w-6 h-6 bg-orange-600/20 rounded-full blur-lg animate-pulse" />
                                                    )}
                                                </Link>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            )}
                        </div>
                    ))}
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-2.5 rounded-xl border transition-all text-white bg-white/5 border-white/10 hover:bg-white/10 active:scale-95"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="absolute top-28 left-6 right-6 rounded-3xl shadow-2xl overflow-hidden md:hidden border transition-all z-50 bg-[#0e0e0e] border-white/10"
                    >
                        <div className="flex flex-col p-6 space-y-2 max-h-[70vh] overflow-y-auto">
                            {navLinks.map((link) => (
                                <div key={link.name} className="flex flex-col">
                                    <button
                                        onClick={() => {
                                            if (link.isDropdown) {
                                                setActiveDropdown(activeDropdown === link.name ? null : link.name);
                                            } else {
                                                setIsOpen(false);
                                                if (link.name === "Contact") {
                                                    window.dispatchEvent(new CustomEvent("open-ai-chat"));
                                                } else {
                                                    window.location.href = link.href;
                                                }
                                            }
                                        }}
                                        className="flex items-center justify-between p-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all text-white/60 hover:text-orange-500 hover:bg-white/5 w-full text-left"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <link.icon size={18} className="text-orange-600/60" />
                                            <span>{link.name}</span>
                                        </div>
                                        {link.isDropdown && <ChevronDown size={14} className={`transition-transform duration-300 ${activeDropdown === link.name ? "rotate-180" : ""}`} />}
                                    </button>

                                    {/* Mobile Dropdown Items */}
                                    {link.isDropdown && activeDropdown === link.name && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="grid grid-cols-1 gap-1 pl-12 pr-4 pb-4"
                                        >
                                            {link.items?.map((item) => (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-white/40 hover:text-white"
                                                >
                                                    <item.icon size={14} className={item.color} />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">{item.name}</span>
                                                </Link>
                                            ))}
                                        </motion.div>
                                    )}
                                </div>
                            ))}
                            {/* Removed Hire Me button per user request */}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav >
    );
}
