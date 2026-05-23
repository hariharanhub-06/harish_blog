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
} from "lucide-react";

type SubTab = "usages" | "security" | "data";

function formatBytes(bytes: number): string {
    if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
}

const PROJECT_COLORS: Record<string, string> = {
    Harishblog: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    StartUP: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    "D-Driver": "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
};

function UsageBar({ used, limit, label }: { used: number; limit: number; label: string }) {
    const pct = Math.min((used / limit) * 100, 100);
    const color = pct >= 80 ? "bg-red-500" : pct >= 60 ? "bg-amber-500" : "bg-emerald-500";
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400">
                <span>{label}</span>
                <span className={pct >= 80 ? "text-red-500 font-medium" : pct >= 60 ? "text-amber-500 font-medium" : ""}>
                    {Math.round(pct)}%
                </span>
            </div>
            <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

function ProjectBadge({ label }: { label: string }) {
    return (
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${PROJECT_COLORS[label] ?? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"}`}>
            {label}
        </span>
    );
}

function ServiceCard({
    icon,
    name,
    color,
    link,
    loading,
    children,
}: {
    icon: React.ReactNode;
    name: string;
    color: string;
    link: string;
    loading: boolean;
    children?: React.ReactNode;
}) {
    return (
        <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center text-white`}>
                        {icon}
                    </div>
                    <div>
                        <p className="font-semibold text-sm">{name}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Free Tier
                        </span>
                    </div>
                </div>
                <a href={link} target="_blank" rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    <ExternalLink size={14} />
                </a>
            </div>
            {loading ? (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Fetching…</span>
                </div>
            ) : children}
        </div>
    );
}

function ProjectRow({ project, renderMetrics }: { project: any; renderMetrics: (p: any) => React.ReactNode }) {
    if (!project.configured) {
        return (
            <div className="flex items-start justify-between gap-3 py-2 border-t border-gray-100 dark:border-gray-800 first:border-0">
                <ProjectBadge label={project.label} />
                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                    Not configured — add <code className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded text-[10px]">
                        {project.label.toUpperCase().replace(/-/g, "").replace(/\s/g, "_")}_KEY
                    </code>
                </p>
            </div>
        );
    }
    if (project.error) {
        return (
            <div className="flex items-start justify-between gap-3 py-2 border-t border-gray-100 dark:border-gray-800 first:border-0">
                <ProjectBadge label={project.label} />
                <p className="text-[11px] text-red-500">{project.error}</p>
            </div>
        );
    }
    return (
        <div className="space-y-2 py-2 border-t border-gray-100 dark:border-gray-800 first:border-0">
            <ProjectBadge label={project.label} />
            {renderMetrics(project)}
        </div>
    );
}

// ─── Usages Tab ──────────────────────────────────────────────────────────────

function UsagesTab({ sessionId }: { sessionId: string }) {
    const [vercel, setVercel] = useState<any>(null);
    const [neon, setNeon] = useState<any>(null);
    const [imagekit, setImagekit] = useState<any>(null);
    const [render, setRender] = useState<any>(null);
    const [loading, setLoading] = useState({ vercel: true, neon: true, imagekit: true, render: true });
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const h = { "X-Session-Id": sessionId };

    const fetchAll = useCallback(async () => {
        setLoading({ vercel: true, neon: true, imagekit: true, render: true });
        const [v, n, ik, r] = await Promise.allSettled([
            fetch("/api/admin/hub/vercel-usage", { headers: h }).then((x) => x.json()),
            fetch("/api/admin/hub/neon-usage", { headers: h }).then((x) => x.json()),
            fetch("/api/admin/hub/imagekit-usage", { headers: h }).then((x) => x.json()),
            fetch("/api/admin/hub/render-usage", { headers: h }).then((x) => x.json()),
        ]);
        setVercel(v.status === "fulfilled" ? v.value : null);
        setNeon(n.status === "fulfilled" ? n.value : null);
        setImagekit(ik.status === "fulfilled" ? ik.value : null);
        setRender(r.status === "fulfilled" ? r.value : null);
        setLoading({ vercel: false, neon: false, imagekit: false, render: false });
        setLastRefresh(new Date());
    }, [sessionId]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Each project has its own separate account per service
                </p>
                <button onClick={fetchAll}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                    <RefreshCw size={12} />
                    Refresh · {lastRefresh.toLocaleTimeString()}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Vercel */}
                <ServiceCard icon={<Zap size={16} />} name="Vercel" color="bg-gray-900 dark:bg-gray-700"
                    link="https://vercel.com/dashboard" loading={loading.vercel}>
                    {(vercel?.projects ?? []).map((p: any) => (
                        <ProjectRow key={p.label} project={p} renderMetrics={(proj) => {
                            const usage = proj.usage;
                            const limits = proj.limits;
                            return (
                                <div className="space-y-1.5 pl-1">
                                    {usage?.bandwidth ? (
                                        <UsageBar
                                            used={usage.bandwidth.used ?? 0}
                                            limit={limits.bandwidth}
                                            label={`Bandwidth · ${formatBytes(usage.bandwidth.used ?? 0)} / ${formatBytes(limits.bandwidth)}`}
                                        />
                                    ) : null}
                                    {usage?.buildMinutes ? (
                                        <UsageBar
                                            used={usage.buildMinutes.used ?? 0}
                                            limit={limits.buildMinutes}
                                            label={`Build min · ${usage.buildMinutes.used ?? 0} / ${limits.buildMinutes}`}
                                        />
                                    ) : null}
                                    {!usage && (
                                        <div className="space-y-1">
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                {proj.projects?.length ?? 0} project(s)
                                            </p>
                                            {(proj.recentDeployments ?? []).slice(0, 2).map((d: any, i: number) => (
                                                <div key={i} className="flex justify-between text-[11px]">
                                                    <span className="text-gray-600 dark:text-gray-300 truncate max-w-[160px]">{d.name ?? d.url ?? "deploy"}</span>
                                                    <span className={`px-1.5 rounded text-[10px] ${d.readyState === "READY" ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"}`}>
                                                        {d.readyState ?? d.state ?? "—"}
                                                    </span>
                                                </div>
                                            ))}
                                            <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer"
                                                className="text-[11px] text-blue-500 hover:underline flex items-center gap-1">
                                                Full stats on Vercel <ExternalLink size={9} />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            );
                        }} />
                    ))}
                    {vercel?.timestamp && (
                        <p className="text-[10px] text-gray-400 flex items-center gap-1 pt-1">
                            <Clock size={9} /> {new Date(vercel.timestamp).toLocaleTimeString()}
                        </p>
                    )}
                </ServiceCard>

                {/* Neon */}
                <ServiceCard icon={<Database size={16} />} name="Neon (PostgreSQL)" color="bg-teal-600"
                    link="https://console.neon.tech" loading={loading.neon}>
                    {(neon?.projects ?? []).map((p: any) => (
                        <ProjectRow key={p.label} project={p} renderMetrics={(proj) => {
                            const period = proj.consumption?.periods?.[0];
                            const limits = proj.limits;
                            return (
                                <div className="space-y-1.5 pl-1">
                                    {period?.active_time_seconds != null ? (
                                        <UsageBar
                                            used={period.active_time_seconds / 3600}
                                            limit={limits.computeHours}
                                            label={`Compute · ${(period.active_time_seconds / 3600).toFixed(1)}h / ${limits.computeHours}h`}
                                        />
                                    ) : null}
                                    {period?.data_storage_bytes_hour != null ? (
                                        <UsageBar
                                            used={period.data_storage_bytes_hour}
                                            limit={limits.storageBytes}
                                            label={`Storage · ${formatBytes(period.data_storage_bytes_hour)} / ${formatBytes(limits.storageBytes)}`}
                                        />
                                    ) : null}
                                    {period?.data_transfer_bytes != null ? (
                                        <UsageBar
                                            used={period.data_transfer_bytes}
                                            limit={limits.dataTransferBytes}
                                            label={`Transfer · ${formatBytes(period.data_transfer_bytes)} / ${formatBytes(limits.dataTransferBytes)}`}
                                        />
                                    ) : null}
                                    {!period && (
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                            {proj.projects?.length ?? 0} project(s) ·{" "}
                                            <a href="https://console.neon.tech" target="_blank" rel="noopener noreferrer"
                                                className="text-blue-500 hover:underline">View console</a>
                                        </p>
                                    )}
                                </div>
                            );
                        }} />
                    ))}
                    {neon?.timestamp && (
                        <p className="text-[10px] text-gray-400 flex items-center gap-1 pt-1">
                            <Clock size={9} /> {new Date(neon.timestamp).toLocaleTimeString()}
                        </p>
                    )}
                </ServiceCard>

                {/* ImageKit */}
                <ServiceCard icon={<Image size={16} />} name="ImageKit" color="bg-violet-600"
                    link="https://imagekit.io/dashboard" loading={loading.imagekit}>
                    {(imagekit?.projects ?? []).map((p: any) => (
                        <ProjectRow key={p.label} project={p} renderMetrics={(proj) => {
                            const stats = proj.stats;
                            const limits = proj.limits;
                            return (
                                <div className="space-y-1.5 pl-1">
                                    {stats?.bandwidth != null ? (
                                        <UsageBar
                                            used={stats.bandwidth}
                                            limit={limits.bandwidthBytes}
                                            label={`Bandwidth · ${formatBytes(stats.bandwidth)} / ${formatBytes(limits.bandwidthBytes)}`}
                                        />
                                    ) : null}
                                    {stats?.storageUsed != null ? (
                                        <UsageBar
                                            used={stats.storageUsed}
                                            limit={limits.storageBytes}
                                            label={`Storage · ${formatBytes(stats.storageUsed)} / ${formatBytes(limits.storageBytes)}`}
                                        />
                                    ) : null}
                                    {!stats?.bandwidth && !stats?.storageUsed && (
                                        <a href="https://imagekit.io/dashboard" target="_blank" rel="noopener noreferrer"
                                            className="text-[11px] text-blue-500 hover:underline flex items-center gap-1">
                                            View dashboard <ExternalLink size={9} />
                                        </a>
                                    )}
                                </div>
                            );
                        }} />
                    ))}
                    {imagekit?.timestamp && (
                        <p className="text-[10px] text-gray-400 flex items-center gap-1 pt-1">
                            <Clock size={9} /> {new Date(imagekit.timestamp).toLocaleTimeString()}
                        </p>
                    )}
                </ServiceCard>

                {/* Render */}
                <ServiceCard icon={<Server size={16} />} name="Render" color="bg-sky-600"
                    link="https://dashboard.render.com" loading={loading.render}>
                    {(render?.projects ?? []).map((p: any) => (
                        <ProjectRow key={p.label} project={p} renderMetrics={(proj) => (
                            <div className="space-y-1 pl-1">
                                {(proj.services ?? []).map((svc: any, i: number) => {
                                    const s = svc.service ?? svc;
                                    return (
                                        <div key={i} className="flex justify-between text-[11px]">
                                            <span className="text-gray-600 dark:text-gray-300 truncate max-w-[160px]">{s.name}</span>
                                            <span className={`px-1.5 rounded text-[10px] ${
                                                s.suspended === "not_suspended"
                                                    ? "text-emerald-600 dark:text-emerald-400"
                                                    : "text-amber-500"
                                            }`}>
                                                {s.suspended === "not_suspended" ? "Active" : "Suspended"}
                                            </span>
                                        </div>
                                    );
                                })}
                                {(!proj.services || proj.services.length === 0) && (
                                    <a href="https://dashboard.render.com" target="_blank" rel="noopener noreferrer"
                                        className="text-[11px] text-blue-500 hover:underline flex items-center gap-1">
                                        View dashboard <ExternalLink size={9} />
                                    </a>
                                )}
                            </div>
                        )} />
                    ))}
                    {render?.timestamp && (
                        <p className="text-[10px] text-gray-400 flex items-center gap-1 pt-1">
                            <Clock size={9} /> {new Date(render.timestamp).toLocaleTimeString()}
                        </p>
                    )}
                </ServiceCard>
            </div>
        </div>
    );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────

const SECURITY_HEADERS_LABELS: Record<string, string> = {
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
            const res = await fetch("/api/admin/hub/security-overview", {
                headers: { "X-Session-Id": sessionId },
            });
            setData(await res.json());
        } catch {
            setData({ error: "Request failed" });
        } finally {
            setLoading(false);
            setLastRefresh(new Date());
        }
    }, [sessionId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-sm text-gray-400 py-12 justify-center">
                <Loader2 size={16} className="animate-spin" /> Checking all three sites…
            </div>
        );
    }

    const sites: any[] = data?.sites ?? [];
    const sessions = data?.sessions ?? {};
    const allHeaders = Object.keys(SECURITY_HEADERS_LABELS);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">Security health across all three production sites</p>
                <button onClick={fetchData}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                    <RefreshCw size={12} /> Refresh · {lastRefresh.toLocaleTimeString()}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sites.map((site) => (
                    <div key={site.name} className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {site.ok ? (
                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                ) : (
                                    <XCircle size={16} className="text-red-500" />
                                )}
                                <span className="font-medium text-sm">{site.name}</span>
                            </div>
                            <a href={site.url} target="_blank" rel="noopener noreferrer"
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <ExternalLink size={12} />
                            </a>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500 dark:text-gray-400">
                            <span className={`px-2 py-0.5 rounded-full font-mono text-[11px] ${
                                site.status >= 200 && site.status < 300
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    : site.status === 0
                                    ? "bg-gray-100 text-gray-500 dark:bg-gray-800"
                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}>
                                {site.status === 0 ? "Timeout" : `HTTP ${site.status}`}
                            </span>
                            <span className="flex items-center gap-0.5">
                                <Activity size={10} /> {site.responseTime}ms
                            </span>
                            {site.https && (
                                <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                                    <Shield size={10} /> HTTPS
                                </span>
                            )}
                        </div>

                        <div className="space-y-1">
                            {allHeaders.map((h) => (
                                <div key={h} className="flex items-center justify-between text-[11px]">
                                    <span className="text-gray-500 dark:text-gray-400">{SECURITY_HEADERS_LABELS[h]}</span>
                                    {site.headers[h] ? (
                                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                            <CheckCircle2 size={10} /> Present
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-amber-500">
                                            <AlertTriangle size={10} /> Missing
                                        </span>
                                    )}
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
                <div className="flex gap-6">
                    <div>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{sessions.active ?? 0}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Active (last 30 min)</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">{sessions.total ?? 0}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total sessions</p>
                    </div>
                </div>
                <div className="space-y-2">
                    {(sessions.recent ?? []).map((s: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-2">
                                <Monitor size={12} className="text-gray-400" />
                                <span>{s.deviceName ?? "Unknown device"}</span>
                                <span className="text-gray-400">·</span>
                                <span className="text-gray-400">{s.browser}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                                {s.ipAddress && <span className="font-mono text-[10px]">{s.ipAddress}</span>}
                                <Clock size={10} />
                                <span>{new Date(s.lastActive).toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg px-3 py-2">
                    <ShieldCheck size={12} />
                    <span>No breach attempts detected · All sessions nominal</span>
                </div>
            </div>
        </div>
    );
}

// ─── Data Tab ─────────────────────────────────────────────────────────────────

const PORTALS = [
    {
        name: "StartUP Men's Wear",
        subtitle: "Admin Portal",
        url: "https://www.startupmenswear.in/admin/login",
        color: "bg-blue-600",
        icon: <Layers size={16} />,
    },
    {
        name: "D-Driver",
        subtitle: "Super Admin Portal",
        url: "https://d-driver.vercel.app/login",
        color: "bg-sky-600",
        icon: <Terminal size={16} />,
    },
];

function DataTab() {
    const [blocked, setBlocked] = useState<Record<string, boolean>>({});

    return (
        <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Direct access to other project portals — already authenticated here, no extra password needed
            </p>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {PORTALS.map((portal) => (
                    <div key={portal.name} className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className={`w-7 h-7 rounded-lg ${portal.color} flex items-center justify-center text-white`}>
                                    {portal.icon}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{portal.name}</p>
                                    <p className="text-[11px] text-gray-400">{portal.subtitle}</p>
                                </div>
                            </div>
                            <a href={portal.url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                                Open <ExternalLink size={11} />
                            </a>
                        </div>
                        {blocked[portal.name] ? (
                            <div className="h-[520px] flex flex-col items-center justify-center gap-3 text-center px-6">
                                <WifiOff size={24} className="text-gray-300 dark:text-gray-600" />
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Cannot embed this page</p>
                                <p className="text-xs text-gray-400 max-w-xs">
                                    The CSP header change hasn&apos;t been deployed yet for {portal.name}. Deploy that project first, then come back.
                                </p>
                                <a href={portal.url} target="_blank" rel="noopener noreferrer"
                                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors">
                                    Open in new tab <ExternalLink size={12} />
                                </a>
                            </div>
                        ) : (
                            <iframe
                                src={portal.url}
                                className="w-full h-[520px] border-0"
                                title={`${portal.name} Login`}
                                sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
                                onError={() => setBlocked((p) => ({ ...p, [portal.name]: true }))}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Main Module ─────────────────────────────────────────────────────────────

const SUB_TABS: { id: SubTab; label: string; icon: React.ReactNode }[] = [
    { id: "usages", label: "Usages", icon: <Activity size={14} /> },
    { id: "security", label: "Security", icon: <ShieldAlert size={14} /> },
    { id: "data", label: "Data", icon: <Globe size={14} /> },
];

export default function PlatformHubModule() {
    const [activeSubTab, setActiveSubTab] = useState<SubTab>("usages");
    const sessionId = typeof window !== "undefined" ? localStorage.getItem("admin_sessionId") ?? "" : "";

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Globe size={20} className="text-purple-600" />
                        Platform Hub
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Unified view — usage, security &amp; portal access across all three projects
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
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeSubTab === "usages" && <UsagesTab sessionId={sessionId} />}
            {activeSubTab === "security" && <SecurityTab sessionId={sessionId} />}
            {activeSubTab === "data" && <DataTab />}
        </div>
    );
}
