"use client";

import { useEffect, useState } from "react";
import {
    Briefcase,
    Calendar,
    CheckCircle2,
    Clock,
    DollarSign,
    Edit3,
    FileText,
    History,
    Loader2,
    Plus,
    RefreshCcw,
    Search,
    Trash2,
    User,
    X,
    ChevronRight,
    ArrowRight,
    AlertCircle,
    Copy,
    Save
} from "lucide-react";


export default function ClientProjectsModule() {
    const [projects, setProjects] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [viewing, setViewing] = useState<any>(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async (silent = false) => {
        if (!silent) setFetching(true);
        try {
            const res = await fetch("/api/admin/client-projects");
            if (res.ok) {
                const data = await res.json();
                setProjects(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error(error);
        }
        if (!silent) setFetching(false);
    };

    const handleUpdateProject = async (updateData: any) => {
        setUpdating(true);
        try {
            const res = await fetch("/api/admin/client-projects", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updateData),
            });
            if (res.ok) {
                const updated = await res.json();
                setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
                if (viewing?.id === updated.id) setViewing(updated);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Remove this project record? This cannot be undone.")) return;
        try {
            const res = await fetch(`/api/admin/client-projects?id=${id}`, { method: "DELETE" });
            if (res.ok) fetchProjects();
        } catch (error) {
            console.error(error);
        }
    };


    const getStatusColor = (status: string) => {
        switch (status) {
            case "New": return "bg-blue-50 text-blue-600 border-blue-100";
            case "Details Collected": return "bg-purple-50 text-purple-600 border-purple-100";
            case "In progress": return "bg-amber-50 text-amber-600 border-amber-100";
            case "Demo Shown": return "bg-cyan-50 text-cyan-600 border-cyan-100";
            case "Project Completed": return "bg-emerald-50 text-emerald-600 border-emerald-100";
            case "Project Dropped": return "bg-red-50 text-red-600 border-red-100";
            default: return "bg-gray-50 text-gray-500 border-gray-100";
        }
    };

    const getPaymentColor = (status: string) => {
        switch (status) {
            case "pending": return "bg-red-50 text-red-600 border-red-100";
            case "advance_paid": return "bg-amber-50 text-amber-600 border-amber-100";
            case "fully_paid": return "bg-emerald-50 text-emerald-600 border-emerald-100";
            default: return "bg-gray-50 text-gray-500 border-gray-100";
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    // Analytics Calculation
    const totalProjects = projects.length;
    const fullyPaid = projects.filter(p => p.paymentStatus === "fully_paid").length;
    const advancePaid = projects.filter(p => p.paymentStatus === "advance_paid").length;
    const newProjects = projects.filter(p => p.status === "New").length;
    const inProgress = projects.filter(p => p.status === "In progress").length;
    const completed = projects.filter(p => p.status === "Project Completed").length;

    const resetForm = () => {
        setViewing({
            title: "",
            clientName: "",
            businessName: "",
            status: "New",
            paymentStatus: "pending",
            price: 0,
            plannedDeliveryDate: "",
            projectCategory: "Web Development",
            projectNotes: [],
        });
    };

    const handleCreateWrapper = () => {
        resetForm();
    };

    const handleSave = async () => {
        setUpdating(true);
        try {
            const method = viewing.id ? "PUT" : "POST";
            const res = await fetch("/api/admin/client-projects", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(viewing),
            });
            if (res.ok) {
                const saved = await res.json();
                if (method === "POST") {
                    setProjects(prev => [saved, ...prev]);
                } else {
                    setProjects(prev => prev.map(p => p.id === saved.id ? saved : p));
                }
                setViewing(null);
            } else {
                const err = await res.json();
                alert("Error: " + (err.error || "Failed to save"));
            }
        } catch (error) {
            console.error(error);
            alert("Failed to save project");
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Dashboard Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase text-secondary/60 tracking-widest mb-1">Total Projects</p>
                    <p className="text-3xl font-black text-gray-900">{totalProjects}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase text-secondary/60 tracking-widest mb-1">Completed</p>
                    <p className="text-3xl font-black text-emerald-500">{completed}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase text-secondary/60 tracking-widest mb-1">In Progress</p>
                    <p className="text-3xl font-black text-blue-500">{inProgress}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase text-secondary/60 tracking-widest mb-1">Fully Paid</p>
                    <p className="text-3xl font-black text-purple-500">{fullyPaid}</p>
                </div>
            </div>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2 uppercase tracking-tighter">
                        Active Client Projects ({projects.length})
                        <button onClick={() => fetchProjects()} className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-all">
                            <RefreshCcw size={14} className={fetching ? "animate-spin" : ""} />
                        </button>
                    </h2>
                    <p className="text-secondary text-xs font-bold mt-0.5">Manage delivery, payments, and legal agreements</p>
                </div>
                <button
                    onClick={handleCreateWrapper}
                    className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Plus size={16} /> New Project
                </button>
            </div>

            {/* Project Grid */}
            <div className="grid gap-6">
                {projects.map((project) => (
                    <div
                        key={project.id}
                        className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col xl:flex-row items-start xl:items-center gap-6 xl:gap-12 hover:border-primary/20 group"
                    >
                        <div className="flex items-center gap-5 min-w-[280px]">
                            <div className={`w-14 h-14 rounded-2xl ${getStatusColor(project.status)} flex items-center justify-center font-black text-xl shadow-sm group-hover:scale-110 transition-transform`}>
                                {project.clientName?.charAt(0) || 'P'}
                            </div>
                            <div>
                                <h3 className="font-black text-gray-900 text-lg leading-tight">{project.title || 'Untitled Project'}</h3>
                                <p className="text-secondary font-bold text-xs mt-1 flex items-center gap-1.5">
                                    <User size={12} className="text-primary" /> {project.clientName || 'Unknown Client'}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 flex-1 w-full bg-gray-50/50 p-6 rounded-[2rem] border border-gray-50">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-secondary/40">Investment:</span>
                                <span className="text-sm font-black italic text-gray-900">₹{(project.price || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-secondary/40">Payment:</span>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${project.paymentStatus === 'fully_paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {(project.paymentStatus || 'pending').replace('_', ' ')}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-secondary/40">Project Status:</span>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${project.status === 'Project Completed' ? 'text-emerald-600' : 'text-blue-600'}`}>
                                    {project.status}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full xl:w-auto pt-6 xl:pt-0 border-t xl:border-0 border-gray-50">
                            <button
                                onClick={() => setViewing(project)}
                                className="flex-1 xl:flex-none bg-primary text-white px-6 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                Manage <ChevronRight size={14} />
                            </button>
                            <button
                                onClick={() => setViewing(project)}
                                className="p-3.5 bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white rounded-2xl transition-all active:scale-95"
                                title="Edit Project Details"
                            >
                                <Edit3 size={18} />
                            </button>
                            <button
                                onClick={() => handleDelete(project.id)}
                                className="p-3.5 bg-red-50 text-red-300 hover:bg-red-500 hover:text-white rounded-2xl transition-all active:scale-95"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {projects.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center">
                        <Briefcase size={40} className="text-gray-200 mb-4" />
                        <p className="text-secondary font-black uppercase tracking-widest text-sm">No active projects found</p>
                        <p className="text-[10px] text-gray-400 font-bold mt-2">Convert won leads into projects to start tracking</p>
                    </div>
                )}
            </div>

            {/* Project Management Modal */}
            {viewing && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-10 leading-normal">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto p-6 md:p-12 relative scrollbar-hide animate-in zoom-in-95 duration-300">
                        <button onClick={() => setViewing(null)} className="absolute top-6 right-6 md:top-10 md:right-10 p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-full transition-all z-10">
                            <X size={24} />
                        </button>

                        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                            <div className={`w-20 h-20 rounded-3xl ${getStatusColor(viewing.status)} flex items-center justify-center font-black text-3xl shadow-lg border-2 border-white`}>
                                {viewing.clientName?.charAt(0) || 'P'}
                            </div>
                            <div className="text-center md:text-left space-y-1">
                                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{viewing.title}</h3>
                                <p className="text-primary font-black uppercase text-xs tracking-widest flex items-center justify-center md:justify-start gap-2">
                                    <User size={14} /> {viewing.clientName} {viewing.businessName && `| ${viewing.businessName}`}
                                </p>
                            </div>
                        </div>

                        {/* Editable Fields */}
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Project Name</label>
                                <input
                                    type="text"
                                    value={viewing.title || ""}
                                    onChange={(e) => setViewing({ ...viewing, title: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-primary"
                                    placeholder="e.g. E-Commerce Platform"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Client Name / Project For</label>
                                <input
                                    type="text"
                                    value={viewing.clientName || ""}
                                    onChange={(e) => setViewing({ ...viewing, clientName: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-primary"
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Project Category</label>
                                <input
                                    type="text"
                                    value={viewing.projectCategory || ""}
                                    onChange={(e) => setViewing({ ...viewing, projectCategory: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-primary"
                                    placeholder="e.g. Web Development"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Planned Delivery Date</label>
                                <input
                                    type="date"
                                    value={viewing.plannedDeliveryDate ? new Date(viewing.plannedDeliveryDate).toISOString().split('T')[0] : ""}
                                    onChange={(e) => setViewing({ ...viewing, plannedDeliveryDate: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>

                        {/* Status & Commercials */}
                        <div className="grid md:grid-cols-3 gap-8 mb-12">
                            <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Progress Status</p>
                                <select
                                    value={viewing.status}
                                    onChange={(e) => setViewing({ ...viewing, status: e.target.value })}
                                    className="w-full bg-white border-0 rounded-2xl p-4 font-black uppercase text-[11px] tracking-widest focus:ring-2 focus:ring-primary shadow-sm"
                                >
                                    <option value="New">New</option>
                                    <option value="Details Collected">Details Collected</option>
                                    <option value="In progress">In Progress</option>
                                    <option value="Demo Shown">Demo Shown</option>
                                    <option value="Project Completed">Project Completed</option>
                                    <option value="Project Dropped">Project Dropped</option>
                                </select>
                            </div>

                            <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Payment Cycle</p>
                                <select
                                    value={viewing.paymentStatus}
                                    onChange={(e) => setViewing({ ...viewing, paymentStatus: e.target.value })}
                                    className="w-full bg-white border-0 rounded-2xl p-4 font-black uppercase text-[11px] tracking-widest focus:ring-2 focus:ring-emerald-500 shadow-sm"
                                >
                                    <option value="advance_paid">Advance Paid</option>
                                    <option value="fully_paid">Fully Paid</option>
                                </select>
                            </div>

                            <div className="p-6 bg-gray-900 rounded-[2rem] text-white space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Commercials</p>
                                <div className="space-y-1 px-2">
                                    <input
                                        type="number"
                                        value={viewing.price || 0}
                                        onChange={(e) => setViewing({ ...viewing, price: parseFloat(e.target.value) })}
                                        className="bg-transparent border-0 text-white w-full p-0 text-2xl font-black italic focus:ring-0 placeholder:text-gray-700"
                                        placeholder="0"
                                    />
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                        Balance: ₹{((viewing.price || 0) - (viewing.advancePaid || 0)).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end mb-8">
                            <button
                                onClick={handleSave}
                                disabled={updating}
                                className="bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                            >
                                {updating ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                                Save Project Details
                            </button>
                        </div>

                        <div className="max-w-2xl mx-auto w-full">
                            {/* Project Timeline & Notes */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between ml-2">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Timeline & Notes</h4>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-full">Project History</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <input
                                            id="new-note-input"
                                            type="text"
                                            placeholder="Add a progress note..."
                                            className="flex-1 bg-gray-50 border-0 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-primary"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const val = (e.target as HTMLInputElement).value;
                                                    if (val.trim()) {
                                                        const newNote = {
                                                            date: new Date().toISOString(),
                                                            note: val,
                                                            author: 'Admin'
                                                        };
                                                        const updatedNotes = [newNote, ...(viewing.projectNotes || [])];
                                                        setViewing({ ...viewing, projectNotes: updatedNotes });
                                                        (e.target as HTMLInputElement).value = '';
                                                    }
                                                }
                                            }}
                                        />
                                        <button
                                            onClick={() => {
                                                const input = document.getElementById('new-note-input') as HTMLInputElement;
                                                const val = input?.value;
                                                if (val?.trim()) {
                                                    const newNote = {
                                                        date: new Date().toISOString(),
                                                        note: val,
                                                        author: 'Admin'
                                                    };
                                                    const updatedNotes = [newNote, ...(viewing.projectNotes || [])];
                                                    setViewing({ ...viewing, projectNotes: updatedNotes });
                                                    input.value = '';
                                                }
                                            }}
                                            className="bg-primary text-white p-3 rounded-xl shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {(viewing.projectNotes || []).map((note: any, idx: number) => (
                                            <div key={idx} className="flex gap-4 relative">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-2 h-2 rounded-full bg-primary ring-4 ring-white shadow-sm z-10" />
                                                    {idx !== (viewing.projectNotes?.length || 0) - 1 && (
                                                        <div className="w-0.5 flex-1 bg-gray-100 my-1" />
                                                    )}
                                                </div>
                                                <div className="pb-4 w-full">
                                                    <p className="text-[10px] text-gray-400 font-bold mb-0.5">
                                                        {new Date(note.date).toLocaleDateString()} at {new Date(note.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    <p className="text-xs text-gray-700 font-medium bg-gray-50/50 p-3 rounded-xl border border-dashed border-gray-100">
                                                        {note.note}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {(!viewing.projectNotes || viewing.projectNotes.length === 0) && (
                                            <div className="text-center py-8">
                                                <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest">No notes recorded</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
