"use client";

import { useEffect, useState, useCallback } from "react";
import { TreePine, Instagram, Facebook, MessageCircle, Link, Trash2, CheckCircle, XCircle, Download, Image } from "lucide-react";

interface Letter {
    id: string;
    senderName: string;
    message: string;
    source: string;
    sourceRef: string | null;
    posX: number | null;
    posY: number | null;
    color: string | null;
    status: string;
    createdAt: string;
}

type TabType = "pending" | "all";

const sessionId =
    typeof window !== "undefined" ? localStorage.getItem("admin_sessionId") || "" : "";
const headers = { "X-Session-Id": sessionId };

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

function SourceBadge({ source }: { source: string }) {
    const map: Record<string, { label: string; Icon: typeof Instagram; cls: string }> = {
        instagram: { label: "Instagram", Icon: Instagram, cls: "bg-pink-100 text-pink-700" },
        facebook: { label: "Facebook", Icon: Facebook, cls: "bg-blue-100 text-blue-700" },
        whatsapp: { label: "WhatsApp", Icon: MessageCircle, cls: "bg-green-100 text-green-700" },
        direct: { label: "Direct", Icon: Link, cls: "bg-gray-100 text-gray-600" },
    };
    const item = map[source] ?? map.direct;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${item.cls}`}>
            <item.Icon size={11} />
            {item.label}
        </span>
    );
}

function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
) {
    const words = text.split(" ");
    let line = "";
    let currentY = y;
    for (const word of words) {
        const testLine = line + word + " ";
        if (ctx.measureText(testLine).width > maxWidth && line !== "") {
            ctx.fillText(line.trim(), x, currentY);
            line = word + " ";
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line.trim(), x, currentY);
}

export default function TreeModule() {
    const [tab, setTab] = useState<TabType>("pending");
    const [pending, setPending] = useState<Letter[]>([]);
    const [all, setAll] = useState<Letter[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionId, setActionId] = useState<string | null>(null);
    const [showPoster, setShowPoster] = useState(false);
    const [posterUrl, setPosterUrl] = useState<string | null>(null);
    const [posterStoryUrl, setPosterStoryUrl] = useState<string | null>(null);
    const [generatingPoster, setGeneratingPoster] = useState(false);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [pRes, aRes] = await Promise.all([
                fetch("/api/admin/tree?status=pending", { headers }),
                fetch("/api/admin/tree", { headers }),
            ]);
            const [pData, aData] = await Promise.all([pRes.json(), aRes.json()]);
            setPending(pData.letters || []);
            setAll(aData.letters || []);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleAction = async (id: string, status: "approved" | "rejected") => {
        setActionId(id);
        try {
            await fetch("/api/admin/tree", {
                method: "PATCH",
                headers: { ...headers, "Content-Type": "application/json" },
                body: JSON.stringify({ id, status }),
            });
            await fetchAll();
        } finally {
            setActionId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this letter permanently?")) return;
        setActionId(id);
        try {
            await fetch(`/api/admin/tree?id=${id}`, { method: "DELETE", headers });
            await fetchAll();
        } finally {
            setActionId(null);
        }
    };

    // Stats
    const stats = {
        total: all.length,
        pending: pending.length,
        instagram: all.filter((l) => l.source === "instagram").length,
        facebook: all.filter((l) => l.source === "facebook").length,
        whatsapp: all.filter((l) => l.source === "whatsapp").length,
        direct: all.filter((l) => l.source === "direct").length,
    };

    // Poster generation — loads QR + tree PNG, then draws both sizes
    const generatePosters = () => {
        setGeneratingPoster(true);
        let qrImg: HTMLImageElement | null = null;
        let treeImg: HTMLImageElement | null = null;
        let loadCount = 0;

        const onLoaded = () => {
            loadCount++;
            if (loadCount < 2) return;
            try {
                setPosterUrl(drawPoster(1080, 1080, qrImg, treeImg));
                setPosterStoryUrl(drawPoster(1080, 1920, qrImg, treeImg));
            } finally {
                setGeneratingPoster(false);
            }
        };

        const qr = new window.Image();
        qr.crossOrigin = "anonymous";
        qr.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent("https://hariharanhub.com/tree?ref=instagram")}&bgcolor=fdf5ec&color=7c3aed&qzone=2`;
        qr.onload = () => { qrImg = qr; onLoaded(); };
        qr.onerror = () => { onLoaded(); };

        const tree = new window.Image();
        tree.src = "/magical-tree.png";
        tree.onload = () => { treeImg = tree; onLoaded(); };
        tree.onerror = () => { onLoaded(); };
    };

    function drawPoster(w: number, h: number, qrImg: HTMLImageElement | null, treeImg: HTMLImageElement | null): string {
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        const cx = w / 2;
        const rng = (seed: number) => (((seed * 1664525 + 1013904223) >>> 0) / 4294967296);

        // ── Warm parchment sky ────────────────────────────────────────────
        const sky = ctx.createLinearGradient(0, 0, 0, h);
        sky.addColorStop(0,    "#f0e6ff");
        sky.addColorStop(0.22, "#f5dff8");
        sky.addColorStop(0.46, "#fde6d5");
        sky.addColorStop(0.70, "#fff0e4");
        sky.addColorStop(0.88, "#fdf4ec");
        sky.addColorStop(1,    "#f8ece0");
        ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);

        // Rose glow left
        const rg = ctx.createRadialGradient(w*0.18, h*0.42, 0, w*0.18, h*0.42, w*0.52);
        rg.addColorStop(0, "rgba(220,100,160,0.22)"); rg.addColorStop(1, "rgba(220,100,160,0)");
        ctx.fillStyle = rg; ctx.fillRect(0, 0, w, h);

        // Lavender glow right
        const lg = ctx.createRadialGradient(w*0.82, h*0.38, 0, w*0.82, h*0.38, w*0.52);
        lg.addColorStop(0, "rgba(150,80,220,0.20)"); lg.addColorStop(1, "rgba(150,80,220,0)");
        ctx.fillStyle = lg; ctx.fillRect(0, 0, w, h);

        // ── Floating pollen dots ─────────────────────────────────────────
        const PC = ["rgba(255,200,120,0.65)","rgba(220,140,200,0.55)","rgba(200,160,240,0.50)","rgba(255,180,100,0.55)"];
        for (let i = 0; i < 90; i++) {
            const px = rng(i*5+1) * w;
            const py = rng(i*5+2) * h * 0.78;
            const pr = rng(i*5+3) * 3 + 1;
            ctx.fillStyle = PC[i % PC.length];
            ctx.globalAlpha = rng(i*7+4) * 0.55 + 0.18;
            ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI*2); ctx.fill();
        }
        ctx.globalAlpha = 1;

        // ── Diagonal light rays ───────────────────────────────────────────
        const rays = [
            { x: w*0.16, ang: -0.40, len: h*0.56 },
            { x: w*0.42, ang:  0.10, len: h*0.62 },
            { x: w*0.60, ang:  0.45, len: h*0.52 },
            { x: w*0.78, ang:  0.70, len: h*0.48 },
        ];
        for (const r of rays) {
            ctx.save(); ctx.translate(r.x, 0); ctx.rotate(r.ang);
            const rgrad = ctx.createLinearGradient(0, 0, 0, r.len);
            rgrad.addColorStop(0,   "rgba(255,210,130,0)");
            rgrad.addColorStop(0.3, "rgba(255,200,100,0.14)");
            rgrad.addColorStop(0.7, "rgba(255,170,80,0.08)");
            rgrad.addColorStop(1,   "rgba(255,150,60,0)");
            ctx.fillStyle = rgrad; ctx.fillRect(-40, 0, 80, r.len);
            ctx.restore();
        }

        // ── Tree ─────────────────────────────────────────────────────────
        const treeSize = w * 0.74;
        const treeX = (w - treeSize) / 2;
        const treeY = h * 0.04;
        const treeMidY = treeY + treeSize * 0.50;

        // Warm glow behind trunk center
        const tg = ctx.createRadialGradient(cx, treeMidY, 0, cx, treeMidY, treeSize * 0.36);
        tg.addColorStop(0,    "rgba(255,230,100,0.68)");
        tg.addColorStop(0.12, "rgba(255,190,70,0.52)");
        tg.addColorStop(0.35, "rgba(255,140,50,0.28)");
        tg.addColorStop(0.65, "rgba(255,100,30,0.10)");
        tg.addColorStop(1,    "rgba(255,80,20,0)");
        ctx.fillStyle = tg;
        ctx.beginPath(); ctx.ellipse(cx, treeMidY, treeSize*0.46, treeSize*0.53, 0, 0, Math.PI*2); ctx.fill();

        if (treeImg) {
            ctx.drawImage(treeImg, treeX, treeY, treeSize, treeSize);
        }

        // ── Ground shadow ─────────────────────────────────────────────────
        const groundY = treeY + treeSize * 0.93;
        const gg2 = ctx.createRadialGradient(cx, groundY, 0, cx, groundY, w*0.32);
        gg2.addColorStop(0, "rgba(160,120,80,0.18)"); gg2.addColorStop(1, "rgba(160,120,80,0)");
        ctx.fillStyle = gg2;
        ctx.beginPath(); ctx.ellipse(cx, groundY, w*0.32, h*0.02, 0, 0, Math.PI*2); ctx.fill();

        // ── Letter cards floating near tree ───────────────────────────────
        const isStory = h > w;
        const cardArea = { top: treeY + treeSize*0.12, h: treeSize*0.62 };
        const cardPositions = [
            [treeX + treeSize*0.18, cardArea.top + cardArea.h*0.20],
            [treeX + treeSize*0.36, cardArea.top + cardArea.h*0.08],
            [treeX + treeSize*0.60, cardArea.top + cardArea.h*0.10],
            [treeX + treeSize*0.76, cardArea.top + cardArea.h*0.24],
            [treeX + treeSize*0.50, cardArea.top + cardArea.h*0.48],
            [treeX + treeSize*0.28, cardArea.top + cardArea.h*0.50],
        ] as [number, number][];
        const cColors = ["#fef3c7","#fce7f3","#e0f2fe","#dcfce7","#ffe4e6","#f3e8ff"];
        const cw = w*0.052, ch = w*0.062;
        for (let i = 0; i < cardPositions.length; i++) {
            const [px, py] = cardPositions[i];
            ctx.globalAlpha = 0.35; ctx.strokeStyle = "rgba(100,50,20,0.55)"; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(px, py - ch*0.40); ctx.lineTo(px, py); ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.fillStyle = cColors[i % cColors.length];
            ctx.shadowColor = "rgba(0,0,0,0.18)"; ctx.shadowBlur = 10;
            ctx.beginPath(); ctx.roundRect(px - cw/2, py, cw, ch, 3); ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = "rgba(0,0,0,0.10)";
            for (let row = 0; row < 3; row++) ctx.fillRect(px - cw/2 + cw*0.12, py + ch*0.22 + row*ch*0.22, cw*0.76, ch*0.07);
        }

        // ── Text ─────────────────────────────────────────────────────────
        const textY = isStory ? h * 0.72 : treeY + treeSize + h * 0.038;

        ctx.shadowColor = "rgba(180,80,150,0.38)"; ctx.shadowBlur = 28;
        ctx.fillStyle = "#4a1a6a";
        ctx.font = `bold ${w * 0.068}px Georgia, serif`;
        ctx.textAlign = "center";
        ctx.fillText("Write your letter ✉️", cx, textY);
        ctx.shadowBlur = 0;

        ctx.globalAlpha = 0.85;
        ctx.fillStyle = "#7c3a8a";
        ctx.font = `italic ${w * 0.034}px Georgia, serif`;
        ctx.fillText("Leave a piece of yourself on Hari’s tree.", cx, textY + w*0.058);
        ctx.globalAlpha = 1;

        ctx.globalAlpha = 0.60;
        ctx.fillStyle = "#5a3060";
        ctx.font = `${w * 0.028}px Arial, sans-serif`;
        ctx.fillText("Your words will live here forever — anonymously.", cx, textY + w*0.098);
        ctx.globalAlpha = 1;

        ctx.strokeStyle = "rgba(180,100,160,0.30)"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(w*0.28, textY + w*0.126); ctx.lineTo(w*0.72, textY + w*0.126); ctx.stroke();

        // ── QR code ───────────────────────────────────────────────────────
        const qrSize = w * 0.16;
        const qrX = cx - qrSize / 2;
        const qrY2 = textY + w * 0.140;

        if (qrImg) {
            ctx.fillStyle = "rgba(255,248,240,0.94)";
            ctx.beginPath(); ctx.roundRect(qrX - w*0.016, qrY2 - w*0.012, qrSize + w*0.032, qrSize + w*0.075, w*0.016); ctx.fill();
            ctx.strokeStyle = "rgba(124,58,237,0.42)"; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.roundRect(qrX - w*0.016, qrY2 - w*0.012, qrSize + w*0.032, qrSize + w*0.075, w*0.016); ctx.stroke();
            ctx.drawImage(qrImg, qrX, qrY2, qrSize, qrSize);
            ctx.fillStyle = "#7c3aed";
            ctx.font = `bold ${w * 0.023}px Arial, sans-serif`;
            ctx.textAlign = "center";
            ctx.fillText("📱 Scan to write your letter", cx, qrY2 + qrSize + w*0.044);
        } else {
            ctx.fillStyle = "#7c3aed";
            ctx.font = `bold ${w * 0.034}px Arial, sans-serif`;
            ctx.textAlign = "center";
            ctx.fillText("hariharanhub.com/tree", cx, qrY2 + qrSize*0.5);
        }

        ctx.globalAlpha = 0.38;
        ctx.fillStyle = "#4a2060";
        ctx.font = `${w * 0.022}px Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("hariharanhub.com/tree", cx, h * 0.978);
        ctx.globalAlpha = 1;

        return canvas.toDataURL("image/png");
    }

    function downloadPoster(url: string, name: string) {
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        a.click();
    }

    const displayList = tab === "pending" ? pending : all;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-700">
                        <TreePine size={22} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-text">Message Tree</h2>
                        <p className="text-sm text-text/60">Moderate letters from visitors</p>
                    </div>
                </div>
                <button
                    onClick={() => { setShowPoster(true); generatePosters(); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-600 transition"
                >
                    <Image size={16} />
                    Create Instagram Poster
                </button>
            </div>

            {/* Stats bar */}
            <div className="flex flex-wrap gap-3 text-sm">
                {[
                    { label: "Total", value: stats.total, cls: "bg-gray-100 text-gray-700" },
                    { label: "Pending", value: stats.pending, cls: "bg-amber-100 text-amber-700" },
                    { label: "📸 Instagram", value: stats.instagram, cls: "bg-pink-100 text-pink-700" },
                    { label: "👤 Facebook", value: stats.facebook, cls: "bg-blue-100 text-blue-700" },
                    { label: "💬 WhatsApp", value: stats.whatsapp, cls: "bg-green-100 text-green-700" },
                    { label: "🔗 Direct", value: stats.direct, cls: "bg-gray-100 text-gray-600" },
                ].map(({ label, value, cls }) => (
                    <span key={label} className={`px-3 py-1 rounded-full font-medium ${cls}`}>
                        {label}: {value}
                    </span>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
                {(["pending", "all"] as TabType[]).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition capitalize ${
                            tab === t
                                ? "bg-white shadow text-emerald-700"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        {t === "pending" ? `Pending (${stats.pending})` : "All Letters"}
                    </button>
                ))}
            </div>

            {/* Letter list */}
            {loading ? (
                <div className="text-center py-12 text-text/40">Loading…</div>
            ) : displayList.length === 0 ? (
                <div className="text-center py-12 text-text/40">
                    {tab === "pending" ? "No letters awaiting approval." : "No letters yet."}
                </div>
            ) : (
                <div className="space-y-3">
                    {displayList.map((letter) => (
                        <div
                            key={letter.id}
                            className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4 items-start"
                        >
                            {/* Color swatch */}
                            <div
                                className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                                style={{ background: letter.color || "#d1d5db" }}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <span className="font-semibold text-sm text-text">
                                        {letter.senderName}
                                    </span>
                                    <span className="text-xs text-text/40">
                                        {timeAgo(letter.createdAt)}
                                    </span>
                                    <SourceBadge source={letter.source} />
                                    {letter.status !== "pending" && (
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                letter.status === "approved"
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-red-100 text-red-600"
                                            }`}
                                        >
                                            {letter.status}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-text/70 line-clamp-2">
                                    {letter.message}
                                </p>
                                {letter.posX != null && (
                                    <p className="text-xs text-text/30 mt-1">
                                        Position: {letter.posX}%, {letter.posY}%
                                    </p>
                                )}
                            </div>
                            {/* Actions */}
                            <div className="flex gap-2 flex-shrink-0">
                                {letter.status === "pending" && (
                                    <>
                                        <button
                                            onClick={() => handleAction(letter.id, "approved")}
                                            disabled={actionId === letter.id}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500 transition disabled:opacity-50"
                                        >
                                            <CheckCircle size={13} />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleAction(letter.id, "rejected")}
                                            disabled={actionId === letter.id}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-100 text-red-600 text-xs font-medium hover:bg-red-200 transition disabled:opacity-50"
                                        >
                                            <XCircle size={13} />
                                            Reject
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => handleDelete(letter.id)}
                                    disabled={actionId === letter.id}
                                    className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Poster modal */}
            {showPoster && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
                    onClick={() => setShowPoster(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-text flex items-center gap-2">
                                <Image size={18} className="text-emerald-600" />
                                Instagram Poster
                            </h3>
                            <button
                                onClick={() => setShowPoster(false)}
                                className="text-gray-400 hover:text-gray-700 text-sm"
                            >
                                ✕ Close
                            </button>
                        </div>

                        {generatingPoster ? (
                            <div className="text-center py-10 text-gray-500">Generating poster…</div>
                        ) : posterUrl ? (
                            <>
                                <img
                                    src={posterUrl}
                                    alt="Tree poster preview"
                                    className="w-full rounded-xl border border-gray-100 mb-4"
                                />
                                <p className="text-xs text-gray-500 mb-4 text-center">
                                    QR URL: hariharanhub.com/tree?ref=instagram
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => downloadPoster(posterUrl, "tree-poster-feed.png")}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-600 transition"
                                    >
                                        <Download size={15} />
                                        Feed (1080×1080)
                                    </button>
                                    {posterStoryUrl && (
                                        <button
                                            onClick={() => downloadPoster(posterStoryUrl, "tree-poster-story.png")}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-100 text-emerald-700 text-sm font-medium hover:bg-emerald-200 transition"
                                        >
                                            <Download size={15} />
                                            Story (1080×1920)
                                        </button>
                                    )}
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
}
