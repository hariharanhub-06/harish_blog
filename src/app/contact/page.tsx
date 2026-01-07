"use client";

import { useState } from "react";
import { Send, Mail, Phone, MapPin, Linkedin, Github, CheckCircle2 } from "lucide-react";

export default function Contact() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus("loading");
        // Simulate API call
        setTimeout(() => setStatus("success"), 2000);
    };

    if (status === "success") {
        return (
            <div className="container mx-auto px-6 py-40 flex flex-col items-center text-center">
                <div className="bg-green-50 text-green-600 p-8 rounded-full mb-8">
                    <CheckCircle2 size={80} />
                </div>
                <h1 className="text-4xl font-bold mb-4">Message Received!</h1>
                <p className="text-secondary text-lg max-w-md mb-12">
                    Thank you for reaching out. I&apos;ll get back to you within 24 hours.
                </p>
                <button
                    onClick={() => setStatus("idle")}
                    className="bg-primary text-white px-10 py-4 rounded-full font-bold shadow-lg"
                >
                    Send another message
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-20">
            <div className="grid lg:grid-cols-2 gap-20 items-start">
                {/* Contact Info */}
                <div className="space-y-12">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Let&apos;s Connect</h1>
                        <p className="text-secondary text-lg leading-relaxed">
                            Have a project in mind or just want to chat about technology and career growth?
                            I&apos;m always open to interesting conversations and collaborations.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center space-x-6 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                            <div className="bg-blue-50 p-4 rounded-2xl text-primary">
                                <Mail size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-secondary uppercase tracking-widest">Email Me</p>
                                <p className="text-lg font-bold">hariharan@example.com</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-6 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                            <div className="bg-amber-50 p-4 rounded-2xl text-accent">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-secondary uppercase tracking-widest">Location</p>
                                <p className="text-lg font-bold">Tamil Nadu, India</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-6 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                            <div className="bg-gray-50 p-4 rounded-2xl text-gray-900">
                                <Linkedin size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-secondary uppercase tracking-widest">LinkedIn</p>
                                <p className="text-lg font-bold">/in/hari-haran-jeyaramamoorthy</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-2xl border border-gray-100 relative group overflow-hidden">
                    {/* Decorative Background Blob */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />

                    <form className="space-y-8 relative z-10" onSubmit={handleSubmit}>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-900 ml-2">Your Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="John Doe"
                                    className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-primary transition-all placeholder:text-gray-300"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-900 ml-2">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    placeholder="john@example.com"
                                    className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-primary transition-all placeholder:text-gray-300"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-900 ml-2">Subject</label>
                            <input
                                required
                                type="text"
                                placeholder="Project Opportunity"
                                className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-primary transition-all placeholder:text-gray-300"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-900 ml-2">Message</label>
                            <textarea
                                required
                                rows={5}
                                placeholder="How can I help you?"
                                className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-primary transition-all placeholder:text-gray-300"
                            />
                        </div>

                        <button
                            disabled={status === "loading"}
                            className="w-full bg-primary text-white py-5 rounded-[2rem] font-bold text-lg flex items-center justify-center space-x-3 group-hover:shadow-2xl group-hover:shadow-primary/20 transition-all disabled:opacity-50"
                        >
                            {status === "loading" ? (
                                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Send Message</span>
                                    <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
