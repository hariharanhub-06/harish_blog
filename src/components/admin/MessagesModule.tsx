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
    RefreshCcw
} from "lucide-react";

export default function MessagesModule() {
    const [messages, setMessages] = useState<any[]>([]);
    const [filteredMessages, setFilteredMessages] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [viewing, setViewing] = useState<any>(null);
    const [editing, setEditing] = useState<any>(null);
    const [updating, setUpdating] = useState(false);

    // Filter States
    const [filterCategory, setFilterCategory] = useState("All");
    const [filterStatus, setFilterStatus] = useState("All");

    // Default Options
    const defaultCategories = [
        "Business Development",
        "Web Development",
        "Graphic or Poster Designing",
        "Education Training purpose",
        "HM Snack",
        "Not Determined"
    ];

    const defaultStatuses = [
        "Fresh",
        "RNR",
        "Call Connected",
        "On Process",
        "On Discussion",
        "Delivered"
    ];

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
            const res = await fetch("/api/admin/messages");
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
        const res = await fetch(`/api/admin/messages?id=${id}`, { method: "DELETE" });
        if (res.ok) fetchMessages();
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const res = await fetch("/api/admin/messages", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: editing.id,
                    category: editing.category,
                    status: editing.status
                }),
            });
            if (res.ok) {
                setEditing(null);
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

    const availableCategories = Array.from(new Set([...defaultCategories, ...messages.map(m => m.category || "Not Determined")]));
    const availableStatuses = Array.from(new Set([...defaultStatuses, ...messages.map(m => m.status || "Fresh")]));

    if (fetching) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                        Inbox ({messages.length})
                        <button
                            onClick={() => fetchMessages()}
                            disabled={fetching}
                            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-all disabled:opacity-50"
                            title="Refresh Messages"
                        >
                            <RefreshCcw size={14} className={fetching ? "animate-spin" : ""} />
                        </button>
                    </h2>
                    <p className="text-secondary text-xs font-bold mt-0.5">Manage your website inquiries</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-1.5 px-2">
                        <SlidersHorizontal size={12} className="text-secondary" />
                        <span className="text-[8px] font-black uppercase text-secondary">Filter</span>
                    </div>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-gray-50 border-0 rounded-lg text-[10px] font-bold px-2 py-1.5 outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="All">All Categories</option>
                        {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-gray-50 border-0 rounded-lg text-[10px] font-bold px-2 py-1.5 outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="All">All Statuses</option>
                        {availableStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            {/* Message List (Spacious Rows) */}
            <div className="space-y-6">
                {filteredMessages.map((msg) => (
                    <div
                        key={msg.id}
                        className="bg-white p-4 md:p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col xl:flex-row items-start xl:items-center gap-4 xl:gap-8 hover:border-primary/20 relative group flex-wrap"
                    >
                        <div className="flex items-center gap-4 shrink-0 min-w-0 md:min-w-[200px]">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gray-50 text-primary flex items-center justify-center font-black text-lg shrink-0 group-hover:scale-110 transition-transform">
                                {msg.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-black text-gray-900 truncate text-base">{msg.name}</h3>
                                <div className="flex items-center gap-1.5 text-primary font-bold text-xs mt-0.5">
                                    <Phone size={12} className="shrink-0" />
                                    <span>{msg.mobile}</span>
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-widest text-secondary/40 block mt-1.5">
                                    {new Date(msg.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 md:gap-8 w-full xl:w-auto">
                            <div className="min-w-[140px]">
                                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-secondary/50 block mb-1">Category</span>
                                <span className="text-xs font-bold text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 whitespace-nowrap">{msg.category || 'Inquiry'}</span>
                            </div>

                            <div>
                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest inline-block border ${msg.status === 'Fresh' ? 'bg-green-50 text-green-600 border-green-100' :
                                    msg.status === 'RNR' ? 'bg-red-50 text-red-500 border-red-100' :
                                        'bg-gray-50 text-gray-400 border-gray-100'
                                    }`}>
                                    {msg.status || 'Fresh'}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 min-w-0 w-full overflow-hidden">
                            <p className="text-xs text-gray-500 font-medium line-clamp-2 italic px-3 py-2 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 group-hover:bg-white transition-colors">&quot;{msg.message}&quot;</p>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto mt-3 xl:mt-0 pt-4 xl:pt-0 border-t xl:border-0 border-gray-50 flex-wrap justify-end ml-auto">
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setViewing(msg)}
                                    className="p-2 bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all shadow-sm active:scale-95"
                                >
                                    <Eye size={16} />
                                </button>
                                <a
                                    href={`https://wa.me/${msg.mobile?.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 bg-gray-50 text-gray-400 hover:bg-green-50 hover:text-green-500 rounded-xl transition-all shadow-sm active:scale-95"
                                >
                                    <MessageCircle size={16} />
                                </a>
                            </div>

                            <button
                                onClick={() => setEditing(msg)}
                                className="flex-1 sm:flex-none px-4 py-2.5 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white rounded-xl transition-all font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-sm shadow-amber-100/50 active:scale-95"
                            >
                                <Edit3 size={14} /> Update
                            </button>

                            <button
                                onClick={() => handleDelete(msg.id)}
                                className="p-2 bg-red-50 text-red-200 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm active:scale-95"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {filteredMessages.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                        <p className="text-secondary font-bold text-sm">No messages found matching your filters</p>
                    </div>
                )}
            </div>

            {/* View Modal (Ensuring it's bigger and clearer) */}
            {viewing && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-8 md:p-10 relative">
                        <button onClick={() => setViewing(null)} className="absolute top-6 right-6 p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-full transition-all">
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-5 mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-primary/20">
                                {viewing.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 mb-0.5">{viewing.name}</h3>
                                <p className="text-secondary font-bold flex items-center gap-1.5 text-xs">
                                    <Calendar size={12} /> {new Date(viewing.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div className="space-y-1.5">
                                <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-2">Mobile</p>
                                <div className="p-4 bg-gray-50 rounded-xl font-bold flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2.5"><Phone size={16} className="text-primary" /> {viewing.mobile}</span>
                                    <a href={`https://wa.me/${viewing.mobile?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-green-500 bg-white p-1.5 rounded-lg shadow-sm">
                                        <MessageCircle size={16} />
                                    </a>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-2">Email</p>
                                <div className="p-4 bg-gray-50 rounded-xl font-bold flex items-center gap-2.5 text-sm">
                                    <Mail size={16} className="text-blue-400" />
                                    <span className="truncate">{viewing.email}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-2">Message Content</p>
                            <div className="p-6 bg-gray-50 rounded-[2rem] border-l-4 border-primary">
                                <p className="text-sm text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">{viewing.message}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editing && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black">Update Submission</h3>
                            <button onClick={() => setEditing(null)} className="p-1.5 hover:bg-red-50 text-gray-300 rounded-full transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-2">Category</label>
                                <select
                                    className="w-full bg-gray-50 border-0 rounded-xl p-3 focus:ring-2 focus:ring-primary appearance-none font-bold text-xs"
                                    value={availableCategories.includes(editing.category) ? editing.category : '__new__'}
                                    onChange={(e) => {
                                        if (e.target.value === '__new__') {
                                            setEditing({ ...editing, category: "", isNewCategory: true });
                                        } else {
                                            setEditing({ ...editing, category: e.target.value, isNewCategory: false });
                                        }
                                    }}
                                >
                                    {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                    <option value="__new__">+ Add New Category...</option>
                                </select>
                                {editing.isNewCategory && (
                                    <input
                                        autoFocus
                                        placeholder="New category..."
                                        className="w-full mt-2 bg-white border-2 border-primary/10 rounded-2xl p-4 font-bold"
                                        value={editing.category}
                                        onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                                    />
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Status</label>
                                <select
                                    className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-primary appearance-none font-bold"
                                    value={availableStatuses.includes(editing.status) ? editing.status : '__new__'}
                                    onChange={(e) => {
                                        if (e.target.value === '__new__') {
                                            setEditing({ ...editing, status: "", isNewStatus: true });
                                        } else {
                                            setEditing({ ...editing, status: e.target.value, isNewStatus: false });
                                        }
                                    }}
                                >
                                    {availableStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                    <option value="__new__">+ Add New Status...</option>
                                </select>
                                {editing.isNewStatus && (
                                    <input
                                        autoFocus
                                        placeholder="New status..."
                                        className="w-full mt-2 bg-white border-2 border-primary/10 rounded-xl p-3 font-bold text-xs"
                                        value={editing.status}
                                        onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                                    />
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={updating}
                                className="w-full bg-primary text-white py-4 rounded-xl font-black text-base shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2.5 transition-all active:scale-95"
                            >
                                {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                                <span>{updating ? "Saving..." : "Save Updates"}</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
