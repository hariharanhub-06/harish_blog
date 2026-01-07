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
    X,
    Menu,
    Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import ProfileModule from "@/components/admin/ProfileModule";
import ProjectsModule from "@/components/admin/ProjectsModule";
import TimelineModule from "@/components/admin/TimelineModule";
import MessagesModule from "@/components/admin/MessagesModule";
import GalleryModule from "@/components/admin/GalleryModule";
import OverviewModule from "@/components/admin/OverviewModule";
import SnacksProductModule from "@/components/admin/SnacksProductModule";
import SnacksOrdersModule from "@/components/admin/SnacksOrdersModule";
import SnacksOverviewModule from "@/components/admin/SnacksOverviewModule";
import { ShoppingBag, Package, PieChart } from "lucide-react";

type Tab = "overview" | "profile" | "projects" | "timeline" | "messages" | "gallery" | "snacks-overview" | "snacks-products" | "snacks-orders";

export default function AdminDashboard() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>("overview");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Sync tab with URL hash for persistence on refresh
    useEffect(() => {
        const hash = window.location.hash.replace('#', '') as Tab;
        const validTabs = ["overview", "profile", "projects", "timeline", "messages", "gallery", "snacks-overview", "snacks-products", "snacks-orders"];
        if (hash && validTabs.includes(hash)) {
            setActiveTab(hash);
        }
    }, []);

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
        { id: "overview", title: "Dashboard", icon: Home, color: "bg-blue-500" },
        { id: "profile", title: "Profile Info", icon: User, color: "bg-indigo-500" },
        { id: "projects", title: "Portfolio", icon: Layout, color: "bg-purple-500" },
        { id: "gallery", title: "Gallery", icon: ImageIcon, color: "bg-pink-500" },
        { id: "timeline", title: "Timeline", icon: Briefcase, color: "bg-amber-600" },
        { id: "messages", title: "Messages", icon: MessageSquare, color: "bg-emerald-500" },
        { id: "divider", title: "BUSINESS SECTION", icon: null, color: "" },
        { id: "snacks-overview", title: "Snacks Overview", icon: PieChart, color: "bg-pink-600" },
        { id: "snacks-products", title: "Snack Inventory", icon: Package, color: "bg-pink-500" },
        { id: "snacks-orders", title: "Snack Orders", icon: ShoppingBag, color: "bg-pink-400" },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case "profile": return <ProfileModule />;
            case "projects": return <ProjectsModule />;
            case "timeline": return <TimelineModule />;
            case "messages": return <MessagesModule />;
            case "gallery": return <GalleryModule />;
            case "snacks-products": return <SnacksProductModule />;
            case "snacks-orders": return <SnacksOrdersModule />;
            case "snacks-overview": return <SnacksOverviewModule />;
            default: return <OverviewModule />;
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

                <nav className="flex-1 px-6 space-y-2 mt-10 overflow-y-auto pb-10">
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

            {/* Main Content */}
            <main className="flex-1 lg:ml-80 w-full overflow-x-hidden min-h-screen bg-gray-50/20">
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
                    <div className="max-w-7xl mx-auto px-6 md:px-10 py-6 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <Menu size={24} />
                            </button>
                            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-secondary">
                                {activeTab === 'overview' ? 'Command Center' : activeTab}
                            </h2>
                        </div>
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

                <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
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
