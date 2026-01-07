"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Plus,
    Trash2,
    Edit3,
    ExternalLink,
    Github,
    Save,
    X,
    ArrowLeft,
    Loader2,
    Image as ImageIcon,
    Check
} from "lucide-react";
import Link from "next/link";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Image from "next/image";

export default function AdminProjects() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [projects, setProjects] = useState<any[]>([]);
    const [editing, setEditing] = useState<any>(null);
    const [fetching, setFetching] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/admin/login");
        } else if (user) {
            fetchProjects();
        }
    }, [user, loading, router]);

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

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setUploading(true);
        try {
            const file = e.target.files[0];
            const storageRef = ref(storage, `projects/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            setEditing({ ...editing, thumbnail: url });
        } catch (error) {
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    if (loading || fetching) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <Link href="/admin/dashboard" className="text-secondary hover:text-primary flex items-center space-x-2 font-black transition-colors mb-4 uppercase tracking-widest text-xs">
                        <ArrowLeft size={16} />
                        <span>Dashboard</span>
                    </Link>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Project Portfolio</h1>
                </div>
                {!editing && (
                    <button
                        onClick={() => setEditing({ title: "", description: "", technologies: [], featured: false, order: 0 })}
                        className="flex items-center space-x-2 bg-primary text-white font-black px-8 py-4 rounded-2xl hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1"
                    >
                        <Plus size={20} />
                        <span>Add New Project</span>
                    </button>
                )}
            </div>

            {editing ? (
                <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-2xl font-black">{editing.id ? "Edit Project" : "New Project"}</h2>
                        <button onClick={() => setEditing(null)} className="text-secondary hover:text-red-500 transition-colors">
                            <X size={28} />
                        </button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Project Title</label>
                                    <input
                                        required
                                        type="text"
                                        value={editing.title}
                                        onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                                        placeholder="E.g. Portfolio Hub"
                                        className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-primary transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Description</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={editing.description}
                                        onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                                        placeholder="Project details..."
                                        className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-primary transition-all font-bold"
                                    />
                                </div>
                                <div className="flex items-center space-x-4 p-5 bg-gray-50 rounded-2xl cursor-pointer">
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
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Thumbnail Image</label>
                                    <div className="relative group aspect-video bg-gray-100 rounded-[2rem] overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center">
                                        {editing.thumbnail ? (
                                            <Image src={editing.thumbnail} alt="Preview" fill className="object-cover" />
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
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Live URL</label>
                                        <input
                                            type="url"
                                            value={editing.liveUrl || ""}
                                            onChange={(e) => setEditing({ ...editing, liveUrl: e.target.value })}
                                            className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-primary transition-all font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Repo URL</label>
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
                            className="w-full bg-primary text-white py-6 rounded-[2rem] font-black text-xl flex items-center justify-center space-x-3 shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all disabled:opacity-50"
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
                                    <Image src={project.thumbnail} alt={project.title} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-primary/10 font-black text-4xl">{project.title.charAt(0)}</div>
                                )}
                                {project.featured && (
                                    <div className="absolute top-4 right-4 bg-accent text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Featured</div>
                                )}
                            </div>
                            <h3 className="text-xl font-black mb-2">{project.title}</h3>
                            <p className="text-secondary text-sm mb-6 line-clamp-2">{project.description}</p>
                            <div className="flex justify-between items-center border-t border-gray-50 pt-6">
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
                                <div className="flex space-x-2">
                                    {project.liveUrl && <ExternalLink size={16} className="text-gray-300" />}
                                    {project.repoUrl && <Github size={16} className="text-gray-300" />}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
