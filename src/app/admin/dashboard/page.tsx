"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import {
    Layout,
    Layers,
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
    Video,
    Pin,
    Smartphone,
    Sparkles,
    Globe,
    Calendar,
    Terminal,
    Dumbbell,
    TreePine,
} from "lucide-react";
import Link from "next/link";
import ProfileModule from "@/components/admin/ProfileModule";
import TimelineModule from "@/components/admin/TimelineModule";
import MessagesModule from "@/components/admin/MessagesModule";
import OverviewModule from "@/components/admin/OverviewModule";
import TrainingAcademyModule from "@/components/admin/TrainingAcademyModule";
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
import SmileTaskModule from "@/components/admin/SmileTaskModule";
import SpamModule from "@/components/admin/SpamModule";
import ProjectsModule from "@/components/admin/ProjectsModule";
import SkillsModule from "@/components/admin/SkillsModule";
import PartnershipsModule from "@/components/admin/PartnershipsModule";
import YouTubeModule from "@/components/admin/YouTubeModule";
import AIAssistantModule from "@/components/admin/AIAssistantModule";
import AdminMeetingsModule from "@/components/admin/AdminMeetingsModule";
import TravelledModule from "@/components/admin/TravelledModule";
import FinanceLeadModule from "@/components/admin/FinanceLeadModule";
import SchedulerDocumentsModule from "@/components/admin/SchedulerDocumentsModule";
import PlatformHubModule from "@/components/admin/PlatformHubModule";
import WorkoutModule from "@/components/admin/WorkoutModule";
import TreeModule from "@/components/admin/TreeModule";

type Tab = "overview" | "profile" | "messages" | "training-academy" | "timeline" | "feedbacks" | "quiz-manager" | "finance-hub" | "leaderboard" | "forms" | "sessions" | "game-assets" | "client-projects" | "kanban" | "routines" | "smile-tasks" | "settings" | "spam" | "projects" | "skills" | "partnerships" | "youtube" | "ai-assistant" | "meetings" | "travelled" | "finance-leads" | "scheduler-docs" | "platform-hub" | "startup-admin" | "ddriver-sa" | "workout" | "tree";

export default function AdminDashboard() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("admin-active-tab") as Tab | null;
            // Portal tabs open full external iframes — don't auto-restore on refresh
            const portalTabs: Tab[] = ["startup-admin", "ddriver-sa"];
            if (saved && !portalTabs.includes(saved)) return saved;
            if (saved && portalTabs.includes(saved)) return "platform-hub";
        }
        return "overview";
    });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [pinnedItems, setPinnedItems] = useState<string[]>([]);

    // Sidebar Menu Configuration
    const menuItems = useMemo(() => [
        { id: "overview", title: "Command Center", icon: Home, color: "bg-blue-500", group: "Main" },
        { id: "platform-hub",  title: "Platform Hub",    icon: Globe,    color: "bg-purple-600", group: "Main" },
        { id: "startup-admin", title: "StartUP Admin",   icon: Layers,   color: "bg-blue-600",   group: "Main", subItem: true },
        { id: "ddriver-sa",    title: "D-Driver DEV SA", icon: Terminal, color: "bg-sky-600",    group: "Main", subItem: true },
        { id: "profile", title: "Profile Info", icon: User, color: "bg-indigo-500", group: "Personal" },
        { id: "workout", title: "Workout Tracker", icon: Dumbbell, color: "bg-green-600", group: "Personal" },
        { id: "tree", title: "Message Tree", icon: TreePine, color: "bg-emerald-700", group: "Content" },
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
        { id: "messages", title: "Messages", icon: MessageSquare, color: "bg-emerald-500", badge: unreadMessages, group: "Communication" },
        { id: "routines", title: "Routine Checklist", icon: CheckSquare, color: "bg-indigo-600", group: "Admin" },
        { id: "smile-tasks", title: "Smile Tasks", icon: Sparkles, color: "bg-rose-500", group: "Engagement" },
        { id: "spam", title: "Lucky Draw", icon: Trophy, color: "bg-yellow-600", group: "Campaigns" },
        { id: "settings", title: "Settings", icon: Settings, color: "bg-gray-600", group: "Admin" },
    ], [unreadMessages]);

    // Theme Management
    useEffect(() => {
        const savedTheme = localStorage.getItem("admin-theme") as any;
        if (savedTheme) {
            setTheme(savedTheme);
        } else {
            setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        }
        const pinned = localStorage.getItem("admin-pinned-items");
        if (pinned) setPinnedItems(JSON.parse(pinned));
    }, []);

    const togglePin = (id: string) => {
        setPinnedItems(prev => {
            const next = prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id];
            localStorage.setItem("admin-pinned-items", JSON.stringify(next));
            return next;
        });
    };

    useEffect(() => {
        const root = window.document.documentElement;
        const applyTheme = () => {
            const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
            if (isDark) {
                root.classList.add("dark");
                root.style.colorScheme = "dark";
            } else {
                root.classList.remove("dark");
                root.style.colorScheme = "light";
            }
            localStorage.setItem("admin-theme", theme);
        };
        applyTheme();
        if (theme === "system") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const listener = (e: MediaQueryListEvent) => {
                if (theme === "system") {
                    if (e.matches) root.classList.add("dark");
                    else root.classList.remove("dark");
                }
            };
            mediaQuery.addEventListener("change", listener);
            return () => mediaQuery.removeEventListener("change", listener);
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
                const idToken = user ? await user.getIdToken() : undefined;
                const res = await fetch("/api/admin/sessions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id: sid,
                        userEmail: user?.email || undefined,
                        idToken,
                        deviceName,
                        browser,
                        os
                    })
                });

                if (res.ok) {
                    const session = await res.json();
                    if (!sid || sid !== session.id) {
                        localStorage.setItem('admin_sessionId', session.id);
                    }
                } else if (res.status === 404) {
                    localStorage.removeItem('admin_sessionId');
                    setTimeout(trackSession, 1000);
                } else if (res.status === 401 && !localStorage.getItem("admin_deviceToken")) {
                    await logout();
                    router.push('/admin/login');
                }
            } catch (err) {
                console.error("[Dashboard] Network error during session tracking:", err);
            }
        };

        const checkSession = async () => {
            const sid = localStorage.getItem('admin_sessionId');
            if (!sid) return;
            try {
                const res = await fetch("/api/admin/sessions", {
                    headers: { "X-Session-Id": sid }
                });
                if (res.ok) {
                    const sessions = await res.json();
                    const exists = sessions.some((s: any) => s.id === sid);
                    if (!exists) {
                        await logout();
                        router.push('/admin/login');
                    }
                }
            } catch (err) {
                console.error("[Dashboard] Network error during session check:", err);
            }
        };

        trackSession();
        const interval = setInterval(checkSession, 30000);
        return () => clearInterval(interval);
    }, [user, loading, logout, router]);

    // Register Service Worker for PWA push notifications
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(err => {
                console.warn('[PWA] Service Worker registration failed:', err);
            });
        }
    }, []);

    // Sync tab with URL hash and fetch notifications
    useEffect(() => {
        const hash = window.location.hash.replace('#', '') as Tab;
        const validTabs = ["overview", "profile", "messages", "training-academy", "timeline", "feedbacks", "quiz-manager", "finance-hub", "leaderboard", "forms", "sessions", "game-assets", "client-projects", "kanban", "routines", "smile-tasks", "settings", "spam", "projects", "skills", "partnerships", "youtube", "ai-assistant", "meetings", "travelled", "finance-leads", "scheduler-docs", "workout", "tree"];
        if (hash && validTabs.includes(hash)) setActiveTab(hash);

        const fetchAllCounts = async () => {
            try {
                const sid = localStorage.getItem('admin_sessionId') || "";
                const [notifRes, msgRes] = await Promise.all([
                    fetch("/api/admin/notifications", { headers: { "X-Session-Id": sid } }),
                    fetch("/api/admin/messages", { headers: { "X-Session-Id": sid } })
                ]);
                if (notifRes.ok) {
                    const data = await notifRes.json();
                    setUnreadCount(data.totalNew || 0);
                    setNotifications(data.items || []);
                }
                if (msgRes.ok) {
                    const msgs = await msgRes.json();
                    const unread = Array.isArray(msgs) ? msgs.filter((m: any) => m.status === "New").length : 0;
                    setUnreadMessages(unread);
                }
            } catch (err) { console.error("Failed to fetch notification counts", err); }
        };

        fetchAllCounts();
        const interval = setInterval(fetchAllCounts, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab);
        localStorage.setItem("admin-active-tab", tab);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#f8f9fa] dark:bg-[#121212]">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    const hasDBSession = typeof window !== 'undefined' ? !!localStorage.getItem('admin_sessionId') : false;

    if (!user && !hasDBSession) {
        router.push('/admin/login');
        return null;
    }

    const handleMarkAllSeen = async () => {
        try {
            const sid = localStorage.getItem('admin_sessionId') || "";
            await fetch("/api/admin/notifications", { method: "PATCH", headers: { "X-Session-Id": sid } });
            setUnreadCount(0);
            setNotifications([]);
            setIsNotificationsOpen(false);
        } catch (err) { console.error("Failed to mark notifications as seen", err); }
    };

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
            case "smile-tasks": return <SmileTaskModule />;
            case "spam": return <SpamModule />;
            case "settings": return <SettingsModule />;
            case "projects": return <ProjectsModule />;
            case "skills": return <SkillsModule />;
            case "partnerships": return <PartnershipsModule />;
            case "youtube": return <YouTubeModule />;
            case "ai-assistant": return <AIAssistantModule />;
            case "meetings": return <AdminMeetingsModule />;
            case "travelled": return <TravelledModule />;
            case "finance-leads": return <FinanceLeadModule />;
            case "scheduler-docs": return <SchedulerDocumentsModule />;
            case "platform-hub":  return <PlatformHubModule key="platform-hub" />;
            case "startup-admin": return <PlatformHubModule key="startup-admin" initialPortal="StartUP Admin" />;
            case "ddriver-sa":    return <PlatformHubModule key="ddriver-sa" initialPortal="D-Driver DEV SA" />;
            case "workout": return <WorkoutModule />;
            case "tree": return <TreeModule />;
            default: return (
                <div className="space-y-8 animate-in fade-in duration-700">
                    <OverviewModule onTabChange={handleTabChange} />
                </div>
            );
        }
    };

    return (
        <div className="flex h-[100dvh] bg-[#f8f9fa] dark:bg-[#121212] overflow-hidden selection:bg-primary/10 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-[260px] bg-white dark:bg-[#1e1e1e] border-r border-gray-200 dark:border-gray-800 hidden lg:flex flex-col fixed inset-y-0 z-50 transition-colors duration-300 shadow-sm" aria-label="Admin sidebar">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <Link href="/" className="group flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-all text-white">
                            <Layout size={18} strokeWidth={2.5} />
                        </div>
                        <span className="text-lg font-bold tracking-tight">Hariharanhub</span>
                    </Link>
                </div>

                <nav className="flex-1 px-3 mt-4 overflow-y-auto pb-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
                    {(() => {
                        const nonDivider = menuItems.filter(item => item.id !== "divider");
                        const pinned = nonDivider.filter(item => pinnedItems.includes(item.id));
                        const unpinned = nonDivider.filter(item => !pinnedItems.includes(item.id));

                        const renderItem = (item: typeof nonDivider[0]) => {
                            const isPinned = pinnedItems.includes(item.id);
                            const isActive = activeTab === item.id;

                            // Sub-item (indented portal shortcut under Platform Hub)
                            if ((item as any).subItem) {
                                return (
                                    <div key={item.id} className="pl-4">
                                        <div className="relative ml-3 border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                                            <button
                                                onClick={() => handleTabChange(item.id as Tab)}
                                                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${isActive
                                                    ? "bg-primary/10 text-primary dark:bg-primary/20"
                                                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-primary dark:hover:text-primary"
                                                    }`}
                                            >
                                                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${item.color} text-white`}>
                                                    <item.icon size={11} />
                                                </div>
                                                <span className="flex-1 text-left leading-tight">{item.title}</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={item.id} className="relative group/row">
                                    <button
                                        onClick={() => handleTabChange(item.id as Tab)}
                                        className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg font-bold text-sm transition-all group pr-10 ${isActive
                                            ? "bg-primary/10 text-primary dark:bg-primary/20 shadow-sm"
                                            : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-primary dark:hover:text-primary"
                                            }`}
                                    >
                                        <item.icon size={17} className={`shrink-0 ${isActive ? "text-primary" : "text-gray-400 dark:text-gray-500 group-hover:text-primary"} transition-colors`} />
                                        <span className="flex-1 text-left">{item.title}</span>
                                        {item.badge && item.badge > 0 && (
                                            <span className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">
                                                {item.badge}
                                            </span>
                                        )}
                                    </button>
                                    {/* Pin Button — visible on hover */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); togglePin(item.id); }}
                                        title={isPinned ? "Unpin" : "Pin to top"}
                                        className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-all ${isPinned
                                            ? "opacity-100 text-primary"
                                            : "opacity-0 group-hover/row:opacity-100 text-gray-400 hover:text-primary"
                                            }`}
                                    >
                                        <Pin size={12} className={isPinned ? "fill-primary" : ""} />
                                    </button>
                                </div>
                            );
                        };

                        return (
                            <>
                                {pinned.length > 0 && (
                                    <>
                                        <div className="px-2 pb-1 pt-2">
                                            <span className="text-[9px] font-black text-primary uppercase tracking-[0.15em] flex items-center gap-1.5">
                                                <Pin size={8} className="fill-primary" /> Pinned
                                            </span>
                                        </div>
                                        <div className="space-y-0.5 mb-1">
                                            {pinned.map(renderItem)}
                                        </div>
                                        <div className="mx-2 mb-3 border-t border-gray-100 dark:border-gray-800" />
                                    </>
                                )}
                                <div className="space-y-0.5">
                                    {unpinned.map(renderItem)}
                                </div>
                            </>
                        );
                    })()}
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
            <main className="flex-1 lg:ml-[260px] w-full overflow-x-clip overflow-y-auto min-h-screen relative flex flex-col">
                <header className="bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 h-14 md:h-20 lg:h-28 transition-colors duration-300">
                    <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 h-full flex justify-between items-center gap-2">
                        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg shrink-0">
                                <Menu size={20} />
                            </button>

                            {/* Global Search Container */}
                            <div className="relative max-w-md w-full hidden md:block">
                                <div className="flex items-center gap-3 bg-gray-100/80 dark:bg-white/5 px-5 py-3 rounded-2xl border border-gray-200 dark:border-gray-800 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                                    <Search size={16} className="text-gray-500 dark:text-gray-400 font-bold" />
                                    <input
                                        type="text"
                                        placeholder="Search features (e.g. Finance, Forms...)"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-transparent border-none outline-none text-sm font-bold text-gray-900 dark:text-gray-100 placeholder:text-gray-400 w-full"
                                    />
                                </div>
                                {searchQuery && (
                                    <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-[#252525] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Search Results</span>
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto p-2">
                                            {filteredMenuItems.length > 0 ? (
                                                filteredMenuItems.map(item => (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => handleTabChange(item.id as Tab)}
                                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl text-left group"
                                                    >
                                                        <div className={`p-2 rounded-lg ${item.color} bg-opacity-10 text-primary dark:text-white`}>
                                                            <item.icon size={18} />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-extrabold text-gray-900 dark:text-gray-100">{item.title}</div>
                                                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{item.group}</div>
                                                        </div>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm italic">No features found for "{searchQuery}"</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 md:gap-4 shrink-0">
                            {/* Theme Switcher — compact on mobile */}
                            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 md:p-1.5 border border-gray-200 dark:border-gray-700 items-center">
                                <button
                                    onClick={() => setTheme("light")}
                                    title="Light Mode"
                                    className={`p-1.5 md:p-2 rounded-lg transition-all ${theme === "light" ? "bg-white dark:bg-gray-600 shadow-md text-primary" : "text-gray-400 hover:text-gray-600"}`}
                                >
                                    <Sun size={14} strokeWidth={2.5} />
                                </button>
                                <button
                                    onClick={() => setTheme("dark")}
                                    title="Dark Mode"
                                    className={`p-1.5 md:p-2 rounded-lg transition-all ${theme === "dark" ? "bg-white dark:bg-gray-600 shadow-md text-primary" : "text-gray-400 hover:text-gray-600"}`}
                                >
                                    <Moon size={14} strokeWidth={2.5} />
                                </button>
                                <button
                                    onClick={() => setTheme("system")}
                                    title="System Mode"
                                    className={`hidden sm:block p-1.5 md:p-2 rounded-lg transition-all ${theme === "system" ? "bg-white dark:bg-gray-600 shadow-md text-primary" : "text-gray-400 hover:text-gray-600"}`}
                                >
                                    <Monitor size={14} strokeWidth={2.5} />
                                </button>
                            </div>

                            {/* Notifications Center */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                    className={`p-2 md:p-2.5 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all relative group ${unreadCount > 0 ? 'bg-primary/5 border-primary/20' : ''}`}
                                >
                                    <ShieldAlert size={18} className={unreadCount > 0 ? 'text-primary' : 'text-gray-500 dark:text-gray-400 group-hover:text-primary'} />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-4 w-4 bg-primary text-[9px] font-black text-white items-center justify-center">
                                                {unreadCount}
                                            </span>
                                        </span>
                                    )}
                                </button>

                                {isNotificationsOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                                        <div className="absolute top-full right-0 mt-3 w-[calc(100vw-1.5rem)] max-w-[380px] sm:w-[380px] bg-white dark:bg-[#252525] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                                                <span className="font-black text-xs uppercase tracking-widest text-gray-900 dark:text-white">Recent Enquiries</span>
                                                <span className="text-[10px] font-black bg-primary text-white px-2.5 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-primary/20">{unreadCount} Pending</span>
                                            </div>
                                            <div className="max-h-[350px] overflow-y-auto p-2">
                                                {notifications.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {notifications.map((item, idx) => (
                                                            <button key={idx} onClick={() => { if (item.actionTab) handleTabChange(item.actionTab); setIsNotificationsOpen(false); setIsMobileMenuOpen(false); }} className="w-full p-4 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl text-left flex gap-4 items-start group transition-all">
                                                                <div className={`p-2.5 ${item.bg} ${item.color} rounded-xl group-hover:scale-110 transition-transform`}>
                                                                    {item.icon === "MessageSquare" && <MessageSquare size={18} />}
                                                                    {item.icon === "HeartHandshake" && <HeartHandshake size={18} />}
                                                                    {item.icon === "FileText" && <FileText size={18} />}
                                                                </div>
                                                                <div className="flex-1 w-full overflow-hidden">
                                                                    <div className="text-sm font-black text-gray-900 dark:text-gray-100 flex justify-between items-center gap-2">
                                                                        <span className="truncate">{item.title}</span>
                                                                        <span className="text-[9px] text-gray-400 font-bold tracking-widest uppercase shrink-0 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                                                                            {new Date(item.date).toLocaleDateString()}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 pr-4">{item.message}</div>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="py-12 px-6 text-center text-gray-400 text-sm italic font-medium uppercase tracking-widest flex flex-col items-center gap-3">
                                                        <ShieldAlert size={32} className="opacity-20" />
                                                        Everything is up to date
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-gray-800">
                                                <button onClick={handleMarkAllSeen} className="w-full py-2.5 text-[10px] font-black text-gray-400 dark:text-gray-500 hover:text-primary transition-colors text-center uppercase tracking-widest">Mark everything as seen</button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-3 border-l border-gray-200 dark:border-gray-800">
                                <div className="text-right hidden md:block">
                                    <div className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-none mb-1 max-w-[100px] truncate">{user?.email?.split('@')[0] || 'Admin'}</div>
                                    <div className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider leading-none">Admin</div>
                                </div>
                                <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-indigo-600 shadow-lg shadow-indigo-600/20 flex items-center justify-center font-bold text-white text-sm border-2 border-white dark:border-gray-800 shrink-0">
                                    {user?.email?.charAt(0).toUpperCase() || <Smartphone size={16} />}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="px-3 sm:px-6 md:px-8 py-4 md:py-8 lg:py-10 max-w-7xl mx-auto w-full flex-1">
                    {/* Header Breadcrumb */}
                    <div className="mb-5 md:mb-8 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <h1 className="text-lg md:text-2xl font-black text-gray-900 dark:text-white tracking-tight capitalize truncate">
                                {activeTab.replace(/-/g, ' ')}
                            </h1>
                            <div className="flex items-center gap-2 mt-1 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none">
                                <span className="hidden sm:inline">Platform</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700 hidden sm:block" />
                                <span className="text-primary italic truncate">/ {activeTab.replace(/-/g, ' ')}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <button onClick={() => window.open('/', '_blank')} className="px-3 md:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2">
                                <ExternalLink size={14} /> <span className="hidden sm:inline">Visit</span> Site
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
                    <aside className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] bg-white dark:bg-[#1e1e1e] shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
                        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 text-white">
                                    <Layout size={16} strokeWidth={2.5} />
                                </div>
                                <span className="text-base font-bold tracking-tight">Hariharanhub</span>
                            </div>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>
                        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto pb-4">
                            {menuItems.map((item) => (
                                item.id !== "divider" && (
                                    <button
                                        key={item.id}
                                        onClick={() => handleTabChange(item.id as Tab)}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === item.id
                                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-primary dark:hover:text-primary"
                                            }`}
                                    >
                                        <item.icon size={18} className="shrink-0" />
                                        <span className="truncate">{item.title}</span>
                                        {item.badge && item.badge > 0 && (
                                            <span className="ml-auto bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">
                                                {item.badge}
                                            </span>
                                        )}
                                    </button>
                                )
                            ))}
                        </nav>
                        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                            <button
                                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                            >
                                <LogOut size={18} className="shrink-0" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
}
