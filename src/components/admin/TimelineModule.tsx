"use client";

import { useEffect, useState } from "react";
import {
    Plus,
    Trash2,
    Edit3,
    Save,
    X,
    Loader2,
    Briefcase,
    GraduationCap,
    Calendar,
    ArrowUp,
    ArrowDown
} from "lucide-react";

export default function TimelineModule() {
    const [experiences, setExperiences] = useState<any[]>([]);
    const [educations, setEducations] = useState<any[]>([]);
    const [editing, setEditing] = useState<any>(null);
    const [fetching, setFetching] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<"experience" | "education">("experience");

    useEffect(() => {
        fetchTimeline();
    }, []);

    const fetchTimeline = async () => {
        setFetching(true);
        const [expRes, eduRes] = await Promise.all([
            fetch("/api/admin/experience"),
            fetch("/api/admin/education")
        ]);

        if (expRes.ok) setExperiences(await expRes.json());
        if (eduRes.ok) setEducations(await eduRes.json());
        setFetching(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const endpoint = activeTab === "experience" ? "/api/admin/experience" : "/api/admin/education";
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editing),
            });
            if (res.ok) {
                setEditing(null);
                fetchTimeline();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const endpoint = activeTab === "experience" ? "/api/admin/experience" : "/api/admin/education";
        const res = await fetch(`${endpoint}?id=${id}`, { method: "DELETE" });
        if (res.ok) fetchTimeline();
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    const currentItems = activeTab === "experience" ? experiences : educations;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex bg-gray-100 p-2 rounded-2xl w-full md:w-auto">
                    <button
                        onClick={() => setActiveTab("experience")}
                        className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-black text-sm transition-all ${activeTab === "experience" ? "bg-white text-primary shadow-sm" : "text-secondary hover:text-primary"}`}
                    >
                        Work Experience
                    </button>
                    <button
                        onClick={() => setActiveTab("education")}
                        className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-black text-sm transition-all ${activeTab === "education" ? "bg-white text-primary shadow-sm" : "text-secondary hover:text-primary"}`}
                    >
                        Education
                    </button>
                </div>
                {!editing && (
                    <button
                        onClick={() => setEditing({
                            ...(activeTab === "experience" ?
                                { role: "", company: "", duration: "", description: "" } :
                                { degree: "", institution: "", period: "", details: "" }
                            ),
                            order: 0
                        })}
                        className="flex items-center space-x-2 bg-primary text-white font-black px-6 py-3 rounded-2xl hover:shadow-xl transition-all w-full md:w-auto justify-center"
                    >
                        <Plus size={20} />
                        <span>Add {activeTab === "experience" ? "Experience" : "Education"}</span>
                    </button>
                )}
            </div>

            {editing ? (
                <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-8 md:p-12">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-black">{editing.id ? "Edit Entry" : "New Entry"}</h3>
                        <button onClick={() => setEditing(null)} className="text-secondary hover:text-red-500 transition-colors">
                            <X size={28} />
                        </button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">
                                    {activeTab === "experience" ? "Role / Title" : "Degree / Certificate"}
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={activeTab === "experience" ? editing.role : editing.degree}
                                    onChange={(e) => setEditing({ ...editing, [activeTab === "experience" ? "role" : "degree"]: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-primary transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">
                                    {activeTab === "experience" ? "Company / Org" : "Institution / University"}
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={activeTab === "experience" ? editing.company : editing.institution}
                                    onChange={(e) => setEditing({ ...editing, [activeTab === "experience" ? "company" : "institution"]: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-primary transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">Period (Ex: 2021 - Present)</label>
                                <input
                                    required
                                    type="text"
                                    value={activeTab === "experience" ? editing.duration : editing.period}
                                    onChange={(e) => setEditing({ ...editing, [activeTab === "experience" ? "duration" : "period"]: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-primary transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">Display Order (Higher = First)</label>
                                <input
                                    type="number"
                                    value={editing.order}
                                    onChange={(e) => setEditing({ ...editing, order: parseInt(e.target.value) })}
                                    className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-primary transition-all font-bold"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">Description / Highlights</label>
                            <textarea
                                required
                                rows={5}
                                value={activeTab === "experience" ? editing.description : editing.details}
                                onChange={(e) => setEditing({ ...editing, [activeTab === "experience" ? "description" : "details"]: e.target.value })}
                                className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-primary transition-all font-bold"
                            />
                        </div>

                        <button
                            disabled={saving}
                            className="w-full bg-primary text-white py-6 rounded-[2rem] font-black text-xl flex items-center justify-center space-x-3 shadow-2xl transition-all disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                            <span>Save Entry</span>
                        </button>
                    </form>
                </div>
            ) : (
                <div className="space-y-6">
                    {currentItems.map((item) => (
                        <div key={item.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex items-center space-x-8">
                                <div className={`p-6 rounded-[2rem] ${activeTab === 'experience' ? 'bg-blue-50 text-primary' : 'bg-amber-50 text-accent'} shadow-lg group-hover:scale-110 transition-transform`}>
                                    {activeTab === 'experience' ? <Briefcase size={28} /> : <GraduationCap size={28} />}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 group-hover:text-primary transition-colors">
                                        {activeTab === 'experience' ? item.role : item.degree}
                                    </h3>
                                    <p className="text-secondary font-bold text-lg">{activeTab === 'experience' ? item.company : item.institution}</p>
                                    <div className="flex items-center space-x-2 text-secondary/60 text-xs font-black uppercase tracking-widest mt-2">
                                        <Calendar size={14} />
                                        <span>{activeTab === 'experience' ? item.duration : item.period}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex space-x-3 w-full md:w-auto">
                                <button
                                    onClick={() => setEditing(item)}
                                    className="flex-1 md:flex-none p-4 bg-gray-50 text-secondary rounded-2xl hover:bg-primary hover:text-white transition-all flex items-center justify-center space-x-2"
                                >
                                    <Edit3 size={20} />
                                    <span className="md:hidden font-black">Edit</span>
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="flex-1 md:flex-none p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center space-x-2"
                                >
                                    <Trash2 size={20} />
                                    <span className="md:hidden font-black">Delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                    {currentItems.length === 0 && (
                        <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                            <p className="text-secondary font-black uppercase tracking-widest">No entries found for {activeTab}.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
