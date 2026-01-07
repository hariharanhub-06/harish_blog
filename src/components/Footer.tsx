"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Linkedin, Instagram, Facebook, Mail, Phone as WhatsApp } from "lucide-react";

const socialLinks = [
    { name: "WhatsApp", href: "https://wa.me/919042387152", icon: WhatsApp },
    { name: "LinkedIn", href: "https://www.linkedin.com/in/hari-haran-jeyaramamoorthy/", icon: Linkedin },
    { name: "Instagram", href: "https://www.instagram.com/_mr_vibrant/", icon: Instagram },
    { name: "Facebook", href: "https://www.facebook.com/profile.php?id=61573749598737", icon: Facebook },
    { name: "Mail", href: "mailto:hariharanjeyaramoorthy@gmail.com", icon: Mail },
];

export default function Footer() {
    const pathname = usePathname();
    const isSnacksPage = pathname?.startsWith("/business/hm-snacks");

    return (
        <footer className="bg-white border-t border-gray-100 py-10">
            <div className="container mx-auto px-6">
                {!isSnacksPage && (
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 mb-12">
                        <div>
                            <Link href="/" className="text-2xl font-bold text-primary">
                                HariHaran<span className="text-accent">.</span>
                            </Link>
                            <p className="text-secondary mt-2 max-w-sm">
                                Helping businesses grow through technology and strategic leadership.
                            </p>
                        </div>

                        <div className="flex space-x-6">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-secondary hover:text-primary transition-colors p-2 bg-gray-50 rounded-full"
                                >
                                    <social.icon size={24} />
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                <div className={`${!isSnacksPage ? "border-t border-gray-50 pt-8" : ""} flex flex-col items-center text-center text-sm text-secondary`}>
                    <p>© {new Date().getFullYear()} Hari Haran Jeyaramamoorthy. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
