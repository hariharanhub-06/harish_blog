"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Database,
    ExternalLink,
    Globe,
    Image,
    Layers,
    Loader2,
    Monitor,
    RefreshCw,
    Server,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Terminal,
    Wifi,
    WifiOff,
    XCircle,
    Zap,
    TrendingUp,
    Package,
    BarChart3,
} from "lucide-react";

type SubTab = "usages" | "security" | "data";

function formatBytes(bytes: number): string {
    if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
}

const PROJECT_COLORS: Record<string, { bg: string; text: string; bar: string; border: string }> = {
    Harishblog: { bg: "bg-indigo-50 dark:bg-indigo-900/20", text: "text-indigo-700 dark:text-indigo-300", bar: "bg-indigo-500", border: "border-indigo-200 dark:border-indigo-800" },
    StartUP:    { bg: "bg-blue-50 dark:bg-blue-900/20",   text: "text-blue-700 dark:text-blue-300",   bar: "bg-blue-500",   border: "border-blue-200 dark:border-blue-800" },
    "D-Driver": { bg: "bg-sky-50 dark:bg-sky-900/20",     text: "text-sky-700 dark:text-sky-300",     bar: "bg-sky-500",    border: "border-sky-200 dark:border-sky-800" },
};

// Projects that actually use Render
const RENDER_USERS = new Set(["D-Driver"]);

function MetricBar({ used, limit, label, unit }: { used: number; limit: number; label: string; unit?: string }) {
    const pct = Math.min((used / limit) * 100, 100);
    const barColor = pct >= 80 ? "bg-red-500" : pct >= 60 ? "bg-amber-400" : "bg-emerald-500";
    const textColor = pct >= 80 ? "text-red-600 dark:text-red-400" : pct >= 60 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400";
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-baseline">
                <span className="text-[11px] text-gray-500 dark:text-gray-400">{label}</span>
                <span className={`text-xs font-bold tabular-nums ${textColor}`}>{Math.round(pct)}%</span>
            </div>
            <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }} />
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 tabular-nums">
                {unit === "bytes" ? `${formatBytes(used)} / ${formatBytes(limit)}` : `${used.toLocaleString()} / ${limit.toLocaleString()}`}
            </p>
        </div>
    );
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
    return (
        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
        </div>
    );
}

function ProjectColumn({ project, children }: { project: string; children: React.ReactNode }) {
    const c = PROJECT_COLORS[project] ?? PROJECT_COLORS["Harishblog"];
    return (
        <div className="space-y-3">
            <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full ${c.bg} ${c.text}`}>
                {project}
            </span>
            {children}
        </div>
    );
}

function NotUsed() {
    return <p className="text-[12px] text-gray-400 dark:text-gray-500 italic pt-1">Not used for this project</p>;
}

function NotConfigured({ keyName }: { keyName: string }) {
    return (
        <div className="text-[11px] text-amber-600 dark:text-amber-400 space-y-0.5 pt-1">
            <p className="font-medium">API key not configured</p>
            <code className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[10px] text-gray-600 dark:text-gray-300">{keyName}</code>
        </div>
    );
}

function ServiceRow({
    icon, name, color, link, loading, timestamp, children,
}: {
    icon: React.ReactNode; name: string; color: string; link: string;
    loading: boolean; timestamp?: string; children?: React.ReactNode;
}) {
    return (
        <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white shadow-sm`}>{icon}</div>
                    <div>
                        <p className="font-bold text-base">{name}</p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">
                            Free Tier
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {timestamp && (
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Clock size={9} /> {new Date(timestamp).toLocaleTimeString()}
                        </span>
                    )}
                    <a href={link} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                        <ExternalLink size={13} />
                    </a>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
                    <Loader2 size={14} className="animate-spin" /> Loading…
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-0 divide-x divide-gray-100 dark:divide-gray-800">
                    {children}
                </div>
            )}
        </div>
    );
}

// ─── Usages Tab ──────────────────────────────────────────────────────────────

function UsagesTab({ sessionId }: { sessionId: string }) {
    const [vercel, setVercel]   = useState<any>(null);
    const [neon, setNeon]       = useState<any>(null);
    const [imagekit, setIK]     = useState<any>(null);
    const [render, setRender]   = useState<any>(null);
    const [loading, setLoading] = useState({ vercel: true, neon: true, imagekit: true, render: true });
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const h = { "X-Session-Id": sessionId };

    const fetchAll = useCallback(async () => {
        setLoading({ vercel: true, neon: true, imagekit: true, render: true });
        const [v, n, ik, r] = await Promise.allSettled([
            fetch("/api/admin/hub/vercel-usage",  { headers: h }).then((x) => x.json()),
            fetch("/api/admin/hub/neon-usage",    { headers: h }).then((x) => x.json()),
            fetch("/api/admin/hub/imagekit-usage",{ headers: h }).then((x) => x.json()),
            fetch("/api/admin/hub/render-usage",  { headers: h }).then((x) => x.json()),
        ]);
        setVercel(v.status === "fulfilled" ? v.value : null);
        setNeon(n.status === "fulfilled" ? n.value : null);
        setIK(ik.status === "fulfilled" ? ik.value : null);
        setRender(r.status === "fulfilled" ? r.value : null);
        setLoading({ vercel: false, neon: false, imagekit: false, render: false });
        setLastRefresh(new Date());
    }, [sessionId]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // Summary stats
    const readyDeployments = (vercel?.projects ?? []).reduce((acc: number, p: any) =>
        acc + (p.recentDeployments ?? []).filter((d: any) => d.readyState === "READY").length, 0);
    const totalProjects = (vercel?.projects ?? []).reduce((acc: number, p: any) =>
        acc + (p.projects?.length ?? 0), 0);

    return (
        <div className="space-y-5">
            {/* Header row */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <BarChart3 size={15} className="text-purple-500" />
                    Integration Usage — All Projects
                </h3>
                <button onClick={fetchAll}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                    <RefreshCw size={11} /> {lastRefresh.toLocaleTimeString()}
                </button>
            </div>

            {/* Summary stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard label="Services Monitored" value="4" sub="Vercel · Neon · ImageKit · Render" color="text-purple-600 dark:text-purple-400" />
                <StatCard label="Projects" value="3" sub="Harishblog · StartUP · D-Driver" color="text-blue-600 dark:text-blue-400" />
                <StatCard label="Vercel Deployments" value={readyDeployments > 0 ? readyDeployments : "—"} sub="READY status" color="text-emerald-600 dark:text-emerald-400" />
                <StatCard label="Plan" value="Free" sub="All services on free tier" color="text-amber-600 dark:text-amber-400" />
            </div>

            {/* ── Vercel ── */}
            <ServiceRow icon={<Zap size={18} />} name="Vercel" color="bg-gray-900"
                link="https://vercel.com/dashboard" loading={loading.vercel} timestamp={vercel?.timestamp}>
                {(["Harishblog", "StartUP", "D-Driver"] as const).map((label, i) => {
                    const p = (vercel?.projects ?? []).find((x: any) => x.label === label);
                    return (
                        <div key={label} className={`px-5 ${i === 0 ? "pl-0" : ""} ${i === 2 ? "pr-0" : ""}`}>
                            <ProjectColumn project={label}>
                                {!p ? <NotConfigured keyName={`VERCEL_API_TOKEN_${label.toUpperCase().replace(/-/g,"")}`} /> :
                                 !p.configured ? <NotConfigured keyName={`VERCEL_API_TOKEN_${label.toUpperCase().replace(/-/g,"")}`} /> : (
                                    <div className="space-y-2">
                                        {label === "D-Driver" && (
                                            <p className="text-[10px] text-gray-400 italic">Same account as Harishblog</p>
                                        )}
                                        <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                                            {p.projects?.length ?? 0} project(s)
                                        </p>
                                        <div className="space-y-1.5">
                                            {(p.recentDeployments ?? []).slice(0, 3).map((d: any, di: number) => (
                                                <div key={di} className="flex items-center justify-between gap-2">
                                                    <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-[100px]">
                                                        {d.name ?? d.url ?? "deploy"}
                                                    </span>
                                                    <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                                        d.readyState === "READY"
                                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                            : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                                                    }`}>
                                                        {d.readyState ?? "—"}
                                                    </span>
                                                </div>
                                            ))}
                                            {(p.recentDeployments ?? []).length === 0 && (
                                                <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer"
                                                    className="text-[11px] text-blue-500 hover:underline flex items-center gap-1">
                                                    View dashboard <ExternalLink size={9} />
                                                </a>
                                            )}
                                        </div>
                                        {p.usage?.bandwidth && (
                                            <MetricBar used={p.usage.bandwidth.used ?? 0} limit={p.limits?.bandwidth ?? 1}
                                                label="Bandwidth" unit="bytes" />
                                        )}
                                    </div>
                                )}
                            </ProjectColumn>
                        </div>
                    );
                })}
            </ServiceRow>

            {/* ── Neon ── */}
            <ServiceRow icon={<Database size={18} />} name="Neon (PostgreSQL)" color="bg-teal-600"
                link="https://console.neon.tech" loading={loading.neon} timestamp={neon?.timestamp}>
                {(["Harishblog", "StartUP", "D-Driver"] as const).map((label, i) => {
                    const p = (neon?.projects ?? []).find((x: any) => x.label === label);
                    const period = p?.consumption?.periods?.[0];
                    const limits = p?.limits;
                    return (
                        <div key={label} className={`px-5 ${i === 0 ? "pl-0" : ""} ${i === 2 ? "pr-0" : ""}`}>
                            <ProjectColumn project={label}>
                                {!p || !p.configured ? (
                                    <NotConfigured keyName={`NEON_API_KEY_${label.toUpperCase().replace(/-/g,"")}`} />
                                ) : (
                                    <div className="space-y-2">
                                        {label === "D-Driver" && (
                                            <p className="text-[10px] text-gray-400 italic">Same account as Harishblog</p>
                                        )}
                                        <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                                            {p.projects?.length ?? 0} DB project(s)
                                        </p>
                                        {period ? (
                                            <div className="space-y-3">
                                                {period.active_time_seconds != null && (
                                                    <MetricBar
                                                        used={parseFloat((period.active_time_seconds / 3600).toFixed(2))}
                                                        limit={limits?.computeHours ?? 191.9}
                                                        label="Compute hours"
                                                    />
                                                )}
                                                {period.data_storage_bytes_hour != null && (
                                                    <MetricBar
                                                        used={period.data_storage_bytes_hour}
                                                        limit={limits?.storageBytes ?? 1}
                                                        label="Storage"
                                                        unit="bytes"
                                                    />
                                                )}
                                                {period.data_transfer_bytes != null && (
                                                    <MetricBar
                                                        used={period.data_transfer_bytes}
                                                        limit={limits?.dataTransferBytes ?? 1}
                                                        label="Data transfer"
                                                        unit="bytes"
                                                    />
                                                )}
                                            </div>
                                        ) : (
                                            <a href="https://console.neon.tech" target="_blank" rel="noopener noreferrer"
                                                className="text-[11px] text-blue-500 hover:underline flex items-center gap-1">
                                                View console <ExternalLink size={9} />
                                            </a>
                                        )}
                                    </div>
                                )}
                            </ProjectColumn>
                        </div>
                    );
                })}
            </ServiceRow>

            {/* ── ImageKit ── */}
            <ServiceRow icon={<Image size={18} />} name="ImageKit" color="bg-violet-600"
                link="https://imagekit.io/dashboard" loading={loading.imagekit} timestamp={imagekit?.timestamp}>
                {(["Harishblog", "StartUP", "D-Driver"] as const).map((label, i) => {
                    const p = (imagekit?.projects ?? []).find((x: any) => x.label === label);
                    const stats = p?.stats;
                    const limits = p?.limits;
                    return (
                        <div key={label} className={`px-5 ${i === 0 ? "pl-0" : ""} ${i === 2 ? "pr-0" : ""}`}>
                            <ProjectColumn project={label}>
                                {!p || !p.configured ? (
                                    <NotConfigured keyName={`IMAGEKIT_PRIVATE_KEY_${label.toUpperCase().replace(/-/g,"")}`} />
                                ) : stats ? (
                                    <div className="space-y-3">
                                        {stats.bandwidth != null && (
                                            <MetricBar used={stats.bandwidth} limit={limits?.bandwidthBytes ?? 1}
                                                label="Bandwidth" unit="bytes" />
                                        )}
                                        {stats.storageUsed != null && (
                                            <MetricBar used={stats.storageUsed} limit={limits?.storageBytes ?? 1}
                                                label="Storage" unit="bytes" />
                                        )}
                                        {stats.requests != null && (
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                Requests: <span className="font-semibold text-gray-700 dark:text-gray-200">{stats.requests.toLocaleString()}</span>
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <a href="https://imagekit.io/dashboard" target="_blank" rel="noopener noreferrer"
                                        className="text-[11px] text-blue-500 hover:underline flex items-center gap-1">
                                        View dashboard <ExternalLink size={9} />
                                    </a>
                                )}
                            </ProjectColumn>
                        </div>
                    );
                })}
            </ServiceRow>

            {/* ── Render ── */}
            <ServiceRow icon={<Server size={18} />} name="Render" color="bg-sky-600"
                link="https://dashboard.render.com" loading={loading.render} timestamp={render?.timestamp}>
                {(["Harishblog", "StartUP", "D-Driver"] as const).map((label, i) => {
                    const p = (render?.projects ?? []).find((x: any) => x.label === label);
                    return (
                        <div key={label} className={`px-5 ${i === 0 ? "pl-0" : ""} ${i === 2 ? "pr-0" : ""}`}>
                            <ProjectColumn project={label}>
                                {!RENDER_USERS.has(label) ? (
                                    <NotUsed />
                                ) : !p || !p.configured ? (
                                    <NotConfigured keyName="RENDER_API_KEY_DDRIVER" />
                                ) : (
                                    <div className="space-y-1.5">
                                        {(p.services ?? []).length === 0 ? (
                                            <a href="https://dashboard.render.com" target="_blank" rel="noopener noreferrer"
                                                className="text-[11px] text-blue-500 hover:underline flex items-center gap-1">
                                                View dashboard <ExternalLink size={9} />
                                            </a>
                                        ) : (p.services ?? []).map((svc: any, si: number) => {
                                            const s = svc.service ?? svc;
                                            const active = s.suspended === "not_suspended";
                                            return (
                                                <div key={si} className="space-y-1">
                                                    <p className="text-[11px] font-medium text-gray-700 dark:text-gray-200 truncate">{s.name}</p>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-amber-500"}`} />
                                                        <span className={`text-[11px] font-semibold ${active ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                                                            {active ? "Active" : "Suspended"}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400">{s.type}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </ProjectColumn>
                        </div>
                    );
                })}
            </ServiceRow>
        </div>
    );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────

const HEADER_LABELS: Record<string, string> = {
    "strict-transport-security": "HSTS",
    "x-content-type-options": "X-Content-Type",
    "x-frame-options": "X-Frame",
    "content-security-policy": "CSP",
};

function SecurityTab({ sessionId }: { sessionId: string }) {
    const [data, setData] = useState<any>(null);
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
    const sessions = data?.sessions ?? {};
    const allHeaders = Object.keys(HEADER_LABELS);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">Security health across all three production sites</p>
                <button onClick={fetchData} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                    <RefreshCw size={11} /> {lastRefresh.toLocaleTimeString()}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sites.map((site) => (
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
                            {allHeaders.map((h) => (
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

// ─── Data Tab ─────────────────────────────────────────────────────────────────

const PORTALS = [
    { name: "StartUP Men's Wear", subtitle: "Admin Portal",       url: "https://www.startupmenswear.in/admin", color: "bg-blue-600", icon: <Layers size={16} /> },
    { name: "D-Driver",           subtitle: "Super Admin Portal", url: "https://d-driver.vercel.app/login",    color: "bg-sky-600",  icon: <Terminal size={16} /> },
];

function DataTab() {
    const [blocked, setBlocked] = useState<Record<string, boolean>>({});
    return (
        <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Direct access — already authenticated here, no extra login needed</p>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {PORTALS.map((portal) => (
                    <div key={portal.name} className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className={`w-7 h-7 rounded-lg ${portal.color} flex items-center justify-center text-white`}>{portal.icon}</div>
                                <div><p className="font-semibold text-sm">{portal.name}</p><p className="text-[11px] text-gray-400">{portal.subtitle}</p></div>
                            </div>
                            <a href={portal.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition-colors">Open <ExternalLink size={11} /></a>
                        </div>
                        {blocked[portal.name] ? (
                            <div className="h-[520px] flex flex-col items-center justify-center gap-3 text-center px-6">
                                <WifiOff size={24} className="text-gray-300 dark:text-gray-600" />
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Cannot embed this page</p>
                                <p className="text-xs text-gray-400 max-w-xs">CSP header hasn&apos;t deployed yet for {portal.name}. Try again after that deploy finishes.</p>
                                <a href={portal.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors">Open in new tab <ExternalLink size={12} /></a>
                            </div>
                        ) : (
                            <iframe src={portal.url} className="w-full h-[520px] border-0" title={`${portal.name} Login`}
                                sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
                                onError={() => setBlocked((p) => ({ ...p, [portal.name]: true }))} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Main Module ─────────────────────────────────────────────────────────────

const SUB_TABS: { id: SubTab; label: string; icon: React.ReactNode }[] = [
    { id: "usages",   label: "Usages",   icon: <Activity size={14} /> },
    { id: "security", label: "Security", icon: <ShieldAlert size={14} /> },
    { id: "data",     label: "Data",     icon: <Globe size={14} /> },
];

export default function PlatformHubModule() {
    const [activeSubTab, setActiveSubTab] = useState<SubTab>("usages");
    const sessionId = typeof window !== "undefined" ? localStorage.getItem("admin_sessionId") ?? "" : "";

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Globe size={20} className="text-purple-600" /> Platform Hub
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Unified analytics — usage, security &amp; portal access across all three projects
                    </p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-gray-400">
                    <Wifi size={11} className="text-emerald-500" />
                    hariharanhub.com · startupmenswear.in · d-driver.vercel.app
                </div>
            </div>

            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl w-fit">
                {SUB_TABS.map((tab) => (
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
            {activeSubTab === "data"     && <DataTab />}
        </div>
    );
}
