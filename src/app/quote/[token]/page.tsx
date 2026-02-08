"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getQuoteByToken } from "@/lib/actions/quote-actions";
import {
    FileText,
    CheckCircle2,
    Clock,
    Download,
    ShieldCheck,
    Globe,
    ExternalLink,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { MatrixBackground } from "@/components/MatrixBackground";

export default function PublicQuotePage() {
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [quote, setQuote] = useState<any>(null);

    useEffect(() => {
        if (params.token) {
            fetchQuote();
        }
    }, [params.token]);

    const fetchQuote = async () => {
        const res = await getQuoteByToken(params.token as string);
        if (res.success) {
            setQuote(res.quote);
        }
        setLoading(false);
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0e0e0e] flex flex-col items-center justify-center gap-4 text-white">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Decrypting Secure Quote...</p>
        </div>
    );

    if (!quote) return (
        <div className="min-h-screen bg-[#0e0e0e] flex flex-col items-center justify-center gap-4 text-white">
            <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center">
                <ShieldCheck size={40} />
            </div>
            <h1 className="text-2xl font-black">Quote Not Found</h1>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">This link may have expired or is invalid.</p>
            <Link href="/" className="mt-4 px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest">Return Home</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0e0e0e] text-white selection:bg-primary/20 relative overflow-hidden font-poppins">
            <MatrixBackground />

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 lg:py-32 space-y-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-1.5 rounded-full border border-primary/20">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Digital Solution Proposal</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none">
                            {quote.projectName.split(' ').map((word: string, i: number) => (
                                <span key={i} className={i % 2 === 1 ? "text-primary italic" : ""}>{word} </span>
                            ))}
                        </h1>
                        <p className="text-gray-400 font-bold text-sm uppercase tracking-[0.2em]">Prepared specifically for <span className="text-white underline underline-offset-8 decoration-primary/50">{quote.clientName}</span></p>
                    </div>

                    <div className="p-8 bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2.5rem] shrink-0 w-full md:w-auto">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Total Project Investment</p>
                        <p className="text-5xl font-black italic tracking-tighter text-primary">₹{Number(quote.finalPrice).toLocaleString()}</p>
                    </div>
                </div>

                {/* Scope & Deliverables Table */}
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <h2 className="text-xs font-black uppercase tracking-[0.4em] text-gray-500 ml-6 flex items-center gap-3">
                        <FileText size={16} className="text-primary" /> Proposed Project Scope
                    </h2>

                    <div className="bg-white/5 border border-white/10 backdrop-blur-3xl rounded-[3rem] overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-white/5">
                                    <th className="py-6 px-10 w-2/3">Deliverable Component</th>
                                    <th className="py-6 px-10 text-center">Implementation Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {/* Pages */}
                                {(quote.deliverables?.pages || []).map((p: any, i: number) => (
                                    <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="py-8 px-10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary italic font-black text-xs">P{i + 1}</div>
                                                <div>
                                                    <p className="text-sm font-black italic">{p.type}</p>
                                                    <p className="text-[9px] font-bold text-gray-500 uppercase">Interactive Design + Logic</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-8 px-10 text-center">
                                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-lg uppercase tracking-tighter">Planned</span>
                                        </td>
                                    </tr>
                                ))}

                                {/* Features */}
                                {(quote.deliverables?.features || []).map((f: any, i: number) => (
                                    <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="py-8 px-10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500"><Zap size={16} /></div>
                                                <div>
                                                    <p className="text-sm font-black italic">Advanced Feature: {f}</p>
                                                    <p className="text-[9px] font-bold text-gray-500 uppercase">Seamless System Integration</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-8 px-10 text-center">
                                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-lg uppercase tracking-tighter">Included</span>
                                        </td>
                                    </tr>
                                ))}

                                {/* CRM Module */}
                                {quote.deliverables?.crm && (
                                    <tr className="bg-primary/5">
                                        <td className="py-10 px-10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center"><LayoutIcon size={20} /></div>
                                                <div>
                                                    <p className="text-lg font-black tracking-tight">Full CRM Suite & Business Automations</p>
                                                    <p className="text-xs font-bold text-gray-400 italic">Centralized database, lead tracking, and dashboard.</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-10 px-10 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <CheckCircle2 size={24} className="text-primary" />
                                                <span className="text-[10px] font-black uppercase text-primary tracking-widest">Active</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Timeline & Next Steps */}
                <div className="grid md:grid-cols-2 gap-10">
                    <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] space-y-6">
                        <div className="flex items-center gap-4">
                            <Clock className="text-primary" size={24} />
                            <h3 className="text-xl font-black tracking-tight">Execution Timeline.</h3>
                        </div>
                        <p className="text-gray-400 text-sm font-medium leading-relaxed uppercase tracking-widest text-[10px]">Estimated deployment within <span className="text-white">{quote.timeline === 'Standard' ? '7-10' : quote.timeline === 'Fast Track' ? '4-6' : '3-5'} business days</span> from project commencement. We prioritize velocity without compromising architectural integrity.</p>
                    </div>

                    <div className="p-10 bg-primary/10 border border-primary/20 rounded-[3rem] flex flex-col justify-center gap-6">
                        <div className="flex items-center gap-4">
                            <CheckCircle2 className="text-primary" size={24} />
                            <h3 className="text-xl font-black tracking-tight">Next Phase.</h3>
                        </div>
                        <button className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
                            Acknowledge Proposal
                        </button>
                    </div>
                </div>

                {/* Footer Copyright */}
                <div className="pt-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 opacity-30">
                    <p className="text-[10px] font-black uppercase tracking-widest">© {new Date().getFullYear()} Hariharan Digital Solutions</p>
                    <div className="flex gap-6">
                        <Globe size={16} />
                        <ShieldCheck size={16} />
                        <ExternalLink size={16} />
                    </div>
                </div>
            </div>
        </div>
    );
}
