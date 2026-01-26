"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit3, Save, X, Loader2, Award, Hash } from "lucide-react";
import { uploadToImageKit } from "@/lib/imagekit-upload";

export default function SkillsModule() {
    const [skills, setSkills] = useState<any[]>([]);
    const [editing, setEditing] = useState<any>(null);
    const [fetching, setFetching] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchSkills();
    }, []);

    const fetchSkills = async () => {
        setFetching(true);
        try {
            const res = await fetch("/api/admin/skills");
            if (res.ok) {
                const data = await res.json();
                setSkills(data);
            }
        } catch (error) {
            console.error("Failed to fetch skills", error);
        } finally {
            setFetching(false);
        }
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
                fetchSkills();
                setEditing(null);
            } else {
                alert("Error saving skill");
            }
        } catch (error) {
            console.error("Save error:", error);
            alert("Network error while saving.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this skill?")) return;
        try {
            const res = await fetch(`/api/admin/skills?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchSkills();
            } else {
                alert("Failed to delete skill.");
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("Network error while deleting.");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await uploadToImageKit(file);
            setEditing({ ...editing, icon: url });
        } catch (error) {
            alert("Image upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100">
                <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <Award className="text-primary" size={24} />
                        Domain <span className="text-primary italic">Skills</span>
                    </h2>
                    <p className="text-secondary font-medium mt-0.5 text-[10px] uppercase tracking-widest">Manage your technical and professional expertise.</p>
                </div>
                <button
                    onClick={() => setEditing({ name: "", icon: "", proficiency: 90, displayOrder: 0, category: "Domain Skill" })}
                    className="flex items-center space-x-2 bg-primary text-white px-4 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
                >
                    <Plus size={16} />
                    <span>Add Skill</span>
                </button>
            </div>

            {fetching ? (
                <div className="flex items-center justify-center p-20">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {skills.map((skill) => (
                        <div key={skill.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-lg transition-all group relative">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-xl overflow-hidden p-1">
                                    {skill.icon && skill.icon.startsWith('http') ? (
                                        <img src={skill.icon} alt="" className="w-full h-full object-contain" />
                                    ) : (
                                        <span>{skill.icon || "⚙️"}</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-black text-gray-900 truncate tracking-tight">{skill.name}</h3>
                                    <p className="text-[9px] font-bold text-secondary uppercase tracking-widest">{skill.category}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <button onClick={() => setEditing(skill)} className="p-1.5 text-gray-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-lg">
                                        <Edit3 size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(skill.id)} className="p-1.5 text-gray-400 hover:text-rose-500 transition-colors hover:bg-rose-50 rounded-lg">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editing && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditing(null)} />
                    <div className="relative bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <button onClick={() => setEditing(null)} className="absolute top-6 right-6 text-secondary hover:text-gray-900">
                            <X size={20} />
                        </button>

                        <h3 className="text-xl font-black text-gray-900 mb-6">{editing.id ? "Edit Skill" : "New Skill"}</h3>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1.5">Icon / Logo</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-200 text-2xl overflow-hidden">
                                        {editing.icon && editing.icon.startsWith('http') ? (
                                            <img src={editing.icon} alt="" className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <span>{editing.icon || "+"}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <input
                                            type="text"
                                            value={editing.icon}
                                            onChange={(e) => setEditing({ ...editing, icon: e.target.value })}
                                            placeholder="Emoji or URL"
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs font-bold"
                                        />
                                        <label className="block text-center bg-white border border-gray-200 rounded-xl p-2 text-[10px] font-black uppercase cursor-pointer hover:bg-gray-50 transition-colors">
                                            {uploading ? <Loader2 className="animate-spin mx-auto" size={12} /> : "Upload Logo"}
                                            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1.5">Skill Name</label>
                                <input
                                    required
                                    type="text"
                                    value={editing.name}
                                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                                    placeholder="e.g. Next.js"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-secondary ml-1.5">Category</label>
                                    <input
                                        type="text"
                                        value={editing.category}
                                        onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-xs font-bold focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="Category"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-secondary ml-1.5">Sort Order</label>
                                    <input
                                        type="number"
                                        value={editing.displayOrder || 0}
                                        onChange={(e) => setEditing({ ...editing, displayOrder: parseInt(e.target.value) })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-xs font-bold focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={saving || uploading}
                                className="w-full bg-primary text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:shadow-2xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-4"
                            >
                                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                <span>Save Skill</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
