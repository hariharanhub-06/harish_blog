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
    ChevronUp,
    Eye,
    MessageCircle,
    Edit3,
    X,
    Filter,
    Phone,
    Briefcase
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

    const fetchMessages = async () => {
        setFetching(true);
        const res = await fetch("/api/admin/messages");
        if (res.ok) {
            const data = await res.json();
            setMessages(data);
        }
        setFetching(false);
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

    // Derived options from existing data + defaults
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
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Inbox ({messages.length})</h2>
                    <p className="text-secondary text-sm font-bold mt-1">Manage your website inquiries and status</p>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-wrap items-center gap-4 bg-gray-100/50 p-2 rounded-[1.5rem] border border-gray-100">
                    <div className="flex items-center gap-2 px-3 py-1">
                        <Filter size={16} className="text-secondary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Filters:</span>
                    </div>

                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-white border-0 rounded-xl text-xs font-black px-4 py-2 focus:ring-2 focus:ring-primary shadow-sm outline-none"
                    >
                        <option value="All">All Categories</option>
                        {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-white border-0 rounded-xl text-xs font-black px-4 py-2 focus:ring-2 focus:ring-primary shadow-sm outline-none"
                    >
                        <option value="All">All Statuses</option>
                        {availableStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    {(filterCategory !== "All" || filterStatus !== "All") && (
                        <button
                            onClick={() => { setFilterCategory("All"); setFilterStatus("All"); }}
                            className="text-[10px] font-black uppercase text-red-500 hover:text-red-600 transition-colors px-4"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Messages Grid (Tiles) */}
            <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredMessages.map((msg) => (
                    <div
                        key={msg.id}
                        className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col h-full"
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl shadow-inner">
                                    {msg.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-black text-xl text-gray-900 line-clamp-1">{msg.name}</h3>
                                    <div className="flex items-center gap-2 text-primary font-black text-sm mt-0.5">
                                        <Phone size={14} className="shrink-0" />
                                        <span>{msg.mobile}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${msg.status === 'Fresh'
                                        ? 'bg-green-50 border-green-100 text-green-600'
                                        : msg.status === 'RNR'
                                            ? 'bg-red-50 border-red-100 text-red-500'
                                            : 'bg-gray-50 border-gray-100 text-gray-600'
                                    }`}>
                                    {msg.status || 'Fresh'}
                                </span>
                                <span className="text-[10px] font-bold text-secondary/40">
                                    {new Date(msg.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8 flex-grow">
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl w-fit">
                                <Filter size={14} className="text-gray-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-secondary/60">
                                    {msg.category || 'Not Determined'}
                                </span>
                            </div>

                            <p className="text-gray-600 font-medium text-sm leading-relaxed line-clamp-3 bg-gray-50/50 p-4 rounded-2xl border border-dashed border-gray-100">
                                &quot;{msg.message}&quot;
                            </p>
                        </div>

                        <div className="flex justify-between items-center pt-6 border-t border-gray-50 gap-4 mt-auto">
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setViewing(msg)}
                                    className="p-3 bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
                                    title="View Full Details"
                                >
                                    <Eye size={20} />
                                </button>
                                <a
                                    href={`https://wa.me/${msg.mobile?.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 bg-gray-50 text-gray-400 hover:bg-green-50 hover:text-green-500 rounded-xl transition-all"
                                    title="WhatsApp Chat"
                                >
                                    <MessageCircle size={20} />
                                </a>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setEditing(msg)}
                                    className="px-4 py-3 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl transition-all font-black text-xs uppercase tracking-widest flex items-center gap-2"
                                >
                                    <Edit3 size={16} /> Update
                                </button>
                                <button
                                    onClick={() => handleDelete(msg.id)}
                                    className="p-3 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                                    title="Delete Submission"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredMessages.length === 0 && (
                <div className="text-center py-32 px-6 bg-gray-50 rounded-[3rem] border-4 border-dashed border-gray-100">
                    <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <MessageSquare size={32} className="text-gray-200" />
                    </div>
                    <p className="text-secondary font-black uppercase tracking-[0.2em] text-sm">No messages match your criteria</p>
                    <button
                        onClick={() => { setFilterCategory("All"); setFilterStatus("All"); }}
                        className="mt-6 text-primary font-black text-xs uppercase hover:underline"
                    >
                        Clear all filters
                    </button>
                </div>
            )}

            {/* View Details Modal */}
            {viewing && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-10 md:p-14 animate-in fade-in zoom-in-95 duration-200 relative">
                        <button
                            onClick={() => setViewing(null)}
                            className="absolute top-8 right-8 p-3 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-all"
                        >
                            <X size={28} />
                        </button>

                        <div className="flex items-center gap-6 mb-12">
                            <div className="w-20 h-20 rounded-3xl bg-primary text-white flex items-center justify-center font-black text-3xl shadow-2xl shadow-primary/20">
                                {viewing.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-gray-900 mb-1">{viewing.name}</h3>
                                <p className="text-secondary font-bold flex items-center gap-2">
                                    <Calendar size={16} /> Submitted on {new Date(viewing.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-10 mb-10">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Company</p>
                                <div className="p-5 bg-gray-50 rounded-2xl font-bold flex items-center gap-3">
                                    <Briefcase size={18} className="text-primary" />
                                    {viewing.company || 'Private Organization'}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Mobile Number</p>
                                <div className="p-5 bg-gray-50 rounded-2xl font-bold flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Phone size={18} className="text-blue-500" />
                                        {viewing.mobile}
                                    </div>
                                    <a href={`https://wa.me/${viewing.mobile?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-green-500 hover:scale-110 transition-transform bg-white p-2 rounded-lg shadow-sm">
                                        <MessageCircle size={20} />
                                    </a>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Email Address</p>
                                <div className="p-5 bg-gray-50 rounded-2xl font-bold flex items-center gap-3 overflow-hidden">
                                    <Mail size={18} className="text-purple-500" />
                                    <a href={`mailto:${viewing.email}`} className="text-primary hover:underline truncate">{viewing.email}</a>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Category & Status</p>
                                <div className="flex gap-2">
                                    <span className="flex-1 p-5 bg-blue-50 text-primary rounded-2xl font-black text-[10px] uppercase tracking-widest text-center">
                                        {viewing.category || 'Not Determined'}
                                    </span>
                                    <span className="flex-1 p-5 bg-amber-50 text-amber-600 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center">
                                        {viewing.status || 'Fresh'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Message</p>
                            <div className="p-8 bg-gray-50 rounded-[2rem] border-l-4 border-primary">
                                <p className="text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">{viewing.message}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editing && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md p-10 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black">Update Inbox Item</h3>
                            <button onClick={() => setEditing(null)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">Category</label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-primary appearance-none font-bold"
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
                                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                                </div>
                                {editing.isNewCategory && (
                                    <input
                                        autoFocus
                                        placeholder="Enter new category name..."
                                        className="w-full mt-2 bg-white border-2 border-primary/20 rounded-2xl p-5 focus:ring-2 focus:ring-primary outline-none font-bold animate-in fade-in slide-in-from-top-1"
                                        value={editing.category}
                                        onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                                    />
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">Status</label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-primary appearance-none font-bold"
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
                                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                                </div>
                                {editing.isNewStatus && (
                                    <input
                                        autoFocus
                                        placeholder="Enter new status..."
                                        className="w-full mt-2 bg-white border-2 border-primary/20 rounded-2xl p-5 focus:ring-2 focus:ring-primary outline-none font-bold animate-in fade-in slide-in-from-top-1"
                                        value={editing.status}
                                        onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                                    />
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={updating}
                                className="w-full bg-primary text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {updating && <Loader2 className="w-6 h-6 animate-spin" />}
                                <span>{updating ? "Saving..." : "Save Updates"}</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
