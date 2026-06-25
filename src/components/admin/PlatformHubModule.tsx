"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
    Activity, AlertTriangle, CheckCircle2, Clock, Database,
    ExternalLink, Globe, Image, Loader2, Monitor,
    RefreshCw, Server, Shield, ShieldAlert, ShieldCheck,
    TrendingUp, Wifi, XCircle, Zap, Calendar,
} from "lucide-react";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

type SubTab = "usages" | "security";
type Period = "this_month" | "prev_month" | "custom";

function fmt(bytes: number) {
    if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
    if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
    if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(0)} KB`;
    return `${bytes} B`;
}

function localDateStr(d: Date) {
    // Build YYYY-MM-DD from LOCAL time components — avoids UTC shift (e.g. IST → Apr 30 instead of May 1)
    const p = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function getPeriodRange(period: Period, customStart: string, customEnd: string) {
    const now = new Date();
    if (period === "this_month") {
        const from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0); // LOCAL midnight May 1
        return {
            from: from.getTime(), to: now.getTime(),
            startDate: localDateStr(from), // "2026-05-01"
            endDate:   localDateStr(now),  // "2026-05-30"
            label: "This Month",
        };
    }
    if (period === "prev_month") {
        const from = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
        const to   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        return {
            from: from.getTime(), to: to.getTime(),
            startDate: localDateStr(from),
            endDate:   localDateStr(to),
            label: "Previous Month",
        };
    }
    const from = new Date(customStart + "T00:00:00");
    const to   = new Date(customEnd   + "T23:59:59");
    return {
        from: from.getTime(), to: to.getTime(),
        startDate: customStart, endDate: customEnd,
        label: `${customStart} → ${customEnd}`,
    };
}

// ─── Usage Card ───────────────────────────────────────────────────────────────

function UsageCard({
    icon, name, subtitle, value, limitLabel, pct, noBar, onClick,
}: {
    icon: React.ReactNode;
    name: string;
    subtitle: string;
    value: string;
    limitLabel?: string;
    pct?: number;
    noBar?: boolean;
    onClick?: () => void;
}) {
    const barColor =
        (pct ?? 0) >= 80 ? "bg-red-500" :
        (pct ?? 0) >= 60 ? "bg-amber-400" : "bg-emerald-500";

    return (
        <div
            onClick={onClick}
            className={`bg-[#0f172a] rounded-2xl p-5 space-y-4 min-w-0 transition-all duration-200 ${
                onClick ? "hover:bg-[#1a2744] hover:ring-1 hover:ring-slate-600 cursor-pointer group" : ""
            }`}
        >
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1e293b] flex items-center justify-center shrink-0 text-slate-300">
                    {icon}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white text-sm leading-tight">{name}</p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-tight">{subtitle}</p>
                </div>
                {onClick && (
                    <span className="text-[10px] text-slate-600 group-hover:text-slate-400 transition mt-0.5 font-medium tracking-wide">
                        VIEW
                    </span>
                )}
            </div>
            <div>
                <p className="text-3xl font-bold text-white leading-none">{value}</p>
                {limitLabel && <p className="text-sm text-slate-400 mt-1">{limitLabel}</p>}
            </div>
            {!noBar && pct != null && (
                <div className="space-y-1.5">
                    <div className="h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                            style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                    <p className="text-xs text-slate-500">{Math.round(pct)}% used</p>
                </div>
            )}
        </div>
    );
}

function NotConfiguredCard({ keyName }: { keyName: string }) {
    return (
        <div className="bg-[#0f172a] rounded-2xl p-5 space-y-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#1e293b] flex items-center justify-center">
                <AlertTriangle size={18} className="text-amber-400" />
            </div>
            <div>
                <p className="text-sm font-medium text-amber-400">Not configured</p>
                <code className="text-[10px] text-slate-500 font-mono break-all">{keyName}</code>
            </div>
        </div>
    );
}

function ProjectSection({ label, children }: { label: string; children: React.ReactNode }) {
    const colors: Record<string, string> = {
        Harishblog: "text-indigo-400 border-indigo-800",
        StartUP:    "text-blue-400 border-blue-800",
        "D-Driver": "text-sky-400 border-sky-800",
    };
    const c = colors[label] ?? "text-slate-400 border-slate-700";
    return (
        <div className="space-y-3">
            <div className={`flex items-center gap-3 pb-2 border-b ${c}`}>
                <h3 className={`text-sm font-bold uppercase tracking-widest ${c.split(" ")[0]}`}>{label}</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {children}
            </div>
        </div>
    );
}

// ─── Service Chart Modal ──────────────────────────────────────────────────────

type ModalState = {
    service: "vercel" | "neon" | "imagekit" | "render";
    project: string;
    // initial data from parent (tiles), modal refetches per period
    parentData: any;
};

const SERVICE_COLORS: Record<string, string> = {
    vercel:   "#6366f1",
    neon:     "#22d3ee",
    imagekit: "#f59e0b",
    render:   "#10b981",
};
const SERVICE_NAMES: Record<string, string> = {
    vercel: "Vercel", neon: "Neon DB", imagekit: "ImageKit", render: "Render",
};

function ServiceChartModal({
    modal, onClose, sessionId,
}: {
    modal: ModalState;
    onClose: () => void;
    sessionId: string;
}) {
    const today = new Date().toISOString().slice(0, 10);
    const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

    const [period, setPeriod]           = useState<Period>("this_month");
    const [customStart, setCustomStart] = useState(firstOfMonth);
    const [customEnd,   setCustomEnd]   = useState(today);
    const [data, setData]               = useState<any>(null);
    const [loading, setLoading]         = useState(true);

    const color = SERVICE_COLORS[modal.service];

    const fetchData = useCallback(async () => {
        if (period === "custom" && (!customStart || !customEnd || customStart > customEnd)) return;
        setLoading(true);
        const range = getPeriodRange(period, customStart, customEnd);
        const h = { "X-Session-Id": sessionId };

        try {
            if (modal.service === "vercel") {
                const url = `/api/admin/hub/vercel-usage?project=${encodeURIComponent(modal.project)}&from=${range.from}&to=${range.to}&startDate=${range.startDate}&endDate=${range.endDate}`;
                const res = await fetch(url, { headers: h });
                setData(await res.json());
            } else if (modal.service === "neon") {
                // Neon returns monthly aggregates — period filter shows same snapshot
                const url = `/api/admin/hub/neon-usage?project=${encodeURIComponent(modal.project)}`;
                const res = await fetch(url, { headers: h });
                const json = await res.json();
                setData(json.projects?.find((p: any) => p.label === modal.project) ?? json);
            } else if (modal.service === "imagekit") {
                const url = `/api/admin/hub/imagekit-usage?project=${encodeURIComponent(modal.project)}&startDate=${range.startDate}&endDate=${range.endDate}&weekly=true`;
                const res = await fetch(url, { headers: h });
                setData(await res.json());
            } else if (modal.service === "render") {
                const url = `/api/admin/hub/render-usage`;
                const res = await fetch(url, { headers: h });
                const json = await res.json();
                setData(json.projects?.find((p: any) => p.label === modal.project) ?? json);
            }
        } catch {
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [modal.service, modal.project, period, customStart, customEnd, sessionId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const ServiceIcon = () => {
        const props = { size: 18, style: { color } };
        if (modal.service === "vercel")   return <Zap {...props} />;
        if (modal.service === "neon")     return <Database {...props} />;
        if (modal.service === "imagekit") return <Image {...props} />;
        return <Server {...props} />;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div
                className="relative bg-[#0f172a] rounded-2xl p-6 w-full max-w-2xl shadow-2xl border border-slate-700/50 max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-5 gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}22` }}>
                            <ServiceIcon />
                        </div>
                        <div>
                            <h3 className="text-white font-bold">{SERVICE_NAMES[modal.service]} — {modal.project}</h3>
                            <p className="text-slate-400 text-xs">Usage details</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-200 transition shrink-0 mt-0.5">
                        <XCircle size={20} />
                    </button>
                </div>

                {/* Period filter */}
                <div className="flex flex-wrap items-center gap-2 mb-5 pb-5 border-b border-slate-800">
                    <Calendar size={14} className="text-slate-500" />
                    {(["this_month", "prev_month", "custom"] as Period[]).map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                period === p
                                    ? "text-white"
                                    : "text-slate-400 bg-[#1e293b] hover:text-slate-200"
                            }`}
                            style={period === p ? { background: color } : undefined}
                        >
                            {p === "this_month" ? "This Month" : p === "prev_month" ? "Previous Month" : "Custom Range"}
                        </button>
                    ))}
                    {period === "custom" && (
                        <div className="flex items-center gap-2 ml-1">
                            <input
                                type="date" value={customStart}
                                onChange={e => setCustomStart(e.target.value)}
                                className="bg-[#1e293b] text-slate-300 text-xs border border-slate-600 rounded-lg px-2 py-1.5 outline-none"
                            />
                            <span className="text-slate-500 text-xs">→</span>
                            <input
                                type="date" value={customEnd}
                                onChange={e => setCustomEnd(e.target.value)}
                                className="bg-[#1e293b] text-slate-300 text-xs border border-slate-600 rounded-lg px-2 py-1.5 outline-none"
                            />
                        </div>
                    )}
                </div>

                {/* Chart content */}
                {loading ? (
                    <div className="flex items-center justify-center py-16 gap-2 text-slate-400 text-sm">
                        <Loader2 size={16} className="animate-spin" /> Loading…
                    </div>
                ) : !data ? (
                    <p className="text-center py-12 text-slate-500 text-sm">Failed to load data</p>
                ) : modal.service === "vercel" ? (
                    <VercelChart data={data} color={color} />
                ) : modal.service === "neon" ? (
                    <NeonChart data={data} color={color} />
                ) : modal.service === "imagekit" ? (
                    <ImageKitChart data={data} color={color} />
                ) : (
                    <RenderStatus data={data} />
                )}
            </div>
        </div>
    );
}

// ── Per-service chart components ──────────────────────────────────────────────

function VercelChart({ data, color }: { data: any; color: string }) {
    const daily: { date: string; builds: number }[] = data.daily ?? [];
    const total    = data.usage?.monthlyBuilds ?? 0;
    const limit    = data.limits?.monthlyDeployLimit ?? 6000;
    const pct      = (total / limit) * 100;
    const barColor = pct >= 80 ? "#ef4444" : pct >= 60 ? "#f59e0b" : color;

    // Shorten date labels to "D MMM"
    const chartData = daily.map(d => ({
        ...d,
        label: new Date(d.date + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    }));

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
                <StatPill label="Total builds" value={`${total}`} color={color} />
                <StatPill label="% of limit" value={`${Math.round(pct)}%`} color={barColor} />
            </div>
            <div>
                <p className="text-slate-400 text-xs mb-3 font-medium uppercase tracking-wide">Daily builds</p>
                <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false}
                                interval={Math.max(0, Math.floor(chartData.length / 8) - 1)} />
                            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#f1f5f9", fontSize: 12 }}
                                formatter={(v: any) => [`${v} build${v !== 1 ? "s" : ""}`, ""]}
                                labelStyle={{ color: "#94a3b8" }}
                                cursor={{ stroke: color, strokeWidth: 1, strokeOpacity: 0.3 }}
                            />
                            <Area type="monotone" dataKey="builds" stroke={color} strokeWidth={2} fill="url(#vGrad)" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <UsageBar label="Builds vs limit" used={total} limit={limit} displayUsed={`${total}`} displayLimit={`${limit}`} color={barColor} />
        </div>
    );
}

function NeonChart({ data, color }: { data: any; color: string }) {
    const usage  = data.usage;
    const limits = data.limits ?? { computeHours: 191.9, storageBytes: 512 * 1024 * 1024 };

    if (!usage) return <p className="text-slate-500 text-sm text-center py-10">No usage data available</p>;

    const computeHrs  = parseFloat((usage.cpuUsedSec / 3600).toFixed(2));
    const computePct  = (computeHrs / limits.computeHours) * 100;
    const storagePct  = (usage.storageBytes / (usage.storageLimitBytes ?? limits.storageBytes)) * 100;

    const chartData = [
        { metric: "Compute", used: computeHrs, limit: limits.computeHours, pct: computePct, display: `${computeHrs}h / ${limits.computeHours}h` },
        { metric: "Storage",  used: storagePct, limit: 100, pct: storagePct, display: `${fmt(usage.storageBytes)} / ${fmt(usage.storageLimitBytes ?? limits.storageBytes)}` },
    ];

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
                <StatPill label="Compute" value={`${computeHrs} hrs`} color={computePct >= 80 ? "#ef4444" : color} />
                <StatPill label="Storage" value={fmt(usage.storageBytes)} color={storagePct >= 80 ? "#ef4444" : color} />
            </div>
            <div>
                <p className="text-slate-400 text-xs mb-3 font-medium uppercase tracking-wide">Usage vs free tier limit</p>
                <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="metric" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false}
                                tickFormatter={v => `${Math.round(v)}%`} domain={[0, 100]} />
                            <Tooltip
                                contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#f1f5f9", fontSize: 12 }}
                                formatter={(_: any, __: any, props: any) => [props.payload?.display ?? "", "Usage"]}
                                labelStyle={{ color: "#94a3b8" }}
                                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                            />
                            <Bar dataKey="pct" radius={[6, 6, 0, 0]} maxBarSize={80}>
                                {chartData.map((e, i) => <Cell key={i} fill={e.pct >= 80 ? "#ef4444" : e.pct >= 60 ? "#f59e0b" : color} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="space-y-3 border-t border-slate-800 pt-4">
                <UsageBar label="Compute hours" used={computeHrs} limit={limits.computeHours} displayUsed={`${computeHrs}h`} displayLimit={`${limits.computeHours}h`} color={computePct >= 80 ? "#ef4444" : color} />
                <UsageBar label="DB storage" used={usage.storageBytes} limit={usage.storageLimitBytes ?? limits.storageBytes} displayUsed={fmt(usage.storageBytes)} displayLimit={fmt(usage.storageLimitBytes ?? limits.storageBytes)} color={storagePct >= 80 ? "#ef4444" : color} />
            </div>
            {usage.quotaResetAt && (
                <p className="text-xs text-slate-600">Quota resets: {new Date(usage.quotaResetAt).toLocaleDateString()}</p>
            )}
        </div>
    );
}

function ImageKitChart({ data, color }: { data: any; color: string }) {
    const limits = data.limits ?? { storageBytes: 20 * 1024 * 1024 * 1024, bandwidthBytes: 20 * 1024 * 1024 * 1024 };
    const stats  = data.stats;
    const weekly: { date: string; bandwidthUsed: number; storageUsed: number }[] = data.weekly ?? data.daily ?? [];

    if (!stats && !weekly.length) return <p className="text-slate-500 text-sm text-center py-10">No usage data available</p>;

    const totalBw   = stats?.bandwidthUsed ?? 0;
    const totalSt   = stats?.storageUsed   ?? 0;
    const fileCount = stats?.fileCount     ?? 0;
    const bwPct     = (totalBw / limits.bandwidthBytes) * 100;
    const stPct     = (totalSt / limits.storageBytes)   * 100;
    const barColor  = (pct: number) => pct >= 80 ? "#ef4444" : pct >= 60 ? "#f59e0b" : color;

    const gradId = "ikBwGrad";

    const chartData = weekly.map(d => ({
        ...d,
        label: d.date,
        value: d.bandwidthUsed,
    }));

    return (
        <div className="space-y-5">
            {/* Stat pills */}
            <div className="grid grid-cols-3 gap-3">
                <StatPill label="Bandwidth" value={fmt(totalBw)} color={barColor(bwPct)} />
                <StatPill label="Storage"   value={fmt(totalSt)} color={barColor(stPct)} />
                <StatPill label="Files"     value={`${fileCount}`} color={color} />
            </div>

            {/* Chart label */}
            <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg text-xs font-medium text-white" style={{ background: color }}>Bandwidth</span>
                <span className="text-slate-500 text-xs">consumed per week</span>
            </div>

            {/* Area chart — date on X, metric on Y */}
            <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                        <defs>
                            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor={color} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false}
                            interval={Math.max(0, Math.floor(chartData.length / 8) - 1)} />
                        <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false}
                            tickFormatter={v => fmt(v)} width={56} />
                        <Tooltip
                            contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#f1f5f9", fontSize: 12 }}
                            formatter={(v: any) => [fmt(v as number), "Bandwidth"]}
                            labelStyle={{ color: "#94a3b8" }}
                            cursor={{ stroke: color, strokeWidth: 1, strokeOpacity: 0.3 }}
                        />
                        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#${gradId})`} dot={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Usage bars */}
            <div className="space-y-3 border-t border-slate-800 pt-4">
                <UsageBar label="Bandwidth used" used={totalBw} limit={limits.bandwidthBytes} displayUsed={fmt(totalBw)} displayLimit={fmt(limits.bandwidthBytes)} color={barColor(bwPct)} />
                <UsageBar label="Storage used"   used={totalSt} limit={limits.storageBytes}   displayUsed={fmt(totalSt)} displayLimit={fmt(limits.storageBytes)}   color={barColor(stPct)} />
            </div>
        </div>
    );
}

function RenderStatus({ data }: { data: any }) {
    const services: any[] = data.services ?? [];
    if (!data.configured) return <p className="text-slate-500 text-sm text-center py-10">Not configured</p>;
    return (
        <div className="space-y-3">
            {services.length === 0
                ? <p className="text-slate-500 text-sm text-center py-8">No services found</p>
                : services.map((svc: any, i: number) => {
                    const s = svc.service ?? svc;
                    const active = s.suspended === "not_suspended";
                    return (
                        <div key={i} className="bg-[#1e293b] rounded-xl p-4 flex items-center justify-between">
                            <div>
                                <p className="text-white text-sm font-medium">{s.name ?? "Service"}</p>
                                <p className="text-slate-500 text-xs mt-0.5">{s.serviceDetails?.env ?? s.type ?? "Web Service"}</p>
                            </div>
                            <span className={`text-sm font-bold px-3 py-1 rounded-full ${active ? "bg-emerald-900/30 text-emerald-400" : "bg-amber-900/30 text-amber-400"}`}>
                                {active ? "Active" : "Suspended"}
                            </span>
                        </div>
                    );
                })
            }
        </div>
    );
}

// ── Shared small components ───────────────────────────────────────────────────

function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div className="bg-[#1e293b] rounded-xl p-3 space-y-1">
            <p className="text-slate-500 text-[10px] uppercase tracking-wide">{label}</p>
            <p className="text-white font-bold text-lg leading-none" style={{ color }}>{value}</p>
        </div>
    );
}

function UsageBar({ label, used, limit, displayUsed, displayLimit, color }: {
    label: string; used: number; limit: number; displayUsed: string; displayLimit: string; color: string;
}) {
    const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">{label}</span>
                <span className="text-slate-400">{displayUsed} / {displayLimit} · <span style={{ color }}>{Math.round(pct)}%</span></span>
            </div>
            <div className="h-1.5 bg-[#0f172a] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
            </div>
        </div>
    );
}

// ─── Usages Tab ──────────────────────────────────────────────────────────────

function UsagesTab({ sessionId }: { sessionId: string }) {
    const [vercel,   setVercel]   = useState<any>(null);
    const [neon,     setNeon]     = useState<any>(null);
    const [imagekit, setIK]       = useState<any>(null);
    const [render,   setRender]   = useState<any>(null);
    const [loading,  setLoading]  = useState(true);
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const [modal, setModal] = useState<ModalState | null>(null);
    const h = { "X-Session-Id": sessionId };

    const fetchAll = useCallback(async () => {
        setLoading(true);
        const [v, n, ik, r] = await Promise.allSettled([
            fetch("/api/admin/hub/vercel-usage",   { headers: h }).then(x => x.json()),
            fetch("/api/admin/hub/neon-usage",     { headers: h }).then(x => x.json()),
            fetch("/api/admin/hub/imagekit-usage", { headers: h }).then(x => x.json()),
            fetch("/api/admin/hub/render-usage",   { headers: h }).then(x => x.json()),
        ]);
        setVercel(v.status   === "fulfilled" ? v.value   : null);
        setNeon(n.status     === "fulfilled" ? n.value   : null);
        setIK(ik.status      === "fulfilled" ? ik.value  : null);
        setRender(r.status   === "fulfilled" ? r.value   : null);
        setLoading(false);
        setLastRefresh(new Date());
    }, [sessionId]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-sm text-slate-400 py-16 justify-center">
                <Loader2 size={16} className="animate-spin" /> Loading service usage…
            </div>
        );
    }

    const RENDER_USERS = new Set(["D-Driver"]);

    return (
        <>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                            <TrendingUp size={18} className="text-purple-500" /> Platform Usage
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                            Click any tile to see its chart with period filter
                        </p>
                    </div>
                    <button onClick={fetchAll}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors">
                        <RefreshCw size={11} /> {lastRefresh.toLocaleTimeString()}
                    </button>
                </div>

                {(["Harishblog", "StartUP", "D-Driver"] as const).map(label => {
                    const vp  = vercel?.projects?.find((x: any) => x.label === label);
                    const np  = neon?.projects?.find((x: any) => x.label === label);
                    const ikp = imagekit?.projects?.find((x: any) => x.label === label);
                    const rp  = render?.projects?.find((x: any) => x.label === label);
                    const neonUsage = np?.usage;
                    const ikStats   = ikp?.stats;

                    const lastDeploy = vp?.usage?.lastDeployAt
                        ? (() => {
                            const m = Math.round((Date.now() - vp.usage.lastDeployAt) / 60000);
                            if (m < 60) return `${m}m ago`;
                            if (m < 1440) return `${Math.round(m / 60)}h ago`;
                            return `${Math.round(m / 1440)}d ago`;
                        })() : null;

                    return (
                        <ProjectSection key={label} label={label}>

                            {/* Vercel */}
                            {!vp || !vp.configured ? (
                                <NotConfiguredCard keyName={`VERCEL_API_TOKEN_${label.replace(/-/g,"").toUpperCase()}`} />
                            ) : (
                                <UsageCard
                                    icon={<Zap size={16} />} name="Vercel" subtitle="Builds this month"
                                    value={`${vp.usage?.monthlyBuilds ?? 0}`}
                                    limitLabel={lastDeploy ? `last deploy ${lastDeploy}` : `${vp.projects?.length ?? 0} projects`}
                                    pct={((vp.usage?.monthlyBuilds ?? 0) / vp.limits.monthlyDeployLimit) * 100}
                                    onClick={() => setModal({ service: "vercel", project: label, parentData: vp })}
                                />
                            )}

                            {/* Neon compute */}
                            {!np || !np.configured ? (
                                <NotConfiguredCard keyName={`NEON_API_KEY_${label.replace(/-/g,"").toUpperCase()}`} />
                            ) : neonUsage ? (
                                <UsageCard
                                    icon={<Database size={16} />} name="Neon DB" subtitle="Compute (monthly)"
                                    value={`${(neonUsage.cpuUsedSec / 3600).toFixed(1)} hrs`}
                                    limitLabel={`of ${np.limits.computeHours} hrs free`}
                                    pct={(neonUsage.cpuUsedSec / 3600 / np.limits.computeHours) * 100}
                                    onClick={() => setModal({ service: "neon", project: label, parentData: np })}
                                />
                            ) : (
                                <UsageCard icon={<Database size={16} />} name="Neon DB" subtitle="Storage"
                                    value={`${np.projects?.length ?? 0} projects`} limitLabel="View usage" noBar
                                    onClick={() => setModal({ service: "neon", project: label, parentData: np })}
                                />
                            )}

                            {/* Neon storage */}
                            {neonUsage?.storageBytes != null && (
                                <UsageCard
                                    icon={<Database size={16} />} name="Neon DB" subtitle="DB storage"
                                    value={fmt(neonUsage.storageBytes)}
                                    limitLabel={`of ${fmt(neonUsage.storageLimitBytes)} free`}
                                    pct={(neonUsage.storageBytes / neonUsage.storageLimitBytes) * 100}
                                    onClick={() => setModal({ service: "neon", project: label, parentData: np })}
                                />
                            )}

                            {/* ImageKit */}
                            {!ikp || !ikp.configured ? (
                                <NotConfiguredCard keyName={`IMAGEKIT_PRIVATE_KEY_${label.replace(/-/g,"").toUpperCase()}`} />
                            ) : ikp.breakdown ? (
                                ikp.breakdown.map((acc: any) => (
                                    <React.Fragment key={acc.account}>
                                        <UsageCard
                                            icon={<Image size={16} />} name="ImageKit Storage" subtitle={acc.account}
                                            value={fmt(acc.storageUsed)}
                                            limitLabel={`of ${fmt(ikp.limits.storageBytes)} free · ${acc.fileCount} files`}
                                            pct={(acc.storageUsed / ikp.limits.storageBytes) * 100}
                                            onClick={() => setModal({ service: "imagekit", project: label, parentData: ikp })}
                                        />
                                        <UsageCard
                                            icon={<Image size={16} />} name="ImageKit Bandwidth" subtitle={`${acc.account} · this month`}
                                            value={fmt(acc.bandwidthUsed)}
                                            limitLabel={`of ${fmt(ikp.limits.bandwidthBytes)} free/month`}
                                            pct={(acc.bandwidthUsed / ikp.limits.bandwidthBytes) * 100}
                                            onClick={() => setModal({ service: "imagekit", project: label, parentData: ikp })}
                                        />
                                    </React.Fragment>
                                ))
                            ) : ikStats?.storageUsed != null ? (
                                <React.Fragment>
                                    <UsageCard
                                        icon={<Image size={16} />} name="ImageKit Storage" subtitle="File storage"
                                        value={fmt(ikStats.storageUsed)}
                                        limitLabel={`of ${fmt(ikp.limits.storageBytes)} free · ${ikStats.fileCount} files`}
                                        pct={(ikStats.storageUsed / ikp.limits.storageBytes) * 100}
                                        onClick={() => setModal({ service: "imagekit", project: label, parentData: ikp })}
                                    />
                                    <UsageCard
                                        icon={<Image size={16} />} name="ImageKit Bandwidth" subtitle="This month"
                                        value={fmt(ikStats.bandwidthUsed ?? 0)}
                                        limitLabel={`of ${fmt(ikp.limits.bandwidthBytes)} free/month`}
                                        pct={((ikStats.bandwidthUsed ?? 0) / ikp.limits.bandwidthBytes) * 100}
                                        onClick={() => setModal({ service: "imagekit", project: label, parentData: ikp })}
                                    />
                                </React.Fragment>
                            ) : (
                                <UsageCard icon={<Image size={16} />} name="ImageKit" subtitle="Media storage"
                                    value="Connected" limitLabel="View usage" noBar
                                    onClick={() => setModal({ service: "imagekit", project: label, parentData: ikp })}
                                />
                            )}

                            {/* Render */}
                            {RENDER_USERS.has(label) && (
                                !rp || !rp.configured ? (
                                    <NotConfiguredCard keyName="RENDER_API_KEY_DDRIVER" />
                                ) : (
                                    <UsageCard
                                        icon={<Server size={16} />} name="Render" subtitle="Backend service"
                                        value={(rp.services ?? []).length > 0
                                            ? ((rp.services[0].service ?? rp.services[0]).suspended === "not_suspended" ? "Active" : "Suspended")
                                            : "—"}
                                        limitLabel={(rp.services[0]?.service ?? rp.services[0])?.name ?? "Web service"}
                                        noBar
                                        onClick={() => setModal({ service: "render", project: label, parentData: rp })}
                                    />
                                )
                            )}

                        </ProjectSection>
                    );
                })}
            </div>

            {modal && (
                <ServiceChartModal
                    modal={modal}
                    onClose={() => setModal(null)}
                    sessionId={sessionId}
                />
            )}
        </>
    );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────

const HEADER_LABELS: Record<string, string> = {
    "strict-transport-security": "HSTS",
    "x-content-type-options":    "X-Content-Type",
    "x-frame-options":           "X-Frame",
    "content-security-policy":   "CSP",
};

function SecurityTab({ sessionId }: { sessionId: string }) {
    const [data, setData]       = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/hub/security-overview", { headers: { "X-Session-Id": sessionId } });
            setData(await res.json());
        } catch { setData({ error: "Request failed" }); }
        finally { setLoading(false); setLastRefresh(new Date()); }
    }, [sessionId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (loading) {
        return <div className="flex items-center gap-2 text-sm text-gray-400 py-12 justify-center"><Loader2 size={16} className="animate-spin" /> Checking all three sites…</div>;
    }

    const sites: any[] = data?.sites ?? [];
    const sessions     = data?.sessions ?? {};
    const allHeaders   = Object.keys(HEADER_LABELS);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">Security health across all three production sites</p>
                <button onClick={fetchData} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                    <RefreshCw size={11} /> {lastRefresh.toLocaleTimeString()}
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sites.map(site => (
                    <div key={site.name} className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {site.ok ? <CheckCircle2 size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-red-500" />}
                                <span className="font-medium text-sm">{site.name}</span>
                            </div>
                            <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><ExternalLink size={12} /></a>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                            <span className={`px-2 py-0.5 rounded-full font-mono text-[11px] ${site.status >= 200 && site.status < 300 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800"}`}>
                                {site.status === 0 ? "Timeout" : `HTTP ${site.status}`}
                            </span>
                            <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400"><Activity size={10} />{site.responseTime}ms</span>
                            {site.https && <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><Shield size={10} />HTTPS</span>}
                        </div>
                        <div className="space-y-1.5">
                            {allHeaders.map(h => (
                                <div key={h} className="flex items-center justify-between text-[11px]">
                                    <span className="text-gray-500 dark:text-gray-400">{HEADER_LABELS[h]}</span>
                                    {site.headers[h]
                                        ? <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={10} /> Present</span>
                                        : <span className="flex items-center gap-1 text-amber-500"><AlertTriangle size={10} /> Missing</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
                <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-blue-500" />
                    <h3 className="font-semibold text-sm">Admin Session Activity — Harishblog</h3>
                </div>
                <div className="flex gap-8">
                    <div><p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{sessions.active ?? 0}</p><p className="text-xs text-gray-500">Active (30 min)</p></div>
                    <div><p className="text-2xl font-bold text-gray-700 dark:text-gray-200">{sessions.total ?? 0}</p><p className="text-xs text-gray-500">Total sessions</p></div>
                </div>
                <div className="space-y-2">
                    {(sessions.recent ?? []).map((s: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-2"><Monitor size={12} className="text-gray-400" /><span>{s.deviceName ?? "Unknown"}</span><span className="text-gray-400">·</span><span className="text-gray-400">{s.browser}</span></div>
                            <div className="flex items-center gap-2 text-gray-400">{s.ipAddress && <span className="font-mono text-[10px]">{s.ipAddress}</span>}<Clock size={10} /><span>{new Date(s.lastActive).toLocaleString()}</span></div>
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg px-3 py-2">
                    <ShieldCheck size={12} /> No breach attempts detected · All sessions nominal
                </div>
            </div>
        </div>
    );
}

// ─── Portal View ─────────────────────────────────────────────────────────────

const PORTAL_URLS: Record<string, string> = {
    "StartUP Admin":   "https://www.startupmenswear.in/admin",
    "D-Driver DEV SA": "https://d-driver.vercel.app/super-admin/dashboard",
};

// Maps the portal display name to its stable toggle key (matches API PORTAL_KEYS).
// A key being OFF deactivates the entire real site (customer + admin), not just this shortcut.
const PORTAL_KEYS: Record<string, string> = {
    "StartUP Admin":   "startup",
    "D-Driver DEV SA": "ddriver",
};

// Rows shown in the Access Control card — each toggle disables the whole real website.
const ACCESS_CONTROL_SITES: { key: string; label: string }[] = [
    { key: "startup", label: "StartUP Menswear (entire site)" },
    { key: "ddriver", label: "D-Driver (entire site)" },
];

function PortalView({ portalName }: { portalName: string }) {
    const url = PORTAL_URLS[portalName];
    if (!url) return null;
    return (
        <iframe key={url} src={url} title={portalName}
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation allow-modals"
            style={{ position: "fixed", top: 0, left: 260, right: 0, bottom: 0, width: "calc(100vw - 260px)", height: "100vh", border: "none", zIndex: 45 }}
        />
    );
}

function PortalAccessDenied({ portalName }: { portalName: string }) {
    return (
        <div style={{ position: "fixed", top: 0, left: 260, right: 0, bottom: 0, zIndex: 45 }}
            className="flex items-center justify-center bg-[#f8f9fa] dark:bg-[#121212] p-6">
            <div className="max-w-md w-full text-center bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-10">
                <div className="w-16 h-16 mx-auto rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                    <ShieldAlert size={32} className="text-red-500" />
                </div>
                <p className="mt-5 text-xs font-semibold tracking-widest text-red-500 uppercase">Error 403</p>
                <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">Access Denied</h2>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{portalName}</span> has been disabled by the administrator and is currently unavailable.
                </p>
            </div>
        </div>
    );
}

// ─── Main Module ─────────────────────────────────────────────────────────────

const SUB_TABS: { id: SubTab; label: string; icon: React.ReactNode }[] = [
    { id: "usages",   label: "Usages",   icon: <TrendingUp size={14} /> },
    { id: "security", label: "Security", icon: <ShieldAlert size={14} /> },
];

export default function PlatformHubModule({ initialPortal }: { initialPortal?: string } = {}) {
    const [activeSubTab, setActiveSubTab] = useState<SubTab>("usages");
    const sessionId = typeof window !== "undefined" ? localStorage.getItem("admin_sessionId") ?? "" : "";

    // Portal on/off toggles (shared server state). null = still loading.
    const [toggles, setToggles] = useState<Record<string, boolean> | null>(null);
    const [savingKey, setSavingKey] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        fetch("/api/admin/hub/portal-toggles", { headers: { "X-Session-Id": sessionId } })
            .then(res => (res.ok ? res.json() : { toggles: {} }))
            .then(data => { if (active) setToggles(data.toggles || {}); })
            .catch(() => { if (active) setToggles({}); });
        return () => { active = false; };
    }, [sessionId]);

    const setPortalEnabled = async (pageKey: string, isEnabled: boolean) => {
        setSavingKey(pageKey);
        setToggles(prev => ({ ...(prev || {}), [pageKey]: isEnabled }));
        try {
            await fetch("/api/admin/hub/portal-toggles", {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Session-Id": sessionId },
                body: JSON.stringify({ pageKey, isEnabled }),
            });
        } finally {
            setSavingKey(null);
        }
    };

    if (initialPortal) {
        const key = PORTAL_KEYS[initialPortal];
        // Wait for toggle state before deciding; fail open if the key is unknown.
        if (toggles === null) {
            return (
                <div style={{ position: "fixed", top: 0, left: 260, right: 0, bottom: 0, zIndex: 45 }}
                    className="flex items-center justify-center bg-[#f8f9fa] dark:bg-[#121212]">
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                </div>
            );
        }
        if (key && toggles[key] === false) return <PortalAccessDenied portalName={initialPortal} />;
        return <PortalView portalName={initialPortal} />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2"><Globe size={20} className="text-purple-600" /> Platform Hub</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Unified analytics — usage &amp; security across all three projects</p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-gray-400">
                    <Wifi size={11} className="text-emerald-500" />
                    hariharanhub.com · startupmenswear.in · d-driver.vercel.app
                </div>
            </div>
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl w-fit">
                {SUB_TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveSubTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            activeSubTab === tab.id
                                ? "bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 shadow-sm"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        }`}>
                        {tab.icon}{tab.label}
                    </button>
                ))}
            </div>
            {activeSubTab === "usages"   && <UsagesTab sessionId={sessionId} />}
            {activeSubTab === "security" && <SecurityTab sessionId={sessionId} />}

            {/* ─── Access Control ─── */}
            <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2">
                    <Shield size={16} className="text-purple-600" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Access Control</h3>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Turn a project off to deactivate its entire live website (customer &amp; admin). While off, every page of the real site shows an Access Denied (403) screen for everyone. Changes apply within ~30s.
                </p>
                <div className="mt-4 space-y-2">
                    {ACCESS_CONTROL_SITES.map(({ key, label }) => {
                        const enabled = toggles ? toggles[key] !== false : true;
                        const loading = toggles === null;
                        return (
                            <div key={key} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-2 min-w-0">
                                    <Globe size={14} className="text-gray-400 shrink-0" />
                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{label}</span>
                                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                                        enabled
                                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                                            : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                                    }`}>
                                        {enabled ? "Active" : "Disabled"}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={enabled}
                                    disabled={loading || savingKey === key}
                                    onClick={() => setPortalEnabled(key, !enabled)}
                                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
                                        enabled ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"
                                    }`}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                        enabled ? "translate-x-6" : "translate-x-1"
                                    }`} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
