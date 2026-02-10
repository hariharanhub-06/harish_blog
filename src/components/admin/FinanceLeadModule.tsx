"use client";

import { useEffect, useState } from "react";
import {
    Trash2,
    Calendar,
    Loader2,
    Search,
    X,
    Phone,
    Briefcase,
    Eye,
    MessageCircle,
    CheckCircle2,
    XCircle,
    HandCoins,
    Banknote,
    FileCheck,
    PenTool,
    ChevronDown,
    Building2,
    IndianRupee,
    Clock,
    User
} from "lucide-react";

export default function FinanceLeadModule() {
    const [leads, setLeads] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [viewing, setViewing] = useState<any>(null);
    const [updating, setUpdating] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const statuses = [
        "Document Collection",
        "Applied",
        "Approved Pending",
        "Approved",
        "Disbursed",
        "Commission Collected",
        "Not Eligible",
        "Rejected"
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Document Collection": return "bg-blue-50 text-blue-600 border-blue-100";
            case "Applied": return "bg-indigo-50 text-indigo-600 border-indigo-100";
            case "Approved Pending": return "bg-amber-50 text-amber-600 border-amber-100";
            case "Approved": return "bg-emerald-50 text-emerald-600 border-emerald-100";
            case "Disbursed": return "bg-emerald-100 text-emerald-800 border-emerald-200";
            case "Commission Collected": return "bg-purple-100 text-purple-800 border-purple-200";
            case "Not Eligible":
            case "Rejected": return "bg-red-50 text-red-600 border-red-100";
            default: return "bg-gray-50 text-gray-500 border-gray-100";
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        setFetching(true);
        try {
            const res = await fetch("/api/admin/finance-leads");
            if (res.ok) {
                const data = await res.json();
                setLeads(data);
            }
        } catch (error) {
            console.error("Failed to fetch finance leads", error);
        } finally {
            setFetching(false);
        }
    };

    const handleUpdateLead = async (id: string, updateData: any) => {
        setUpdating(true);
        try {
            const res = await fetch("/api/admin/finance-leads", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, ...updateData }),
            });
            if (res.ok) {
                const updated = await res.json();
                setLeads(leads.map(l => l.id === id ? { ...l, ...updated } : l));
                if (viewing?.id === id) setViewing({ ...viewing, ...updated });
            }
        } catch (error) {
            console.error("Failed to update lead", error);
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this lead record?")) return;
        const res = await fetch(`/api/admin/finance-leads?id=${id}`, { method: "DELETE" });
        if (res.ok) fetchLeads();
    };

    const filteredLeads = leads.filter(l =>
        l.lead?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.loanType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.lead?.mobile?.includes(searchQuery)
    );

    if (fetching) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 uppercase tracking-tighter">
                        <Banknote className="text-emerald-500" />
                        Finance Lead Management ({filteredLeads.length})
                    </h2>
                    <p className="text-secondary text-xs font-bold mt-1 uppercase tracking-widest">Track loan status and payouts</p>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                        type="text"
                        placeholder="Search leads..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-xl pl-10 pr-4 py-2 text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    />
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {filteredLeads.map((lead) => (
                    <div
                        key={lead.id}
                        className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row items-start md:items-center gap-6 group"
                    >
                        <div className="flex items-center gap-4 min-w-[200px]">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg">
                                {lead.lead?.name?.charAt(0) || lead.loanType.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-black text-gray-900 text-sm truncate">{lead.lead?.name || 'Unknown'}</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{lead.loanType}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusColor(lead.status)}`}>
                                {lead.status}
                            </span>

                            {lead.approvedAmount > 0 && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
                                    <Building2 size={12} />
                                    <span className="text-[10px] font-black italic">₹{lead.approvedAmount.toLocaleString()} @ {lead.approvedBank || 'Bank'}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0 font-medium text-xs text-secondary/60">
                            {lead.adminNotes || "No internal notes..."}
                        </div>

                        <div className="flex items-center gap-2 ml-auto">
                            <button
                                onClick={() => setViewing(lead)}
                                className="p-2 bg-gray-50 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all"
                            >
                                <Eye size={16} />
                            </button>
                            <button
                                onClick={() => handleDelete(lead.id)}
                                className="p-2 bg-red-50 text-red-200 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {filteredLeads.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                        <p className="text-secondary font-bold text-sm">No finance leads found</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {viewing && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-10 relative">
                        <button onClick={() => setViewing(null)} className="absolute top-8 right-8 p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-full transition-all">
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-5 mb-10">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-emerald-500/20">
                                {viewing.lead?.name?.charAt(0) || viewing.loanType.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 mb-1">{viewing.lead?.name || 'Inquiry'}</h3>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black uppercase text-secondary/40 tracking-widest bg-gray-50 px-2 py-0.5 rounded-md">{viewing.loanType}</span>
                                    <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                                        <Phone size={12} /> {viewing.lead?.mobile || 'No Contact'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Status Grid */}
                        <div className="mb-10">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 block">Current Journey Phase</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {statuses.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => handleUpdateLead(viewing.id, { status: s })}
                                        disabled={updating}
                                        className={`px-3 py-3 rounded-xl text-[8px] font-black uppercase transition-all flex flex-col items-center justify-center gap-1.5 border ${viewing.status === s ? 'bg-gray-900 border-gray-900 text-white shadow-xl' : 'bg-white text-gray-500 border-gray-100 hover:border-emerald-500/30'}`}
                                    >
                                        {viewing.status === s && <CheckCircle2 size={10} />}
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Details Edit */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            {/* Approved Section */}
                            <div className="space-y-4 p-6 bg-emerald-50/30 rounded-3xl border border-emerald-500/10">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                                    <FileCheck size={14} /> Approval Stats
                                </h4>
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-gray-400 ml-1">Approved Bank</label>
                                        <input
                                            type="text"
                                            value={viewing.approvedBank || ""}
                                            onChange={(e) => setViewing({ ...viewing, approvedBank: e.target.value })}
                                            onBlur={() => handleUpdateLead(viewing.id, { approvedBank: viewing.approvedBank })}
                                            placeholder="e.g. HDFC Bank"
                                            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-gray-400 ml-1">Approved Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">₹</span>
                                            <input
                                                type="number"
                                                value={viewing.approvedAmount || ""}
                                                onChange={(e) => setViewing({ ...viewing, approvedAmount: e.target.value })}
                                                onBlur={() => handleUpdateLead(viewing.id, { approvedAmount: viewing.approvedAmount })}
                                                placeholder="0.00"
                                                className="w-full bg-white border border-gray-100 rounded-xl pl-6 pr-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Disbursement Section */}
                            <div className="space-y-4 p-6 bg-indigo-50/30 rounded-3xl border border-indigo-500/10">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                                    <HandCoins size={14} /> Disbursement & Payout
                                </h4>
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-gray-400 ml-1">Disbursement Date</label>
                                        <input
                                            type="date"
                                            value={viewing.disbursementDate ? new Date(viewing.disbursementDate).toISOString().split('T')[0] : ""}
                                            onChange={(e) => handleUpdateLead(viewing.id, { disbursementDate: e.target.value })}
                                            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-gray-400 ml-1">Commission Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">₹</span>
                                            <input
                                                type="number"
                                                value={viewing.commissionAmount || ""}
                                                onChange={(e) => setViewing({ ...viewing, commissionAmount: e.target.value })}
                                                onBlur={() => handleUpdateLead(viewing.id, { commissionAmount: viewing.commissionAmount })}
                                                placeholder="0.00"
                                                className="w-full bg-white border border-gray-100 rounded-xl pl-6 pr-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-gray-400 ml-1">Commission Collected Date</label>
                                        <input
                                            type="date"
                                            value={viewing.commissionCollectedDate ? new Date(viewing.commissionCollectedDate).toISOString().split('T')[0] : ""}
                                            onChange={(e) => handleUpdateLead(viewing.id, { commissionCollectedDate: e.target.value })}
                                            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rejection / Notes */}
                        <div className="space-y-6">
                            {(viewing.status === "Rejected" || viewing.status === "Not Eligible") && (
                                <div className="space-y-2 p-6 bg-red-50/50 rounded-3xl border border-red-500/10">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-red-600 ml-1 flex items-center gap-2">
                                        <XCircle size={14} /> Rejection Reason (Mandatory)
                                    </label>
                                    <textarea
                                        value={viewing.rejectionReason || ""}
                                        required={viewing.status === "Rejected" || viewing.status === "Not Eligible"}
                                        onChange={(e) => setViewing({ ...viewing, rejectionReason: e.target.value })}
                                        onBlur={() => handleUpdateLead(viewing.id, { rejectionReason: viewing.rejectionReason })}
                                        className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-red-500/20 outline-none min-h-[80px]"
                                        placeholder="Explain why the lead was not processed..."
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                                    <PenTool size={14} /> Internal Admin Notes
                                </label>
                                <textarea
                                    value={viewing.adminNotes || ""}
                                    onChange={(e) => setViewing({ ...viewing, adminNotes: e.target.value })}
                                    onBlur={() => handleUpdateLead(viewing.id, { adminNotes: viewing.adminNotes })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-6 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none min-h-[120px]"
                                    placeholder="Add updates from bank discussion, missing documents, etc..."
                                />
                            </div>
                        </div>

                        <div className="mt-10 flex gap-3 pt-8 border-t border-gray-50">
                            <button
                                onClick={() => setViewing(null)}
                                className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all"
                            >
                                Close View
                            </button>
                            {updating && (
                                <div className="flex items-center gap-2 px-6 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 animate-pulse">
                                    <Loader2 size={14} className="animate-spin" />
                                    <span className="text-[8px] font-black uppercase">Auto-saving...</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
