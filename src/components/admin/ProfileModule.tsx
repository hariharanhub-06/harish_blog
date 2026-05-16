"use client";

import { useEffect, useState } from "react";
import { Camera, Save, Loader2, User, GraduationCap, Presentation, Users, Music, Eye, Image as ImageIcon, Video, Link, Check } from "lucide-react";
import Image from "next/image";
import { uploadToImageKit } from "@/lib/imagekit-upload";
import TimelineModule from "./TimelineModule";

export default function ProfileModule() {
    const [profile, setProfile] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [copiedAnchor, setCopiedAnchor] = useState<string | null>(null);

    const sessionId = typeof window !== "undefined" ? localStorage.getItem("admin_sessionId") || "" : "";

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

            const res = await fetch("/api/admin/profile", { signal: controller.signal, headers: { "X-Session-Id": sessionId } });
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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'hero' | 'about' | 'audio') => {
        if (!e.target.files?.[0]) return;
        setUploading(true);

        try {
            const file = e.target.files[0];
            const isAudio = type === 'audio';
            const isHero = type === 'hero';
            const isVideo = file.type.startsWith('video/');
            const limit = (isAudio || (isHero && isVideo)) ? 100 * 1024 * 1024 : 10 * 1024 * 1024;

            if (file.size > limit) {
                const message = isAudio ? 'audio under 100MB' : (isHero && isVideo) ? 'video under 100MB' : 'image under 10MB';
                alert(`File is too large. Please select a ${message}.`);
                setUploading(false);
                return;
            }

            const imagekitUrl = await uploadToImageKit(file, 'profile');

            if (type === 'avatar') {
                setProfile({ ...profile, avatarUrl: imagekitUrl });
            } else if (type === 'hero') {
                setProfile({ ...profile, heroImageUrl: imagekitUrl });
            } else if (type === 'about') {
                setProfile({ ...profile, aboutImageUrl: imagekitUrl });
            } else if (type === 'audio') {
                setProfile({ ...profile, audioUrl: imagekitUrl });
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
                headers: { "Content-Type": "application/json", "X-Session-Id": sessionId },
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
            <div className="bg-white dark:bg-[#1e1e1e] rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 p-8 md:p-12">
                <form onSubmit={handleSave} className="space-y-12">
                    {/* Header with quick tip */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-8">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Main Page <span className="text-primary italic">Configuration</span></h1>
                            <p className="text-secondary text-xs font-bold uppercase tracking-widest mt-1">Manage your branding, media, and social engagement settings.</p>
                        </div>
                    </div>
                    {/* Images Section */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center space-y-6">
                            <div className="relative group">
                                <div className="w-48 h-48 rounded-full overflow-hidden border-8 border-gray-50 dark:border-gray-800 shadow-inner bg-gray-100 dark:bg-white/10 flex items-center justify-center relative">
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
                                <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden border-8 border-gray-50 dark:border-gray-800 shadow-inner bg-gray-100 dark:bg-white/10 flex items-center justify-center relative">
                                    {profile.heroImageUrl ? (
                                        profile.heroImageUrl.includes('.mp4') || profile.heroImageUrl.includes('.webm') ? (
                                            <video src={profile.heroImageUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                                        ) : (
                                            <Image src={profile.heroImageUrl} alt="Hero" fill className="object-cover" />
                                        )
                                    ) : (
                                        <div className="text-gray-300 font-black text-xl uppercase tracking-tighter opacity-20">No Hero Media</div>
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                                            <Loader2 className="animate-spin mb-2" size={32} />
                                        </div>
                                    )}
                                </div>
                                <label className="absolute bottom-4 right-4 bg-accent text-white p-4 rounded-2xl cursor-pointer hover:bg-amber-600 transition-all shadow-xl hover:scale-110 active:scale-95 border-4 border-white">
                                    <Video size={20} />
                                    <input type="file" className="hidden" accept="image/*,video/*" onChange={(e) => handleImageUpload(e, 'hero')} />
                                </label>
                            </div>
                            <p className="text-secondary text-sm font-bold uppercase tracking-widest text-center">Hero Background Media (Image/Video)</p>
                        </div>

                        {/* About Image Section */}
                        <div className="flex flex-col items-center space-y-6">
                            <div className="relative group">
                                <div className="w-48 h-48 rounded-full overflow-hidden border-8 border-gray-50 dark:border-gray-800 shadow-inner bg-gray-100 dark:bg-white/10 flex items-center justify-center relative">
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
                            <div className="w-full max-w-md bg-gray-50 dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-pink-100 text-pink-600 rounded-xl">
                                        <Music size={24} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">Profile Audio</span>
                                        {profile.audioUrl ? (
                                            <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                                                Audio Uploaded
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400 font-medium">No audio uploaded</span>
                                        )}
                                    </div>
                                </div>

                                <label className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors shadow-sm text-xs font-black uppercase tracking-widest text-gray-600 dark:text-white">
                                    {uploading ? <Loader2 size={16} className="animate-spin" /> : "Upload MP3"}
                                    <input type="file" className="hidden" accept="audio/*" onChange={(e) => handleImageUpload(e, 'audio')} />
                                </label>
                            </div>
                            {profile.audioUrl && (
                                <audio controls src={profile.audioUrl} className="w-full max-w-md bg-transparent" />
                            )}
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
                                className="w-full bg-gray-50 dark:bg-white/5 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-primary transition-all font-bold text-gray-900 dark:text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">Location</label>
                            <input
                                type="text"
                                value={profile.location}
                                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-white/5 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-primary transition-all font-bold text-gray-900 dark:text-white"
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
                    <div className="space-y-6 pt-12 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center space-x-3 ml-2">
                            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                <GraduationCap size={20} />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white">Training Program Stats</h2>
                        </div>
                        <p className="text-secondary text-xs ml-2 max-w-2xl font-medium">Configure the counters shown in the Training Programs section. Use keywords like <span className="text-primary italic">"Session"</span>, <span className="text-primary italic">"College"</span>, and <span className="text-primary italic">"Student"</span> in labels for auto-detection.</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[0, 1, 2].map((i) => {
                                const stat = profile.trainingStats?.[i] || { label: "", value: "", icon: i === 0 ? "Presentation" : i === 1 ? "GraduationCap" : "Users" };
                                return (
                                    <div key={i} className="bg-gray-50 dark:bg-white/5 p-6 rounded-2xl space-y-4 border border-gray-100 dark:border-gray-800">
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
                                                className="w-full bg-white dark:bg-[#2a2a2a] border border-gray-100 dark:border-gray-700 rounded-xl p-3 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary transition-all"
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
                                                className="w-full bg-white dark:bg-[#2a2a2a] border border-gray-100 dark:border-gray-700 rounded-xl p-3 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary transition-all"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Section Management (Visibility Toggles) */}
                    <div className="space-y-8 pt-12 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center space-x-3 ml-2">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <Eye size={20} />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Section Visibility</h2>
                        </div>
                        <p className="text-secondary text-[10px] font-black uppercase tracking-widest ml-2 max-w-2xl leading-relaxed">
                            Control which parts of your homepage are visible to visitors. Toggle them off to hide sections while you're still working on them or to keep your page clean.
                        </p>

                        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                {/* Header */}
                <div className="flex items-center px-4 sm:px-5 py-3 bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-gray-800">
                  <span className="flex-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Section</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 w-16 text-center hidden sm:block">Status</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 w-14 text-center">Show</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 w-14 text-center">Link</span>
                </div>

                {[
                  { key: 'showHeroSection',         label: 'Hero / Introduction',  anchor: 'home' },
                  { key: 'showStatsSection',         label: 'Quick Stats',          anchor: 'stats' },
                  { key: 'showKnowAboutYouSection',  label: 'Know About You',       anchor: 'know-about-you' },
                  { key: 'showLiveSessionsSection',  label: 'Live Sessions',        anchor: 'live-sessions' },
                  { key: 'showTrainingSection',      label: 'Training & Services',  anchor: 'training' },
                  { key: 'showExperienceSection',    label: 'Experience',           anchor: 'experience' },
                  { key: 'showEducationSection',     label: 'Education',            anchor: 'education' },
                  { key: 'showVolunteeringSection',  label: 'Volunteering',         anchor: 'volunteering' },
                  { key: 'showAboutSection',         label: 'About Me',             anchor: 'about' },
                  { key: 'showProjectsSection',      label: 'Projects',             anchor: 'portfolio' },
                  { key: 'showQuizzesSection',       label: 'Interactive Quizzes',  anchor: 'quiz' },
                  { key: 'showTypingTestSection',    label: 'Typing Test',          anchor: 'typing-test' },
                  { key: 'showFeedbackSection',      label: 'Client Feedback',      anchor: 'feedback' },
                  { key: 'showGamesSection',         label: 'Arcade Hub',           anchor: 'games' },
                ].map((section, i, arr) => {
                  const isVisible = profile[section.key] !== false;
                  const shareUrl = typeof window !== 'undefined'
                    ? `${window.location.origin}/#${section.anchor}`
                    : `/#${section.anchor}`;
                  return (
                    <div
                      key={section.key}
                      className={`flex items-center gap-2 px-4 sm:px-5 py-3.5 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03] ${i < arr.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}
                    >
                      {/* Name + mobile status */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{section.label}</p>
                        <p className={`text-[10px] font-black uppercase tracking-wider mt-0.5 sm:hidden ${isVisible ? 'text-green-500' : 'text-gray-400'}`}>
                          {isVisible ? '● Visible' : '○ Hidden'}
                        </p>
                      </div>

                      {/* Status badge — desktop */}
                      <div className="w-16 justify-center hidden sm:flex">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${isVisible
                          ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400'
                          : 'bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-500'}`}>
                          {isVisible ? 'Visible' : 'Hidden'}
                        </span>
                      </div>

                      {/* Toggle switch */}
                      <div className="w-14 flex justify-center">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isVisible}
                          onClick={() => setProfile({ ...profile, [section.key]: !isVisible })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isVisible ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${isVisible ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>

                      {/* Copy link */}
                      <div className="w-14 flex justify-center">
                        <button
                          type="button"
                          title="Copy direct link to this section"
                          onClick={() => {
                            navigator.clipboard.writeText(shareUrl).catch(() => {});
                            setCopiedAnchor(section.anchor);
                            setTimeout(() => setCopiedAnchor(null), 2000);
                          }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-500 transition-all"
                        >
                          {copiedAnchor === section.anchor
                            ? <Check size={14} className="text-green-500" />
                            : <Link size={14} />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
                    </div>

                    {/* Click Effects */}
                    <div className="space-y-5 pt-12 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center space-x-3 ml-2">
                            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                <Eye size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Click Effects</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-0.5">Animation that plays when visitors click anywhere on the homepage</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { value: "none",    label: "Off",            desc: "No animation",              icon: "✕" },
                                { value: "emoji",   label: "Emoji Pop",      desc: "Random emoji floats up",    icon: "🌟" },
                                { value: "sparkle", label: "Sparkle Trail",  desc: "Stars burst from cursor",   icon: "✨" },
                                { value: "ripple",  label: "Fluid Ripple",   desc: "Water ripple rings",        icon: "💧" },
                            ].map((opt) => {
                                const selected = (profile.clickEffect ?? "none") === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setProfile({ ...profile, clickEffect: opt.value })}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-center ${selected
                                            ? "bg-blue-50 dark:bg-blue-950/30 border-blue-500 shadow-sm"
                                            : "bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600"}`}
                                    >
                                        <span className="text-2xl">{opt.icon}</span>
                                        <span className={`text-xs font-black uppercase tracking-widest ${selected ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-300"}`}>{opt.label}</span>
                                        <span className="text-[9px] text-gray-400 leading-tight">{opt.desc}</span>
                                        {selected && <span className="text-[9px] font-black text-blue-500 uppercase tracking-wider">✓ Active</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick Stats Section */}
                    <div className="space-y-6 pt-12 border-t border-gray-100 dark:border-gray-800">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white ml-2">Quick Stats (Home Page)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(profile.stats || []).map((stat: any, index: number) => (
                                <div key={index} className="bg-gray-50 dark:bg-white/5 p-6 rounded-2xl space-y-4">
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
                                                className="w-full bg-white dark:bg-[#2a2a2a] border border-gray-100 dark:border-gray-700 rounded-xl p-3 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary transition-all"
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
                                                className="w-full bg-white dark:bg-[#2a2a2a] border border-gray-100 dark:border-gray-700 rounded-xl p-3 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        disabled={saving || uploading}
                        type="submit"
                        className="w-full bg-primary text-white py-6 rounded-[2rem] font-black text-xl flex items-center justify-center space-x-3 shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                        <span>Save Profile Changes</span>
                    </button>
                </form>
            </div>

            {/* Timeline Module Integration */}
            <div className="bg-white dark:bg-[#1e1e1e] rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 p-8 md:p-12">
                <TimelineModule />
            </div>
        </div>
    );
}
