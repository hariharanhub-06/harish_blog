"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Activity, AlertTriangle, CheckCircle2, ChevronDown, Clock, Database,
    ExternalLink, Globe, Image, Layers, Loader2, Monitor,
    RefreshCw, Server, Shield, ShieldAlert, ShieldCheck,
    Terminal, TrendingUp, Wifi, WifiOff, XCircle, Zap,
} from "lucide-react";

type SubTab = "usages" | "security";

function fmt(bytes: number) {
    if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
    if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
    if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(0)} KB`;
    return `${bytes} B`;
}

// ─── Usage Card (matches D-Driver Platform Expenses style) ───────────────────

function UsageCard({
    icon, name, subtitle, value, limitLabel, pct, noBar,
}: {
    icon: React.ReactNode;
    name: string;
    subtitle: string;
    value: string;
    limitLabel?: string;
    pct?: number;
    noBar?: boolean;
}) {
    const barColor =
        (pct ?? 0) >= 80 ? "bg-red-500" :
        (pct ?? 0) >= 60 ? "bg-amber-400" : "bg-emerald-500";

    return (
        <div className="bg-[#0f172a] rounded-2xl p-5 space-y-4 min-w-0">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1e293b] flex items-center justify-center shrink-0 text-slate-300">
                    {icon}
                </div>
                <div className="min-w-0">
                    <p className="font-semibold text-white text-sm leading-tight">{name}</p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-tight">{subtitle}</p>
                </div>
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

// ─── Usages Tab ──────────────────────────────────────────────────────────────

function UsagesTab({ sessionId }: { sessionId: string }) {
    const [vercel,   setVercel]   = useState<any>(null);
    const [neon,     setNeon]     = useState<any>(null);
    const [imagekit, setIK]       = useState<any>(null);
    const [render,   setRender]   = useState<any>(null);
    const [loading,  setLoading]  = useState(true);
    const [lastRefresh, setLastRefresh] = useState(new Date());
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

    const PROJECTS = ["Harishblog", "StartUP", "D-Driver"] as const;
    const RENDER_USERS = new Set(["D-Driver"]);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                        <TrendingUp size={18} className="text-purple-500" />
                        Platform Usage
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                        Service usage, free tier limits — all three projects
                    </p>
                </div>
                <button onClick={fetchAll}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors">
                    <RefreshCw size={11} /> {lastRefresh.toLocaleTimeString()}
                </button>
            </div>

            {/* One section per project */}
            {PROJECTS.map(label => {
                const vp  = vercel?.projects?.find((x: any) => x.label === label);
                const np  = neon?.projects?.find((x: any) => x.label === label);
                const ikp = imagekit?.projects?.find((x: any) => x.label === label);
                const rp  = render?.projects?.find((x: any) => x.label === label);

                const ikStats  = ikp?.stats;
                const neonUsage = np?.usage;

                // Last deploy: how long ago
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

                        {/* ── Vercel: builds this month ── */}
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
                            />
                        )}

                        {/* ── Neon: compute hours ── */}
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
                            />
                        ) : (
                            <UsageCard icon={<Database size={16} />} name="Neon DB" subtitle="Storage" value={`${np.projects?.length ?? 0} projects`} limitLabel="View console" noBar />
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
                            />
                        )}

                        {/* ── ImageKit: storage ── */}
                        {!ikp || !ikp.configured ? (
                            <NotConfiguredCard keyName={`IMAGEKIT_PRIVATE_KEY_${label.replace(/-/g,"").toUpperCase()}`} />
                        ) : ikStats?.storageUsed != null ? (
                            <UsageCard
                                icon={<Image size={16} />}
                                name="ImageKit"
                                subtitle="File storage"
                                value={fmt(ikStats.storageUsed)}
                                limitLabel={`of ${fmt(ikp.limits.storageBytes)} free · ${ikStats.fileCount} files`}
                                pct={(ikStats.storageUsed / ikp.limits.storageBytes) * 100}
                            />
                        ) : (
                            <UsageCard icon={<Image size={16} />} name="ImageKit" subtitle="Media storage" value="Connected" limitLabel="View dashboard" noBar />
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
                                />
                            )
                        )}

                    </ProjectSection>
                );
            })}
        </div>
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

// ─── Portal View (direct iframe for sidebar shortcuts) ───────────────────────

const PORTAL_URLS: Record<string, string> = {
    "StartUP Admin":   "https://www.startupmenswear.in/admin",
    "D-Driver DEV SA": "https://d-driver.vercel.app/login",
};

function PortalView({ portalName }: { portalName: string }) {
    const url = PORTAL_URLS[portalName];
    if (!url) return null;
    return (
        <iframe
            key={url}
            src={url}
            title={portalName}
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation"
            style={{
                position: "fixed",
                top: 0,
                left: 260,
                right: 0,
                bottom: 0,
                width: "calc(100vw - 260px)",
                height: "100vh",
                border: "none",
                zIndex: 45,
            }}
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

    if (initialPortal) {
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
        </div>
    );
}
