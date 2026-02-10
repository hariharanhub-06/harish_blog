"use client";

import { ArrowRight, Code, Database, BarChart, Zap, CheckCircle2, X, Globe, Users, RefreshCw, BarChart3, MessageSquare, Briefcase, GraduationCap, Rocket, Store, Mail, Phone, Loader2, Home, ShieldCheck, IndianRupee, Layers, PenTool } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { MatrixBackground } from "@/components/MatrixBackground";
import ContactBusinessSection from "@/components/ContactBusinessSection";

export default function ServicesPage() {
    const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [formData, setFormData] = useState({
        name: "",
        businessType: "",
        serviceNeeded: "Website Development",
        contact: "",
        message: ""
    });

    const handleFormSubmit = async (e: React.FormEvent) => {
        // Form logic moved to ContactBusinessSection
    };

    const crmSteps = [
        { title: "Capture Lead", icon: Users, desc: "From website, ads, or manual entry.", color: "text-blue-400" },
        { title: "Track Contact", icon: MessageSquare, desc: "Log calls, emails, and notes.", color: "text-purple-400" },
        { title: "Follow Up", icon: RefreshCw, desc: "Automated reminders & sequences.", color: "text-orange-400" },
        { title: "Conversion", icon: BarChart3, desc: "Turn prospects into revenue.", color: "text-emerald-400" }
    ];

    const industries = [
        {
            id: "small-biz",
            title: "Small Businesses",
            icon: Store,
            description: "Local shops, service providers, and agencies.",
            benefit: "Rank higher on local search, manage appointments, and collect reviews automatically.",
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            id: "coaching",
            title: "Coaching Institutes",
            icon: GraduationCap,
            description: "Tutors, training centers, and educational hubs.",
            benefit: "Student enrollment forms, fee tracking, and automated class reminders via WhatsApp/Email.",
            color: "text-orange-500",
            bg: "bg-orange-500/10"
        },
        {
            id: "startups",
            title: "Startups",
            icon: Rocket,
            description: "Tech products, SaaS, and innovative ventures.",
            benefit: "Scalable architecture, MVP development, and investor-ready dashboards.",
            color: "text-purple-500",
            bg: "bg-purple-500/10"
        },
        {
            id: "freelancers",
            title: "Freelancers & Consultants",
            icon: Briefcase,
            description: "Independent professionals and contractors.",
            benefit: "Professional portfolio to showcase work and a CRM to manage client projects efficiently.",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        }
    ];

    const services = [
        {
            id: "web-dev",
            title: "Business Website Development",
            icon: Code,
            description: "High-performance, stunning websites tailored to your brand identity.",
            features: ["Custom Design & Branding", "Mobile Responsive", "SEO Optimized", "Fast Loading Speed"],
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        {
            id: "crm-dev",
            title: "CRM Development & Setup",
            icon: Database,
            description: "Centralize your customer data and streamline your sales process.",
            features: ["Lead Tracking", "Contact Management", "Pipeline Visualization", "Automated Workflows"],
            color: "text-purple-500",
            bg: "bg-purple-500/10",
        },
        {
            id: "lead-mgmt",
            title: "Lead Management Systems",
            icon: BarChart,
            description: "Capture, qualify, and nurture leads to boost conversion rates.",
            features: ["Lead Capture Forms", "Automatic Scoring", "Follow-up Reminders", "Performance Analytics"],
            color: "text-orange-500",
            bg: "bg-orange-500/10",
        },
        {
            id: "sales-auto",
            title: "Sales Automation Solutions",
            icon: Zap,
            description: "Automate repetitive tasks and focus on closing deals.",
            features: ["Email Sequences", "Task Automation", "Meeting Scheduling", "Integration with Tools"],
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
        }
    ];

    return (
        <div className="min-h-screen bg-[#0e0e0e] text-white relative flex flex-col">
            <MatrixBackground />

            {/* Hero Section */}
            <section className="container mx-auto px-6 pt-4 pb-10 md:pt-6 md:pb-12 text-center relative z-10">
                <span className="text-orange-500 font-black tracking-[0.3em] uppercase text-xs mb-4 block">Hariharan Hub</span>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 leading-tight">
                    Business <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-600">Digital Solution</span> <br className="hidden md:block" /> Growth Engine
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-10 font-medium">
                    We empower small businesses, startups, and coaching centers with high-performance websites and automated CRM systems designed for digital scale.
                </p>
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <Link href="/contact-business" className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-orange-500 hover:text-white transition-all shadow-xl">
                        Get Free Consultation
                    </Link>
                    <Link href="/crm-solutions" className="px-8 py-4 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-white/10 transition-all backdrop-blur-sm">
                        Explore CRM Solutions
                    </Link>
                </div>
                <p className="text-gray-500 mt-8 text-sm md:text-base font-bold max-w-xl mx-auto leading-relaxed">
                    Stop managing leads on spreadsheets. Let's build a unified system that grows your business 24/7.
                </p>
            </section>

            {/* Problem Awareness Section */}
            <section className="container mx-auto px-6 py-10 relative z-10 border-t border-white/5">
                <div className="max-w-5xl mx-auto bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5 rounded-[3rem] border border-white/10 p-10 md:p-16 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[100px] -z-10"></div>
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="text-red-500 font-black tracking-[0.3em] uppercase text-xs mb-4 block">Pain Points</span>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-6 leading-tight">
                                Common Business <br /><span className="text-red-500">Challenges</span>
                            </h2>
                            <p className="text-gray-400 font-medium mb-8">
                                Are you struggling to maintain growth with manual processes? Many businesses face these exact hurdles every day.
                            </p>
                            <Link href="/contact-business" className="inline-flex items-center gap-3 px-8 py-4 bg-red-500 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-red-600 transition-all shadow-xl shadow-red-500/20">
                                Solve These Challenges Now <ArrowRight size={16} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { title: "Missing customer inquiries", desc: "No central system to capture every lead that visits your site." },
                                { title: "No organized lead tracking", desc: "Leads scattered across emails, WhatsApp, and notebooks." },
                                { title: "Manual follow-ups", desc: "Inconsistent communication leads to lost sales opportunities." },
                                { title: "Lack of professional digital presence", desc: "A website that doesn't build trust or convert visitors." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-red-500/30 transition-all group">
                                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shrink-0 group-hover:scale-110 transition-transform">
                                        <X size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black uppercase tracking-tight mb-1">{item.title}</h4>
                                        <p className="text-[10px] text-gray-500 font-medium">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Solution Explanation Section */}
            <section id="solutions" className="container mx-auto px-6 py-10 relative z-10 scroll-mt-20">
                <div className="flex flex-col items-center mb-16 text-center">
                    <span className="text-blue-500 font-black tracking-[0.3em] uppercase text-xs mb-4 block">Our Expertise</span>
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">Digital <span className="text-blue-500">Solutions</span></h2>
                    <p className="text-gray-400 max-w-xl mx-auto text-sm font-medium">A unified system designed to automate your sales funnel and professionalize your brand.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {services.map((service) => (
                        <div key={service.id} className="group bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all hover:-translate-y-1 duration-300">
                            <div className={`w-14 h-14 ${service.bg} rounded-2xl flex items-center justify-center mb-6`}>
                                <service.icon className={`${service.color}`} size={28} />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tight mb-3 group-hover:text-white transition-colors">{service.title}</h3>
                            <p className="text-gray-400 font-medium mb-6 leading-relaxed">
                                {service.description}
                            </p>
                            <ul className="space-y-3 mb-8">
                                {service.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-gray-300">
                                        <CheckCircle2 size={16} className={service.color} />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Link href="/contact-business" className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest ${service.color} hover:opacity-80 transition-opacity`}>
                                Request Consultation <ArrowRight size={14} />
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* CRM Workflow Section */}
            <section id="crm" className="container mx-auto px-6 py-10 relative z-10 scroll-mt-20">
                <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-16 overflow-hidden relative">
                    <div className="text-center mb-16">
                        <span className="text-purple-500 font-black tracking-[0.3em] uppercase text-xs mb-4 block">CRM Systems</span>
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">Turn Leads into <span className="text-purple-500">Loyal Customers</span></h2>
                        <p className="text-gray-400 max-w-xl mx-auto text-sm font-medium">A Customer Relationship Management system is your business brain. Track interaction, automate follow-ups.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-0 w-full h-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 z-0 transform -translate-y-1/2"></div>

                        {crmSteps.map((step, i) => (
                            <div key={i} className="relative z-10 bg-[#151515] p-8 rounded-[2rem] border border-white/10 flex flex-col items-center text-center group hover:border-purple-500/30 transition-all">
                                <div className={`w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 ${step.color} border border-white/5 group-hover:scale-110 transition-transform`}>
                                    <step.icon size={24} />
                                </div>
                                <h3 className="font-black uppercase tracking-tight text-white mb-3 text-sm">{step.title}</h3>
                                <p className="text-[10px] text-gray-500 font-medium leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            {[
                                { title: "Centralized Data", desc: "One place for all customer info. No more sticky notes." },
                                { title: "Sales Tracking", desc: "Know exactly where every deal stands in the pipeline." },
                                { title: "Automated Tasks", desc: "Let the system send emails and set reminders for you." },
                                { title: "Performance Insights", desc: "Visual dashboards to see what's working." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                                        <CheckCircle2 size={14} className="text-purple-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-white text-xs uppercase tracking-tight">{item.title}</h4>
                                        <p className="text-gray-500 text-[10px] font-medium">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-black/40 p-8 rounded-3xl border border-white/10 shadow-2xl relative">
                            <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-4 w-3/4 bg-white/5 rounded-full animate-pulse"></div>
                                <div className="h-4 w-1/2 bg-white/5 rounded-full animate-pulse"></div>
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="h-20 bg-purple-500/10 rounded-2xl border border-purple-500/20 px-4 flex flex-col justify-center">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-purple-400">Conversion</span>
                                        <span className="text-xl font-black text-white">12.5%</span>
                                    </div>
                                    <div className="h-20 bg-blue-500/10 rounded-2xl border border-blue-500/20 px-4 flex flex-col justify-center">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-blue-400">Total Leads</span>
                                        <span className="text-xl font-black text-white">1.2K+</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How We Work Section */}
            <section id="process" className="container mx-auto px-6 py-10 relative z-10 scroll-mt-20">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-orange-500 font-black tracking-[0.3em] uppercase text-xs mb-4 block">Process</span>
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">How We <span className="text-white">Work</span></h2>
                    </div>

                    <div className="grid md:grid-cols-5 gap-8">
                        {[
                            { step: "01", title: "Submit Requirement", desc: "Share your business goals and current challenges with us." },
                            { step: "02", title: "Business Analysis", desc: "Our team analyzes your needs to design the perfect workflow." },
                            { step: "03", title: "Consultation Discussion", desc: "A deep dive to finalize the strategy and solution architecture." },
                            { step: "04", title: "Solution Setup", desc: "Rapid development and deployment of your website and CRM." },
                            { step: "05", title: "Ongoing Support", desc: "Continuous monitoring and updates to ensure peak performance." }
                        ].map((item, idx) => (
                            <div key={idx} className="relative group">
                                <span className="text-4xl font-black text-white/5 group-hover:text-orange-500/10 transition-colors absolute -top-4 -left-2">{item.step}</span>
                                <div className="relative z-10 pt-4">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-white mb-2 group-hover:text-orange-500 transition-colors">{item.title}</h3>
                                    <p className="text-[10px] text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                                </div>
                                {idx < 4 && <div className="hidden md:block absolute top-10 -right-4 w-8 h-px bg-white/10" />}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Industries Section */}
            <section id="industries" className="container mx-auto px-6 py-10 relative z-10 scroll-mt-20">
                <div className="text-center mb-16">
                    <span className="text-blue-500 font-black tracking-[0.3em] uppercase text-xs mb-4 block">Industries</span>
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Solutions Tailored to <span className="text-white">Your Sector</span></h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {industries.map((industry) => (
                        <div key={industry.id} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 hover:bg-white/10 transition-all group">
                            <div className="flex flex-col md:flex-row items-start gap-6">
                                <div className={`w-16 h-16 ${industry.bg} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                    <industry.icon className={industry.color} size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tight mb-2 text-white">{industry.title}</h3>
                                    <p className="text-gray-400 text-xs font-bold mb-4">{industry.description}</p>
                                    <div className="bg-black/40 rounded-2xl p-5 border border-white/5">
                                        <p className="text-xs text-gray-300 font-medium leading-relaxed">
                                            <span className={`${industry.color} font-black uppercase tracking-wider text-[10px] block mb-2`}>How We Help:</span>
                                            {industry.benefit}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Business Benefits Section */}
            <section className="container mx-auto px-6 py-10 relative z-10">
                <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 md:p-16">
                    <div className="text-center mb-16">
                        <span className="text-emerald-500 font-black tracking-[0.3em] uppercase text-xs mb-4 block">The Impact</span>
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Business <span className="text-emerald-500">Benefits</span></h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { title: "Organized Customer Management", desc: "No more lost leads. Every interaction is tracked and managed centrally.", icon: Database },
                            { title: "Faster Response Time", desc: "Automated alerts and workflows ensure you're always the first to respond.", icon: Zap },
                            { title: "Professional Brand Presence", desc: "A world-class website that positions you as an industry leader.", icon: Globe },
                            { title: "Improved Operational Efficiency", desc: "Focus on closing deals while our system handles the busy work.", icon: BarChart }
                        ].map((item, i) => (
                            <div key={i} className="text-center group">
                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10 group-hover:border-emerald-500/50 transition-all group-hover:scale-110">
                                    <item.icon className="text-emerald-500" size={32} />
                                </div>
                                <h4 className="text-sm font-black uppercase tracking-tight mb-3 px-4">{item.title}</h4>
                                <p className="text-[10px] text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Demo / Proof Section */}
            <section className="container mx-auto px-6 py-10 relative z-10">
                <div className="text-center mb-16">
                    <span className="text-purple-500 font-black tracking-[0.3em] uppercase text-xs mb-4 block">Proof of Concept</span>
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">System <span className="text-purple-500">Previews</span></h2>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-6 group">
                        <div className="aspect-video bg-white/5 rounded-[2rem] border border-white/10 overflow-hidden relative shadow-2xl group-hover:border-purple-500/30 transition-all">
                            <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80" alt="CRM Dashboard Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Smart CRM Interface</p>
                            </div>
                        </div>
                        <h4 className="text-lg font-black uppercase tracking-tighter ml-4">Advanced CRM Dashboard</h4>
                        <p className="text-xs text-gray-500 font-medium ml-4 leading-relaxed">Centralize lead tracking, automate follow-ups, and visualize your sales pipeline with precision.</p>
                    </div>

                    <div className="space-y-6 group">
                        <div className="aspect-video bg-white/5 rounded-[2rem] border border-white/10 overflow-hidden relative shadow-2xl group-hover:border-orange-500/30 transition-all">
                            <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80" alt="Business Website Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Professional Web Engine</p>
                            </div>
                        </div>
                        <h4 className="text-lg font-black uppercase tracking-tighter ml-4">High-Conversion Website</h4>
                        <p className="text-xs text-gray-500 font-medium ml-4 leading-relaxed">Fast, SEO-optimized, and conversion-focused designs that turn visitors into paying customers.</p>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="container mx-auto px-6 py-10 relative z-10 scroll-mt-20">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-orange-500 font-black tracking-[0.3em] uppercase text-xs mb-4 block">Pricing</span>
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Investment <span className="text-white">Guide</span></h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                title: "Starter Websites",
                                price: "₹12,000",
                                icon: Rocket,
                                desc: "Starter business websites begin from ₹12,000.",
                                color: "text-blue-500"
                            },
                            {
                                title: "Integrated Systems",
                                price: "₹25k - ₹40k",
                                icon: Layers,
                                desc: "Business websites with lead management typically range from ₹25,000 to ₹40,000 depending on requirements.",
                                color: "text-orange-500"
                            },
                            {
                                title: "Custom Solutions",
                                price: "Custom",
                                icon: PenTool,
                                desc: "Custom business systems are priced based on scope and complexity.",
                                color: "text-purple-500"
                            }
                        ].map((item, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all group flex flex-col h-full">
                                <item.icon className={`${item.color} mb-6 group-hover:scale-110 transition-transform`} size={28} />
                                <h3 className="text-sm font-black uppercase tracking-tight text-white mb-2">{item.title}</h3>
                                <p className="text-[10px] text-gray-400 font-medium leading-relaxed flex-grow">{item.desc}</p>
                                <div className="mt-8 pt-6 border-t border-white/5 flex items-baseline gap-1">
                                    <span className={`text-xl font-black ${item.color}`}>{item.price}</span>
                                    {item.price.includes("₹") && <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Base</span>}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-3">
                            <ArrowRight size={14} className="text-orange-500" />
                            Request a consultation to receive an exact quote for your business.
                        </p>
                    </div>
                </div>
            </section>

            <ContactBusinessSection />
        </div>
    );
}
