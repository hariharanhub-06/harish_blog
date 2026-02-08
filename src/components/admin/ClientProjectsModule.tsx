"use client";

import { useEffect, useState } from "react";
import {
    Briefcase,
    Calendar,
    CheckCircle2,
    Clock,
    DollarSign,
    Edit3,
    FileText,
    History,
    Loader2,
    Plus,
    RefreshCcw,
    Search,
    Trash2,
    User,
    X,
    ChevronRight,
    ArrowRight,
    TrendingUp,
    AlertCircle,
    Copy,
    Save
} from "lucide-react";
import AgreementGenerator from "./AgreementGenerator";

export default function ClientProjectsModule() {
    const [projects, setProjects] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [viewing, setViewing] = useState<any>(null);
    const [updating, setUpdating] = useState(false);
    const [showGenerator, setShowGenerator] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async (silent = false) => {
        if (!silent) setFetching(true);
        try {
            const res = await fetch("/api/admin/client-projects");
            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            }
        } catch (error) {
            console.error(error);
        }
        if (!silent) setFetching(false);
    };

    const handleUpdateProject = async (updateData: any) => {
        setUpdating(true);
        try {
            const res = await fetch("/api/admin/client-projects", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updateData),
            });
            if (res.ok) {
                const updated = await res.json();
                setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
                if (viewing?.id === updated.id) setViewing(updated);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Remove this project record? This cannot be undone.")) return;
        try {
            const res = await fetch(`/api/admin/client-projects?id=${id}`, { method: "DELETE" });
            if (res.ok) fetchProjects();
        } catch (error) {
            console.error(error);
        }
    };

    const toggleChecklistItem = (itemIdx: number) => {
        const newChecklist = [...viewing.onboardingChecklist];
        newChecklist[itemIdx].completed = !newChecklist[itemIdx].completed;
        handleUpdateProject({ ...viewing, onboardingChecklist: newChecklist });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "onboarding": return "bg-blue-50 text-blue-600 border-blue-100";
            case "development": return "bg-purple-50 text-purple-600 border-purple-100";
            case "testing": return "bg-amber-50 text-amber-600 border-amber-100";
            case "delivered": return "bg-emerald-50 text-emerald-600 border-emerald-100";
            case "support": return "bg-cyan-50 text-cyan-600 border-cyan-100";
            default: return "bg-gray-50 text-gray-500 border-gray-100";
        }
    };

    const getPaymentColor = (status: string) => {
        switch (status) {
            case "pending": return "bg-red-50 text-red-600 border-red-100";
            case "advance_paid": return "bg-amber-50 text-amber-600 border-amber-100";
            case "fully_paid": return "bg-emerald-50 text-emerald-600 border-emerald-100";
            default: return "bg-gray-50 text-gray-500 border-gray-100";
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2 uppercase tracking-tighter">
                        Active Client Projects ({projects.length})
                        <button onClick={() => fetchProjects()} className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-all">
                            <RefreshCcw size={14} className={fetching ? "animate-spin" : ""} />
                        </button>
                    </h2>
                    <p className="text-secondary text-xs font-bold mt-0.5">Manage delivery, payments, and legal agreements</p>
                </div>
            </div>

            {/* Project Grid */}
            <div className="grid gap-6">
                {projects.map((project) => (
                    <div
                        key={project.id}
                        className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col xl:flex-row items-start xl:items-center gap-6 xl:gap-12 hover:border-primary/20 group"
                    >
                        <div className="flex items-center gap-5 min-w-[280px]">
                            <div className={`w-14 h-14 rounded-2xl ${getStatusColor(project.status)} flex items-center justify-center font-black text-xl shadow-sm group-hover:scale-110 transition-transform`}>
                                {project.clientName.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-black text-gray-900 text-lg leading-tight">{project.title}</h3>
                                <p className="text-secondary font-bold text-xs mt-1 flex items-center gap-1.5">
                                    <User size={12} className="text-primary" /> {project.clientName}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 flex-1 w-full">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-1.5">Investment</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-black italic">₹{project.price.toLocaleString()}</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-1.5">Payment</span>
                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getPaymentColor(project.paymentStatus)}`}>
                                    {project.paymentStatus.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="hidden md:block">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-1.5">Project Status</span>
                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusColor(project.status)}`}>
                                    {project.status}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full xl:w-auto pt-6 xl:pt-0 border-t xl:border-0 border-gray-50">
                            <button
                                onClick={() => setViewing(project)}
                                className="flex-1 xl:flex-none bg-primary text-white px-6 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                Manage <ChevronRight size={14} />
                            </button>
                            <button
                                onClick={() => handleDelete(project.id)}
                                className="p-3.5 bg-red-50 text-red-300 hover:bg-red-500 hover:text-white rounded-2xl transition-all active:scale-95"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {projects.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center">
                        <Briefcase size={40} className="text-gray-200 mb-4" />
                        <p className="text-secondary font-black uppercase tracking-widest text-sm">No active projects found</p>
                        <p className="text-[10px] text-gray-400 font-bold mt-2">Convert won leads into projects to start tracking</p>
                    </div>
                )}
            </div>

            {/* Project Management Modal */}
            {viewing && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-10 relative scrollbar-hide">
                        <button onClick={() => setViewing(null)} className="absolute top-8 right-8 p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-full transition-all">
                            <X size={24} />
                        </button>

                        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                            <div className={`w-20 h-20 rounded-3xl ${getStatusColor(viewing.status)} flex items-center justify-center font-black text-3xl shadow-lg border-2 border-white`}>
                                {viewing.clientName.charAt(0)}
                            </div>
                            <div className="text-center md:text-left space-y-1">
                                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{viewing.title}</h3>
                                <p className="text-primary font-black uppercase text-xs tracking-widest flex items-center justify-center md:justify-start gap-2">
                                    <User size={14} /> {viewing.clientName} {viewing.businessName && `| ${viewing.businessName}`}
                                </p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 mb-12">
                            <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Progress Status</p>
                                <select
                                    value={viewing.status}
                                    onChange={(e) => handleUpdateProject({ ...viewing, status: e.target.value })}
                                    className="w-full bg-white border-0 rounded-2xl p-4 font-black uppercase text-[11px] tracking-widest focus:ring-2 focus:ring-primary shadow-sm"
                                >
                                    <option value="onboarding">Onboarding</option>
                                    <option value="development">Development</option>
                                    <option value="testing">Testing</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="support">Active Support</option>
                                </select>
                            </div>

                            <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Payment Cycle</p>
                                <select
                                    value={viewing.paymentStatus}
                                    onChange={(e) => handleUpdateProject({ ...viewing, paymentStatus: e.target.value })}
                                    className="w-full bg-white border-0 rounded-2xl p-4 font-black uppercase text-[11px] tracking-widest focus:ring-2 focus:ring-emerald-500 shadow-sm"
                                >
                                    <option value="pending">Pending Advance</option>
                                    <option value="advance_paid">Advance Received</option>
                                    <option value="fully_paid">Fully Paid</option>
                                </select>
                            </div>

                            <div className="p-6 bg-gray-900 rounded-[2rem] text-white space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Commercials</p>
                                <div className="space-y-1 px-2">
                                    <p className="text-2xl font-black italic tracking-tighter">₹{viewing.price.toLocaleString()}</p>
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                        Balance: ₹{(viewing.price - (viewing.advancePaid || 0)).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-10">
                            {/* Onboarding Checklist */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between ml-2">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Onboarding Checklist</h4>
                                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black">
                                        <TrendingUp size={10} />
                                        {Math.round((viewing.onboardingChecklist.filter((t: any) => t.completed).length / viewing.onboardingChecklist.length) * 100)}%
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {viewing.onboardingChecklist.map((item: any, idx: number) => (
                                        <button
                                            key={item.id}
                                            onClick={() => toggleChecklistItem(idx)}
                                            className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${item.completed ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700' : 'bg-white border-gray-100 text-gray-500 hover:border-primary/20'}`}
                                        >
                                            <span className="text-xs font-bold">{item.task}</span>
                                            {item.completed ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Clock size={18} className="text-gray-200" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Project Docs & Actions */}
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Actions & Documents</h4>
                                <div className="grid gap-3">
                                    <button
                                        onClick={() => setShowGenerator(true)}
                                        className="w-full p-5 bg-purple-50 text-purple-600 rounded-3xl border border-purple-100 flex flex-col items-center justify-center gap-2 hover:bg-purple-600 hover:text-white transition-all group"
                                    >
                                        <FileText size={24} className="group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Agreement Generator</span>
                                    </button>

                                    {viewing.agreementContent && (
                                        <div className="p-5 bg-gray-50 rounded-3xl border border-dashed border-gray-200 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-600">
                                                    <CheckCircle2 size={12} /> Agreement Saved
                                                </div>
                                                <button className="text-[9px] font-black uppercase text-primary hover:underline">View Preview</button>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(viewing.agreementContent);
                                                    alert("Saved agreement content copied to clipboard!");
                                                }}
                                                className="w-full py-3 bg-white border border-gray-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Copy size={12} /> Copy Saved Agreement
                                            </button>
                                        </div>
                                    )}

                                    <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100 space-y-4">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle size={14} className="text-orange-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-orange-900">Admin Controls</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-[8px] font-black text-orange-700 uppercase mb-1">Internal Cost</p>
                                                <input
                                                    type="number"
                                                    value={viewing.internalCost || 0}
                                                    onChange={(e) => setViewing({ ...viewing, internalCost: parseFloat(e.target.value) })}
                                                    onBlur={() => handleUpdateProject(viewing)}
                                                    className="w-full bg-white border-0 rounded-xl px-4 py-2 text-xs font-bold focus:ring-1 focus:ring-orange-200"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-orange-700 uppercase mb-1">Expected Profit</p>
                                                <div className="bg-white rounded-xl px-4 py-2 text-xs font-black italic">
                                                    ₹{((viewing.price || 0) - (viewing.internalCost || 0)).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Agreement Generator Overlay */}
            {showGenerator && viewing && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
                    <AgreementGenerator
                        project={{
                            clientName: viewing.clientName,
                            businessName: viewing.businessName,
                            title: viewing.title,
                            price: viewing.price,
                            timeline: viewing.timeline,
                            scopeSummary: viewing.scopeSummary
                        }}
                        onClose={() => setShowGenerator(false)}
                        onSave={(content) => {
                            handleUpdateProject({ ...viewing, agreementContent: content });
                            setShowGenerator(false);
                            alert("Agreement content saved to project record.");
                        }}
                    />
                </div>
            )}
        </div>
    );
}
