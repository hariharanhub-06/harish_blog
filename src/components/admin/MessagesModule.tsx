"use client";

import { useEffect, useState } from "react";
import {
    Trash2,
    Mail,
    User,
    Calendar,
    Loader2,
    MessageSquare,
    ChevronDown,
    X,
    SlidersHorizontal,
    Phone,
    Briefcase,
    Eye,
    MessageCircle,
    Edit3,
    RefreshCcw,
    CheckCircle2,
    Calculator as CalculatorIcon,
    Wallet
} from "lucide-react";
import PricingCalculator from "./PricingCalculator";

function FilterDropdown({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: string[]; label: (v: string) => string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false); }}>
            <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300 transition-colors whitespace-nowrap">
                {label(value)}
                <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
                <div className="absolute z-50 top-full left-0 mt-1.5 min-w-[140px] bg-white dark:bg-[#252525] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
                    {options.map((opt) => (
                        <button key={opt} onClick={() => { onChange(opt); setOpen(false); }} className={`w-full px-3 py-2 text-left text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${value === opt ? "text-primary" : "text-gray-700 dark:text-gray-300"}`}>
                            {label(opt)}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function MessagesModule() {
    const [messages, setMessages] = useState<any[]>([]);
    const [filteredMessages, setFilteredMessages] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [viewing, setViewing] = useState<any>(null);
    const [showCalculator, setShowCalculator] = useState(false);
    const [updating, setUpdating] = useState(false);

    // Filter States
    const [filterCategory, setFilterCategory] = useState("All");
    const [filterStatus, setFilterStatus] = useState("All");

    const sessionId = typeof window !== "undefined" ? localStorage.getItem("admin_sessionId") || "" : "";

    // Default Options
    const defaultCategories = [
        "Blog",
        "Financial Logics",
        "Web Development"
    ];

    const defaultStatuses = [
        "New",
        "Qualified",
        "In Progress",
        "Success",
        "Failed"
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case "New": return "bg-blue-50 text-blue-600 border-blue-100";
            case "Qualified": return "bg-purple-50 text-purple-600 border-purple-100";
            case "In Progress": return "bg-amber-50 text-amber-600 border-amber-100";
            case "Success": return "bg-emerald-50 text-emerald-600 border-emerald-100 text-emerald-700";
            case "Failed": return "bg-red-50 text-red-600 border-red-100";
            default: return "bg-gray-50 dark:bg-white/5 text-gray-500 border-gray-100 dark:border-gray-800";
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    useEffect(() => {
        let filtered = [...messages];
        if (filterCategory !== "All") {
            filtered = filtered.filter(m => m.category === filterCategory);
        }
        if (filterStatus !== "All") {
            filtered = filtered.filter(m => m.status === filterStatus);
        }
        setFilteredMessages(filtered);
    }, [filterCategory, filterStatus, messages]);

    const fetchMessages = async (silent = false) => {
        if (!silent) setFetching(true);
        try {
            const res = await fetch("/api/admin/messages", { headers: { "X-Session-Id": sessionId } });
            if (res.ok) {
                const data = await res.json();

                // Only update if data has changed to prevent UI flicker
                // Simple length check + ID check of first item is a cheap heuristic
                // But React state diffing should handle it mostly fine.
                // To be safe, let's just update.
                setMessages(data);
            }
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
        if (!silent) setFetching(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this message?")) return;
        const res = await fetch(`/api/admin/messages?id=${id}`, { method: "DELETE", headers: { "X-Session-Id": sessionId } });
        if (res.ok) fetchMessages();
    };

    const handleUpdate = async (e?: React.FormEvent, updateData?: any) => {
        console.log("DEBUG: Running handleUpdate v4 (No setEditing)");
        if (e) e.preventDefault();
        setUpdating(true);
        try {
            const payload = updateData;
            if (!payload) return;

            const res = await fetch("/api/admin/messages", {
                method: "PUT",
                headers: { "Content-Type": "application/json", "X-Session-Id": sessionId },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                setViewing(null);
                fetchMessages();
            } else {
                const err = await res.json();
                alert(`Error: ${err.error || "Failed to update"}`);
            }
        } catch (error) {
            console.error(error);
            alert("An unexpected error occurred");
        } finally {
            setUpdating(false);
        }
    };

    const handleConvertToProject = async (msg: any) => {
        if (!confirm(`Convert ${msg.name} into a formal Client Project?`)) return;
        setUpdating(true);
        try {
            const res = await fetch("/api/admin/client-projects", {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Session-Id": sessionId },
                body: JSON.stringify({
                    leadId: msg.id,
                    title: msg.requestedService || `${msg.name}'s Project`,
                    clientName: msg.name,
                    businessName: msg.businessType || "",
                    description: msg.message,
                    price: 0 // Will be set in project management
                }),
            });
            if (res.ok) {
                alert("Lead successfully converted to Project! You can now manage it in the 'Client Projects' tab.");
                handleUpdate(undefined, { ...msg, status: 'Won' }); // Ensure status is updated
            } else {
                const err = await res.json();
                alert(err.error || "Failed to convert lead");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred during conversion");
        } finally {
            setUpdating(false);
        }
    };

    const handlePushToFinance = async (msg: any) => {
        if (!confirm(`Track ${msg.name} as a Finance Lead?`)) return;
        setUpdating(true);
        try {
            const res = await fetch("/api/admin/finance-leads", {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Session-Id": sessionId },
                body: JSON.stringify({
                    leadId: msg.id,
                    loanType: msg.requestedService || "General Loan",
                    adminNotes: `Transferred from messages. Initial message: ${msg.message}`
                }),
            });
            if (res.ok) {
                alert("Lead successfully pushed to Finance Management!");
                // Keep status if already moved past New, otherwise mark as Qualified/Pushed
                const nextStatus = msg.status === 'New' ? 'Qualified' : msg.status;
                handleUpdate(undefined, { ...msg, status: nextStatus });
            } else {
                const err = await res.json().catch(() => ({}));
                alert(err.details || err.error || "Failed to push lead");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setUpdating(false);
        }
    };

    const availableCategories = Array.from(new Set([...defaultCategories, ...messages.map(m => m.category || "Not Determined")]));
    const availableStatuses = Array.from(new Set([...defaultStatuses, ...messages.map(m => m.status || "New")]));

    // Analytics Calculation
    const totalLeads = messages.length;
    const contactedLeads = messages.filter(m => m.status !== "New").length;
    const wonLeads = messages.filter(m => m.status === "Success").length;
    const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : "0";

    if (fetching) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Analytics Block */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
                    <p className="text-[10px] font-black uppercase text-secondary/60 dark:text-gray-500 tracking-widest mb-1">Total Leads</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{totalLeads}</p>
                </div>
                <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
                    <p className="text-[10px] font-black uppercase text-secondary/60 dark:text-gray-500 tracking-widest mb-1">Contacted</p>
                    <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{contactedLeads}</p>
                </div>
                <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
                    <p className="text-[10px] font-black uppercase text-secondary/60 dark:text-gray-500 tracking-widest mb-1">Won</p>
                    <p className="text-3xl font-black text-emerald-500">{wonLeads}</p>
                </div>
                <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
                    <p className="text-[10px] font-black uppercase text-secondary/60 dark:text-gray-500 tracking-widest mb-1">Conversion %</p>
                    <p className="text-3xl font-black text-purple-600 dark:text-purple-400">{conversionRate}%</p>
                </div>
            </div>

            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-tighter">
                        Sales Opportunities ({filteredMessages.length})
                        <button
                            onClick={() => fetchMessages()}
                            disabled={fetching}
                            className="p-1.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 rounded-lg transition-all disabled:opacity-50"
                            title="Refresh Messages"
                        >
                            <RefreshCcw size={14} className={fetching ? "animate-spin" : ""} />
                        </button>
                    </h2>
                    <p className="text-secondary dark:text-gray-400 text-xs font-bold mt-0.5">Track and convert leads into customers</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-[#1e1e1e] p-1.5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center gap-1.5 px-2">
                        <SlidersHorizontal size={12} className="text-secondary" />
                        <span className="text-[8px] font-black uppercase text-secondary">Filter</span>
                    </div>
                    <FilterDropdown
                        value={filterCategory}
                        onChange={setFilterCategory}
                        options={["All", ...availableCategories]}
                        label={(v) => v === "All" ? "All Categories" : v}
                    />
                    <FilterDropdown
                        value={filterStatus}
                        onChange={setFilterStatus}
                        options={["All", ...availableStatuses]}
                        label={(v) => v === "All" ? "All Statuses" : v}
                    />
                </div>
            </div>

            {/* Message List (Grid Tiles) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {filteredMessages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`bg-white dark:bg-[#1e1e1e] p-5 rounded-[2rem] border-2 border-gray-50 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all flex flex-col gap-3 hover:border-primary/20 relative group h-full ${msg.category === "Financial Logistics" ? "border-l-[6px] border-l-emerald-500 bg-emerald-50/5 dark:bg-emerald-500/5" :
                            msg.category?.includes("Web") || msg.category?.includes("Development") ? "border-l-[6px] border-l-purple-600 bg-purple-50/5 dark:bg-purple-600/5" :
                                msg.category === "Blog" ? "border-l-[6px] border-l-blue-600 bg-blue-50/5 dark:bg-blue-600/5" : ""
                            }`}
                    >
                        <div className="flex items-center gap-4 shrink-0 min-w-0">
                            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 group-hover:scale-110 transition-transform ${msg.category === "Financial Logistics" ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" :
                                msg.category?.includes("Web") || msg.category?.includes("Development") ? "bg-purple-100 dark:bg-purple-600/20 text-purple-700 dark:text-purple-400" :
                                    "bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400"
                                }`}>
                                {msg.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-black text-gray-900 dark:text-white truncate text-xs tracking-tight leading-none">{msg.name}</h3>
                                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 font-bold text-[9px] mt-1">
                                    <Phone size={9} className="shrink-0 text-primary/60" />
                                    <span>{msg.mobile}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 w-full">
                            <div className="flex justify-between items-center bg-gray-50/50 dark:bg-white/5 p-1.5 rounded-xl border border-gray-100/50 dark:border-gray-800">
                                <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg ${msg.category === "Financial Logistics" ? "bg-emerald-500 text-white" :
                                    msg.category?.includes("Web") || msg.category?.includes("Development") ? "bg-purple-600 text-white" :
                                        "bg-blue-600 text-white"
                                    }`}>
                                    {(msg.category || 'Inquiry').split(' ')[0]}
                                </span>
                                <span className="text-[8px] font-bold text-gray-400 dark:text-gray-500">
                                    {new Date(msg.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <select
                                value={msg.status || 'New'}
                                onChange={(e) => handleUpdate(undefined, { ...msg, status: e.target.value })}
                                disabled={updating}
                                className={`w-full px-2 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 cursor-pointer transition-all appearance-none bg-white dark:bg-[#1e1e1e] hover:shadow-md outline-none disabled:opacity-50 ${getStatusColor(msg.status || 'New')}`}
                            >
                                {availableStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <div className="flex-1 min-w-0 w-full overflow-hidden">
                            <p className="text-[9px] text-gray-500 dark:text-gray-400 font-semibold line-clamp-2 italic px-2.5 py-2 bg-gray-50/80 dark:bg-white/5 rounded-[1.2rem] border border-dashed border-gray-200 dark:border-gray-800 group-hover:bg-white dark:group-hover:bg-white/10 transition-colors">&quot;{msg.message}&quot;</p>
                        </div>

                        <div className="flex items-center justify-end gap-1 mt-2 border-t border-gray-50 dark:border-gray-800 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => setViewing(msg)}
                                className="p-1.5 bg-gray-50 dark:bg-white/5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all"
                            >
                                <Eye size={12} />
                            </button>
                            <a
                                href={`https://wa.me/${msg.mobile?.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-gray-50 dark:bg-white/5 text-gray-400 hover:bg-green-50 hover:text-green-500 rounded-lg transition-all"
                            >
                                <MessageCircle size={12} />
                            </a>
                            <button
                                onClick={() => handleDelete(msg.id)}
                                className="p-1.5 bg-red-50 text-red-200 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </div>
                ))}

                {filteredMessages.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-gray-50 dark:bg-white/5 rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
                        <p className="text-secondary font-bold text-sm">No messages found matching your filters</p>
                    </div>
                )}
            </div>

            {/* View Modal (Ensuring it's bigger and clearer) */}
            {viewing && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-[2rem] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-8 md:p-10 relative">
                        <button onClick={() => setViewing(null)} className="absolute top-6 right-6 p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-full transition-all">
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-5 mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-primary/20">
                                {viewing.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-0.5">{viewing.name}</h3>
                                <p className="text-secondary font-bold flex items-center gap-1.5 text-xs">
                                    <Calendar size={12} /> {new Date(viewing.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div className="space-y-1.5">
                                <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-2">Mobile</p>
                                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl font-bold flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2.5"><Phone size={16} className="text-primary" /> {viewing.mobile}</span>
                                    <a href={`https://wa.me/${viewing.mobile?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-green-500 bg-white dark:bg-white/10 p-1.5 rounded-lg shadow-sm">
                                        <MessageCircle size={16} />
                                    </a>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-2">Email</p>
                                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl font-bold flex items-center gap-2.5 text-sm">
                                    <Mail size={16} className="text-blue-400" />
                                    <span className="truncate">{viewing.email}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            {viewing.category !== "Financial Logistics" && (
                                <div className="space-y-1.5">
                                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-2">Business Type</p>
                                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl font-bold flex items-center gap-2.5 text-sm">
                                        <Briefcase size={16} className="text-orange-500" />
                                        <span>{viewing.businessType || 'Personal'}</span>
                                    </div>
                                </div>
                            )}
                            <div className="space-y-1.5">
                                <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-2">Service Requested</p>
                                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl font-bold flex items-center gap-2.5 text-sm">
                                    <Edit3 size={16} className="text-purple-500" />
                                    <span>{viewing.requestedService || 'General Inquiry'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5 mb-8">
                            <div className="flex justify-between items-center ml-2">
                                <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Current Status</p>
                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusColor(viewing.status || 'New')}`}>
                                    {viewing.status || 'New'}
                                </span>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl flex flex-wrap gap-2">
                                {defaultStatuses.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => handleUpdate(undefined, { ...viewing, status: s })}
                                        disabled={updating}
                                        className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${viewing.status === s ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg' : 'bg-white dark:bg-white/10 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700 hover:border-primary/30'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1.5 mb-8">
                            <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-2">Message</p>
                            <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-[2rem] border-l-4 border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium whitespace-pre-wrap">{viewing.message}</p>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center ml-2">
                                <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Admin Notes</p>
                                {updating && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                            </div>
                            <textarea
                                className="w-full bg-blue-50/30 border border-primary/10 rounded-[2rem] p-6 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-300 min-h-[120px]"
                                placeholder="Add follow-up notes, discussion points, or proposal details..."
                                value={viewing.adminNotes || ""}
                                onBlur={() => handleUpdate(undefined, viewing)}
                                onChange={(e) => setViewing({ ...viewing, adminNotes: e.target.value })}
                            />
                        </div>

                        <div className="mt-8 flex flex-col gap-3">
                            {viewing.category === "Financial Logistics" ? (
                                <button
                                    onClick={() => handlePushToFinance(viewing)}
                                    disabled={updating || viewing.status === 'Qualified'}
                                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <Wallet size={16} /> {viewing.status === 'Qualified' ? 'Pushed to Finance Leads' : 'Push to Finance Leads'}
                                </button>
                            ) : (viewing.category === "Business Digital Solution" || viewing.category?.includes("Development") || viewing.category?.includes("Designing")) ? (
                                <>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleUpdate(undefined, { ...viewing, status: 'Success' })}
                                            disabled={updating}
                                            className="flex-1 bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle2 size={16} /> Mark as Success
                                        </button>
                                        <button
                                            onClick={() => handleUpdate(undefined, { ...viewing, status: 'Failed' })}
                                            disabled={updating}
                                            className="flex-1 bg-red-50 text-red-600 border border-red-100 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all"
                                        >
                                            Mark as Failed
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => handleConvertToProject(viewing)}
                                        disabled={updating}
                                        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Briefcase size={16} /> Convert to formal Client Project
                                    </button>

                                    <button
                                        onClick={() => setShowCalculator(true)}
                                        className="w-full bg-blue-50 text-blue-600 border border-blue-100 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white"
                                    >
                                        <CalculatorIcon size={16} /> Pricing Calculator & Quote Generator
                                    </button>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}

            {/* Pricing Calculator Modal */}
            {showCalculator && viewing && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
                    <PricingCalculator
                        leadName={viewing.name}
                        leadMessage={viewing.message}
                        onClose={() => setShowCalculator(false)}
                        onSave={(quote) => {
                            const updatedNotes = (viewing.adminNotes ? viewing.adminNotes + "\n\n" : "") + "--- PRICING QUOTE ---\n" + quote;
                            handleUpdate(undefined, { ...viewing, adminNotes: updatedNotes });
                            setShowCalculator(false);
                            setViewing({ ...viewing, adminNotes: updatedNotes });
                        }}
                    />
                </div>
            )}

        </div>
    );
}
