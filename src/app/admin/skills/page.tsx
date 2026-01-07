"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, Trash2, Save, X, ArrowLeft, Loader2, Code, Layout, Settings } from "lucide-react";
import Link from "next/link";

export default function AdminSkills() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [skills, setSkills] = useState<any[]>([]);
    const [editing, setEditing] = useState<any>(null);
    const [fetching, setFetching] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/admin/login");
        } else if (user) {
            fetchSkills();
        }
    }, [user, loading, router]);

    const fetchSkills = async () => {
        setFetching(true);
        const res = await fetch("/api/admin/skills");
        if (res.ok) {
            const data = await res.json();
            setSkills(data);
        }
        setFetching(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/admin/skills", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editing),
            });
            if (res.ok) {
                setEditing(null);
                fetchSkills();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const res = await fetch(`/api/admin/skills?id=${id}`, { method: "DELETE" });
        if (res.ok) fetchSkills();
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
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Technical Arsenal</h1>
                </div>
                {!editing && (
                    <button
                        onClick={() => setEditing({ name: "", category: "Technology", proficiency: 80, order: 0 })}
                        className="flex items-center space-x-2 bg-primary text-white font-black px-8 py-4 rounded-2xl hover:shadow-2xl hover:shadow-primary/30 transition-all"
                    >
                        <Plus size={20} />
                        <span>Add Skill</span>
                    </button>
                )}
            </div>

            {editing ? (
                <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-8 md:p-12 animate-in fade-in zoom-in duration-300">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-2xl font-black">{editing.id ? "Edit Skill" : "New Skill"}</h2>
                        <button onClick={() => setEditing(null)} className="text-secondary hover:text-red-500 transition-colors">
                            <X size={28} />
                        </button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Skill Name</label>
                                <input
                                    required
                                    type="text"
                                    value={editing.name}
                                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                                    placeholder="E.g. React.js"
                                    className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-primary transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Category</label>
                                <select
                                    value={editing.category}
                                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-primary transition-all font-bold"
                                >
                                    <option value="Technology">Technology</option>
                                    <option value="Management">Management</option>
                                    <option value="Soft Skills">Soft Skills</option>
                                    <option value="Tools">Tools</option>
                                </select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <div className="flex justify-between mb-4">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Proficiency ({editing.proficiency}%)</label>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={editing.proficiency}
                                    onChange={(e) => setEditing({ ...editing, proficiency: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>
                        </div>

                        <button
                            disabled={saving}
                            className="w-full bg-primary text-white py-6 rounded-[2rem] font-black text-xl flex items-center justify-center space-x-3 shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                            <span>Save Skill</span>
                        </button>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {skills.map((skill) => (
                        <div key={skill.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-lg transition-all">
                            <div className="flex items-center space-x-4">
                                <div className="bg-blue-50 text-primary p-4 rounded-xl">
                                    <Code size={20} />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg">{skill.name}</h3>
                                    <p className="text-secondary text-xs font-bold uppercase tracking-widest">{skill.category}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="text-right mr-4 hidden sm:block">
                                    <div className="text-xs font-black text-gray-400 mb-1">{skill.proficiency}%</div>
                                    <div className="w-20 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-primary h-full" style={{ width: `${skill.proficiency}%` }} />
                                    </div>
                                </div>
                                <button
                                    onClick={() => setEditing(skill)}
                                    className="p-2.5 text-secondary hover:text-primary bg-gray-50 rounded-lg transition-all"
                                >
                                    <Plus size={18} className="rotate-45" />
                                    <span className="sr-only">Edit</span>
                                </button>
                                <button
                                    onClick={() => handleDelete(skill.id)}
                                    className="p-2.5 text-gray-300 hover:text-red-500 transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
