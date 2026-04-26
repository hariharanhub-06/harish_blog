"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import {
    Layout,
    MessageSquare,
    LogOut,
    ExternalLink,
    Loader2,
    Home,
    X,
    Menu,
    GraduationCap,
    HeartHandshake,
    Gamepad2,
    Wallet,
    Trophy,
    FileText,
    ShieldAlert,
    Search,
    Sun,
    Moon,
    Monitor,
    Briefcase,
    CheckSquare,
    Settings,
    User,
    Video
} from "lucide-react";
import Link from "next/link";
import ProfileModule from "@/components/admin/ProfileModule";
import TimelineModule from "@/components/admin/TimelineModule";
import MessagesModule from "@/components/admin/MessagesModule";
import OverviewModule from "@/components/admin/OverviewModule";
import TrainingAcademyModule from "@/components/admin/TrainingAcademyModule";
import YouTubeModule from "@/components/admin/YouTubeModule";
import QuizModule from "@/components/admin/QuizModule";
import FeedbackModule from "@/components/admin/FeedbackModule";
import FinanceModule from "@/components/admin/FinanceModule";
import LeaderboardModule from "@/components/admin/LeaderboardModule";
import FormsModule from "@/components/admin/FormsModule";
import LiveSessionsModule from "@/components/admin/LiveSessionsModule";
import GameAssetsModule from "@/components/admin/GameAssetsModule";
import ClientProjectsModule from "@/components/admin/ClientProjectsModule";
import SettingsModule from "@/components/admin/SettingsModule";
import KanbanModule from "@/components/admin/KanbanModule";
import RoutinesModule from "@/components/admin/RoutinesModule";

type Tab = "overview" | "profile" | "messages" | "training-academy" | "timeline" | "feedbacks" | "quiz-manager" | "finance-hub" | "leaderboard" | "forms" | "sessions" | "game-assets" | "client-projects" | "kanban" | "routines" | "settings";

export default function AdminDashboard() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>("overview");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    // Sidebar Menu Configuration
    const menuItems = useMemo(() => [
        { id: "overview", title: "Command Center", icon: Home, color: "bg-blue-500", group: "Main" },
        { id: "profile", title: "Profile Info", icon: User, color: "bg-indigo-500", group: "Personal" },
        { id: "training-academy", title: "Training Academy", icon: GraduationCap, color: "bg-orange-500", group: "Learning" },
        { id: "timeline", title: "Timeline / Experience", icon: Briefcase, color: "bg-purple-500", group: "Professional" },
        { id: "feedbacks", title: "Testimonials", icon: HeartHandshake, color: "bg-pink-500", group: "Communication" },
        { id: "quiz-manager", title: "Quiz Manager", icon: Gamepad2, color: "bg-cyan-500", group: "Engagement" },
        { id: "finance-hub", title: "Finance Hub", icon: Wallet, color: "bg-amber-500", group: "Business" },
        { id: "leaderboard", title: "Leaderboard", icon: Trophy, color: "bg-yellow-500", group: "Engagement" },
        { id: "forms", title: "Forms Manager", icon: FileText, color: "bg-blue-600", group: "Data" },
        { id: "sessions", title: "Live Sessions", icon: Video, color: "bg-red-500", group: "Learning" },
        { id: "game-assets", title: "Game Content", icon: Gamepad2, color: "bg-violet-500", group: "Deployment" },
        { id: "divider", title: "Business Operations", icon: Briefcase, color: "bg-gray-400", group: "Admin" },
        { id: "kanban", title: "Kanban Board", icon: Layout, color: "bg-teal-500", group: "Project" },
        { id: "client-projects", title: "Client Projects", icon: Briefcase, color: "bg-blue-700", group: "Professional" },
        { id: "messages", title: "Messages", icon: MessageSquare, color: "bg-emerald-500", badge: unreadCount, group: "Communication" },
        { id: "routines", title: "Routine Checklist", icon: CheckSquare, color: "bg-indigo-600", group: "Admin" },
        { id: "settings", title: "Settings", icon: Settings, color: "bg-gray-600", group: "Admin" },
    ], [unreadCount]);

    // Theme Management
    useEffect(() => {
        const root = window.document.documentElement;
        const applyTheme = () => {
            if (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
                root.classList.add("dark");
            } else {
                root.classList.remove("dark");
            }
        };
        applyTheme();
        if (theme === "system") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            mediaQuery.addEventListener("change", applyTheme);
            return () => mediaQuery.removeEventListener("change", applyTheme);
        }
    }, [theme]);

    // Session Tracking
    useEffect(() => {
        if (!user || loading) return;

        const trackSession = async () => {
            const sid = localStorage.getItem('admin_sessionId');
            const ua = window.navigator.userAgent;
            const browser = ua.includes("Chrome") ? "Chrome" : ua.includes("Firefox") ? "Firefox" : ua.includes("Safari") ? "Safari" : "Unknown Browser";
            const os = ua.includes("Windows") ? "Windows" : ua.includes("Mac") ? "MacOS" : ua.includes("Linux") ? "Linux" : ua.includes("Android") ? "Android" : ua.includes("iPhone") ? "iOS" : "Unknown OS";
            const deviceName = os === "Windows" || os === "MacOS" || os === "Linux" ? "Desktop" : "Mobile Device";

            try {
                const res = await fetch("/api/admin/sessions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: sid, userEmail: user.email, deviceName, browser, os })
                });

                if (res.ok) {
                    const session = await res.json();
                    if (!sid || sid !== session.id) {
                        localStorage.setItem('admin_sessionId', session.id);
                    }
                } else if (res.status === 404) {
                    localStorage.removeItem('admin_sessionId');
                    setTimeout(trackSession, 1000);
                } else if (res.status === 401) {
                    logout();
                }
            } catch (err) {
                console.error("[Dashboard] Network error during session tracking:", err);
            }
        };

        const checkSession = async () => {
            const sid = localStorage.getItem('admin_sessionId');
            if (!sid) return;
            try {
                const res = await fetch("/api/admin/sessions");
                if (res.ok) {
                    const sessions = await res.json();
                    const exists = sessions.some((s: any) => s.id === sid);
                    if (!exists) logout();
                }
            } catch (err) {
                console.error("[Dashboard] Network error during session check:", err);
            }
        };

        trackSession();
        const interval = setInterval(checkSession, 30000);
        return () => clearInterval(interval);
    }, [user, loading, logout]);

    // Sync tab with URL hash and fetch notifications
    useEffect(() => {
        const hash = window.location.hash.replace('#', '') as Tab;
        const validTabs = ["overview", "profile", "messages", "training-academy", "timeline", "feedbacks", "quiz-manager", "finance-hub", "leaderboard", "forms", "sessions", "game-assets", "client-projects", "kanban", "routines", "settings"];
        if (hash && validTabs.includes(hash)) setActiveTab(hash);

        const fetchAllCounts = async () => {
            try {
                const res = await fetch("/api/admin/notifications");
                if (res.ok) {
                    const data = await res.json();
                    setUnreadCount((data.unreadMessages || 0) + (data.pendingFeedbacks || 0));
                }
            } catch (err) { console.error("Failed to fetch notification counts", err); }
        };

        fetchAllCounts();
        const interval = setInterval(fetchAllCounts, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab);
        window.location.hash = tab;
        setIsMobileMenuOpen(false);
        setSearchQuery("");
    };

    const filteredMenuItems = useMemo(() =>
        menuItems.filter(item =>
            item.id !== "divider" &&
            (item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.group.toLowerCase().includes(searchQuery.toLowerCase()))
        ), [menuItems, searchQuery]);

    if (loading || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#f8f9fa] dark:bg-[#121212]">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    const renderContent = () => {
        switch (activeTab) {
            case "profile": return <ProfileModule />;
            case "messages": return <MessagesModule />;
            case "training-academy": return <TrainingAcademyModule />;
            case "timeline": return <TimelineModule />;
            case "feedbacks": return <FeedbackModule />;
            case "quiz-manager": return <QuizModule />;
            case "finance-hub": return <FinanceModule />;
            case "leaderboard": return <LeaderboardModule />;
            case "forms": return <FormsModule />;
            case "sessions": return <LiveSessionsModule />;
            case "game-assets": return <GameAssetsModule />;
            case "client-projects": return <ClientProjectsModule />;
            case "kanban": return <KanbanModule />;
            case "routines": return <RoutinesModule />;
            case "settings": return <SettingsModule />;
            default: return (
                <div className="space-y-8 animate-in fade-in duration-700">
                    <OverviewModule />
                </div>
            );
        }
    };

    return (
        <div className="flex h-[100dvh] bg-[#f8f9fa] dark:bg-[#121212] overflow-hidden selection:bg-primary/10 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-[260px] bg-white dark:bg-[#1e1e1e] border-r border-gray-200 dark:border-gray-800 hidden lg:flex flex-col fixed inset-y-0 z-50 transition-colors duration-300 shadow-sm">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <Link href="/" className="group flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-all text-white">
                            <Layout size={18} strokeWidth={2.5} />
                        </div>
                        <span className="text-lg font-bold tracking-tight">Hariharanhub</span>
                    </Link>
                </div>

                <nav className="flex-1 px-3 space-y-1 mt-4 overflow-y-auto pb-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
                    {menuItems.reduce((acc: any[], item, idx) => {
                        const prevItem = menuItems[idx - 1];
                        if (item.group !== prevItem?.group) {
                            acc.push(
                                <div key={`header-${item.group}`} className="px-4 pt-4 pb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{item.group}</span>
                                </div>
                            );
                        }
                        if (item.id !== "divider") {
                            acc.push(
                                <button
                                    key={item.id}
                                    onClick={() => handleTabChange(item.id as Tab)}
                                    className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all group ${activeTab === item.id
                                        ? "bg-primary/10 text-primary dark:bg-primary/20 shadow-sm shadow-primary/5"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-primary dark:hover:text-primary"
                                        }`}
                                >
                                    <item.icon size={18} className={`${activeTab === item.id ? "text-primary" : "text-gray-400 dark:text-gray-500 group-hover:text-primary"}`} />
                                    <span className="flex-1 text-left">{item.title}</span>
                                    {item.badge && item.badge > 0 && (
                                        <span className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        }
                        return acc;
                    }, [])}
                </nav>

                <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={() => logout()}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg font-bold text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all group"
                    >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-[260px] w-full overflow-x-hidden min-h-screen relative flex flex-col">
                <header className="bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 h-16 transition-colors duration-300">
                    <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
                        <div className="flex items-center gap-4 flex-1">
                            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                                <Menu size={20} />
                            </button>

                            {/* Global Search Container */}
                            <div className="relative max-w-md w-full hidden md:block">
                                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-800 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                                    <Search size={16} className="text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search features..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-transparent border-none outline-none text-sm font-medium text-gray-900 dark:text-gray-100 placeholder:text-gray-400 w-full"
                                    />
                                    {searchQuery && (
                                        <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                {/* Search Results Dropdown */}
                                {searchQuery && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#252525] border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl z-50 max-h-[400px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="p-2">
                                            {filteredMenuItems.length > 0 ? (
                                                filteredMenuItems.map(item => (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => handleTabChange(item.id as Tab)}
                                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg text-left group"
                                                    >
                                                        <div className={`p-2 rounded-lg ${item.color} bg-opacity-10 text-primary`}>
                                                            <item.icon size={18} />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{item.title}</div>
                                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.group}</div>
                                                        </div>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">No results found for "{searchQuery}"</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Theme Switcher */}
                            <div className="flex bg-gray-50 dark:bg-gray-800 rounded-lg p-1 border border-gray-100 dark:border-gray-800">
                                <button
                                    onClick={() => setTheme("light")}
                                    title="Light Mode"
                                    className={`p-1.5 rounded-md transition-all ${theme === "light" ? "bg-white dark:bg-gray-700 shadow-sm text-primary" : "text-gray-400 hover:text-gray-600"}`}
                                >
                                    <Sun size={15} />
                                </button>
                                <button
                                    onClick={() => setTheme("dark")}
                                    title="Dark Mode"
                                    className={`p-1.5 rounded-md transition-all ${theme === "dark" ? "bg-white dark:bg-gray-700 shadow-sm text-primary" : "text-gray-400 hover:text-gray-600"}`}
                                >
                                    <Moon size={15} />
                                </button>
                                <button
                                    onClick={() => setTheme("system")}
                                    title="System Mode"
                                    className={`p-1.5 rounded-md transition-all ${theme === "system" ? "bg-white dark:bg-gray-700 shadow-sm text-primary" : "text-gray-400 hover:text-gray-600"}`}
                                >
                                    <Monitor size={15} />
                                </button>
                            </div>

                            {/* Notifications Center */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                    className="p-2 border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all relative group"
                                >
                                    <ShieldAlert size={20} className="text-gray-500 dark:text-gray-400 group-hover:text-primary" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white dark:border-[#1e1e1e]" />
                                    )}
                                </button>

                                {isNotificationsOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                                        <div className="absolute top-full right-0 mt-3 w-80 bg-white dark:bg-[#252525] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                                                <span className="font-bold text-sm">Notifications</span>
                                                <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full">{unreadCount} New</span>
                                            </div>
                                            <div className="max-h-[350px] overflow-y-auto p-2">
                                                {unreadCount > 0 ? (
                                                    <div className="space-y-1">
                                                        <button onClick={() => { handleTabChange("messages"); setIsNotificationsOpen(false); }} className="w-full p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl text-left flex gap-3 items-start group">
                                                            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><MessageSquare size={16} /></div>
                                                            <div>
                                                                <div className="text-sm font-bold">New Messages</div>
                                                                <div className="text-[11px] text-gray-500">You have unread client messages</div>
                                                            </div>
                                                        </button>
                                                        <button onClick={() => { handleTabChange("feedbacks"); setIsNotificationsOpen(false); }} className="w-full p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl text-left flex gap-3 items-start group">
                                                            <div className="p-2 bg-pink-500/10 text-pink-500 rounded-lg"><HeartHandshake size={16} /></div>
                                                            <div>
                                                                <div className="text-sm font-bold">Pending Feedbacks</div>
                                                                <div className="text-[11px] text-gray-500">New student testimonials to review</div>
                                                            </div>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="p-8 text-center text-gray-400 text-sm">No new notifications</div>
                                                )}
                                            </div>
                                            <div className="p-3 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-gray-800">
                                                <button className="w-full py-2 text-[11px] font-black text-gray-500 hover:text-primary transition-colors text-center uppercase tracking-widest">Mark all as read</button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-800">
                                <div className="text-right hidden sm:block">
                                    <div className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-none mb-1">{user.email?.split('@')[0]}</div>
                                    <div className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider leading-none">Admin</div>
                                </div>
                                <div className="w-9 h-9 rounded-lg bg-indigo-600 shadow-lg shadow-indigo-600/20 flex items-center justify-center font-bold text-white text-sm border-2 border-white dark:border-gray-800">
                                    {user.email?.charAt(0).toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex-1">
                    {/* Header Breadcrumb */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight capitalize">
                                {activeTab.replace('-', ' ')}
                            </h1>
                            <div className="flex items-center gap-2 mt-1 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none">
                                <span>Platform</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                                <span className="text-primary italic">/ {activeTab.replace('-', ' ')}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2">
                                <ExternalLink size={14} /> Visit Website
                            </button>
                        </div>
                    </div>

                    {renderContent()}
                </div>
            </main>

            {/* Mobile Menu Drawer */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[100] lg:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                    <aside className="absolute inset-y-0 left-0 w-72 bg-white dark:bg-[#1e1e1e] shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <Link href="/" className="text-xl font-bold tracking-tight">Admin Manager</Link>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>
                        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                            {menuItems.map((item) => (
                                item.id !== "divider" && (
                                    <button
                                        key={item.id}
                                        onClick={() => handleTabChange(item.id as Tab)}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === item.id
                                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                                            : "text-gray-600 dark:text-gray-400"
                                            }`}
                                    >
                                        <item.icon size={18} />
                                        <span>{item.title}</span>
                                    </button>
                                )
                            ))}
                        </nav>
                    </aside>
                </div>
            )}
        </div>
    );
}
