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
    MousePointer2
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
    views: "#3b82f6",     // Blue
    visitors: "#06b6d4",  // Cyan
    inquiries: "#facc15", // Yellow
    growth: "#ef4444"     // Red
};

export default function OverviewModule() {
    const [analytics, setAnalytics] = useState<any[]>([]);
    const [recentMessages, setRecentMessages] = useState<any[]>([]);

    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    const [stats, setStats] = useState({
        totalViews: 0,
        totalVisitors: 0,
        unreadMessages: 0
    });

    useEffect(() => {
        fetchData();
    }, [dateRange]);

    const fetchData = async () => {
        try {
            const [analyticsRes, messagesRes] = await Promise.all([
                fetch(`/api/analytics?start=${dateRange.start}&end=${dateRange.end}`),
                fetch("/api/admin/messages")
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
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
        }
    };

    const SummaryCard = ({ title, value, icon: Icon, color, data, dataKey }: any) => (
        <div className={`${color} p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-500`}>
            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                        <Icon size={24} strokeWidth={2.5} />
                    </div>
                    <div className="text-right">
                        <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">{title}</p>
                        <h3 className="text-3xl font-black mt-1">{(value || 0).toLocaleString()}</h3>
                    </div>
                </div>

                <div className="mt-8 flex items-end justify-between gap-4">
                    <div className="h-[60px] w-full max-w-[120px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={(data || []).slice(-7)}>
                                <Line
                                    type="monotone"
                                    dataKey={dataKey}
                                    stroke="white"
                                    strokeWidth={3}
                                    dot={false}
                                    animationDuration={1500}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-[10px] font-black bg-white/20 px-2 py-1 rounded-lg">
                            <TrendingUp size={10} />
                            +12.5%
                        </div>
                        <span className="text-white/40 text-[8px] font-bold mt-1 uppercase">vs last 30 days</span>
                    </div>
                </div>
            </div>
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header section from Reference 1 */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Analytics Overview</h1>
                    <p className="text-gray-400 text-sm font-bold tracking-tight">Track your performance and inquiries</p>
                </div>

                <div className="flex items-center gap-4 bg-white/50 backdrop-blur-xl p-3 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 px-4 border-r border-gray-100">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Date Range</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="bg-transparent border-none text-xs font-black text-gray-900 focus:ring-0 cursor-pointer"
                        />
                        <span className="text-gray-300 font-bold">to</span>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="bg-transparent border-none text-xs font-black text-gray-900 focus:ring-0 cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {/* Colorful Cards from Reference 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <SummaryCard
                    title="Page Views"
                    value={stats.totalViews}
                    icon={Eye}
                    color="bg-indigo-600 shadow-indigo-600/30"
                    data={analytics}
                    dataKey="views"
                />
                <SummaryCard
                    title="Unique Visitors"
                    value={stats.totalVisitors}
                    icon={MousePointer2}
                    color="bg-cyan-500 shadow-cyan-500/30"
                    data={analytics}
                    dataKey="visitors"
                />
                <SummaryCard
                    title="Total Inquiries"
                    value={stats.unreadMessages}
                    icon={MessageCircle}
                    color="bg-amber-400 shadow-amber-400/30"
                    data={analytics}
                    dataKey="views" // Placeholder
                />
                <SummaryCard
                    title="Conversion"
                    value={Math.floor(stats.totalVisitors * 0.1)}
                    icon={Zap}
                    color="bg-rose-500 shadow-rose-500/30"
                    data={analytics}
                    dataKey="visitors" // Placeholder
                />
            </div>

            {/* Main Charts & Table section from Reference 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Growth Metrics */}
                <div className="lg:col-span-2 bg-white rounded-[48px] p-10 border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Growth Metrics</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Interactions over time</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-indigo-600" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Views</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Visitors</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
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
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 900 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="views"
                                    stroke="#4f46e5"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorViews)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="visitors"
                                    stroke="#10b981"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorVisitors)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mt-10 pt-10 border-t border-gray-50">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Views</span>
                            <div className="flex items-center gap-3">
                                <h4 className="text-3xl font-black text-gray-900">{stats.totalViews.toLocaleString()}</h4>
                                <div className="h-[40px] w-[80px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={analytics.slice(-7)}>
                                            <Area type="monotone" dataKey="views" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.1} strokeWidth={2} dot={false} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Visitors</span>
                            <div className="flex items-center gap-3">
                                <h4 className="text-3xl font-black text-gray-900">{stats.totalVisitors.toLocaleString()}</h4>
                                <div className="h-[40px] w-[80px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={analytics.slice(-7)}>
                                            <Area type="monotone" dataKey="visitors" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} dot={false} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Inquiries Section from Reference 1 */}
                <div className="bg-white rounded-[48px] p-10 border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Recent Inquiries</h3>
                            <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:translate-x-1 transition-transform">View All</button>
                        </div>

                        <div className="space-y-6">
                            {recentMessages.map((msg, idx) => (
                                <div key={msg.id} className="group flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black text-white shadow-lg ${['bg-indigo-500', 'bg-purple-500', 'bg-cyan-500', 'bg-pink-500', 'bg-amber-500'][idx % 5]
                                            }`}>
                                            {msg.name ? msg.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : '??'}
                                        </div>
                                        <div className="flex flex-col">
                                            <h4 className="text-sm font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{msg.name}</h4>
                                            <p className="text-[10px] font-bold text-gray-400 lowercase truncate max-w-[120px]">{msg.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[9px] font-bold text-gray-400">{new Date(msg.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                        <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${msg.status === 'New' ? 'bg-emerald-50 text-emerald-500' :
                                            msg.status === 'Pending' ? 'bg-amber-50 text-amber-500' : 'bg-gray-50 text-gray-400'
                                            }`}>
                                            {msg.status || 'New'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {recentMessages.length === 0 && (
                                <div className="text-center py-20">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MessageSquare className="text-gray-200" />
                                    </div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Zero Feedbacks</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-10 p-6 bg-gray-50 rounded-[32px] border border-gray-100/50 flex items-center justify-between group cursor-pointer hover:bg-indigo-600 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                                <MessageCircle className="text-indigo-600" />
                            </div>
                            <div>
                                <h5 className="text-[11px] font-black text-gray-900 group-hover:text-white transition-colors">Messaging Center</h5>
                                <p className="text-[9px] font-bold text-gray-400 group-hover:text-white/60 transition-colors">{stats.unreadMessages} Unread threads</p>
                            </div>
                        </div>
                        <ChevronRight className="text-gray-300 group-hover:text-white transition-all group-hover:translate-x-1" />
                    </div>
                </div>
            </div>
        </div>
    );
}
