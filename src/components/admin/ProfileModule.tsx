"use client";

import { useEffect, useState } from "react";
import { Camera, Save, Loader2, User } from "lucide-react";
import Image from "next/image";

export default function ProfileModule() {
    const [profile, setProfile] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const res = await fetch("/api/admin/profile");
        if (res.ok) {
            const data = await res.json();
            setProfile(data);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'hero') => {
        if (!e.target.files?.[0]) return;

        setUploading(true);
        try {
            const file = e.target.files[0];
            const formData = new FormData();
            formData.append("file", file);
            formData.append("path", "profile");

            const res = await fetch("/api/admin/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();
            if (type === 'avatar') {
                setProfile({ ...profile, avatarUrl: data.url });
            } else {
                setProfile({ ...profile, heroImageUrl: data.url });
            }
        } catch (error) {
            console.error("Upload failed", error);
            alert("Image upload failed. Please try again.");
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
            }
        } catch (error) {
            console.error("Save failed", error);
        } finally {
            setSaving(false);
        }
    };

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
                    <div className="grid md:grid-cols-2 gap-12">
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

                    {/* Quick Stats Section */}
                    <div className="space-y-6">
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
        </div>
    )
}
