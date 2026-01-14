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
    Search
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";

export default function OverviewModule() {
    const [analytics, setAnalytics] = useState<any[]>([]);
    const [recentMessages, setRecentMessages] = useState<any[]>([]);

    // Date Range State
    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    const [topPages, setTopPages] = useState<any[]>([]);
    const [topReferrers, setTopReferrers] = useState<any[]>([]);

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
                setAnalytics(data.stats.reverse()); // Chronological for graph
                setTopPages(data.topPages || []);
                setTopReferrers(data.topReferrers || []);

                const views = data.stats.reduce((acc: number, curr: any) => acc + curr.views, 0);
                const visitors = data.stats.reduce((acc: number, curr: any) => acc + curr.visitors, 0);
                setStats(prev => ({ ...prev, totalViews: views, totalVisitors: visitors }));
            }

            if (messagesRes.ok) {
                const data = await messagesRes.json();
                setRecentMessages(data.slice(0, 5));
                setStats(prev => ({ ...prev, unreadMessages: data.filter((m: any) => m.status === 'Fresh').length }));
            }
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Analytics and Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                        <TrendingUp size={18} className="text-primary" /> Analytics Overview
                    </h2>
                    <p className="text-gray-400 text-xs font-medium mt-0.5">Track your performance and inquiries</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm w-full md:w-auto">
                    <div className="flex items-center gap-2 px-3">
                        <Calendar size={14} className="text-secondary" />
                        <span className="text-[10px] font-black uppercase text-secondary">Date Range</span>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="bg-gray-50 border-0 rounded-xl text-xs font-bold px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 flex-1 sm:flex-none"
                        />
                        <span className="text-gray-300">to</span>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="bg-gray-50 border-0 rounded-xl text-xs font-bold px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 flex-1 sm:flex-none"
                        />
                    </div>
                </div>
            </div>

            {/* Header Cards with Glassmorphism and Accents */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:shadow-primary/5 transition-all duration-500">
                    <div className="absolute -bottom-4 -right-4 text-blue-500/5 group-hover:text-blue-500/10 transition-colors rotate-12 group-hover:rotate-0 duration-700">
                        <Globe size={110} />
                    </div>
                    <div className="relative z-10">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                            <Globe size={16} />
                        </div>
                        <p className="text-gray-400 text-[8px] font-black uppercase tracking-[0.2em] mb-1">Page Views</p>
                        <h3 className="text-2xl font-black text-gray-900 leading-none">{stats.totalViews.toLocaleString()}</h3>
                    </div>
                </div>

                <div className="bg-white/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:shadow-purple-500/5 transition-all duration-500">
                    <div className="absolute -bottom-4 -right-4 text-purple-500/5 group-hover:text-purple-500/10 transition-colors -rotate-12 group-hover:rotate-0 duration-700">
                        <User size={110} />
                    </div>
                    <div className="relative z-10">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                            <User size={16} />
                        </div>
                        <p className="text-gray-400 text-[8px] font-black uppercase tracking-[0.2em] mb-1">Visitors</p>
                        <h3 className="text-2xl font-black text-gray-900 leading-none">{stats.totalVisitors.toLocaleString()}</h3>
                    </div>
                </div>

                <div className="bg-white/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:shadow-emerald-500/5 transition-all duration-500">
                    <div className="absolute -bottom-4 -right-4 text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors rotate-6 group-hover:rotate-0 duration-700">
                        <MessageSquare size={110} />
                    </div>
                    <div className="relative z-10">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                            <MessageSquare size={16} />
                        </div>
                        <p className="text-gray-400 text-[8px] font-black uppercase tracking-[0.2em] mb-1">Inquiries</p>
                        <h3 className="text-2xl font-black text-gray-900 leading-none">{stats.unreadMessages}</h3>
                    </div>
                </div>
            </div>

            {/* Analytics Graph with Modern Styling */}
            <div className="bg-white/60 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-black text-gray-900 tracking-tight">Growth Metrics</h3>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Views</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Visitors</span>
                        </div>
                    </div>
                </div>
                <div className="h-[240px] w-full">
                    {analytics.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fontWeight: 700, fill: '#94a3b8' }}
                                    dy={10}
                                    tickFormatter={(str) => {
                                        const date = new Date(str);
                                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                    }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fontWeight: 700, fill: '#94a3b8' }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                    labelStyle={{ fontWeight: 900, marginBottom: '0.5rem' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="views"
                                    name="Page Views"
                                    stroke="#3b82f6"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorViews)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="visitors"
                                    name="Unique Visitors"
                                    stroke="#10b981"
                                    strokeWidth={4}
                                    fill="transparent"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                            <Globe size={48} className="text-gray-200 mb-4" />
                            <p className="text-secondary font-black uppercase tracking-widest text-sm">Waiting for traffic data...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Top Pages and Referrers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 shadow-sm">
                    <h3 className="text-base font-black text-gray-900 mb-5 flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-blue-50 text-blue-500">
                            <Globe size={16} />
                        </div>
                        Top Pages
                    </h3>
                    <div className="space-y-2.5">
                        {topPages.map((page, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-gray-50/50 hover:border-primary/20 hover:bg-white transition-all group">
                                <span className="text-[11px] font-bold text-gray-600 truncate max-w-[180px] group-hover:text-gray-900">{page.page}</span>
                                <span className="text-[9px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-lg">{page.count} views</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 shadow-sm">
                    <h3 className="text-base font-black text-gray-900 mb-5 flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-purple-50 text-purple-500">
                            <Search size={16} />
                        </div>
                        Top Referrers
                    </h3>
                    <div className="space-y-2.5">
                        {topReferrers.map((ref, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-gray-50/50 hover:border-primary/20 hover:bg-white transition-all group">
                                <span className="text-[11px] font-bold text-gray-600 truncate max-w-[180px] group-hover:text-gray-900">{ref.referrer}</span>
                                <span className="text-[9px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-lg">{ref.count} visits</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Messages with Premium Feed Style */}
            <div className="bg-white/60 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] border border-white/50 shadow-sm">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2.5 tracking-tight">
                            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-500">
                                <MessageSquare size={18} />
                            </div>
                            Live Inquiries
                        </h3>
                        <p className="text-gray-400 text-[10px] font-bold mt-0.5">Real-time engagement feed</p>
                    </div>
                    <button className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-blue-700 transition-colors flex items-center gap-1 group">
                        View All <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                <div className="space-y-2.5">
                    {recentMessages.length > 0 ? recentMessages.map((msg) => (
                        <div key={msg.id} className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-50 hover:border-primary/20 hover:bg-white hover:shadow-xl hover:shadow-gray-200/20 transition-all group cursor-pointer">
                            <div className="flex items-center space-x-4">
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gray-50 to-white border border-gray-100 flex items-center justify-center font-black text-primary shadow-sm group-hover:scale-105 transition-transform text-sm">
                                    {msg.name.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="font-bold text-xs text-gray-900 group-hover:text-primary transition-colors">{msg.name}</h4>
                                    <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 mt-0.5">
                                        <span className="flex items-center gap-1"><Phone size={8} /> {msg.mobile}</span>
                                        <div className="w-0.5 h-0.5 rounded-full bg-gray-200" />
                                        <span className="flex items-center gap-1"><Calendar size={8} /> {new Date(msg.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${msg.status === 'Fresh' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'
                                    }`}>
                                    {msg.status || 'Fresh'}
                                </span>
                                <div className="p-1.5 rounded-lg bg-gray-50 group-hover:bg-primary group-hover:text-white transition-all text-gray-300">
                                    <ArrowRight size={12} />
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-8">
                            <MessageSquare size={24} className="text-gray-100 mx-auto mb-2" />
                            <p className="text-secondary font-black uppercase tracking-widest text-[10px]">No recent messages</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
