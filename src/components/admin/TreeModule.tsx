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
        const rng = (seed: number) => (((seed * 1664525 + 1013904223) >>> 0) / 4294967296);

        // ── Background: deep cosmic sky ──────────────────────────────────
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        skyGrad.addColorStop(0,    "#050a14");
        skyGrad.addColorStop(0.25, "#080f22");
        skyGrad.addColorStop(0.55, "#0c1530");
        skyGrad.addColorStop(0.80, "#090f1e");
        skyGrad.addColorStop(1,    "#04070f");
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        // Nebula — purple left
        const neb1 = ctx.createRadialGradient(w * 0.25, h * 0.35, 0, w * 0.25, h * 0.35, w * 0.5);
        neb1.addColorStop(0, "rgba(88,28,135,0.28)");
        neb1.addColorStop(1, "rgba(88,28,135,0)");
        ctx.fillStyle = neb1;
        ctx.fillRect(0, 0, w, h);

        // Nebula — teal right
        const neb2 = ctx.createRadialGradient(w * 0.78, h * 0.28, 0, w * 0.78, h * 0.28, w * 0.45);
        neb2.addColorStop(0, "rgba(14,116,144,0.22)");
        neb2.addColorStop(1, "rgba(14,116,144,0)");
        ctx.fillStyle = neb2;
        ctx.fillRect(0, 0, w, h);

        // Nebula — pink top center
        const neb3 = ctx.createRadialGradient(w * 0.5, h * 0.1, 0, w * 0.5, h * 0.1, w * 0.4);
        neb3.addColorStop(0, "rgba(147,51,234,0.18)");
        neb3.addColorStop(1, "rgba(147,51,234,0)");
        ctx.fillStyle = neb3;
        ctx.fillRect(0, 0, w, h);

        // ── Stars ────────────────────────────────────────────────────────
        const STAR_COLORS = ["#ffffff","#a78bfa","#60a5fa","#fbbf24","#f472b6","#ffffff","#ffffff","#34d399"];
        for (let i = 0; i < 180; i++) {
            const sx = rng(i * 3 + 1) * w;
            const sy = rng(i * 3 + 2) * h * 0.65;
            const sr = rng(i * 3 + 3) * 2.5 + 0.5;
            const col = STAR_COLORS[i % STAR_COLORS.length];
            ctx.globalAlpha = rng(i * 5 + 7) * 0.55 + 0.25;
            if (i % 8 === 0) {
                // glowing bright star
                const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 5);
                sg.addColorStop(0, col);
                sg.addColorStop(1, "transparent");
                ctx.fillStyle = sg;
                ctx.beginPath(); ctx.arc(sx, sy, sr * 5, 0, Math.PI * 2); ctx.fill();
                ctx.globalAlpha = 1;
            }
            ctx.fillStyle = col;
            ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;

        // ── Tree ─────────────────────────────────────────────────────────
        const cx = w / 2;
        const baseY = h * 0.92;
        const trunkH = h * 0.42;   // trunk tip relative to baseY
        const trunkTop = baseY - trunkH;

        // Golden inner glow behind trunk
        const glowR = w * 0.34;
        const glow = ctx.createRadialGradient(cx, trunkTop + trunkH * 0.3, 0, cx, trunkTop + trunkH * 0.3, glowR);
        glow.addColorStop(0,    "rgba(251,191,36,0.85)");
        glow.addColorStop(0.18, "rgba(245,158,11,0.55)");
        glow.addColorStop(0.45, "rgba(217,119,6,0.25)");
        glow.addColorStop(0.75, "rgba(146,64,14,0.1)");
        glow.addColorStop(1,    "rgba(146,64,14,0)");
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.ellipse(cx, trunkTop + trunkH * 0.35, glowR, glowR * 1.15, 0, 0, Math.PI * 2); ctx.fill();

        // Roots
        ctx.lineCap = "round";
        const roots = [
            { dx: -40, dy: 12, ex: -110, ey: 8 },
            { dx: -30, dy: 18, ex: -90,  ey: 28 },
            { dx: -20, dy: 22, ex: -65,  ey: 38 },
            { dx: 40,  dy: 12, ex: 110,  ey: 8 },
            { dx: 30,  dy: 18, ex: 90,   ey: 28 },
            { dx: 20,  dy: 22, ex: 65,   ey: 38 },
        ];
        for (const r of roots) {
            ctx.strokeStyle = "#120a04";
            ctx.lineWidth = w * 0.014;
            ctx.beginPath();
            ctx.moveTo(cx + r.dx, baseY + r.dy);
            ctx.quadraticCurveTo(cx + r.ex * 0.6, baseY + r.ey * 0.5, cx + r.ex, baseY + r.ey);
            ctx.stroke();
            ctx.strokeStyle = "#4a2008";
            ctx.lineWidth = w * 0.005;
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.moveTo(cx + r.dx, baseY + r.dy);
            ctx.quadraticCurveTo(cx + r.ex * 0.6, baseY + r.ey * 0.5, cx + r.ex, baseY + r.ey);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        // Trunk outer dark
        const drawTrunkSide = (offX: number, sw: number, col: string) => {
            ctx.strokeStyle = col; ctx.lineWidth = sw;
            ctx.beginPath();
            ctx.moveTo(cx + offX, baseY);
            ctx.bezierCurveTo(cx + offX - 4, baseY - trunkH * 0.4, cx + offX - 6, baseY - trunkH * 0.7, cx, trunkTop);
            ctx.stroke();
        };
        drawTrunkSide(-w * 0.036, w * 0.062, "#0e0804");
        drawTrunkSide( w * 0.036, w * 0.050, "#0e0804");
        // Warm inner highlight
        ctx.strokeStyle = "#7c3700"; ctx.lineWidth = w * 0.022; ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.moveTo(cx - 4, baseY - trunkH * 0.1);
        ctx.bezierCurveTo(cx - 3, baseY - trunkH * 0.4, cx - 2, baseY - trunkH * 0.65, cx, trunkTop + trunkH * 0.05);
        ctx.stroke();
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = w * 0.006;
        ctx.beginPath();
        ctx.moveTo(cx - 2, baseY - trunkH * 0.15);
        ctx.bezierCurveTo(cx - 1, baseY - trunkH * 0.45, cx, baseY - trunkH * 0.68, cx, trunkTop + trunkH * 0.1);
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Branches
        const branches = [
            { sx: cx - 8,  sy: trunkTop + trunkH * 0.35, ex: cx - w * 0.21, ey: trunkTop + trunkH * 0.18, sw: 0.025 },
            { sx: cx + 8,  sy: trunkTop + trunkH * 0.28, ex: cx + w * 0.22, ey: trunkTop + trunkH * 0.12, sw: 0.025 },
            { sx: cx - 5,  sy: trunkTop + trunkH * 0.18, ex: cx - w * 0.16, ey: trunkTop - trunkH * 0.02, sw: 0.020 },
            { sx: cx + 5,  sy: trunkTop + trunkH * 0.14, ex: cx + w * 0.18, ey: trunkTop - trunkH * 0.04, sw: 0.020 },
            { sx: cx,      sy: trunkTop + trunkH * 0.10, ex: cx - w * 0.01, ey: trunkTop - trunkH * 0.18, sw: 0.018 },
            { sx: cx - w * 0.21, sy: trunkTop + trunkH * 0.18, ex: cx - w * 0.31, ey: trunkTop - trunkH * 0.05, sw: 0.014 },
            { sx: cx + w * 0.22, sy: trunkTop + trunkH * 0.12, ex: cx + w * 0.32, ey: trunkTop - trunkH * 0.06, sw: 0.014 },
            { sx: cx - w * 0.16, sy: trunkTop - trunkH * 0.02, ex: cx - w * 0.24, ey: trunkTop - trunkH * 0.22, sw: 0.011 },
            { sx: cx + w * 0.18, sy: trunkTop - trunkH * 0.04, ex: cx + w * 0.26, ey: trunkTop - trunkH * 0.24, sw: 0.011 },
        ];
        for (const b of branches) {
            const mx = (b.sx + b.ex) / 2 + (b.ex - b.sx) * 0.1;
            const my = (b.sy + b.ey) / 2 - Math.abs(b.ex - b.sx) * 0.15;
            ctx.strokeStyle = "#100806"; ctx.lineWidth = w * b.sw;
            ctx.beginPath(); ctx.moveTo(b.sx, b.sy); ctx.quadraticCurveTo(mx, my, b.ex, b.ey); ctx.stroke();
            // warm glow on branch
            ctx.strokeStyle = "#7c3700"; ctx.lineWidth = w * b.sw * 0.35; ctx.globalAlpha = 0.45;
            ctx.beginPath(); ctx.moveTo(b.sx, b.sy); ctx.quadraticCurveTo(mx, my, b.ex, b.ey); ctx.stroke();
            ctx.globalAlpha = 1;
        }

        // Foliage canopy
        const foliage = [
            [cx,          trunkTop - trunkH * 0.28, w * 0.165],
            [cx - w * 0.1, trunkTop - trunkH * 0.15, w * 0.115],
            [cx + w * 0.1, trunkTop - trunkH * 0.12, w * 0.12],
            [cx,          trunkTop - trunkH * 0.42, w * 0.125],
            [cx - w * 0.08,trunkTop - trunkH * 0.48, w * 0.090],
            [cx + w * 0.08,trunkTop - trunkH * 0.46, w * 0.090],
            [cx - w * 0.19,trunkTop + trunkH * 0.05, w * 0.095],
            [cx + w * 0.20,trunkTop + trunkH * 0.00, w * 0.095],
            [cx - w * 0.27,trunkTop - trunkH * 0.08, w * 0.072],
            [cx + w * 0.28,trunkTop - trunkH * 0.10, w * 0.072],
        ] as [number, number, number][];
        for (const [fx, fy, fr] of foliage) {
            ctx.fillStyle = "#0d4a3a"; ctx.globalAlpha = 0.92;
            ctx.beginPath(); ctx.arc(fx, fy, fr, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#0f5440"; ctx.globalAlpha = 0.6;
            ctx.beginPath(); ctx.arc(fx - fr * 0.15, fy - fr * 0.1, fr * 0.7, 0, Math.PI * 2); ctx.fill();
            // teal shimmer
            ctx.fillStyle = "#14b8a6"; ctx.globalAlpha = 0.12;
            ctx.beginPath(); ctx.arc(fx - fr * 0.2, fy - fr * 0.2, fr * 0.45, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Firefly sparkles on tree
        const sparkles = [
            [cx - w * 0.08, trunkTop - trunkH * 0.12], [cx + w * 0.07, trunkTop - trunkH * 0.08],
            [cx - w * 0.14, trunkTop + trunkH * 0.1],  [cx + w * 0.15, trunkTop + trunkH * 0.08],
            [cx,            trunkTop - trunkH * 0.38],  [cx - w * 0.05, trunkTop - trunkH * 0.22],
            [cx + w * 0.06, trunkTop - trunkH * 0.26],  [cx - w * 0.2,  trunkTop - trunkH * 0.02],
            [cx + w * 0.21, trunkTop - trunkH * 0.04],
        ] as [number, number][];
        const spkColors = ["#fbbf24","#fde68a","#fb923c","#fbbf24","#fde68a"];
        for (let i = 0; i < sparkles.length; i++) {
            const [spx, spy] = sparkles[i];
            const sc = spkColors[i % spkColors.length];
            const sg = ctx.createRadialGradient(spx, spy, 0, spx, spy, w * 0.025);
            sg.addColorStop(0, sc); sg.addColorStop(1, "transparent");
            ctx.fillStyle = sg; ctx.globalAlpha = 0.7;
            ctx.beginPath(); ctx.arc(spx, spy, w * 0.025, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = sc; ctx.globalAlpha = 1;
            ctx.beginPath(); ctx.arc(spx, spy, w * 0.007, 0, Math.PI * 2); ctx.fill();
        }

        // Letter cards on branches
        const cardPos = [
            [cx - w * 0.12, trunkTop - trunkH * 0.12],
            [cx + w * 0.10, trunkTop - trunkH * 0.09],
            [cx - w * 0.20, trunkTop + trunkH * 0.07],
            [cx + w * 0.19, trunkTop + trunkH * 0.06],
            [cx,            trunkTop - trunkH * 0.40],
            [cx + w * 0.06, trunkTop - trunkH * 0.28],
        ] as [number, number][];
        const cardColors = ["#fef3c7","#fce7f3","#e0f2fe","#dcfce7","#ffe4e6","#f3e8ff"];
        const cw = w * 0.055, ch = w * 0.065;
        for (let i = 0; i < cardPos.length; i++) {
            const [px, py] = cardPos[i];
            ctx.globalAlpha = 0.28; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(px, py - ch * 0.4); ctx.lineTo(px, py); ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.fillStyle = cardColors[i % cardColors.length];
            ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = 10;
            ctx.beginPath(); ctx.roundRect(px - cw / 2, py, cw, ch, 3); ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = "rgba(0,0,0,0.12)";
            for (let row = 0; row < 3; row++) {
                ctx.fillRect(px - cw / 2 + cw * 0.12, py + ch * 0.22 + row * ch * 0.22, cw * 0.76, ch * 0.07);
            }
        }

        // Ground mound
        const groundGrad = ctx.createLinearGradient(0, baseY, 0, h);
        groundGrad.addColorStop(0, "#0a0d16"); groundGrad.addColorStop(1, "#040609");
        ctx.fillStyle = groundGrad;
        ctx.beginPath();
        ctx.moveTo(0, baseY + h * 0.02);
        ctx.bezierCurveTo(w * 0.2, baseY - h * 0.015, w * 0.4, baseY - h * 0.025, w / 2, baseY - h * 0.022);
        ctx.bezierCurveTo(w * 0.6, baseY - h * 0.025, w * 0.8, baseY - h * 0.015, w, baseY + h * 0.02);
        ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();

        // ── Text ─────────────────────────────────────────────────────────
        const textY = h > w ? h * 0.72 : h * 0.68;

        // Title glow
        ctx.shadowColor = "rgba(251,191,36,0.6)"; ctx.shadowBlur = 30;
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${w * 0.068}px Georgia, serif`;
        ctx.textAlign = "center";
        ctx.fillText("Leave your letter 🌳", w / 2, textY);
        ctx.shadowBlur = 0;

        // Subtitle
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = "#e2e8f0";
        ctx.font = `${w * 0.034}px Georgia, serif`;
        ctx.fillText("Your words will live on Hari's tree forever", w / 2, textY + w * 0.06);
        ctx.globalAlpha = 1;

        // Divider line
        ctx.strokeStyle = "rgba(251,191,36,0.3)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(w * 0.3, textY + w * 0.09); ctx.lineTo(w * 0.7, textY + w * 0.09); ctx.stroke();

        // URL + hint
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.font = `${w * 0.030}px Arial, sans-serif`;
        ctx.fillText("hariharanhub.com/tree", w / 2, h * 0.93);
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${w * 0.024}px Arial, sans-serif`;
        ctx.fillText("Scan or visit the link above ↑", w / 2, h * 0.965);

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
