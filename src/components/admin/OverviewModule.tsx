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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                        <TrendingUp className="text-primary" /> Analytics Overview
                    </h2>
                    <p className="text-secondary font-medium mt-1">Track your performance and inquiries</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 px-3">
                        <Calendar size={14} className="text-secondary" />
                        <span className="text-[10px] font-black uppercase text-secondary">Date Range</span>
                    </div>
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="bg-gray-50 border-0 rounded-xl text-xs font-bold px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <span className="text-gray-300">to</span>
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="bg-gray-50 border-0 rounded-xl text-xs font-bold px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
            </div>

            {/* Header Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute -bottom-6 -right-6 text-blue-50 group-hover:text-blue-100 transition-colors">
                        <Globe size={120} />
                    </div>
                    <p className="text-secondary text-xs font-black uppercase tracking-widest mb-2 relative z-10">Total Page Views</p>
                    <h3 className="text-4xl font-black text-gray-900 relative z-10">{stats.totalViews.toLocaleString()}</h3>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute -bottom-6 -right-6 text-purple-50 group-hover:text-purple-100 transition-colors">
                        <User size={120} />
                    </div>
                    <p className="text-secondary text-xs font-black uppercase tracking-widest mb-2 relative z-10">Unique Visitors</p>
                    <h3 className="text-4xl font-black text-gray-900 relative z-10">{stats.totalVisitors.toLocaleString()}</h3>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute -bottom-6 -right-6 text-amber-50 group-hover:text-amber-100 transition-colors">
                        <MessageSquare size={120} />
                    </div>
                    <p className="text-secondary text-xs font-black uppercase tracking-widest mb-2 relative z-10">Unread Inquiries</p>
                    <h3 className="text-4xl font-black text-gray-900 relative z-10">{stats.unreadMessages}</h3>
                </div>
            </div>

            {/* Analytics Graph */}
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                <div className="h-[400px] w-full mt-6">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                        <Globe className="text-blue-500" /> Top Pages
                    </h3>
                    <div className="space-y-4">
                        {topPages.map((page, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <span className="text-sm font-bold text-gray-700 truncate max-w-[200px]">{page.page}</span>
                                <span className="text-xs font-black text-primary bg-white px-3 py-1 rounded-lg shadow-sm">{page.count} views</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                        <Search className="text-purple-500" /> Top Referrers
                    </h3>
                    <div className="space-y-4">
                        {topReferrers.map((ref, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <span className="text-sm font-bold text-gray-700 truncate max-w-[200px]">{ref.referrer}</span>
                                <span className="text-xs font-black text-primary bg-white px-3 py-1 rounded-lg shadow-sm">{ref.count} visits</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Messages Feed */}
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                            <MessageSquare className="text-emerald-500" /> Recent Inquiries
                        </h3>
                        <p className="text-secondary font-medium mt-1">Last 5 messages received</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {recentMessages.length > 0 ? recentMessages.map((msg) => (
                        <div key={msg.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all group">
                            <div className="flex items-center space-x-6">
                                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center font-black text-primary shadow-sm group-hover:scale-110 transition-transform">
                                    {msg.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-black text-gray-900">{msg.name}</h4>
                                    <div className="flex items-center gap-4 text-xs font-bold text-secondary mt-1">
                                        <span className="flex items-center gap-1.5"><Phone size={12} /> {msg.mobile}</span>
                                        <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(msg.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${msg.status === 'Fresh' ? 'bg-green-100 text-green-600' : 'bg-white text-gray-500'
                                    }`}>
                                    {msg.status || 'Fresh'}
                                </span>
                                <ArrowRight size={20} className="text-gray-200 group-hover:text-primary transition-colors" />
                            </div>
                        </div>
                    )) : (
                        <p className="text-center py-10 text-secondary font-medium uppercase tracking-widest text-xs">No recent messages</p>
                    )}
                </div>
            </div>
        </div>
    );
}
