"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    User,
    Briefcase,
    Layout,
    MessageSquare,
    LogOut,
    ExternalLink,
    Loader2,
    Home,
    X,
    Menu,
    Users,
    Youtube,
    GraduationCap
} from "lucide-react";
import Link from "next/link";
import ProfileModule from "@/components/admin/ProfileModule";
import ProjectsModule from "@/components/admin/ProjectsModule";
import TimelineModule from "@/components/admin/TimelineModule";
import MessagesModule from "@/components/admin/MessagesModule";
import OverviewModule from "@/components/admin/OverviewModule";
import PartnershipsModule from "@/components/admin/PartnershipsModule";
import TrainingAcademyModule from "@/components/admin/TrainingAcademyModule";
import YouTubeModule from "@/components/admin/YouTubeModule";

type Tab = "overview" | "profile" | "messages" | "youtube-manager" | "portfolio" | "training-academy" | "timeline";

export default function AdminDashboard() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>("overview");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Sync tab with URL hash for persistence on refresh
    useEffect(() => {
        const hash = window.location.hash.replace('#', '') as Tab;
        const validTabs = ["overview", "profile", "messages", "youtube-manager", "portfolio", "training-academy", "timeline"];
        if (hash && (validTabs as string[]).includes(hash)) {
            setActiveTab(hash);
        }

        const fetchAllCounts = async () => {
            try {
                const res = await fetch("/api/admin/notifications");
                if (res.ok) {
                    const data = await res.json();
                    setUnreadCount(data.unreadMessages || 0);
                    setUnreadCount(data.unreadMessages || 0);
                }
            } catch (err) {
                console.error("Failed to fetch notification counts", err);
            }
        };

        fetchAllCounts();
        const interval = setInterval(fetchAllCounts, 60000); // Poll every 60s

        return () => clearInterval(interval);
    }, [user]);

    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab);
        window.location.hash = tab;
        setIsMobileMenuOpen(false);
    };

    useEffect(() => {
        if (!loading && !user) {
            router.push("/admin/login");
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    const menuItems = [
        { id: "overview", title: "Command Center", icon: Home, color: "bg-blue-500" },
        { id: "profile", title: "Profile Info", icon: User, color: "bg-indigo-500" },
        { id: "portfolio", title: "Portfolio Manager", icon: Layout, color: "bg-amber-600" },
        { id: "training-academy", title: "Training Academy", icon: GraduationCap, color: "bg-orange-500" },
        { id: "youtube-manager", title: "YouTube Manager", icon: Youtube, color: "bg-red-600" },
        { id: "timeline", title: "Timeline / Experience", icon: Briefcase, color: "bg-purple-500" },
        { id: "messages", title: "Messages", icon: MessageSquare, color: "bg-emerald-500", badge: unreadCount },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case "profile": return <ProfileModule />;
            case "portfolio": return <ProjectsModule />;
            case "youtube-manager": return <YouTubeModule />;
            case "messages": return <MessagesModule />;
            case "training-academy": return <TrainingAcademyModule />;
            case "timeline": return <TimelineModule />;
            default: return (
                <div className="space-y-16 animate-in fade-in duration-700">
                    <OverviewModule />
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen bg-[#fcfcfd] flex relative overflow-hidden font-poppins text-gray-900">
            {/* Soft Background Decorative Blobs */}
            <div className="fixed top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Sidebar */}
            <aside className="w-64 bg-white/70 backdrop-blur-xl border-r border-gray-100 hidden lg:flex flex-col fixed inset-y-0 z-50 print:hidden shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                <div className="p-6">
                    <Link href="/" className="group flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-all text-white">
                            <Layout size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 leading-none mb-0.5">Nexus</span>
                            <span className="text-lg font-bold tracking-tight text-gray-900 leading-none">Admin<span className="text-primary italic">.</span></span>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-6 overflow-y-auto pb-6 scrollbar-hide">
                    {menuItems.map((item) => (
                        item.id === "divider" ? (
                            <div key={item.id} className="px-4 pt-6 pb-2">
                                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-400">{item.title}</span>
                            </div>
                        ) : (
                            <button
                                key={item.id}
                                onClick={() => handleTabChange(item.id as Tab)}
                                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl font-bold text-xs transition-all relative group ${activeTab === item.id
                                    ? "bg-primary text-white shadow-lg shadow-primary/25 translate-x-1"
                                    : "text-gray-500 hover:bg-gray-50/80 hover:text-primary hover:translate-x-1"
                                    }`}
                            >
                                <div className={`p-1.5 rounded-lg transition-colors ${activeTab === item.id ? "bg-white/20" : "bg-gray-50 group-hover:bg-primary/5"}`}>
                                    {item.icon && (() => {
                                        const IconComponent = item.icon;
                                        return <IconComponent size={14} />;
                                    })()}
                                </div>
                                <span className="flex-1 text-left">{item.title}</span>

                                {item.badge && item.badge > 0 && (
                                    <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black animate-pulse ${activeTab === item.id ? "bg-white text-primary" : "bg-red-500 text-white"}`}>
                                        {item.badge}
                                    </span>
                                )}

                                {activeTab === item.id && (
                                    <div className="absolute left-1 w-0.5 h-4 bg-white rounded-full" />
                                )}
                            </button>
                        )
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100/50">
                    <button
                        onClick={() => logout()}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-black text-xs text-red-500 hover:bg-red-50 transition-all group"
                    >
                        <div className="p-1.5 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
                            <LogOut size={16} />
                        </div>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 w-full overflow-x-hidden min-h-screen relative z-10 print:ml-0">
                <header className="bg-white/60 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40 print:hidden shadow-sm">
                    <div className="max-w-7xl mx-auto px-6 md:px-8 py-3.5 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-100 bg-white shadow-sm"
                            >
                                <Menu size={18} />
                            </button>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 mb-0.5">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    <span>System Online</span>
                                </div>
                                <h2 className="text-sm font-black text-gray-900 tracking-tight flex items-center gap-1.5 lowercase">
                                    <span className="text-primary">/</span> {activeTab === 'overview' ? 'Command Center' : activeTab.replace('-', ' ')}
                                </h2>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/"
                                target="_blank"
                                className="p-2 rounded-lg border border-gray-100 bg-white text-gray-400 hover:text-primary hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all shadow-sm group"
                            >
                                <ExternalLink size={16} className="group-hover:scale-110 transition-transform" />
                            </Link>
                            <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
                                <div className="flex flex-col items-end hidden sm:flex">
                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Admin</span>
                                    <span className="text-[10px] font-bold text-gray-900 leading-none">{user.email?.split('@')[0]}</span>
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/20 flex items-center justify-center font-black text-white text-sm border-2 border-white">
                                    {user.email?.charAt(0).toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-8 max-w-7xl mx-auto w-full relative">
                    {renderContent()}
                </div>
            </main>

            {/* Mobile Menu Drawer */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[100] lg:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                    <aside className="absolute inset-y-0 left-0 w-80 bg-white shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
                        <div className="p-10 flex justify-between items-center">
                            <Link href="/" className="text-2xl font-bold tracking-tight">
                                <span className="text-primary">Admin</span>
                                <span className="text-gray-900 font-black">Panel</span>
                            </Link>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <nav className="flex-1 px-6 space-y-2 mt-4 overflow-y-auto pb-10">
                            {menuItems.map((item) => (
                                item.id === "divider" ? (
                                    <div key={item.id} className="px-6 pt-8 pb-2">
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">{item.title}</span>
                                    </div>
                                ) : (
                                    <button
                                        key={item.id}
                                        onClick={() => handleTabChange(item.id as Tab)}
                                        className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl font-black text-sm transition-all ${activeTab === item.id
                                            ? "bg-primary text-white shadow-xl shadow-primary/20"
                                            : "text-secondary hover:bg-gray-50 hover:text-primary"
                                            }`}
                                    >
                                        {item.icon && (() => {
                                            const IconComponent = item.icon;
                                            return <IconComponent size={20} />;
                                        })()}
                                        <span>{item.title}</span>
                                    </button>
                                )
                            ))}
                        </nav>

                        <div className="p-6 border-t border-gray-50">
                            <button
                                onClick={() => logout()}
                                className="w-full flex items-center space-x-4 px-6 py-4 rounded-2xl font-black text-sm text-red-500 hover:bg-red-50 transition-all"
                            >
                                <LogOut size={20} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
}
