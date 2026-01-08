"use client";

import { useEffect, useState } from "react";
import {
    Plus,
    Trash2,
    Edit3,
    ExternalLink,
    Github,
    Save,
    X,
    Loader2,
    Image as ImageIcon,
    Check
} from "lucide-react";
import Image from "next/image";
import { uploadToImageKit } from "@/lib/imagekit-upload";

export default function ProjectsModule() {
    const [projects, setProjects] = useState<any[]>([]);
    const [editing, setEditing] = useState<any>(null);
    const [fetching, setFetching] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setFetching(true);
        const res = await fetch("/api/admin/projects");
        if (res.ok) {
            const data = await res.json();
            setProjects(data);
        }
        setFetching(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/admin/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editing),
            });
            if (res.ok) {
                setEditing(null);
                fetchProjects();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const res = await fetch(`/api/admin/projects?id=${id}`, { method: "DELETE" });
        if (res.ok) fetchProjects();
    };

    // Helper to compress image before setting as Base64
    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = document.createElement("img");
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const MAX_WIDTH = 1920; // 1080p Standard Width
                    const scaleSize = MAX_WIDTH / img.width;
                    const width = scaleSize < 1 ? MAX_WIDTH : img.width;
                    const height = scaleSize < 1 ? img.height * scaleSize : img.height;

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = "high";
                        ctx.drawImage(img, 0, 0, width, height);
                    }

                    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
                    resolve(dataUrl);
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setUploading(true);
        try {
            const file = e.target.files[0];
            if (file.size > 10 * 1024 * 1024) {
                alert("File is too large. Please select an image under 10MB.");
                setUploading(false);
                return;
            }

            // Upload to ImageKit CDN (projects folder) with AVIF optimization
            const imagekitUrl = await uploadToImageKit(file, 'projects');
            setEditing({ ...editing, thumbnail: imagekitUrl });
        } catch (error) {
            console.error(error);
            alert("Thumbnail upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-gray-900">Portfolio Items</h2>
                {!editing && (
                    <button
                        onClick={() => setEditing({ title: "", description: "", technologies: [], featured: false, order: 0 })}
                        className="flex items-center space-x-2 bg-primary text-white font-black px-6 py-3 rounded-2xl hover:shadow-xl transition-all"
                    >
                        <Plus size={20} />
                        <span>Add Project</span>
                    </button>
                )}
            </div>

            {editing ? (
                <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-8 md:p-12">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-black">{editing.id ? "Edit Project" : "New Project"}</h3>
                        <button onClick={() => setEditing(null)} className="text-secondary hover:text-red-500 transition-colors">
                            <X size={28} />
                        </button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">Title</label>
                                    <input
                                        required
                                        type="text"
                                        value={editing.title}
                                        onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                                        className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-primary transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">Description</label>
                                    <textarea
                                        required
                                        rows={5}
                                        value={editing.description}
                                        onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                                        className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-primary transition-all font-bold"
                                    />
                                </div>
                                <div className="flex items-center space-x-4 p-5 bg-gray-50 rounded-2xl">
                                    <input
                                        type="checkbox"
                                        id="featured"
                                        checked={editing.featured}
                                        onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
                                        className="w-6 h-6 text-primary rounded-lg focus:ring-primary"
                                    />
                                    <label htmlFor="featured" className="font-bold cursor-pointer">Mark as Featured</label>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">Snapshot</label>
                                    <div className="relative group aspect-video bg-gray-100 rounded-[2rem] overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center">
                                        {editing.thumbnail ? (
                                            <Image src={editing.thumbnail} alt="Preview" fill className="object-cover" unoptimized />
                                        ) : (
                                            <ImageIcon size={48} className="text-gray-300" />
                                        )}
                                        <label className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center cursor-pointer">
                                            <div className="opacity-0 group-hover:opacity-100 bg-white text-primary p-4 rounded-2xl shadow-xl transition-all scale-90 group-hover:scale-100">
                                                {uploading ? <Loader2 className="animate-spin" /> : <Plus size={24} />}
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailUpload} />
                                        </label>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">Live URL</label>
                                        <input
                                            type="url"
                                            value={editing.liveUrl || ""}
                                            onChange={(e) => setEditing({ ...editing, liveUrl: e.target.value })}
                                            className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-primary transition-all font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">Repo URL</label>
                                        <input
                                            type="url"
                                            value={editing.repoUrl || ""}
                                            onChange={(e) => setEditing({ ...editing, repoUrl: e.target.value })}
                                            className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-primary transition-all font-bold"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={saving || uploading}
                            className="w-full bg-primary text-white py-6 rounded-[2rem] font-black text-xl flex items-center justify-center space-x-3 shadow-2xl transition-all disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                            <span>Save Project</span>
                        </button>
                    </form>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project) => (
                        <div key={project.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                            <div className="relative h-48 bg-gray-50 rounded-[2rem] mb-6 overflow-hidden">
                                {project.thumbnail ? (
                                    <Image src={project.thumbnail} alt={project.title} fill className="object-cover" unoptimized />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-primary/10 font-black text-4xl">{project.title.charAt(0)}</div>
                                )}
                            </div>
                            <h3 className="text-xl font-black mb-2">{project.title}</h3>
                            <p className="text-secondary text-sm mb-6 line-clamp-2">{project.description}</p>
                            <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setEditing(project)}
                                        className="p-3 bg-blue-50 text-primary rounded-xl hover:bg-primary hover:text-white transition-all"
                                    >
                                        <Edit3 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(project.id)}
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
