"use client";

import Link from "next/link";
import { Linkedin, Instagram, Facebook, Mail, Phone as WhatsApp } from "lucide-react";

const socialLinks = [
    { name: "WhatsApp", href: "https://wa.me/919042387152", icon: WhatsApp },
    { name: "LinkedIn", href: "https://www.linkedin.com/in/hari-haran-jeyaramamoorthy/", icon: Linkedin },
    { name: "Instagram", href: "https://www.instagram.com/_mr_vibrant/", icon: Instagram },
    { name: "Facebook", href: "https://www.facebook.com/profile.php?id=61573749598737", icon: Facebook },
    { name: "Mail", href: "mailto:hariharanjeyaramoorthy@gmail.com", icon: Mail },
];

export default function Footer() {

    return (
        <footer className="bg-[#111] border-t border-white/10 py-4 transition-colors duration-300 relative z-50">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 mb-6">
                    <div>
                        <Link href="/" className="text-xl font-bold text-primary">
                            HariHaran<span className="text-accent">.</span>
                        </Link>
                        <p className="text-gray-400 mt-1 max-w-sm text-xs">
                            Helping businesses grow through technology and strategic leadership.
                        </p>
                    </div>

                    <div className="flex space-x-4">
                        {socialLinks.map((social) => (
                            <a
                                key={social.name}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-primary transition-colors p-1.5 bg-white/5 rounded-lg"
                            >
                                <social.icon size={20} />
                            </a>
                        ))}
                    </div>
                </div>

                <div className="border-t border-white/10 pt-4 flex flex-col md:flex-row items-center justify-center gap-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <p>© {new Date().getFullYear()} Hari Haran Jeyaramamoorthy. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
