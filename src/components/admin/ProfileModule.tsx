"use client";

import { useEffect, useState } from "react";
import { Camera, Save, Loader2, User, GraduationCap, Presentation, Users, Music, Video } from "lucide-react";
import Image from "next/image";
import { uploadToImageKit } from "@/lib/imagekit-upload";
import TimelineModule from "./TimelineModule";

export default function ProfileModule() {
    const [profile, setProfile] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

            const res = await fetch("/api/admin/profile", { signal: controller.signal });
            clearTimeout(timeoutId);

            if (res.ok) {
                const data = await res.json();
                // If it's a new/empty profile, use the professional defaults from the main page
                setProfile(data?.id ? data : {
                    name: "Hari Haran Jeyaramamoorthy",
                    headline: "Web/App Developer | Business Consultant | Job Placement Expert | Operations & Partnerships Manager | Snack Business Owner | Project Management",
                    about: "Passionate developer and business strategist focused on building innovative solutions.",
                    location: "Tamil Nadu, India",
                    avatarUrl: "/hari_photo.png",
                    heroImageUrl: null,
                    aboutImageUrl: null,
                    audioUrl: null,
                    featuredVideoUrl: null,
                    businessSolutionVideoUrl: null,
                    businessSolutionVideoConfig: { scale: 1, x: 0, y: 0, mixBlendMode: 'screen' },
                    socialLinks: { linkedin: "https://linkedin.com/in/hari-haran-j", github: "https://github.com/hari-haran-j", twitter: "", instagram: "" },
                    stats: [
                        { label: "Years Experience", value: "3+", icon: "Briefcase" },
                        { label: "Projects Completed", value: "10+", icon: "Code" },
                        { label: "Clubs Led", value: "5+", icon: "Award" },
                        { label: "Colleges Partnered", value: "42", icon: "User" },
                    ],
                    trainingStats: [
                        { label: "Expert Sessions", value: "150+", icon: "Presentation" },
                        { label: "Partnered Colleges", value: "42+", icon: "GraduationCap" },
                        { label: "Minds Empowered", value: "5000+", icon: "Users" },
                    ]
                });
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.error("Failed to fetch profile:", errorData.error || res.statusText);
                setProfile({ error: errorData.error || "Failed to load profile from database." });
            }
        } catch (error: any) {
            console.error("Error fetching profile:", error);
            setProfile({ error: "Network error or request timed out." });
        }
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
                    const MAX_WIDTH = 1200; // Reasonable max width for web
                    const scaleSize = MAX_WIDTH / img.width;
                    const width = scaleSize < 1 ? MAX_WIDTH : img.width;
                    const height = scaleSize < 1 ? img.height * scaleSize : img.height;

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG with 0.7 quality
                    const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
                    resolve(dataUrl);
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'hero' | 'about' | 'audio' | 'video' | 'business_video') => {
        if (!e.target.files?.[0]) return;
        setUploading(true);

        try {
            const file = e.target.files[0];
            // Check file size (limit to 10MB for images, 100MB for video/audio)
            const isMedia = type === 'audio' || type === 'video';
            const limit = isMedia ? 100 * 1024 * 1024 : 10 * 1024 * 1024;

            if (file.size > limit) {
                alert(`File is too large. Please select a ${isMedia ? 'file under 100MB' : 'image under 10MB'}.`);
                setUploading(false);
                return;
            }

            // Upload to ImageKit CDN with AVIF optimization
            const imagekitUrl = await uploadToImageKit(file, 'profile');

            if (type === 'avatar') {
                setProfile({ ...profile, avatarUrl: imagekitUrl });
            } else if (type === 'hero') {
                setProfile({ ...profile, heroImageUrl: imagekitUrl });
            } else if (type === 'about') {
                setProfile({ ...profile, aboutImageUrl: imagekitUrl });
            } else if (type === 'audio') {
                setProfile({ ...profile, audioUrl: imagekitUrl });
            } else if (type === 'video') {
                setProfile({ ...profile, featuredVideoUrl: imagekitUrl });
            } else if (type === 'business_video') {
                setProfile({
                    ...profile,
                    businessSolutionVideoUrl: imagekitUrl,
                    businessSolutionVideoConfig: profile.businessSolutionVideoConfig || { scale: 1, x: 0, y: 0, mixBlendMode: 'screen' }
                });
            }
        } catch (error) {
            console.error("Image upload failed", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/admin/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile),
            });
            if (res.ok) {
                alert("Profile updated successfully!");
            } else {
                const errorData = await res.json().catch(() => ({}));
                alert("Failed to save profile: " + (errorData.error || "Database error. Did you run the migration?"));
            }
        } catch (error) {
            console.error("Save failed", error);
            alert("Network error: Failed to reach the server.");
        } finally {
            setSaving(false);
        }
    };

    if (profile?.error) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-6 bg-red-50 rounded-[3rem] border-2 border-dashed border-red-200">
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-black text-red-600 uppercase tracking-tighter">Database Sync Required</h3>
                    <p className="text-sm font-medium text-red-500 max-w-sm">{profile.error}</p>
                </div>
                <button
                    onClick={() => window.open('/api/repair-db', '_blank')}
                    className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-200"
                >
                    Run Database Repair Tool
                </button>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-8 md:p-12">
                <form onSubmit={handleSave} className="space-y-12">
                    {/* Images Section */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center space-y-6">
                            <div className="relative group">
                                <div className="w-48 h-48 rounded-full overflow-hidden border-8 border-gray-50 shadow-inner bg-gray-100 flex items-center justify-center relative">
                                    {profile.avatarUrl ? (
                                        <Image src={profile.avatarUrl} alt="Avatar" fill className="object-cover" />
                                    ) : (
                                        <User size={64} className="text-gray-300" />
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-full text-white">
                                            <Loader2 className="animate-spin mb-2" size={32} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Uploading...</span>
                                        </div>
                                    )}
                                </div>
                                <label className="absolute bottom-2 right-2 bg-primary text-white p-4 rounded-full cursor-pointer hover:bg-blue-800 transition-all shadow-xl hover:scale-110 active:scale-95 border-4 border-white">
                                    <Camera size={20} />
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar')} />
                                </label>
                            </div>
                            <p className="text-secondary text-sm font-bold uppercase tracking-widest text-center">Profile Picture (Avatar)</p>
                        </div>

                        {/* Hero Image Section */}
                        <div className="flex flex-col items-center space-y-6">
                            <div className="relative group w-full">
                                <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden border-8 border-gray-50 shadow-inner bg-gray-100 flex items-center justify-center relative">
                                    {profile.heroImageUrl ? (
                                        <Image src={profile.heroImageUrl} alt="Hero" fill className="object-cover" />
                                    ) : (
                                        <div className="text-gray-300 font-black text-xl uppercase tracking-tighter opacity-20">No Hero Image</div>
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                                            <Loader2 className="animate-spin mb-2" size={32} />
                                        </div>
                                    )}
                                </div>
                                <label className="absolute bottom-4 right-4 bg-accent text-white p-4 rounded-2xl cursor-pointer hover:bg-amber-600 transition-all shadow-xl hover:scale-110 active:scale-95 border-4 border-white">
                                    <Camera size={20} />
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'hero')} />
                                </label>
                            </div>
                            <p className="text-secondary text-sm font-bold uppercase tracking-widest text-center">Hero Background Picture</p>
                        </div>

                        {/* About Image Section */}
                        <div className="flex flex-col items-center space-y-6">
                            <div className="relative group">
                                <div className="w-48 h-48 rounded-full overflow-hidden border-8 border-gray-50 shadow-inner bg-gray-100 flex items-center justify-center relative">
                                    {profile.aboutImageUrl ? (
                                        <Image src={profile.aboutImageUrl} alt="About" fill className="object-cover" />
                                    ) : (
                                        <User size={64} className="text-gray-300" />
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-full text-white">
                                            <Loader2 className="animate-spin mb-2" size={32} />
                                        </div>
                                    )}
                                </div>
                                <label className="absolute bottom-2 right-2 bg-indigo-600 text-white p-4 rounded-full cursor-pointer hover:bg-indigo-700 transition-all shadow-xl hover:scale-110 active:scale-95 border-4 border-white">
                                    <Camera size={20} />
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'about')} />
                                </label>
                            </div>
                            <p className="text-secondary text-sm font-bold uppercase tracking-widest text-center">About Section Picture</p>
                        </div>

                        {/* Audio Upload Section */}
                        <div className="flex flex-col items-center space-y-6 md:col-span-2 lg:col-span-3">
                            <div className="w-full max-w-md bg-gray-50 rounded-2xl p-6 border border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-pink-100 text-pink-600 rounded-xl">
                                        <Music size={24} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-gray-900 uppercase tracking-wide">Profile Audio</span>
                                        {profile.audioUrl ? (
                                            <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                                                Audio Uploaded
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400 font-medium">No audio uploaded</span>
                                        )}
                                    </div>
                                </div>

                                <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors shadow-sm text-xs font-black uppercase tracking-widest text-gray-600">
                                    {uploading ? <Loader2 size={16} className="animate-spin" /> : "Upload MP3"}
                                    <input type="file" className="hidden" accept="audio/*" onChange={(e) => handleImageUpload(e, 'audio')} />
                                </label>
                            </div>
                            {profile.audioUrl && (
                                <audio controls src={profile.audioUrl} className="w-full max-w-md bg-transparent" />
                            )}
                        </div>

                        {/* Video Section */}
                        <div className="flex flex-col items-center space-y-6 md:col-span-2 lg:col-span-3 pt-6 border-t border-gray-50">
                            <div className="w-full max-w-xl space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                                        <Presentation size={24} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-gray-900 uppercase tracking-wide">Featured Blog Video</span>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Only one video will be displayed on the blog</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">YouTube Video ID</label>
                                        <input
                                            type="text"
                                            placeholder="Paste YouTube ID or Link"
                                            value={profile.featuredVideoUrl || ""}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                                                const match = val.match(regExp);
                                                const id = (match && match[2].length === 11) ? match[2] : val;
                                                setProfile({ ...profile, featuredVideoUrl: id });
                                            }}
                                            className="w-full bg-white border border-gray-100 rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Or Upload File</label>
                                        <label className="flex items-center justify-center gap-2 w-full h-[54px] bg-white border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors shadow-sm text-xs font-black uppercase tracking-widest text-gray-600">
                                            {uploading ? <Loader2 size={16} className="animate-spin" /> : "Select Video File"}
                                            <input type="file" className="hidden" accept="video/*" onChange={(e) => handleImageUpload(e, 'video')} />
                                        </label>
                                    </div>
                                </div>

                                {profile.featuredVideoUrl && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Preview</span>
                                            <button
                                                type="button"
                                                onClick={() => setProfile({ ...profile, featuredVideoUrl: null })}
                                                className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        {(() => {
                                            const val = profile.featuredVideoUrl;
                                            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                                            const match = val.match(regExp);
                                            const id = (match && match[2].length === 11) ? match[2] : val;

                                            if (id.length === 11) {
                                                return (
                                                    <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg">
                                                        <iframe
                                                            width="100%"
                                                            height="100%"
                                                            src={`https://www.youtube.com/embed/${id}`}
                                                            title="YouTube video player"
                                                            frameBorder="0"
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                            allowFullScreen
                                                        ></iframe>
                                                    </div>
                                                );
                                            }
                                            return <video controls src={val} className="w-full rounded-xl shadow-lg" />;
                                        })()}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Business Solutions Video Section */}
                        <div className="flex flex-col items-center space-y-6 md:col-span-2 lg:col-span-3 pt-6 border-t border-gray-50">
                            <div className="w-full max-w-xl space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                                        <Video size={24} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-gray-900 uppercase tracking-wide">Business Solutions Animation</span>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Custom video for the Home Page Tech Section</p>
                                    </div>
                                </div>

                                <div className="p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-black uppercase tracking-widest text-gray-400">Upload Media</span>
                                        <label className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 transition-all shadow-sm text-[10px] font-black uppercase tracking-widest text-gray-600">
                                            {uploading ? <Loader2 size={16} className="animate-spin" /> : "Select Video"}
                                            <input type="file" className="hidden" accept="video/*" onChange={(e) => handleImageUpload(e, 'business_video')} />
                                        </label>
                                    </div>

                                    {profile.businessSolutionVideoUrl && (
                                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                            {/* Advanced Crop & Adjust Controls */}
                                            <div className="grid grid-cols-2 gap-6 bg-white p-6 rounded-3xl border border-gray-100/50">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Scale / Zoom</label>
                                                        <span className="text-[10px] font-black text-primary">{profile.businessSolutionVideoConfig?.scale || 1}x</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="1"
                                                        max="3"
                                                        step="0.1"
                                                        value={profile.businessSolutionVideoConfig?.scale || 1}
                                                        onChange={(e) => setProfile({
                                                            ...profile,
                                                            businessSolutionVideoConfig: {
                                                                ...profile.businessSolutionVideoConfig,
                                                                scale: parseFloat(e.target.value)
                                                            }
                                                        })}
                                                        className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Styling Filter</label>
                                                    <select
                                                        value={profile.businessSolutionVideoConfig?.mixBlendMode || "screen"}
                                                        onChange={(e) => setProfile({
                                                            ...profile,
                                                            businessSolutionVideoConfig: {
                                                                ...profile.businessSolutionVideoConfig,
                                                                mixBlendMode: e.target.value
                                                            }
                                                        })}
                                                        className="w-full bg-gray-50 border-0 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary"
                                                    >
                                                        <option value="normal">Normal / Clean</option>
                                                        <option value="screen">Screen (Lighten)</option>
                                                        <option value="overlay">Overlay (Punchy)</option>
                                                        <option value="multiply">Multiply (Darken)</option>
                                                    </select>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Horizontal Adjust (X)</label>
                                                        <span className="text-[10px] font-black text-primary">{profile.businessSolutionVideoConfig?.x || 0}%</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="-50"
                                                        max="50"
                                                        step="1"
                                                        value={profile.businessSolutionVideoConfig?.x || 0}
                                                        onChange={(e) => setProfile({
                                                            ...profile,
                                                            businessSolutionVideoConfig: {
                                                                ...profile.businessSolutionVideoConfig,
                                                                x: parseInt(e.target.value)
                                                            }
                                                        })}
                                                        className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Vertical Adjust (Y)</label>
                                                        <span className="text-[10px] font-black text-primary">{profile.businessSolutionVideoConfig?.y || 0}%</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="-50"
                                                        max="50"
                                                        step="1"
                                                        value={profile.businessSolutionVideoConfig?.y || 0}
                                                        onChange={(e) => setProfile({
                                                            ...profile,
                                                            businessSolutionVideoConfig: {
                                                                ...profile.businessSolutionVideoConfig,
                                                                y: parseInt(e.target.value)
                                                            }
                                                        })}
                                                        className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
                                                    />
                                                </div>
                                            </div>

                                            {/* Preview Window */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center px-2">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Live Crop Preview</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setProfile({ ...profile, businessSolutionVideoUrl: null })}
                                                        className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline"
                                                    >
                                                        Remove Video
                                                    </button>
                                                </div>
                                                <div className="relative aspect-video w-full rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-black">
                                                    <video
                                                        autoPlay
                                                        loop
                                                        muted
                                                        playsInline
                                                        key={profile.businessSolutionVideoUrl}
                                                        src={profile.businessSolutionVideoUrl}
                                                        style={{
                                                            transform: `scale(${profile.businessSolutionVideoConfig?.scale || 1}) translate(${profile.businessSolutionVideoConfig?.x || 0}%, ${profile.businessSolutionVideoConfig?.y || 0}%)`,
                                                            mixBlendMode: (profile.businessSolutionVideoConfig?.mixBlendMode || "screen") as any,
                                                            transition: 'transform 0.2s ease-out'
                                                        }}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-l from-black/60 to-transparent pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">Full Name</label>
                            <input
                                type="text"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-primary transition-all font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">Location</label>
                            <input
                                type="text"
                                value={profile.location}
                                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-primary transition-all font-bold"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">Headline</label>
                        <textarea
                            rows={3}
                            value={profile.headline}
                            onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                            className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-primary transition-all font-bold"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">About Me</label>
                        <textarea
                            rows={6}
                            value={profile.about}
                            onChange={(e) => setProfile({ ...profile, about: e.target.value })}
                            className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-primary transition-all font-bold"
                        />
                    </div>

                    {/* Training Program Stats Section */}
                    <div className="space-y-6 pt-12 border-t border-gray-100">
                        <div className="flex items-center space-x-3 ml-2">
                            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                <GraduationCap size={20} />
                            </div>
                            <h2 className="text-xl font-black text-gray-900">Training Program Stats</h2>
                        </div>
                        <p className="text-secondary text-xs ml-2 max-w-2xl font-medium">Configure the counters shown in the Training Programs section. Use keywords like <span className="text-primary italic">"Session"</span>, <span className="text-primary italic">"College"</span>, and <span className="text-primary italic">"Student"</span> in labels for auto-detection.</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[0, 1, 2].map((i) => {
                                const stat = profile.trainingStats?.[i] || { label: "", value: "", icon: i === 0 ? "Presentation" : i === 1 ? "GraduationCap" : "Users" };
                                return (
                                    <div key={i} className="bg-gray-50 p-6 rounded-2xl space-y-4 border border-gray-100">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-gray-400">Stat Label</label>
                                            <input
                                                type="text"
                                                value={stat.label}
                                                placeholder={i === 0 ? "Expert Sessions" : i === 1 ? "Partnered Colleges" : "Minds Empowered"}
                                                onChange={(e) => {
                                                    const newStats = [...(profile.trainingStats || [])];
                                                    if (!newStats[i]) newStats[i] = { label: "", value: "", icon: i === 0 ? "Presentation" : i === 1 ? "GraduationCap" : "Users" };
                                                    newStats[i].label = e.target.value;
                                                    setProfile({ ...profile, trainingStats: newStats });
                                                }}
                                                className="w-full bg-white border-gray-100 border rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-gray-400">Stat Value</label>
                                            <input
                                                type="text"
                                                value={stat.value}
                                                placeholder="e.g. 150+"
                                                onChange={(e) => {
                                                    const newStats = [...(profile.trainingStats || [])];
                                                    if (!newStats[i]) newStats[i] = { label: "", value: "", icon: i === 0 ? "Presentation" : i === 1 ? "GraduationCap" : "Users" };
                                                    newStats[i].value = e.target.value;
                                                    setProfile({ ...profile, trainingStats: newStats });
                                                }}
                                                className="w-full bg-white border-gray-100 border rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick Stats Section */}
                    <div className="space-y-6 pt-12 border-t border-gray-100">
                        <h2 className="text-xl font-black text-gray-900 ml-2">Quick Stats (Home Page)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(profile.stats || []).map((stat: any, index: number) => (
                                <div key={index} className="bg-gray-50 p-6 rounded-2xl space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-gray-400">Label</label>
                                            <input
                                                type="text"
                                                value={stat.label}
                                                onChange={(e) => {
                                                    const newStats = [...profile.stats];
                                                    newStats[index].label = e.target.value;
                                                    setProfile({ ...profile, stats: newStats });
                                                }}
                                                className="w-full bg-white border-0 rounded-xl p-3 text-sm font-bold"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-gray-400">Value</label>
                                            <input
                                                type="text"
                                                value={stat.value}
                                                onChange={(e) => {
                                                    const newStats = [...profile.stats];
                                                    newStats[index].value = e.target.value;
                                                    setProfile({ ...profile, stats: newStats });
                                                }}
                                                className="w-full bg-white border-0 rounded-xl p-3 text-sm font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        disabled={saving || uploading}
                        className="w-full bg-primary text-white py-6 rounded-[2rem] font-black text-xl flex items-center justify-center space-x-3 shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                        <span>Save Profile Changes</span>
                    </button>
                </form>
            </div>

            {/* Timeline Module Integration */}
            <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-8 md:p-12">
                <TimelineModule />
            </div>
        </div>
    )
}
