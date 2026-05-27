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

    // Poster generation
    const generatePosters = () => {
        setGeneratingPoster(true);
        setTimeout(() => {
            try {
                setPosterUrl(drawPoster(1080, 1080));
                setPosterStoryUrl(drawPoster(1080, 1920));
            } finally {
                setGeneratingPoster(false);
            }
        }, 50);
    };

    function drawPoster(w: number, h: number): string {
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;

        // Background gradient
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, "#0a1628");
        grad.addColorStop(1, "#1a3a4a");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Stars
        const rng = (seed: number) => ((seed * 1664525 + 1013904223) & 0xffffffff) / 0xffffffff;
        for (let i = 0; i < 80; i++) {
            const sx = rng(i * 3 + 1) * w;
            const sy = rng(i * 3 + 2) * h * 0.6;
            const sr = rng(i * 3 + 3) * 2 + 0.5;
            ctx.globalAlpha = rng(i * 5 + 7) * 0.6 + 0.2;
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(sx, sy, sr, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Tree silhouette (simplified canvas bezier)
        const cx = w / 2;
        const baseY = h * 0.88;
        ctx.fillStyle = "#1c4532";
        ctx.strokeStyle = "#1c4532";

        // Trunk
        ctx.beginPath();
        ctx.moveTo(cx - 28, baseY);
        ctx.bezierCurveTo(cx - 24, baseY - 120, cx - 20, baseY - 200, cx - 5, baseY - 300);
        ctx.bezierCurveTo(cx + 5, baseY - 300, cx + 24, baseY - 200, cx + 28, baseY);
        ctx.closePath();
        ctx.fill();

        // Foliage
        const foliage = [
            [cx, baseY - 420, 130],
            [cx - 80, baseY - 370, 85],
            [cx + 80, baseY - 370, 85],
            [cx - 30, baseY - 480, 80],
            [cx + 30, baseY - 475, 75],
            [cx, baseY - 530, 70],
        ] as [number, number, number][];

        for (const [fx, fy, fr] of foliage) {
            ctx.beginPath();
            ctx.arc(fx, fy, fr, 0, Math.PI * 2);
            ctx.fill();
        }

        // Letter cards on tree
        const cardPositions = [
            [cx - 60, baseY - 430],
            [cx + 55, baseY - 410],
            [cx - 90, baseY - 360],
            [cx + 85, baseY - 350],
            [cx, baseY - 510],
            [cx + 30, baseY - 470],
        ];
        const cardColors = ["#fef3c7", "#fce7f3", "#e0f2fe", "#dcfce7", "#ffe4e6", "#f3e8ff"];

        for (let i = 0; i < cardPositions.length; i++) {
            const [px, py] = cardPositions[i];
            const cw = 48, ch = 58;
            // String
            ctx.globalAlpha = 0.3;
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(px, py - 20);
            ctx.lineTo(px, py - 6);
            ctx.stroke();
            ctx.globalAlpha = 1;
            // Card
            ctx.fillStyle = cardColors[i % cardColors.length];
            ctx.beginPath();
            ctx.roundRect(px - cw / 2, py, cw, ch, 3);
            ctx.fill();
            // Lines on card
            ctx.fillStyle = "rgba(0,0,0,0.15)";
            for (let row = 0; row < 3; row++) {
                ctx.fillRect(px - cw / 2 + 6, py + 14 + row * 10, cw - 12, 3);
            }
        }

        const midY = h / 2;

        // Title
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${w * 0.065}px Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("Leave your letter 🌳", w / 2, midY + h * 0.07);

        // Subtitle
        ctx.globalAlpha = 0.75;
        ctx.font = `${w * 0.035}px Arial, sans-serif`;
        ctx.fillText("Your words will live on Hari's tree forever", w / 2, midY + h * 0.115);
        ctx.globalAlpha = 1;

        // URL
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = `${w * 0.028}px Arial, sans-serif`;
        ctx.fillText("hariharanhub.com/tree", w / 2, h * 0.93);

        // QR code (img from qrserver — drawn async, skip for now; add URL placeholder)
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${w * 0.022}px Arial, sans-serif`;
        ctx.fillText("Scan or visit the link above ↑", w / 2, h * 0.96);

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
