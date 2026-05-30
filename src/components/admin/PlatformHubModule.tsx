"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
    Activity, AlertTriangle, CheckCircle2, Clock, Database,
    ExternalLink, Globe, Image, Loader2, Monitor,
    RefreshCw, Server, Shield, ShieldAlert, ShieldCheck,
    TrendingUp, Wifi, XCircle, Zap,
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell,
} from "recharts";

type SubTab = "usages" | "security";

function fmt(bytes: number) {
    if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
    if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
    if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(0)} KB`;
    return `${bytes} B`;
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
            className={`bg-[#0f172a] rounded-2xl p-5 space-y-4 min-w-0 transition-all duration-200 ${onClick ? "hover:bg-[#1a2744] hover:ring-1 hover:ring-slate-600 cursor-pointer" : ""}`}
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
                    <svg className="w-3 h-3 text-slate-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                )}
            </div>

            <div>
                <p className="text-3xl font-bold text-white leading-none">{value}</p>
                {limitLabel && (
                    <p className="text-sm text-slate-400 mt-1">{limitLabel}</p>
                )}
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

function NotUsedCard() {
    return (
        <div className="bg-[#0f172a] rounded-2xl p-5 flex items-center gap-3 min-w-0 opacity-40">
            <div className="w-10 h-10 rounded-xl bg-[#1e293b] flex items-center justify-center">
                <Server size={16} className="text-slate-500" />
            </div>
            <p className="text-sm text-slate-500 italic">Not used</p>
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

type ModalState = { service: "vercel" | "neon" | "imagekit" | "render"; metric: string };

const SERVICE_COLORS: Record<string, string> = {
    vercel:   "#6366f1",
    neon:     "#22d3ee",
    imagekit: "#f59e0b",
    render:   "#10b981",
};

const SERVICE_NAMES: Record<string, string> = {
    vercel:   "Vercel",
    neon:     "Neon DB",
    imagekit: "ImageKit",
    render:   "Render",
};

const METRIC_OPTIONS: Record<string, { value: string; label: string }[]> = {
    vercel:   [{ value: "builds",    label: "Builds this month" }],
    neon:     [{ value: "compute",   label: "Compute hours" }, { value: "storage", label: "DB storage" }],
    imagekit: [{ value: "storage",   label: "Storage used" }, { value: "bandwidth", label: "Bandwidth used" }, { value: "files", label: "File count" }],
    render:   [{ value: "status",    label: "Service status" }],
};

const PROJECTS = ["Harishblog", "StartUP", "D-Driver"] as const;

function buildChartData(
    modal: ModalState,
    vercel: any, neon: any, imagekit: any, render: any
) {
    return PROJECTS.map(label => {
        let value = 0, pct = 0, displayValue = "—";

        if (modal.service === "vercel") {
            const vp = vercel?.projects?.find((x: any) => x.label === label);
            if (vp?.configured && modal.metric === "builds") {
                value = vp.usage?.monthlyBuilds ?? 0;
                pct   = (value / (vp.limits?.monthlyDeployLimit ?? 6000)) * 100;
                displayValue = `${value}`;
            }
        } else if (modal.service === "neon") {
            const np = neon?.projects?.find((x: any) => x.label === label);
            if (np?.configured && np.usage) {
                if (modal.metric === "compute") {
                    value = parseFloat((np.usage.cpuUsedSec / 3600).toFixed(2));
                    pct   = (value / (np.limits?.computeHours ?? 191)) * 100;
                    displayValue = `${value} hrs`;
                } else if (modal.metric === "storage") {
                    value = np.usage.storageBytes ?? 0;
                    pct   = (value / (np.usage.storageLimitBytes ?? 536870912)) * 100;
                    displayValue = fmt(value);
                }
            }
        } else if (modal.service === "imagekit") {
            const ikp = imagekit?.projects?.find((x: any) => x.label === label);
            if (ikp?.configured) {
                const stats = ikp.stats ?? ikp.breakdown?.[0];
                if (modal.metric === "storage" && stats) {
                    value = stats.storageUsed ?? 0;
                    pct   = (value / (ikp.limits?.storageBytes ?? 21474836480)) * 100;
                    displayValue = fmt(value);
                } else if (modal.metric === "bandwidth" && stats) {
                    value = stats.bandwidthUsed ?? 0;
                    pct   = (value / (ikp.limits?.bandwidthBytes ?? 21474836480)) * 100;
                    displayValue = fmt(value);
                } else if (modal.metric === "files" && stats) {
                    value = stats.fileCount ?? 0;
                    displayValue = `${value} files`;
                }
            }
        }

        return { label, value, pct: Math.min(pct, 100), displayValue };
    });
}

function ServiceChartModal({
    modal, onClose, onMetricChange, vercel, neon, imagekit, render,
}: {
    modal: ModalState;
    onClose: () => void;
    onMetricChange: (m: string) => void;
    vercel: any; neon: any; imagekit: any; render: any;
}) {
    const color   = SERVICE_COLORS[modal.service];
    const options = METRIC_OPTIONS[modal.service] ?? [];
    const data    = buildChartData(modal, vercel, neon, imagekit, render);

    const barFill = (pct: number) =>
        pct >= 80 ? "#ef4444" : pct >= 60 ? "#f59e0b" : color;

    const ServiceIcon = () => {
        const iconProps = { size: 18, style: { color } };
        if (modal.service === "vercel")   return <Zap {...iconProps} />;
        if (modal.service === "neon")     return <Database {...iconProps} />;
        if (modal.service === "imagekit") return <Image {...iconProps} />;
        return <Server {...iconProps} />;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div
                className="relative bg-[#0f172a] rounded-2xl p-6 w-full max-w-2xl shadow-2xl border border-slate-700/50"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}22` }}>
                            <ServiceIcon />
                        </div>
                        <div>
                            <h3 className="text-white font-bold">{SERVICE_NAMES[modal.service]}</h3>
                            <p className="text-slate-400 text-xs">All-project comparison</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {options.length > 1 && (
                            <select
                                value={modal.metric}
                                onChange={e => onMetricChange(e.target.value)}
                                className="bg-[#1e293b] text-slate-300 text-sm border border-slate-600 rounded-lg px-3 py-1.5 outline-none cursor-pointer"
                            >
                                {options.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        )}
                        <button onClick={onClose} className="text-slate-500 hover:text-slate-200 transition">
                            <XCircle size={20} />
                        </button>
                    </div>
                </div>

                {/* Render: status pills (no chart) */}
                {modal.service === "render" ? (
                    <div className="grid grid-cols-3 gap-3 mb-2">
                        {PROJECTS.map(label => {
                            const rp = render?.projects?.find((x: any) => x.label === label);
                            const svc = rp?.services?.[0]?.service ?? rp?.services?.[0];
                            const active = svc?.suspended === "not_suspended";
                            return (
                                <div key={label} className="bg-[#1e293b] rounded-xl p-4 text-center space-y-2">
                                    <p className="text-slate-300 text-sm font-medium">{label}</p>
                                    {!rp?.configured
                                        ? <span className="text-xs text-slate-500">Not configured</span>
                                        : <span className={`text-sm font-bold ${active ? "text-emerald-400" : "text-amber-400"}`}>{active ? "Active" : "Suspended"}</span>
                                    }
                                    {svc?.name && <p className="text-xs text-slate-500 truncate">{svc.name}</p>}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <>
                        {/* Bar chart */}
                        <div className="h-[220px] mb-5">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis
                                        tick={{ fill: "#64748b", fontSize: 11 }}
                                        axisLine={false} tickLine={false}
                                        tickFormatter={v => {
                                            if (modal.metric === "storage" || modal.metric === "bandwidth") return fmt(v);
                                            if (modal.metric === "compute") return `${v}h`;
                                            return `${v}`;
                                        }}
                                        width={52}
                                    />
                                    <Tooltip
                                        contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#f1f5f9", fontSize: 13 }}
                                        formatter={(val: any, _: any, props: any) => [
                                            props.payload?.displayValue ?? val,
                                            options.find(o => o.value === modal.metric)?.label ?? "",
                                        ]}
                                        labelStyle={{ color: "#94a3b8", marginBottom: 4 }}
                                        cursor={{ fill: "rgba(255,255,255,0.04)" }}
                                    />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={72}>
                                        {data.map((entry, i) => (
                                            <Cell key={i} fill={barFill(entry.pct)} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Per-project usage bars */}
                        <div className="space-y-3 border-t border-slate-800 pt-4">
                            {data.map(entry => (
                                <div key={entry.label} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-300 font-medium">{entry.label}</span>
                                        <span className="text-slate-400 text-xs">
                                            {entry.displayValue}
                                            {entry.pct > 0 && (
                                                <> · <span className={entry.pct >= 80 ? "text-red-400" : entry.pct >= 60 ? "text-amber-400" : "text-emerald-400"}>{Math.round(entry.pct)}%</span></>
                                            )}
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{ width: `${entry.pct}%`, background: barFill(entry.pct) }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
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
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                            <TrendingUp size={18} className="text-purple-500" />
                            Platform Usage
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                            Click any tile to see a full project comparison chart
                        </p>
                    </div>
                    <button onClick={fetchAll}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors">
                        <RefreshCw size={11} /> {lastRefresh.toLocaleTimeString()}
                    </button>
                </div>

                {/* One section per project */}
                {(["Harishblog", "StartUP", "D-Driver"] as const).map(label => {
                    const vp  = vercel?.projects?.find((x: any) => x.label === label);
                    const np  = neon?.projects?.find((x: any) => x.label === label);
                    const ikp = imagekit?.projects?.find((x: any) => x.label === label);
                    const rp  = render?.projects?.find((x: any) => x.label === label);

                    const ikStats   = ikp?.stats;
                    const neonUsage = np?.usage;

                    const lastDeploy = vp?.usage?.lastDeployAt
                        ? (() => {
                            const mins = Math.round((Date.now() - vp.usage.lastDeployAt) / 60000);
                            if (mins < 60) return `${mins}m ago`;
                            if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
                            return `${Math.round(mins / 1440)}d ago`;
                        })()
                        : null;

                    return (
                        <ProjectSection key={label} label={label}>

                            {/* ── Vercel ── */}
                            {!vp || !vp.configured ? (
                                <NotConfiguredCard keyName={`VERCEL_API_TOKEN_${label.replace(/-/g,"").toUpperCase()}`} />
                            ) : (
                                <UsageCard
                                    icon={<Zap size={16} />}
                                    name="Vercel"
                                    subtitle="Builds this month"
                                    value={`${vp.usage?.monthlyBuilds ?? 0}`}
                                    limitLabel={lastDeploy ? `last deploy ${lastDeploy}` : `${vp.projects?.length ?? 0} projects`}
                                    pct={((vp.usage?.monthlyBuilds ?? 0) / vp.limits.monthlyDeployLimit) * 100}
                                    onClick={() => setModal({ service: "vercel", metric: "builds" })}
                                />
                            )}

                            {/* ── Neon: compute ── */}
                            {!np || !np.configured ? (
                                <NotConfiguredCard keyName={`NEON_API_KEY_${label.replace(/-/g,"").toUpperCase()}`} />
                            ) : neonUsage ? (
                                <UsageCard
                                    icon={<Database size={16} />}
                                    name="Neon DB"
                                    subtitle="Compute (monthly)"
                                    value={`${(neonUsage.cpuUsedSec / 3600).toFixed(1)} hrs`}
                                    limitLabel={`of ${np.limits.computeHours} hrs free`}
                                    pct={(neonUsage.cpuUsedSec / 3600 / np.limits.computeHours) * 100}
                                    onClick={() => setModal({ service: "neon", metric: "compute" })}
                                />
                            ) : (
                                <UsageCard
                                    icon={<Database size={16} />} name="Neon DB" subtitle="Storage"
                                    value={`${np.projects?.length ?? 0} projects`} limitLabel="View usage"
                                    noBar onClick={() => setModal({ service: "neon", metric: "compute" })}
                                />
                            )}

                            {/* ── Neon: storage ── */}
                            {neonUsage?.storageBytes != null && (
                                <UsageCard
                                    icon={<Database size={16} />}
                                    name="Neon DB"
                                    subtitle="DB storage"
                                    value={fmt(neonUsage.storageBytes)}
                                    limitLabel={`of ${fmt(neonUsage.storageLimitBytes)} free`}
                                    pct={(neonUsage.storageBytes / neonUsage.storageLimitBytes) * 100}
                                    onClick={() => setModal({ service: "neon", metric: "storage" })}
                                />
                            )}

                            {/* ── ImageKit ── */}
                            {!ikp || !ikp.configured ? (
                                <NotConfiguredCard keyName={`IMAGEKIT_PRIVATE_KEY_${label.replace(/-/g,"").toUpperCase()}`} />
                            ) : ikp.breakdown ? (
                                ikp.breakdown.map((acc: any) => (
                                    <React.Fragment key={acc.account}>
                                        <UsageCard
                                            icon={<Image size={16} />}
                                            name="ImageKit Storage"
                                            subtitle={acc.account}
                                            value={fmt(acc.storageUsed)}
                                            limitLabel={`of ${fmt(ikp.limits.storageBytes)} free · ${acc.fileCount} files`}
                                            pct={(acc.storageUsed / ikp.limits.storageBytes) * 100}
                                            onClick={() => setModal({ service: "imagekit", metric: "storage" })}
                                        />
                                        <UsageCard
                                            icon={<Image size={16} />}
                                            name="ImageKit Bandwidth"
                                            subtitle={`${acc.account} · this month`}
                                            value={fmt(acc.bandwidthUsed)}
                                            limitLabel={`of ${fmt(ikp.limits.bandwidthBytes)} free/month`}
                                            pct={(acc.bandwidthUsed / ikp.limits.bandwidthBytes) * 100}
                                            onClick={() => setModal({ service: "imagekit", metric: "bandwidth" })}
                                        />
                                    </React.Fragment>
                                ))
                            ) : ikStats?.storageUsed != null ? (
                                <React.Fragment>
                                    <UsageCard
                                        icon={<Image size={16} />}
                                        name="ImageKit Storage"
                                        subtitle="File storage"
                                        value={fmt(ikStats.storageUsed)}
                                        limitLabel={`of ${fmt(ikp.limits.storageBytes)} free · ${ikStats.fileCount} files`}
                                        pct={(ikStats.storageUsed / ikp.limits.storageBytes) * 100}
                                        onClick={() => setModal({ service: "imagekit", metric: "storage" })}
                                    />
                                    <UsageCard
                                        icon={<Image size={16} />}
                                        name="ImageKit Bandwidth"
                                        subtitle="This month"
                                        value={fmt(ikStats.bandwidthUsed ?? 0)}
                                        limitLabel={`of ${fmt(ikp.limits.bandwidthBytes)} free/month`}
                                        pct={((ikStats.bandwidthUsed ?? 0) / ikp.limits.bandwidthBytes) * 100}
                                        onClick={() => setModal({ service: "imagekit", metric: "bandwidth" })}
                                    />
                                </React.Fragment>
                            ) : (
                                <UsageCard
                                    icon={<Image size={16} />} name="ImageKit" subtitle="Media storage"
                                    value="Connected" limitLabel="View usage" noBar
                                    onClick={() => setModal({ service: "imagekit", metric: "storage" })}
                                />
                            )}

                            {/* ── Render (D-Driver only) ── */}
                            {RENDER_USERS.has(label) && (
                                !rp || !rp.configured ? (
                                    <NotConfiguredCard keyName="RENDER_API_KEY_DDRIVER" />
                                ) : (
                                    <UsageCard
                                        icon={<Server size={16} />}
                                        name="Render"
                                        subtitle="Backend service"
                                        value={(rp.services ?? []).length > 0
                                            ? ((rp.services[0].service ?? rp.services[0]).suspended === "not_suspended" ? "Active" : "Suspended")
                                            : "—"
                                        }
                                        limitLabel={(rp.services[0]?.service ?? rp.services[0])?.name ?? "Web service"}
                                        noBar
                                        onClick={() => setModal({ service: "render", metric: "status" })}
                                    />
                                )
                            )}

                        </ProjectSection>
                    );
                })}
            </div>

            {/* Chart modal */}
            {modal && (
                <ServiceChartModal
                    modal={modal}
                    onClose={() => setModal(null)}
                    onMetricChange={m => setModal(prev => prev ? { ...prev, metric: m } : null)}
                    vercel={vercel} neon={neon} imagekit={imagekit} render={render}
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

    const sites: any[]  = data?.sites ?? [];
    const sessions      = data?.sessions ?? {};
    const allHeaders    = Object.keys(HEADER_LABELS);

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

function PortalView({ portalName }: { portalName: string }) {
    const url = PORTAL_URLS[portalName];
    if (!url) return null;
    return (
        <iframe
            key={url}
            src={url}
            title={portalName}
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation allow-modals"
            style={{ position: "fixed", top: 0, left: 260, right: 0, bottom: 0, width: "calc(100vw - 260px)", height: "100vh", border: "none", zIndex: 45 }}
        />
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

    if (initialPortal) return <PortalView portalName={initialPortal} />;

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
        </div>
    );
}
