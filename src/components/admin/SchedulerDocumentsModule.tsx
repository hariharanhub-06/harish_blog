"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, Trash2, Loader2, Plus, Download, X } from "lucide-react";
import { uploadToImageKit } from "@/lib/imagekit-upload";

interface Document {
    id: string;
    name: string;
    fileUrl: string;
    isActive: boolean;
}

export default function SchedulerDocumentsModule() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newDoc, setNewDoc] = useState({ name: "", fileUrl: "" });

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await fetch("/api/admin/scheduler-documents");
            if (res.ok) {
                const data = await res.json();
                setDocuments(data);
            }
        } catch (err) {
            console.error("Failed to fetch documents", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setUploading(true);
        try {
            const file = e.target.files[0];
            const url = await uploadToImageKit(file, "scheduler-docs");
            // Remove ImageKit transformations for non-image files if necessary, 
            // but usually ImageKit handles documents fine as raw files.
            const cleanUrl = url.split("?")[0];
            setNewDoc({ ...newDoc, fileUrl: cleanUrl });
        } catch (err) {
            console.error("Upload failed", err);
            alert("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleAddDocument = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDoc.name || !newDoc.fileUrl) return;

        try {
            const res = await fetch("/api/admin/scheduler-documents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newDoc),
            });
            if (res.ok) {
                fetchDocuments();
                setNewDoc({ name: "", fileUrl: "" });
                setShowAddForm(false);
            }
        } catch (err) {
            console.error("Failed to add document", err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this document?")) return;
        try {
            const res = await fetch(`/api/admin/scheduler-documents?id=${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                fetchDocuments();
            }
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Scheduler Templates</h3>
                    <p className="text-xs text-secondary font-medium uppercase tracking-widest">Upload files that users can download as templates.</p>
                </div>
                {!showAddForm && (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                    >
                        <Plus size={14} />
                        Add New Template
                    </button>
                )}
            </div>

            {showAddForm && (
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 relative animate-in fade-in slide-in-from-top-4 duration-300">
                    <button
                        onClick={() => setShowAddForm(false)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"
                    >
                        <X size={20} />
                    </button>
                    <form onSubmit={handleAddDocument} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-secondary ml-1">Template Name</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. GRR Format 2024"
                                value={newDoc.name}
                                onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                                className="w-full bg-white border-0 rounded-xl p-4 text-sm font-bold shadow-sm focus:ring-2 ring-primary/20 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-secondary ml-1">File Upload</label>
                            <div className="flex gap-2">
                                <label className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all h-[54px]">
                                    {uploading ? <Loader2 size={16} className="animate-spin text-primary" /> : <Upload size={16} className="text-gray-400" />}
                                    <span className="text-xs font-bold text-gray-500">
                                        {newDoc.fileUrl ? "File Ready" : "Select Document"}
                                    </span>
                                    <input type="file" className="hidden" onChange={handleFileUpload} />
                                </label>
                                {newDoc.fileUrl && (
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Save
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full flex justify-center py-10">
                        <Loader2 className="animate-spin text-primary" />
                    </div>
                ) : documents.length === 0 ? (
                    <div className="col-span-full text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                        <FileText size={32} className="mx-auto text-gray-200 mb-2" />
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-tighter">No templates uploaded yet.</p>
                    </div>
                ) : (
                    documents.map((doc) => (
                        <div key={doc.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-primary/30 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gray-50 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                    <FileText size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-900">{doc.name}</span>
                                    <a href={doc.fileUrl} target="_blank" className="text-[10px] text-primary font-black uppercase hover:underline flex items-center gap-1">
                                        View File <Download size={8} />
                                    </a>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(doc.id)}
                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
