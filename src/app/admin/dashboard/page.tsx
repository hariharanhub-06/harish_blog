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
    Image as ImageIcon,
    Ticket,
    ShoppingBag,
    Package,
    PieChart,
    FileText,
    Star,
    ShoppingCart,
    Users,
    DollarSign,
    Building,
    Banknote
} from "lucide-react";
import Link from "next/link";
import ProfileModule from "@/components/admin/ProfileModule";
import ProjectsModule from "@/components/admin/ProjectsModule";
import TimelineModule from "@/components/admin/TimelineModule";
import MessagesModule from "@/components/admin/MessagesModule";
import OverviewModule from "@/components/admin/OverviewModule";
import SnacksProductModule from "@/components/admin/SnacksProductModule";
import SnacksOrdersModule from "@/components/admin/SnacksOrdersModule";
import SnacksOverviewModule from "@/components/admin/SnacksOverviewModule";
import CouponsModule from "@/components/admin/CouponsModule";
import BillingModule from "@/components/admin/BillingModule";
import ReviewsModule from "@/components/admin/ReviewsModule";
import AbandonedCartsModule from "@/components/admin/AbandonedCartsModule";
import AffiliatesModule from "@/components/admin/AffiliatesModule";
import AffiliatePayoutsModule from "@/components/admin/AffiliatePayoutsModule";
import VendorsModule from "@/components/admin/VendorsModule";
import VendorProductAssignmentModule from "@/components/admin/VendorProductAssignmentModule";
import VendorSettlementsModule from "@/components/admin/VendorSettlementsModule";
import PartnershipsModule from "@/components/admin/PartnershipsModule";
import { Handshake } from "lucide-react";



type Tab = "overview" | "profile" | "professional-journey" | "messages" | "snack-central" | "billing" | "partner-network" | "vendor-central" | "public-assets";

export default function AdminDashboard() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>("overview");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
    const [pendingReviewsCount, setPendingReviewsCount] = useState(0);

    // Sync tab with URL hash for persistence on refresh
    useEffect(() => {
        const hash = window.location.hash.replace('#', '') as Tab;
        const validTabs = ["overview", "profile", "professional-journey", "messages", "snack-central", "billing", "partner-network", "vendor-central", "public-assets"];
        if (hash && validTabs.includes(hash)) {
            setActiveTab(hash);
        }

        const fetchAllCounts = async () => {
            try {
                const res = await fetch("/api/admin/notifications");
                if (res.ok) {
                    const data = await res.json();
                    setUnreadCount(data.unreadMessages || 0);
                    setPendingOrdersCount(data.pendingOrders || 0);
                    setPendingReviewsCount(data.pendingReviews || 0);
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
        { id: "professional-journey", title: "Professional Journey", icon: Briefcase, color: "bg-amber-600" },
        { id: "messages", title: "Messages", icon: MessageSquare, color: "bg-emerald-500", badge: unreadCount },
        { id: "divider", title: "BUSINESS SECTION", icon: null, color: "" },
        { id: "snack-central", title: "Snack Central", icon: Package, color: "bg-pink-600", badge: pendingOrdersCount },
        { id: "billing", title: "Billing / Invoice", icon: FileText, color: "bg-orange-500" },
        { id: "partner-network", title: "Partner Network", icon: Users, color: "bg-orange-600" },
        { id: "vendor-central", title: "Vendor Central", icon: Building, color: "bg-teal-600" },
        { id: "public-assets", title: "Public Assets", icon: Handshake, color: "bg-blue-400", badge: pendingReviewsCount },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case "profile": return <ProfileModule />;
            case "professional-journey": return (
                <div className="space-y-16 animate-in fade-in duration-700">
                    <ProjectsModule />
                    <div className="pt-16 border-t border-gray-100">
                        <TimelineModule />
                    </div>
                </div>
            );
            case "messages": return <MessagesModule />;
            case "snack-central": return (
                <div className="space-y-16 animate-in fade-in duration-700">
                    <SnacksProductModule />
                    <div className="pt-16 border-t border-gray-100">
                        <SnacksOrdersModule />
                    </div>
                    <div className="pt-16 border-t border-gray-100">
                        <CouponsModule />
                    </div>
                </div>
            );
            case "billing": return <BillingModule />;
            case "partner-network": return (
                <div className="space-y-16 animate-in fade-in duration-700">
                    <AffiliatesModule />
                    <div className="pt-16 border-t border-gray-100">
                        <AffiliatePayoutsModule />
                    </div>
                </div>
            );
            case "vendor-central": return <VendorsModule />;
            case "public-assets": return (
                <div className="space-y-16 animate-in fade-in duration-700">
                    <ReviewsModule />
                    <div className="pt-16 border-t border-gray-100">
                        <PartnershipsModule />
                    </div>
                </div>
            );
            default: return (
                <div className="space-y-16 animate-in fade-in duration-700">
                    <OverviewModule />
                    <div className="pt-16 border-t border-gray-100">
                        <SnacksOverviewModule />
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-80 bg-white border-r border-gray-100 hidden lg:flex flex-col fixed inset-y-0 print:hidden">
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
                                <span className="flex-1 text-left">{item.title}</span>
                                {item.id === "messages" && unreadCount > 0 && (
                                    <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                                {item.id === "snacks-orders" && pendingOrdersCount > 0 && (
                                    <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                                        {pendingOrdersCount}
                                    </span>
                                )}
                                {item.id === "reviews" && pendingReviewsCount > 0 && (
                                    <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                                        {pendingReviewsCount}
                                    </span>
                                )}
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
            <main className="flex-1 lg:ml-80 w-full overflow-x-hidden min-h-screen bg-gray-50/20 print:ml-0">
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 print:hidden">
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
