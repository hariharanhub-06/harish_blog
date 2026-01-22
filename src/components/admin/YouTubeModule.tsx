"use client";

import { useEffect, useState } from "react";
import {
    Plus,
    Trash2,
    Edit3,
    Save,
    X,
    Loader2,
    Youtube,
    ExternalLink,
    Video,
    Layout
} from "lucide-react";

export default function YouTubeModule() {
    const [videos, setVideos] = useState<any[]>([]);
    const [editing, setEditing] = useState<any>(null);
    const [fetching, setFetching] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        setFetching(true);
        try {
            const res = await fetch("/api/admin/youtube");
            if (res.ok) setVideos(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setFetching(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/admin/youtube", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editing),
            });
            if (res.ok) {
                setEditing(null);
                fetchVideos();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const res = await fetch(`/api/admin/youtube?id=${id}`, { method: "DELETE" });
        if (res.ok) fetchVideos();
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                    <div className="bg-red-50 p-3 rounded-2xl text-red-600"><Youtube size={24} /></div>
                    YouTube Video Manager
                </h2>
                <button
                    onClick={() => setEditing({ title: "", youtubeVideoId: "", description: "", category: "Main", displayOrder: 0, isActive: true })}
                    className="flex items-center space-x-2 bg-red-600 text-white font-black px-6 py-3 rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                >
                    <Plus size={20} />
                    <span>Add Video</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                    <div key={video.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300">
                        <div className="relative aspect-video bg-gray-100 overflow-hidden">
                            {video.youtubeVideoId ? (
                                <img
                                    src={`https://img.youtube.com/vi/${video.youtubeVideoId}/mqdefault.jpg`}
                                    alt={video.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <Video size={48} />
                                </div>
                            )}
                            <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button
                                    onClick={() => setEditing(video)}
                                    className="p-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white transition-colors shadow-lg"
                                >
                                    <Edit3 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(video.id)}
                                    className="p-2 bg-red-500/90 backdrop-blur-sm text-white rounded-xl hover:bg-red-500 transition-colors shadow-lg"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="p-5">
                            <h3 className="font-black text-lg line-clamp-1 mb-2">{video.title}</h3>
                            <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${video.isActive ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"}`}>
                                    {video.isActive ? "Active" : "Hidden"}
                                </span>
                                <a
                                    href={`https://youtube.com/watch?v=${video.youtubeVideoId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-red-600 hover:text-red-700 transition-colors"
                                >
                                    <ExternalLink size={16} />
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {videos.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                    <Youtube size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 font-bold">No videos added yet.</p>
                </div>
            )}

            {editing && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 md:p-10 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black">{editing.id ? "Edit Video" : "New Video"}</h3>
                            <button onClick={() => setEditing(null)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">Video Title</label>
                                <input
                                    required
                                    type="text"
                                    value={editing.title}
                                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-red-500 transition-all font-bold"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">YouTube Video ID (e.g., dQw4w9WgXcQ)</label>
                                <input
                                    required
                                    type="text"
                                    value={editing.youtubeVideoId}
                                    onChange={(e) => setEditing({ ...editing, youtubeVideoId: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-red-500 transition-all font-bold"
                                />
                                <p className="text-[10px] text-gray-400 ml-2 italic">Tip: The ID is the random characters after ?v= in the URL.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">Category</label>
                                    <input
                                        type="text"
                                        value={editing.category || ""}
                                        onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                                        className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-red-500 transition-all font-bold text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">Order</label>
                                    <input
                                        type="number"
                                        value={editing.displayOrder || 0}
                                        onChange={(e) => setEditing({ ...editing, displayOrder: parseInt(e.target.value) })}
                                        className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-red-500 transition-all font-bold text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">Description (Optional)</label>
                                <textarea
                                    rows={3}
                                    value={editing.description || ""}
                                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-red-500 transition-all font-bold"
                                />
                            </div>

                            <div className="flex items-center gap-2 p-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={editing.isActive}
                                    onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                />
                                <label htmlFor="isActive" className="text-sm font-bold text-gray-700">Display this video on public site</label>
                            </div>

                            <button
                                disabled={saving}
                                className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center space-x-2 shadow-xl hover:shadow-red-600/30 transition-all disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                <span>Save Video</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
