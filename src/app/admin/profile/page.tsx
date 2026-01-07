"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Camera, Save, ArrowLeft, Loader2, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AdminProfile() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/admin/login");
        } else if (user) {
            fetchProfile();
        }
    }, [user, loading, router]);

    const fetchProfile = async () => {
        const res = await fetch("/api/admin/profile");
        if (res.ok) {
            const data = await res.json();
            setProfile(data);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        setUploading(true);
        try {
            const file = e.target.files[0];
            const storageRef = ref(storage, `profile/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            setProfile({ ...profile, avatarUrl: url });
        } catch (error) {
            console.error("Upload failed", error);
            alert("Image upload failed");
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
                router.push("/admin/dashboard");
            }
        } catch (error) {
            console.error("Save failed", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading || !profile) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-12 max-w-4xl">
            <div className="mb-12 flex justify-between items-center">
                <div>
                    <Link href="/admin/dashboard" className="text-secondary hover:text-primary flex items-center space-x-2 font-black transition-colors mb-4 uppercase tracking-widest text-xs">
                        <ArrowLeft size={16} />
                        <span>Dashboard</span>
                    </Link>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Edit Profile</h1>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-8 md:p-12">
                <form onSubmit={handleSave} className="space-y-12">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center">
                        <div className="relative group">
                            <div className="w-48 h-48 rounded-[2.5rem] overflow-hidden border-8 border-gray-50 shadow-inner bg-gray-100 flex items-center justify-center relative">
                                {profile.avatarUrl ? (
                                    <Image src={profile.avatarUrl} alt="Avatar" fill className="object-cover" />
                                ) : (
                                    <User size={64} className="text-gray-300" />
                                )}
                                {uploading && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-[2rem]">
                                        <Loader2 className="text-white animate-spin" />
                                    </div>
                                )}
                            </div>
                            <label className="absolute bottom-2 right-2 bg-primary text-white p-4 rounded-2xl cursor-pointer hover:bg-blue-800 transition-all shadow-xl hover:scale-110 active:scale-95">
                                <Camera size={20} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                        </div>
                        <p className="text-secondary text-sm font-bold mt-6 uppercase tracking-widest">Update Profile Picture</p>
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
    );
}
