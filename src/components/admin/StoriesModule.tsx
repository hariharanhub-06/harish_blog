"use client";

import { useState, useEffect } from "react";
import { Play, Plus, Edit2, Trash2, Eye, EyeOff, GripVertical, Link as LinkIcon, X, Loader2, Upload, Image as ImageIcon } from "lucide-react";
import { uploadToImageKit } from "@/lib/imagekit-upload";

interface Story {
    id: string;
    title: string;
    description: string | null;
    thumbnailUrl: string | null;
    youtubePlaylistId: string | null;
    displayOrder: number;
    isActive: boolean;
    episodeCount?: number;
}

interface Episode {
    id: string;
    storyId: string;
    title: string;
    description: string | null;
    youtubeVideoId: string;
    thumbnailUrl: string | null;
    duration: string | null;
    episodeNumber: number;
    isActive: boolean;
}

export default function StoriesModule() {
    const [stories, setStories] = useState<Story[]>([]);
    const [selectedStory, setSelectedStory] = useState<Story | null>(null);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [loading, setLoading] = useState(true);
    const [showStoryModal, setShowStoryModal] = useState(false);
    const [showEpisodeModal, setShowEpisodeModal] = useState(false);
    const [editingStory, setEditingStory] = useState<Story | null>(null);
    const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);

    // Form states
    const [storyForm, setStoryForm] = useState({
        title: "",
        description: "",
        thumbnailUrl: "",
        youtubePlaylistUrl: "",
    });

    const [episodeForm, setEpisodeForm] = useState({
        title: "",
        description: "",
        thumbnailUrl: "",
        youtubeVideoUrl: "",
    });

    const [submitting, setSubmitting] = useState(false);
    const [thumbnailUploading, setThumbnailUploading] = useState(false);

    useEffect(() => {
        fetchStories();
    }, []);

    useEffect(() => {
        if (selectedStory) {
            fetchEpisodes(selectedStory.id);
        }
    }, [selectedStory]);

    const fetchStories = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/stories");
            const data = await res.json();
            setStories(data);
        } catch (error) {
            console.error("Error fetching stories:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEpisodes = async (storyId: string) => {
        try {
            const res = await fetch(`/api/admin/stories/${storyId}/episodes`);
            const data = await res.json();
            setEpisodes(data);
        } catch (error) {
            console.error("Error fetching episodes:", error);
        }
    };

    const handleCreateStory = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch("/api/admin/stories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(storyForm),
            });

            if (res.ok) {
                await fetchStories();
                setShowStoryModal(false);
                setStoryForm({ title: "", description: "", thumbnailUrl: "", youtubePlaylistUrl: "" });
            }
        } catch (error) {
            console.error("Error creating story:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateStory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStory) return;

        setSubmitting(true);

        try {
            const res = await fetch(`/api/admin/stories/${editingStory.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(storyForm),
            });

            if (res.ok) {
                await fetchStories();
                setShowStoryModal(false);
                setEditingStory(null);
                setStoryForm({ title: "", description: "", thumbnailUrl: "", youtubePlaylistUrl: "" });
            }
        } catch (error) {
            console.error("Error updating story:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteStory = async (storyId: string) => {
        if (!confirm("Delete this story and all its episodes?")) return;

        try {
            const res = await fetch(`/api/admin/stories/${storyId}`, { method: "DELETE" });
            if (res.ok) {
                await fetchStories();
                if (selectedStory?.id === storyId) {
                    setSelectedStory(null);
                    setEpisodes([]);
                }
            }
        } catch (error) {
            console.error("Error deleting story:", error);
        }
    };

    const toggleStoryActive = async (story: Story) => {
        try {
            await fetch(`/api/admin/stories/${story.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...story, isActive: !story.isActive }),
            });
            await fetchStories();
        } catch (error) {
            console.error("Error toggling story:", error);
        }
    };

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setThumbnailUploading(true);
        try {
            const url = await uploadToImageKit(file, 'stories');
            setStoryForm(prev => ({ ...prev, thumbnailUrl: url }));
        } catch (error) {
            console.error("Error uploading story thumbnail:", error);
            alert("Failed to upload thumbnail");
        } finally {
            setThumbnailUploading(false);
        }
    };

    const handleEpisodeThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setThumbnailUploading(true);
        try {
            const url = await uploadToImageKit(file, 'episodes');
            setEpisodeForm(prev => ({ ...prev, thumbnailUrl: url }));
        } catch (error) {
            console.error("Error uploading episode thumbnail:", error);
            alert("Failed to upload thumbnail");
        } finally {
            setThumbnailUploading(false);
        }
    };

    const handleCreateEpisode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStory) return;

        setSubmitting(true);

        try {
            const res = await fetch(`/api/admin/stories/${selectedStory.id}/episodes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(episodeForm),
            });

            if (res.ok) {
                await fetchEpisodes(selectedStory.id);
                setShowEpisodeModal(false);
                setEpisodeForm({ title: "", description: "", thumbnailUrl: "", youtubeVideoUrl: "" });
            }
        } catch (error) {
            console.error("Error creating episode:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteEpisode = async (episodeId: string) => {
        if (!selectedStory || !confirm("Delete this episode?")) return;

        try {
            const res = await fetch(`/api/admin/stories/${selectedStory.id}/episodes?episodeId=${episodeId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                await fetchEpisodes(selectedStory.id);
            }
        } catch (error) {
            console.error("Error deleting episode:", error);
        }
    };

    const handleUpdateEpisode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStory || !editingEpisode) return;

        setSubmitting(true);

        try {
            const res = await fetch(`/api/admin/stories/${selectedStory.id}/episodes`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    episodeId: editingEpisode.id,
                    ...episodeForm,
                }),
            });

            if (res.ok) {
                await fetchEpisodes(selectedStory.id);
                setShowEpisodeModal(false);
                setEditingEpisode(null);
                setEpisodeForm({ title: "", description: "", thumbnailUrl: "", youtubeVideoUrl: "" });
            }
        } catch (error) {
            console.error("Error updating episode:", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">HM Stories Manager</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage episodic content and YouTube integrations</p>
                </div>
                <button
                    onClick={() => {
                        setEditingStory(null);
                        setStoryForm({ title: "", description: "", thumbnailUrl: "", youtubePlaylistUrl: "" });
                        setShowStoryModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Add Story
                </button>
            </div>

            {/* Stories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stories.map((story) => (
                    <div
                        key={story.id}
                        className={`group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer ${selectedStory?.id === story.id ? "ring-4 ring-blue-500" : ""
                            }`}
                        onClick={() => setSelectedStory(story)}
                    >
                        {/* Thumbnail */}
                        <div className="relative h-48 overflow-hidden bg-gray-700">
                            {story.thumbnailUrl ? (
                                <img src={story.thumbnailUrl} alt={story.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Play size={48} className="text-gray-500" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                            {/* Episode Count Badge */}
                            <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white">
                                {story.episodeCount || 0} Episodes
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-3">
                            <h3 className="text-lg font-black text-white line-clamp-1">{story.title}</h3>
                            {story.description && (
                                <p className="text-xs text-gray-300 line-clamp-2">{story.description}</p>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingStory(story);
                                        setStoryForm({
                                            title: story.title,
                                            description: story.description || "",
                                            thumbnailUrl: story.thumbnailUrl || "",
                                            youtubePlaylistUrl: "",
                                        });
                                        setShowStoryModal(true);
                                    }}
                                    className="p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition-colors"
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleStoryActive(story);
                                    }}
                                    className={`p-2 rounded-lg transition-colors ${story.isActive
                                        ? "bg-green-600/20 hover:bg-green-600/40 text-green-400"
                                        : "bg-gray-600/20 hover:bg-gray-600/40 text-gray-400"
                                        }`}
                                >
                                    {story.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteStory(story.id);
                                    }}
                                    className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-colors ml-auto"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Episodes Panel */}
            {selectedStory && (
                <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-600">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-black text-gray-900">Episodes: {selectedStory.title}</h3>
                            <p className="text-sm text-gray-500">{episodes.length} episodes</p>
                        </div>
                        <button
                            onClick={() => {
                                setEditingEpisode(null);
                                setEpisodeForm({ title: "", description: "", thumbnailUrl: "", youtubeVideoUrl: "" });
                                setShowEpisodeModal(true);
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-700 transition-colors"
                        >
                            <Plus size={18} />
                            Add Episode
                        </button>
                    </div>

                    <div className="space-y-3">
                        {episodes.map((episode) => (
                            <div
                                key={episode.id}
                                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                {/* Thumbnail */}
                                <div className="relative w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                                    {episode.thumbnailUrl ? (
                                        <img src={episode.thumbnailUrl} alt={episode.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Play size={24} className="text-gray-400" />
                                        </div>
                                    )}
                                    {episode.duration && (
                                        <div className="absolute bottom-1 right-1 bg-black/75 px-2 py-0.5 rounded text-xs font-bold text-white">
                                            {episode.duration}
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-black text-blue-600">EP {episode.episodeNumber}</span>
                                        <h4 className="font-bold text-gray-900 line-clamp-1">{episode.title}</h4>
                                    </div>
                                    {episode.description && (
                                        <p className="text-xs text-gray-500 line-clamp-1">{episode.description}</p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            setEditingEpisode(episode);
                                            setEpisodeForm({
                                                title: episode.title,
                                                description: episode.description || "",
                                                thumbnailUrl: episode.thumbnailUrl || "",
                                                youtubeVideoUrl: `https://youtube.com/watch?v=${episode.youtubeVideoId}`,
                                            });
                                            setShowEpisodeModal(true);
                                        }}
                                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <a
                                        href={`https://youtube.com/watch?v=${episode.youtubeVideoId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                    >
                                        <LinkIcon size={16} />
                                    </a>
                                    <button
                                        onClick={() => handleDeleteEpisode(episode.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {episodes.length === 0 && (
                            <div className="text-center py-12 text-gray-400">
                                <Play size={48} className="mx-auto mb-3 opacity-20" />
                                <p className="font-medium">No episodes yet</p>
                                <p className="text-sm">Add episodes using YouTube video URLs</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Story Modal */}
            {showStoryModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-gray-900">
                                {editingStory ? "Edit Story" : "Add New Story"}
                            </h3>
                            <button onClick={() => setShowStoryModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={editingStory ? handleUpdateStory : handleCreateStory} className="space-y-4">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={storyForm.title}
                                    onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })}
                                    required
                                    placeholder="Story Title"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={storyForm.description}
                                    onChange={(e) => setStoryForm({ ...storyForm, description: e.target.value })}
                                    placeholder="Story description"
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                                    Story Thumbnail
                                </label>
                                <div className="space-y-3">
                                    <div
                                        className="relative aspect-video bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden flex flex-col items-center justify-center group hover:border-blue-500 transition-colors cursor-pointer"
                                        onClick={() => document.getElementById('story-thumb-upload')?.click()}
                                    >
                                        {storyForm.thumbnailUrl ? (
                                            <>
                                                <img
                                                    src={storyForm.thumbnailUrl}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Upload className="text-white w-8 h-8" />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center p-6">
                                                <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                                <p className="text-sm font-bold text-gray-500">Click to Upload Thumbnail</p>
                                                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                                            </div>
                                        )}

                                        {thumbnailUploading && (
                                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                                                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                                                <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Uploading...</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="relative flex-1">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <LinkIcon size={14} />
                                            </div>
                                            <input
                                                type="url"
                                                value={storyForm.thumbnailUrl}
                                                onChange={(e) => setStoryForm({ ...storyForm, thumbnailUrl: e.target.value })}
                                                placeholder="Or paste external image URL"
                                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        {storyForm.thumbnailUrl && (
                                            <button
                                                type="button"
                                                onClick={() => setStoryForm({ ...storyForm, thumbnailUrl: "" })}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <X size={18} />
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        id="story-thumb-upload"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleThumbnailUpload}
                                        disabled={thumbnailUploading}
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Custom thumbnail for this story collection</p>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowStoryModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Saving...
                                        </>
                                    ) : editingStory ? (
                                        "Update"
                                    ) : (
                                        "Create"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Episode Modal */}
            {showEpisodeModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-gray-900">
                                {editingEpisode ? "Edit Episode" : "Add New Episode"}
                            </h3>
                            <button onClick={() => {
                                setShowEpisodeModal(false);
                                setEditingEpisode(null);
                            }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={editingEpisode ? handleUpdateEpisode : handleCreateEpisode} className="space-y-4">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                                    YouTube Video URL *
                                </label>
                                <input
                                    type="url"
                                    value={episodeForm.youtubeVideoUrl}
                                    onChange={(e) => setEpisodeForm({ ...episodeForm, youtubeVideoUrl: e.target.value })}
                                    required
                                    placeholder="https://youtube.com/watch?v=..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 mt-1">Thumbnail will be auto-generated from video ID</p>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                                    Episode Title *
                                </label>
                                <input
                                    type="text"
                                    value={episodeForm.title}
                                    onChange={(e) => setEpisodeForm({ ...episodeForm, title: e.target.value })}
                                    required
                                    placeholder="Episode Title"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={episodeForm.description}
                                    onChange={(e) => setEpisodeForm({ ...episodeForm, description: e.target.value })}
                                    placeholder="Episode description"
                                    rows={2}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                                    Episode Thumbnail
                                </label>
                                <div className="space-y-3">
                                    <div
                                        className="relative aspect-video bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden flex flex-col items-center justify-center group hover:border-green-500 transition-colors cursor-pointer"
                                        onClick={() => document.getElementById('episode-thumb-upload')?.click()}
                                    >
                                        {episodeForm.thumbnailUrl ? (
                                            <>
                                                <img
                                                    src={episodeForm.thumbnailUrl}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Upload className="text-white w-8 h-8" />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center p-6">
                                                <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                                <p className="text-sm font-bold text-gray-500">Click to Upload Thumbnail</p>
                                                <p className="text-xs text-gray-400 mt-1">Will default to YouTube thumbnail if empty</p>
                                            </div>
                                        )}

                                        {thumbnailUploading && (
                                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                                                <Loader2 className="w-8 h-8 animate-spin text-green-600 mb-2" />
                                                <p className="text-xs font-black text-green-600 uppercase tracking-widest">Uploading...</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="relative flex-1">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <LinkIcon size={14} />
                                            </div>
                                            <input
                                                type="url"
                                                value={episodeForm.thumbnailUrl}
                                                onChange={(e) => setEpisodeForm({ ...episodeForm, thumbnailUrl: e.target.value })}
                                                placeholder="Or paste external image URL"
                                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            />
                                        </div>
                                        {episodeForm.thumbnailUrl && (
                                            <button
                                                type="button"
                                                onClick={() => setEpisodeForm({ ...episodeForm, thumbnailUrl: "" })}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <X size={18} />
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        id="episode-thumb-upload"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleEpisodeThumbnailUpload}
                                        disabled={thumbnailUploading}
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-bold italic">Note: Thumbnail will be auto-generated from video ID if left blank</p>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowEpisodeModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        editingEpisode ? "Update Episode" : "Add Episode"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
