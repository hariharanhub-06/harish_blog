
"use client";

import { useEffect, useState } from "react";
import {
    Star,
    User,
    Building,
    Trash2,
    CheckCircle,
    X,
    Loader2,
    Plus,
    MessageSquare,
    GraduationCap,
    Briefcase,
    Lightbulb,
    Search,
    RefreshCcw,
    Quote,
    Eye
} from "lucide-react";

interface Feedback {
    id: string;
    name: string;
    role: string;
    organization: string;
    rating: number;
    content: string;
    status: string;
    createdAt: string;
}

export default function FeedbackModule() {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [fetching, setFetching] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"All" | "Fresh" | "Approved">("All");

    const [formData, setFormData] = useState({
        name: "",
        role: "Student",
        organization: "",
        rating: 5,
        content: "",
        isAdmin: true // Admin creating feedback is auto-approved
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        setFetching(true);
        try {
            const res = await fetch("/api/admin/feedbacks");
            if (res.ok) {
                const data = await res.json();
                setFeedbacks(data);
            }
        } catch (error) {
            console.error("Failed to fetch feedbacks", error);
        } finally {
            setFetching(false);
        }
    };

    const handleApprove = async (id: string) => {
        setUpdatingId(id);
        try {
            const feedback = feedbacks.find(f => f.id === id);
            if (!feedback) return;

            const res = await fetch("/api/admin/feedbacks", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...feedback, status: "Approved" })
            });

            if (res.ok) fetchFeedbacks();
        } catch (error) {
            console.error("Approval error", error);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this testimonial?")) return;
        setUpdatingId(id);
        try {
            const res = await fetch(`/api/admin/feedbacks?id=${id}`, { method: "DELETE" });
            if (res.ok) fetchFeedbacks();
        } catch (error) {
            console.error("Deletion error", error);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setFetching(true);
        try {
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setIsAdding(false);
                setFormData({ name: "", role: "Student", organization: "", rating: 5, content: "", isAdmin: true });
                fetchFeedbacks();
            }
        } catch (error) {
            console.error("Creation error", error);
        } finally {
            setFetching(false);
        }
    };

    const processedFeedbacks = feedbacks
        .filter(f => activeTab === "All" ? true : f.status === activeTab)
        .filter(f => (f.name || "").toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
        });

    const averageRating = feedbacks.length > 0
        ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)
        : "5.0";

    if (fetching && feedbacks.length === 0) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                        Student Testimonials
                        <span className="text-secondary text-xs opacity-40 font-bold bg-gray-100 px-3 py-1 rounded-full">{feedbacks.length} Total</span>
                    </h2>
                    <p className="text-secondary text-xs font-bold mt-1.5 flex items-center gap-2">
                        Managing the impact you've created <span className="text-orange-600 italic">★ {averageRating} Avg Rating</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchFeedbacks()}
                        className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-primary hover:border-primary/20 rounded-2xl transition-all shadow-sm active:scale-95"
                    >
                        <RefreshCcw size={18} className={fetching ? "animate-spin" : ""} />
                    </button>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="px-6 py-3.5 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Plus size={18} /> Add Testimonial
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 bg-gray-50/50 p-1 rounded-2xl border border-gray-100 shrink-0">
                    {["All", "Fresh", "Approved"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab
                                ? "bg-white text-primary shadow-sm border border-gray-100"
                                : "text-secondary hover:text-primary"
                                }`}
                        >
                            {tab === "Fresh" ? "Pending" : tab}
                            {tab === "Fresh" && feedbacks.filter(f => f.status === "Fresh").length > 0 && (
                                <span className="ml-2 bg-orange-500 text-white px-1.5 py-0.5 rounded-full text-[8px] animate-pulse">
                                    {feedbacks.filter(f => f.status === "Fresh").length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex flex-1 items-center gap-4 w-full">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3 text-xs font-bold focus:outline-none focus:border-primary/30 transition-all"
                        />
                    </div>

                    <button
                        onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                        className="flex items-center gap-2 px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-secondary hover:text-primary transition-all shrink-0"
                    >
                        {sortOrder === "desc" ? "Newest First" : "Oldest First"}
                    </button>
                </div>
            </div>

            {/* List View */}
            <div className="space-y-3">
                {processedFeedbacks.map((f) => {
                    const isExpanded = expandedId === f.id;
                    return (
                        <div
                            key={f.id}
                            className={`group bg-white p-4 md:p-6 rounded-[2rem] border transition-all duration-300 flex flex-col justify-between gap-4 ${isExpanded ? "ring-2 ring-primary/20 border-primary/20 shadow-xl" : "border-gray-100 hover:border-gray-200"} ${f.status === "Fresh" && !isExpanded ? "border-orange-100 bg-orange-50/30" : ""}`}
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isExpanded ? "bg-primary text-white" : "bg-gray-50 text-primary"}`}>
                                        {f.role === "Student" ? <GraduationCap size={20} /> : f.role === "Professional" ? <Briefcase size={20} /> : <Lightbulb size={20} />}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">{f.name}</h4>
                                            <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border ${f.status === "Approved" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-orange-100 text-orange-600 border-orange-200"}`}>
                                                {f.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] font-bold text-secondary uppercase tracking-widest opacity-60">
                                            <span className="flex items-center gap-1"><Building size={10} /> {f.organization}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1"><Quote size={10} /> {f.role}</span>
                                        </div>
                                    </div>
                                </div>

                                {!isExpanded && (
                                    <div className="flex-1 max-w-xl">
                                        <p className="text-xs text-secondary/60 font-medium line-clamp-2 md:line-clamp-1 italic">
                                            &ldquo;{f.content}&rdquo;
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 md:border-l md:border-gray-50 md:pl-6">
                                    <div className="flex flex-col items-center">
                                        <div className="flex text-amber-500 mb-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={10} fill={i < f.rating ? "currentColor" : "none"} />
                                            ))}
                                        </div>
                                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">
                                            {new Date(f.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {f.status === "Fresh" && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleApprove(f.id); }}
                                                disabled={updatingId === f.id}
                                                className="p-3 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                                                title="Approve"
                                            >
                                                {updatingId === f.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setExpandedId(isExpanded ? null : f.id)}
                                            className={`p-3 rounded-xl transition-all active:scale-95 ${isExpanded ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-gray-50 text-secondary/60 hover:bg-primary/10 hover:text-primary"}`}
                                            title={isExpanded ? "Collapse" : "Expand to Read"}
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(f.id); }}
                                            disabled={updatingId === f.id}
                                            className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all active:scale-95 disabled:opacity-50"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="mt-4 pt-6 border-t border-gray-50 animate-in slide-in-from-top-2 duration-300">
                                    <div className="relative">
                                        <Quote className="absolute -top-4 -left-2 text-primary/5" size={60} />
                                        <p className="text-sm text-secondary font-medium leading-relaxed italic relative z-10 px-4 md:px-8">
                                            &ldquo;{f.content}&rdquo;
                                        </p>
                                    </div>
                                    <div className="mt-6 flex justify-end">
                                        <button
                                            onClick={() => setExpandedId(null)}
                                            className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                                        >
                                            Click to collapse
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {processedFeedbacks.length === 0 && !fetching && (
                <div className="text-center py-32 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center">
                    <MessageSquare size={48} className="text-secondary/20 mb-4" />
                    <p className="text-secondary text-sm font-black uppercase tracking-widest">No feedbacks found in this category</p>
                </div>
            )}

            {/* Create Testimony Modal */}
            {isAdding && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />

                        <div className="flex justify-between items-center mb-10 relative z-10">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Add Testimonial</h3>
                                <p className="text-secondary text-[10px] font-bold uppercase tracking-widest mt-1">This will be auto-approved</p>
                            </div>
                            <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-full transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-6 relative z-10">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-3">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-xs text-gray-900 focus:outline-none focus:border-primary transition-all font-bold"
                                        placeholder="Student Name"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-3">Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-xs text-gray-900 focus:outline-none focus:border-primary transition-all font-bold appearance-none cursor-pointer"
                                    >
                                        <option value="Student">Student</option>
                                        <option value="Professional">Professional</option>
                                        <option value="Entrepreneur">Entrepreneur</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-3">College / Company</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.organization}
                                    onChange={e => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-xs text-gray-900 focus:outline-none focus:border-primary transition-all font-bold"
                                    placeholder="Which Institution?"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-3">Rating</label>
                                <div className="flex gap-4 items-center bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                                            className={`transition-all ${star <= formData.rating ? "text-amber-500 scale-110" : "text-gray-200 hover:text-gray-300"}`}
                                        >
                                            <Star size={20} fill={star <= formData.rating ? "currentColor" : "none"} />
                                        </button>
                                    ))}
                                    <span className="text-[10px] font-black text-gray-400 ml-auto uppercase tracking-widest">{formData.rating} Stars</span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-3">Review Content</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.content}
                                    onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-xs text-gray-900 focus:outline-none focus:border-primary transition-all font-bold resize-none"
                                    placeholder="What did they say about your impact?"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={fetching}
                                className="w-full bg-primary text-white py-4.5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 mt-4 h-[60px]"
                            >
                                {fetching ? <Loader2 className="animate-spin" size={20} /> : "Publish Testimony"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

