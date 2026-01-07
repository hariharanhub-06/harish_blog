"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    User,
    Briefcase,
    Code,
    MessageSquare,
    LogOut,
    Settings,
    ChevronRight,
    TrendingUp,
    Layout,
    ExternalLink,
    Loader2,
    PieChart
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/admin/login");
        }
    }, [user, loading, router]);

    const menuItems = [
        { title: "Profile Info", desc: "Update your bio, photo, and title", icon: User, color: "bg-blue-500", href: "/admin/profile" },
        { title: "Portfolio", desc: "Manage your projects and case studies", icon: Layout, color: "bg-purple-500", href: "/admin/projects" },
        { title: "Career Timeline", desc: "Update your work and education", icon: Briefcase, color: "bg-amber-600", href: "/admin/timeline" },
        { title: "Technical Skills", desc: "proficiency and categories", icon: Code, color: "bg-emerald-500", href: "/admin/skills" },
        { title: "Messages", desc: "Review contact form submissions", icon: MessageSquare, color: "bg-indigo-500", href: "/admin/messages" },
    ];

    if (loading || !user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-12 max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-2 italic">
                        Admin <span className="text-primary not-italic">Dashboard</span>.
                    </h1>
                    <p className="text-secondary font-medium uppercase tracking-widest text-xs">Logged in as {user.email}</p>
                </div>
                <div className="flex space-x-4">
                    <Link href="/" target="_blank" className="flex items-center space-x-2 bg-white border border-gray-100 p-4 rounded-2xl shadow-sm hover:shadow-lg transition-all font-black text-sm">
                        <ExternalLink size={18} />
                        <span>View Site</span>
                    </Link>
                    <button
                        onClick={() => logout()}
                        className="flex items-center space-x-2 bg-red-50 text-red-500 p-4 rounded-2xl hover:bg-red-500 hover:text-white transition-all font-black text-sm"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                {[
                    { label: "Site Visitors", value: "1,2k", icon: TrendingUp, color: "text-blue-600" },
                    { label: "Live Projects", value: "12", icon: Briefcase, color: "text-purple-600" },
                    { label: "Unread Messages", value: "4", icon: MessageSquare, color: "text-amber-600" },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute -bottom-6 -right-6 text-gray-50 group-hover:text-gray-100 transition-colors">
                            <stat.icon size={120} />
                        </div>
                        <p className="text-secondary text-xs font-black uppercase tracking-widest mb-2 relative z-10">{stat.label}</p>
                        <h3 className="text-4xl font-black text-gray-900 relative z-10">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Management Modules */}
            <div className="grid md:grid-cols-2 gap-8">
                {menuItems.map((item) => (
                    <Link
                        key={item.title}
                        href={item.href}
                        className="group flex items-center justify-between p-8 bg-white rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all hover:-translate-y-1"
                    >
                        <div className="flex items-center space-x-8">
                            <div className={`${item.color} p-6 rounded-[2rem] text-white shadow-xl group-hover:scale-110 transition-transform`}>
                                <item.icon size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 group-hover:text-primary transition-colors">{item.title}</h3>
                                <p className="text-secondary font-medium mt-1">{item.desc}</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl text-gray-300 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                            <ChevronRight size={24} />
                        </div>
                    </Link>
                ))}
            </div>

            <div className="mt-20 p-12 bg-gray-50 rounded-[3rem] text-center">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Settings size={28} className="text-secondary animate-spin-slow" />
                </div>
                <h2 className="text-2xl font-black mb-4">Advanced Settings</h2>
                <p className="text-secondary max-w-md mx-auto mb-8 font-medium">Configure database connections, API keys, and deployment webhooks for your portfolio.</p>
                <button className="bg-white px-8 py-4 rounded-2xl font-black text-sm shadow-sm hover:shadow-lg transition-all border border-gray-100">Configure Environment</button>
            </div>
        </div>
    );
}
