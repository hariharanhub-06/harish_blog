"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, Trash2, Save, X, ArrowLeft, Loader2, Briefcase, Calendar } from "lucide-react";
import Link from "next/link";

export default function AdminTimeline() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [data, setData] = useState<any[]>([]);
    const [editing, setEditing] = useState<any>(null);
    const [fetching, setFetching] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/admin/login");
        } else if (user) {
            fetchData();
        }
    }, [user, loading, router]);

    const fetchData = async () => {
        setFetching(true);
        const res = await fetch("/api/admin/experience");
        if (res.ok) {
            const json = await res.json();
            setData(json);
        }
        setFetching(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/admin/experience", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editing),
            });
            if (res.ok) {
                setEditing(null);
                fetchData();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const res = await fetch(`/api/admin/experience?id=${id}`, { method: "DELETE" });
        if (res.ok) fetchData();
    };

    if (loading || fetching) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-12 max-w-5xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <Link href="/admin/dashboard" className="text-secondary hover:text-primary flex items-center space-x-2 font-black transition-colors mb-4 uppercase tracking-widest text-xs">
                        <ArrowLeft size={16} />
                        <span>Dashboard</span>
                    </Link>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Career Timeline</h1>
                </div>
                {!editing && (
                    <button
                        onClick={() => setEditing({ role: "", company: "", duration: "", description: "", order: 0 })}
                        className="flex items-center space-x-2 bg-primary text-white font-black px-8 py-4 rounded-2xl hover:shadow-2xl hover:shadow-primary/30 transition-all font-sans"
                    >
                        <Plus size={20} />
                        <span>Add Entry</span>
                    </button>
                )}
            </div>

            {editing ? (
                <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-2xl font-black">{editing.id ? "Edit Entry" : "New Entry"}</h2>
                        <button onClick={() => setEditing(null)} className="text-secondary hover:text-red-500 transition-colors">
                            <X size={28} />
                        </button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Role / Title</label>
                                <input
                                    required
                                    type="text"
                                    value={editing.role}
                                    onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-primary transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Company / Institution</label>
                                <input
                                    required
                                    type="text"
                                    value={editing.company}
                                    onChange={(e) => setEditing({ ...editing, company: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-primary transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Duration (e.g. 2022 - Present)</label>
                                <input
                                    required
                                    type="text"
                                    value={editing.duration}
                                    onChange={(e) => setEditing({ ...editing, duration: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-primary transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Sort Order (Higher = first)</label>
                                <input
                                    type="number"
                                    value={editing.order}
                                    onChange={(e) => setEditing({ ...editing, order: parseInt(e.target.value) })}
                                    className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-primary transition-all font-bold"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Description</label>
                            <textarea
                                rows={4}
                                value={editing.description}
                                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                                className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-primary transition-all font-bold"
                            />
                        </div>

                        <button
                            disabled={saving}
                            className="w-full bg-primary text-white py-6 rounded-[2rem] font-black text-xl flex items-center justify-center space-x-3 shadow-2xl shadow-primary/30 transition-all"
                        >
                            {saving ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                            <span>Save Entry</span>
                        </button>
                    </form>
                </div>
            ) : (
                <div className="space-y-6">
                    {data.map((item) => (
                        <div key={item.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between group hover:shadow-xl transition-all gap-6">
                            <div className="flex items-center space-x-6">
                                <div className="bg-blue-50 text-primary p-5 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all">
                                    <Briefcase size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-xl">{item.role}</h3>
                                    <p className="text-primary font-bold">{item.company}</p>
                                </div>
                            </div>
                            <div className="flex flex-col md:items-end gap-4">
                                <div className="flex items-center space-x-2 text-secondary font-black bg-gray-50 px-4 py-2 rounded-xl text-xs uppercase tracking-widest">
                                    <Calendar size={14} />
                                    <span>{item.duration}</span>
                                </div>
                                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setEditing(item)}
                                        className="p-3 bg-blue-50 text-primary rounded-xl hover:bg-primary hover:text-white transition-all"
                                    >
                                        <Plus size={18} className="rotate-45" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
