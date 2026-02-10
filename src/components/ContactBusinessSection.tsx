"use client";

import { useState, useEffect } from "react";
import { Mail, MessageSquare, CheckCircle2, ShieldCheck, Home, ArrowRight, Loader2, X } from "lucide-react";
import Link from "next/link";

interface ContactBusinessSectionProps {
    category?: "Business Digital Solution" | "Financial Logistics";
}

export default function ContactBusinessSection({ category = "Business Digital Solution" }: ContactBusinessSectionProps) {
    const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [formData, setFormData] = useState({
        name: "",
        businessType: "",
        serviceNeeded: "",
        contact: "",
        message: ""
    });

    // Set default service based on category
    useEffect(() => {
        if (category === "Financial Logistics") {
            setFormData(prev => ({ ...prev, serviceNeeded: "Personal Loan" }));
        } else {
            setFormData(prev => ({ ...prev, serviceNeeded: "Website Development" }));
        }
    }, [category]);

    const digitalServices = [
        "Website Development",
        "CRM Solution",
        "Lead Management",
        "Sales Automation"
    ];

    const financeServices = [
        "Personal Loan",
        "Unsecured Loan",
        "Secured Loan",
        "LAP (Loan Against Property)",
        "Business Loan",
        "Two Wheeler Finance",
        "Four Wheeler Finance"
    ];

    const currentServices = category === "Financial Logistics" ? financeServices : digitalServices;

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus("submitting");

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    businessType: formData.businessType,
                    requestedService: formData.serviceNeeded,
                    mobile: formData.contact,
                    email: formData.contact.includes("@") ? formData.contact : "not-provided@example.com",
                    message: formData.message,
                    subject: `Inquiry: ${formData.businessType} - ${formData.serviceNeeded}`,
                    category: category // Injecting the source category for admin grouping
                }),
            });

            if (res.ok) {
                setFormStatus("success");
                setFormData({
                    name: "",
                    businessType: "",
                    serviceNeeded: category === "Financial Logistics" ? "Personal Loan" : "Website Development",
                    contact: "",
                    message: ""
                });
            } else {
                setFormStatus("error");
            }
        } catch (error) {
            console.error(error);
            setFormStatus("error");
        }
    };

    return (
        <section id="contact" className="container mx-auto px-6 py-10 relative z-10 scroll-mt-20">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12">
                {/* Left: Info */}
                <div className="md:w-1/3">
                    <span className="text-orange-500 font-black tracking-[0.3em] uppercase text-xs mb-4 block">Connect</span>
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-6 leading-tight">Let's Talk <br /><span className="text-orange-500">{category === "Financial Logistics" ? "Finance" : "Business"}</span></h2>
                    <p className="text-gray-400 font-medium mb-10 text-sm leading-relaxed">Ready to upgrade your {category === "Financial Logistics" ? "financial" : "digital"} presence? We respond within 24 hours.</p>

                    <div className="space-y-4">
                        <a href="https://wa.me/919042387152" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-emerald-500/10 transition-all group">
                            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500 group-hover:rotate-12 transition-transform">
                                <MessageSquare size={20} />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-white">WhatsApp</h4>
                                <p className="text-[9px] text-gray-400">+91 90423 87152</p>
                            </div>
                        </a>
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 transition-all group">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-500 group-hover:rotate-12 transition-transform">
                                <Mail size={20} />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Email</h4>
                                <p className="text-[9px] text-gray-400">hariharanjeyaramamoorthy@gmail.com</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Form */}
                <div className="md:w-2/3 bg-[#151515] p-8 md:p-12 rounded-[3.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
                    {formStatus === "success" ? (
                        <div className="h-full flex flex-col items-center justify-center text-center py-12 md:py-20 animate-in fade-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-6 relative">
                                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping opacity-20"></div>
                                <CheckCircle2 size={40} className="relative z-10" />
                            </div>

                            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-4">Request Received Successfully</h3>

                            <div className="space-y-4 max-w-sm mx-auto mb-10">
                                <p className="text-gray-300 text-sm font-medium leading-relaxed">
                                    Thank you for contacting us. Your requirement has been received successfully.
                                </p>
                                <p className="text-gray-400 text-xs font-medium">
                                    Our team will review your request and contact you within <span className="text-orange-500 font-bold">24–48 hours</span>.
                                </p>
                            </div>

                            <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-10 border-t border-white/5 pt-8 w-full">
                                <ShieldCheck size={14} className="text-emerald-500" />
                                Your information is kept confidential and used only for consultation purposes.
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                                <Link href="/" className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                    <Home size={14} /> Back to Home
                                </Link>
                                <Link href={category === "Financial Logistics" ? "/financial-logistics" : "/services"} className="w-full sm:w-auto px-8 py-4 bg-orange-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2">
                                    View Other Services <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleFormSubmit} className="space-y-6">
                            {formStatus === "error" && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 mb-4 animate-in slide-in-from-top-2">
                                    <X size={18} className="text-red-500 shrink-0" />
                                    <p className="text-red-400 text-xs font-bold leading-tight">
                                        Submission failed. Please try again or contact us via email.
                                    </p>
                                </div>
                            )}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Name</label>
                                    <input
                                        type="text" required value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-orange-500 outline-none transition-all placeholder:text-gray-800"
                                        placeholder="Your Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Business Type</label>
                                    <input
                                        type="text" required value={formData.businessType}
                                        onChange={e => setFormData({ ...formData, businessType: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-orange-500 outline-none transition-all placeholder:text-gray-800"
                                        placeholder="e.g. Retail"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Contact (Phone/Email)</label>
                                <input
                                    type="text" required value={formData.contact}
                                    onChange={e => setFormData({ ...formData, contact: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-orange-500 outline-none transition-all placeholder:text-gray-800"
                                    placeholder="+91... / email@..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Service</label>
                                <select
                                    value={formData.serviceNeeded}
                                    onChange={e => setFormData({ ...formData, serviceNeeded: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-orange-500 outline-none transition-all"
                                >
                                    {currentServices.map(s => (
                                        <option key={s} value={s} className="bg-[#1a1a1a]">{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Requirements</label>
                                <textarea
                                    rows={3} value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-orange-500 outline-none transition-all placeholder:text-gray-800 resize-none"
                                    placeholder="Briefly describe what you need..."
                                />
                            </div>
                            <button
                                type="submit" disabled={formStatus === "submitting"}
                                className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] rounded-xl hover:bg-orange-500 hover:text-white transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {formStatus === "submitting" ? <Loader2 className="animate-spin" size={14} /> : "Submit Inquiry"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
