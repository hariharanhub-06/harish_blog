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
    ChevronRight,
    Home,
} from "lucide-react";
import Link from "next/link";
import ProfileModule from "@/components/admin/ProfileModule";
import ProjectsModule from "@/components/admin/ProjectsModule";
import TimelineModule from "@/components/admin/TimelineModule";
import MessagesModule from "@/components/admin/MessagesModule";

type Tab = "overview" | "profile" | "projects" | "timeline" | "messages";

export default function AdminDashboard() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>("overview");

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
        { id: "overview", title: "Dashboard", icon: Home, color: "bg-blue-500" },
        { id: "profile", title: "Profile Info", icon: User, color: "bg-indigo-500" },
        { id: "projects", title: "Portfolio", icon: Layout, color: "bg-purple-500" },
        { id: "timeline", title: "Timeline", icon: Briefcase, color: "bg-amber-600" },
        { id: "messages", title: "Messages", icon: MessageSquare, color: "bg-emerald-500" },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case "profile": return <ProfileModule />;
            case "projects": return <ProjectsModule />;
            case "timeline": return <TimelineModule />;
            case "messages": return <MessagesModule />;
            default: return (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { label: "Site Visitors", value: "1,2k", icon: User, color: "text-blue-600", bg: "bg-blue-50" },
                            { label: "Live Projects", value: "12", icon: Layout, color: "text-purple-600", bg: "bg-purple-50" },
                            { label: "Unread Messages", value: "4", icon: MessageSquare, color: "text-amber-600", bg: "bg-amber-50" },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute -bottom-6 -right-6 text-gray-50 group-hover:text-gray-100 transition-colors">
                                    <stat.icon size={120} />
                                </div>
                                <p className="text-secondary text-xs font-black uppercase tracking-widest mb-2 relative z-10">{stat.label}</p>
                                <h3 className="text-4xl font-black text-gray-900 relative z-10">{stat.value}</h3>
                            </div>
                        ))}
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {menuItems.filter(i => i.id !== 'overview').map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as Tab)}
                                className="group flex items-center justify-between p-8 bg-white rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all hover:-translate-y-1 text-left"
                            >
                                <div className="flex items-center space-x-8">
                                    <div className={`${item.color} p-6 rounded-[2rem] text-white shadow-xl group-hover:scale-110 transition-transform`}>
                                        <item.icon size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 group-hover:text-primary transition-colors">{item.title}</h3>
                                        <p className="text-secondary font-medium mt-1">Manage your {item.title.toLowerCase()}</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl text-gray-300 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                    <ChevronRight size={24} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-80 bg-white border-r border-gray-100 hidden lg:flex flex-col fixed inset-y-0">
                <div className="p-10">
                    <Link href="/" className="text-2xl font-bold tracking-tight">
                        <span className="text-primary">Admin</span>
                        <span className="text-gray-900 font-black">Panel</span>
                    </Link>
                </div>

                <nav className="flex-1 px-6 space-y-2 mt-10">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as Tab)}
                            className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl font-black text-sm transition-all ${activeTab === item.id
                                    ? "bg-primary text-white shadow-xl shadow-primary/20"
                                    : "text-secondary hover:bg-gray-50 hover:text-primary"
                                }`}
                        >
                            <item.icon size={20} />
                            <span>{item.title}</span>
                        </button>
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

            {/* Main Content */}
            <main className="flex-1 lg:ml-80">
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 px-10 py-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-secondary">
                            {activeTab === 'overview' ? 'Command Center' : activeTab}
                        </h2>
                        <div className="flex items-center space-x-6">
                            <Link href="/" target="_blank" className="text-secondary hover:text-primary transition-colors">
                                <ExternalLink size={20} />
                            </Link>
                            <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center font-black text-primary">
                                {user.email?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-10 max-w-6xl mx-auto">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}
