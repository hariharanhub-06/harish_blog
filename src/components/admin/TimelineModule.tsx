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
    HeartHandshake, // Use HeartHandshake for Volunteering
    Calendar,
    ArrowUp,
    ArrowDown
} from "lucide-react";

export default function TimelineModule() {
    const [experiences, setExperiences] = useState<any[]>([]);
    const [educations, setEducations] = useState<any[]>([]);
    const [volunteerings, setVolunteerings] = useState<any[]>([]); // New state
    const [editing, setEditing] = useState<any>(null);
    const [fetching, setFetching] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<"experience" | "education" | "volunteering">("experience"); // Added volunteering

    useEffect(() => {
        fetchTimeline();
    }, []);

    const fetchTimeline = async () => {
        setFetching(true);
        const [expRes, eduRes, volRes] = await Promise.all([
            fetch("/api/admin/experience"),
            fetch("/api/admin/education"),
            fetch("/api/admin/volunteering") // Fetch volunteering
        ]);

        if (expRes.ok) setExperiences(await expRes.json());
        if (eduRes.ok) setEducations(await eduRes.json());
        if (volRes.ok) setVolunteerings(await volRes.json());
        setFetching(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            let endpoint = "";
            if (activeTab === "experience") endpoint = "/api/admin/experience";
            else if (activeTab === "education") endpoint = "/api/admin/education";
            else endpoint = "/api/admin/volunteering";

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editing),
            });
            if (res.ok) {
                setEditing(null);
                fetchTimeline();
                alert("Saved successfully!");
            } else {
                const errorData = await res.json();
                console.error("Save failure:", errorData);
                alert(`Failed to save: ${errorData.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Save error:", error);
            alert("An error occurred while saving. Please check the console.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string, type: "experience" | "education" | "volunteering") => {
        if (!confirm("Are you sure?")) return;
        let endpoint = "";
        if (type === "experience") endpoint = "/api/admin/experience";
        else if (type === "education") endpoint = "/api/admin/education";
        else endpoint = "/api/admin/volunteering";

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

    return (
        <div className="space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Work Experience Section */}
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <div className="bg-blue-50 p-3 rounded-2xl text-primary"><Briefcase size={24} /></div>
                        Work Experience
                    </h2>
                    <button
                        onClick={() => {
                            setActiveTab("experience");
                            setEditing({ role: "", company: "", duration: "", description: "", order: 0 });
                        }}
                        className="flex items-center space-x-2 bg-primary text-white font-black px-6 py-3 rounded-2xl hover:shadow-xl transition-all"
                    >
                        <Plus size={20} />
                        <span>Add Experience</span>
                    </button>
                </div>

                <div className="space-y-4">
                    {experiences.map((item) => (
                        <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <h3 className="text-xl font-black">{item.role}</h3>
                                <p className="text-secondary font-bold">{item.company}</p>
                                <p className="text-xs font-black uppercase tracking-widest text-secondary/60 mt-1">{item.duration}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => {
                                        setActiveTab("experience");
                                        setEditing(item);
                                    }}
                                    className="p-3 bg-gray-50 text-secondary rounded-xl hover:bg-primary hover:text-white transition-all"
                                >
                                    <Edit3 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id, "experience")}
                                    className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {experiences.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                            <p className="text-secondary font-black uppercase tracking-widest opacity-50">No experience entries</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="border-t border-gray-200" />

            {/* Education Section */}
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <div className="bg-amber-50 p-3 rounded-2xl text-accent"><GraduationCap size={24} /></div>
                        Education
                    </h2>
                    <button
                        onClick={() => {
                            setActiveTab("education");
                            setEditing({ degree: "", institution: "", period: "", details: "", order: 0 });
                        }}
                        className="flex items-center space-x-2 bg-accent text-white font-black px-6 py-3 rounded-2xl hover:shadow-xl transition-all"
                    >
                        <Plus size={20} />
                        <span>Add Education</span>
                    </button>
                </div>

                <div className="space-y-4">
                    {educations.map((item) => (
                        <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <h3 className="text-xl font-black">{item.degree}</h3>
                                <p className="text-secondary font-bold">{item.institution}</p>
                                <p className="text-xs font-black uppercase tracking-widest text-secondary/60 mt-1">{item.period}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => {
                                        setActiveTab("education");
                                        setEditing(item);
                                    }}
                                    className="p-3 bg-gray-50 text-secondary rounded-xl hover:bg-primary hover:text-white transition-all"
                                >
                                    <Edit3 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id, "education")}
                                    className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {educations.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                            <p className="text-secondary font-black uppercase tracking-widest opacity-50">No education entries</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="border-t border-gray-200" />

            {/* Volunteering Section */}
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <div className="bg-teal-50 p-3 rounded-2xl text-teal-600"><HeartHandshake size={24} /></div>
                        Volunteering / Rotaract
                    </h2>
                    <button
                        onClick={() => {
                            setActiveTab("volunteering");
                            setEditing({ role: "", organization: "", duration: "", description: "", order: 0 });
                        }}
                        className="flex items-center space-x-2 bg-teal-600 text-white font-black px-6 py-3 rounded-2xl hover:shadow-xl transition-all"
                    >
                        <Plus size={20} />
                        <span>Add Volunteering</span>
                    </button>
                </div>

                <div className="space-y-4">
                    {volunteerings.map((item) => (
                        <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <h3 className="text-xl font-black">{item.role}</h3>
                                <p className="text-secondary font-bold">{item.organization}</p>
                                <p className="text-xs font-black uppercase tracking-widest text-secondary/60 mt-1">{item.duration}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => {
                                        setActiveTab("volunteering");
                                        setEditing(item);
                                    }}
                                    className="p-3 bg-gray-50 text-secondary rounded-xl hover:bg-primary hover:text-white transition-all"
                                >
                                    <Edit3 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id, "volunteering")}
                                    className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {volunteerings.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                            <p className="text-secondary font-black uppercase tracking-widest opacity-50">No volunteering entries</p>
                        </div>
                    )}
                </div>
            </div>


            {/* Edit Modal / Form Overlay */}
            {editing && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 md:p-10 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black">
                                {editing.id ? "Edit" : "New"} {activeTab === "experience" ? "Experience" : activeTab === "education" ? "Education" : "Volunteering"}
                            </h3>
                            <button onClick={() => setEditing(null)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">
                                        {activeTab === "experience" ? "Role / Title" : activeTab === "education" ? "Degree / Certificate" : "Role / Position"}
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={activeTab === "experience" ? editing.role : activeTab === "education" ? editing.degree : editing.role}
                                        onChange={(e) => {
                                            const field = activeTab === "experience" || activeTab === "volunteering" ? "role" : "degree";
                                            setEditing({ ...editing, [field]: e.target.value })
                                        }}
                                        className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-primary transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">
                                        {activeTab === "experience" ? "Company / Org" : activeTab === "education" ? "Institution / University" : "Organization / Club"}
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={activeTab === "experience" ? editing.company : activeTab === "education" ? editing.institution : editing.organization}
                                        onChange={(e) => {
                                            const field = activeTab === "experience" ? "company" : activeTab === "education" ? "institution" : "organization";
                                            setEditing({ ...editing, [field]: e.target.value })
                                        }}
                                        className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-primary transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">Period (Ex: 2021 - Present)</label>
                                    <input
                                        required
                                        type="text"
                                        value={activeTab === "experience" ? editing.duration : activeTab === "education" ? editing.period : editing.duration}
                                        onChange={(e) => {
                                            const field = activeTab === "experience" || activeTab === "volunteering" ? "duration" : "period";
                                            setEditing({ ...editing, [field]: e.target.value })
                                        }}
                                        className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-primary transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">Display Order</label>
                                    <input
                                        type="number"
                                        value={editing.order}
                                        onChange={(e) => setEditing({ ...editing, order: parseInt(e.target.value) })}
                                        className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-primary transition-all font-bold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">Description / Highlights</label>
                                <textarea
                                    required
                                    rows={5}
                                    value={activeTab === "experience" ? editing.description : activeTab === "education" ? editing.details : editing.description}
                                    onChange={(e) => {
                                        const field = activeTab === "experience" || activeTab === "volunteering" ? "description" : "details";
                                        setEditing({ ...editing, [field]: e.target.value })
                                    }}
                                    className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-primary transition-all font-bold"
                                />
                            </div>

                            <button
                                disabled={saving}
                                className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl transition-all disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                <span>Save Changes</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
