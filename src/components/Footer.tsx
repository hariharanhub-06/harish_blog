import Link from "next/link";
import { Linkedin, Github, Twitter, Instagram } from "lucide-react";

const socialLinks = [
    { name: "LinkedIn", href: "https://www.linkedin.com/in/hari-haran-jeyaramamoorthy/", icon: Linkedin },
    { name: "GitHub", href: "https://github.com/startup-digi-3119", icon: Github },
];

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 py-12">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
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

                <div className="border-t border-gray-50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-secondary">
                    <p>© {new Date().getFullYear()} Hari Haran Jeyaramamoorthy. All rights reserved.</p>
                    <div className="flex space-x-8 mt-4 md:mt-0">
                        <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
