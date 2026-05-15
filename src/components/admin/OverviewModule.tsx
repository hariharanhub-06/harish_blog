"use client";

import { useEffect, useState } from "react";
import {
    User,
    MessageSquare,
    Globe,
    TrendingUp,
    Calendar,
    Phone,
    ArrowRight,
    Search,
    Eye,
    Zap,
    MessageCircle,
    ChevronRight,
    MousePointer2,
    Heart,
    Clock,
    Users
} from "lucide-react";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    LineChart,
    Line
} from "recharts";
import { format } from "date-fns";

const COLORS = {
    views: "#3b71ca",     // Dasher Blue
    visitors: "#10b981",  // Emerald
    inquiries: "#f59e0b", // Amber
    growth: "#ef4444"     // Red
};

function formatTime(seconds: number): string {
    if (!seconds || seconds < 5) return "—";
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    return `${mins} min${mins !== 1 ? "s" : ""}`;
}

export default function OverviewModule({ onTabChange }: { onTabChange?: (tab: any) => void }) {
    const [analytics, setAnalytics] = useState<any[]>([]);
    const [recentMessages, setRecentMessages] = useState<any[]>([]);
    const [visitorStats, setVisitorStats] = useState({ totalVisitors: 0, avgTimeSeconds: 0, today: 0 });
    const [heartStats, setHeartStats] = useState({ take: 0, break: 0, total: 0 });

    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    const [stats, setStats] = useState({
        totalViews: 0,
        totalVisitors: 0,
        unreadMessages: 0
    });

    const sessionId = typeof window !== "undefined" ? localStorage.getItem("admin_sessionId") || "" : "";

    useEffect(() => {
        fetchData();
    }, [dateRange]);

    const fetchData = async () => {
        try {
            const [analyticsRes, messagesRes, visitorRes, heartRes] = await Promise.all([
                fetch(`/api/analytics?start=${dateRange.start}&end=${dateRange.end}`),
                fetch("/api/admin/messages", { headers: { "X-Session-Id": sessionId } }),
                fetch("/api/admin/visitors", { headers: { "X-Session-Id": sessionId } }),
                fetch("/api/admin/heart", { headers: { "X-Session-Id": sessionId } }),
            ]);

            if (analyticsRes.ok) {
                const data = await analyticsRes.json();
                if (data && Array.isArray(data.stats)) {
                    const sortedStats = [...data.stats].reverse();
                    setAnalytics(sortedStats);
                    const views = sortedStats.reduce((acc: number, curr: any) => acc + (curr.views || 0), 0);
                    const visitors = sortedStats.reduce((acc: number, curr: any) => acc + (curr.visitors || 0), 0);
                    setStats(prev => ({ ...prev, totalViews: views, totalVisitors: visitors }));
                }
            }

            if (messagesRes.ok) {
                const data = await messagesRes.json();
                if (Array.isArray(data)) {
                    setRecentMessages(data.slice(0, 5));
                    setStats(prev => ({ ...prev, unreadMessages: data.filter((m: any) => m.status === 'New').length }));
                }
            }

            if (visitorRes.ok) {
                const data = await visitorRes.json();
                setVisitorStats({
                    totalVisitors: data.stats?.total || 0,
                    avgTimeSeconds: data.stats?.avgTimeSeconds || 0,
                    today: data.stats?.today || 0,
                });
            }

            if (heartRes.ok) {
                const data = await heartRes.json();
                setHeartStats({ take: data.take || 0, break: data.break || 0, total: data.total || 0 });
            }
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
        }
    };

    const SummaryCard = ({ title, value, icon: Icon, color, data, dataKey }: any) => (
        <div className={`bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group flex flex-col relative overflow-hidden`}>
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                    <div className={`p-3 rounded-xl ${color.split(' ')[0]} bg-opacity-10 text-primary dark:text-white dark:bg-opacity-20 transition-all`}>
                        <Icon size={22} strokeWidth={2.5} />
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-black bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg uppercase tracking-tight">
                        <TrendingUp size={10} strokeWidth={3} />
                        +12.5%
                    </div>
                </div>

                <div>
                    <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{title}</h3>
                    <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                        {(value || 0).toLocaleString()}
                    </p>
                </div>

                <div className="mt-8 flex items-end justify-between pt-4 border-t border-gray-50 dark:border-gray-800/50">
                    <div className="h-[40px] w-[100px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={(data || []).slice(-7)}>
                                <Line
                                    type="monotone"
                                    dataKey={dataKey}
                                    stroke="#3b71ca"
                                    strokeWidth={2.5}
                                    dot={false}
                                    animationDuration={1500}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="text-[10px] font-black text-primary dark:text-blue-400 uppercase tracking-widest hover:underline cursor-pointer">
                        Reports
                    </div>
                </div>
            </div>
            {/* Soft accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#3b71ca]/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-125 transition-transform duration-500" />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Colorful Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard
                    title="Total Page Views"
                    value={stats.totalViews}
                    icon={Eye}
                    color="bg-[#3b71ca] shadow-blue-500/10"
                    data={analytics}
                    dataKey="views"
                />
                <SummaryCard
                    title="Unique Visitors"
                    value={stats.totalVisitors}
                    icon={MousePointer2}
                    color="bg-emerald-500 shadow-emerald-500/10"
                    data={analytics}
                    dataKey="visitors"
                />
                <SummaryCard
                    title="Total Inquiries"
                    value={stats.unreadMessages}
                    icon={MessageCircle}
                    color="bg-amber-400 shadow-amber-400/10"
                    data={analytics}
                    dataKey="views" // Placeholder
                />
                <SummaryCard
                    title="Conversion Rate"
                    value={Math.floor(stats.totalVisitors * 0.1)}
                    icon={Zap}
                    color="bg-rose-500 shadow-rose-500/10"
                    data={analytics}
                    dataKey="visitors" // Placeholder
                />
            </div>

            {/* Visitor & Heart Reaction Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Total Site Visitors */}
                <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-500">
                            <Users size={20} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-lg">All Time</span>
                    </div>
                    <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-1">{visitorStats.totalVisitors.toLocaleString()}</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Unique Visitors</p>
                    <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800 flex justify-between text-[10px] font-bold text-gray-500">
                        <span>Today: <span className="text-sky-500 font-black">{visitorStats.today}</span></span>
                        <span>Avg time: <span className="text-sky-500 font-black">{formatTime(visitorStats.avgTimeSeconds)}</span></span>
                    </div>
                </div>

                {/* Avg Time on Site */}
                <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-500">
                            <Clock size={20} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-lg">Avg Session</span>
                    </div>
                    <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-1">{formatTime(visitorStats.avgTimeSeconds)}</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Average Time Spent</p>
                    <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800">
                        <p className="text-[10px] text-gray-500 font-bold">Across all {visitorStats.totalVisitors.toLocaleString()} visitors</p>
                    </div>
                </div>

                {/* Heart Reactions */}
                <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500">
                            <Heart size={20} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-lg">{heartStats.total} Votes</span>
                    </div>
                    <div className="flex items-end gap-4 mb-1">
                        <div>
                            <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">❤️ {heartStats.take}</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Took It</p>
                        </div>
                        <div className="pb-0.5 text-gray-300 dark:text-gray-700 font-black">vs</div>
                        <div>
                            <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">💔 {heartStats.break}</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Broke It</p>
                        </div>
                    </div>
                    {heartStats.total > 0 && (
                        <div className="mt-4 h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-700"
                                style={{ width: `${Math.round((heartStats.take / heartStats.total) * 100)}%` }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Main Charts & Table section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Growth Metrics */}
                <div className="lg:col-span-2 bg-white dark:bg-[#1e1e1e] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Growth Performance</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Activity metrics (last 30 days)</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#3b71ca]" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Views</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Visitors</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[360px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b71ca" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b71ca" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-gray-800/50" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                                    dy={15}
                                    tickFormatter={(v) => format(new Date(v), "MMM d")}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#fff', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                    itemStyle={{ fontSize: '11px', fontWeight: 900 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="views"
                                    stroke="#3b71ca"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorViews)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="visitors"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorVisitors)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Inquiries Section */}
                <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col transition-colors duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Recent Enquiries</h3>
                        <button
                            onClick={() => onTabChange?.('messages')}
                            className="text-[10px] font-black text-primary dark:text-blue-400 uppercase tracking-widest hover:translate-x-1 transition-transform cursor-pointer"
                        >View All</button>
                    </div>

                    <div className="space-y-6 flex-1">
                        {recentMessages.map((msg, idx) => (
                            <div key={msg.id} className="group flex items-center justify-between cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-white shadow-md ${['bg-indigo-500', 'bg-purple-500', 'bg-cyan-500', 'bg-pink-500', 'bg-amber-500'][idx % 5]
                                        }`}>
                                        {msg.name ? msg.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : '??'}
                                    </div>
                                    <div className="flex flex-col">
                                        <h4 className="text-[13px] font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors">{msg.name}</h4>
                                        <p className="text-[10px] font-bold text-gray-400 lowercase truncate max-w-[120px]">{msg.email}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-[9px] font-bold text-gray-400">{new Date(msg.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                                    <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${msg.status === 'New' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' :
                                        msg.status === 'Pending' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-500' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'
                                        }`}>
                                        {msg.status || 'New'}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {recentMessages.length === 0 && (
                            <div className="text-center py-20">
                                <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MessageSquare className="text-gray-300 dark:text-gray-600" size={20} />
                                </div>
                                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">No enquiries found</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => onTabChange?.('messages')}
                        className="mt-10 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50 flex items-center justify-between group hover:bg-primary hover:border-primary transition-all cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center shadow-sm">
                                <MessageCircle className="text-primary" size={18} />
                            </div>
                            <div className="text-left">
                                <h5 className="text-[11px] font-black text-gray-900 dark:text-white group-hover:text-white transition-colors uppercase tracking-wider">Inbox Center</h5>
                                <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 group-hover:text-white/60 transition-colors">{stats.unreadMessages} Unread threads</p>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-white transition-all group-hover:translate-x-1" />
                    </button>
                </div>
            </div>
        </div>
    );
}
