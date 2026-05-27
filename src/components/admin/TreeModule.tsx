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

    // Poster generation — loads QR code image first, then draws both sizes
    const generatePosters = () => {
        setGeneratingPoster(true);
        const qr = new window.Image();
        qr.crossOrigin = "anonymous";
        qr.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent("https://hariharanhub.com/tree?ref=instagram")}&bgcolor=0a0e1a&color=fbbf24&qzone=2`;
        qr.onload = () => {
            try {
                setPosterUrl(drawPoster(1080, 1080, qr));
                setPosterStoryUrl(drawPoster(1080, 1920, qr));
            } finally {
                setGeneratingPoster(false);
            }
        };
        qr.onerror = () => {
            try {
                setPosterUrl(drawPoster(1080, 1080, null));
                setPosterStoryUrl(drawPoster(1080, 1920, null));
            } finally {
                setGeneratingPoster(false);
            }
        };
    };

    function drawPoster(w: number, h: number, qrImg: HTMLImageElement | null): string {
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        const rng = (seed: number) => (((seed * 1664525 + 1013904223) >>> 0) / 4294967296);

        // ── Sky: blue gradient like reference image ───────────────────────
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        skyGrad.addColorStop(0,    "#0e1828");
        skyGrad.addColorStop(0.20, "#183050");
        skyGrad.addColorStop(0.42, "#1e406a");
        skyGrad.addColorStop(0.62, "#163560");
        skyGrad.addColorStop(0.82, "#0e1f38");
        skyGrad.addColorStop(1,    "#060c18");
        ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, w, h);

        // Purple nebula left
        const neb1 = ctx.createRadialGradient(w*0.15, h*0.48, 0, w*0.15, h*0.48, w*0.52);
        neb1.addColorStop(0, "rgba(130,40,170,0.50)"); neb1.addColorStop(1, "rgba(130,40,170,0)");
        ctx.fillStyle = neb1; ctx.fillRect(0, 0, w, h);

        // Pink warm left-center
        const neb2 = ctx.createRadialGradient(w*0.32, h*0.62, 0, w*0.32, h*0.62, w*0.38);
        neb2.addColorStop(0, "rgba(200,100,80,0.25)"); neb2.addColorStop(1, "rgba(200,100,80,0)");
        ctx.fillStyle = neb2; ctx.fillRect(0, 0, w, h);

        // Cyan nebula right
        const neb3 = ctx.createRadialGradient(w*0.87, h*0.37, 0, w*0.87, h*0.37, w*0.48);
        neb3.addColorStop(0, "rgba(20,150,190,0.45)"); neb3.addColorStop(1, "rgba(20,150,190,0)");
        ctx.fillStyle = neb3; ctx.fillRect(0, 0, w, h);

        // Blue lightning right-center
        const neb4 = ctx.createRadialGradient(w*0.72, h*0.55, 0, w*0.72, h*0.55, w*0.28);
        neb4.addColorStop(0, "rgba(80,160,220,0.32)"); neb4.addColorStop(1, "rgba(80,160,220,0)");
        ctx.fillStyle = neb4; ctx.fillRect(0, 0, w, h);

        // Clouds — soft white blobs
        const cloudBlobs = [
            { x: w*0.04, y: h*0.58, rw: w*0.18, rh: h*0.04 },
            { x: w*0.08, y: h*0.61, rw: w*0.12, rh: h*0.03 },
            { x: w*0.68, y: h*0.54, rw: w*0.20, rh: h*0.04 },
            { x: w*0.72, y: h*0.58, rw: w*0.14, rh: h*0.03 },
            { x: w*0.54, y: h*0.70, rw: w*0.10, rh: h*0.025 },
        ];
        for (const cb of cloudBlobs) {
            const cg = ctx.createRadialGradient(cb.x, cb.y, 0, cb.x, cb.y, Math.max(cb.rw, cb.rh));
            cg.addColorStop(0, "rgba(220,235,255,0.18)");
            cg.addColorStop(1, "rgba(220,235,255,0)");
            ctx.fillStyle = cg;
            ctx.beginPath(); ctx.ellipse(cb.x, cb.y, cb.rw, cb.rh, 0, 0, Math.PI*2); ctx.fill();
        }

        // ── Stars ────────────────────────────────────────────────────────
        const STAR_COLORS = ["#ffffff","#a78bfa","#60a5fa","#fb923c","#f472b6","#ffffff","#ffffff","#34d399","#fbbf24"];
        for (let i = 0; i < 200; i++) {
            const sx = rng(i * 3 + 1) * w;
            const sy = rng(i * 3 + 2) * h * 0.68;
            const sr = rng(i * 3 + 3) * 2.2 + 0.5;
            const col = STAR_COLORS[i % STAR_COLORS.length];
            ctx.globalAlpha = rng(i * 5 + 7) * 0.55 + 0.28;
            if (i % 8 === 0) {
                const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 6);
                sg.addColorStop(0, col); sg.addColorStop(1, "transparent");
                ctx.fillStyle = sg;
                ctx.beginPath(); ctx.arc(sx, sy, sr * 6, 0, Math.PI * 2); ctx.fill();
            }
            ctx.globalAlpha = rng(i * 5 + 7) * 0.55 + 0.28;
            ctx.fillStyle = col;
            ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;

        // ── Tree ─────────────────────────────────────────────────────────
        const cx = w / 2;
        const baseY = h * 0.90;
        const trunkH = h * 0.44;
        const trunkTop = baseY - trunkH;

        // Ambient outer light
        const ambG = ctx.createRadialGradient(cx, trunkTop + trunkH*0.35, 0, cx, trunkTop + trunkH*0.35, w*0.42);
        ambG.addColorStop(0, "rgba(251,191,36,0.18)"); ambG.addColorStop(1, "rgba(251,191,36,0)");
        ctx.fillStyle = ambG;
        ctx.beginPath(); ctx.ellipse(cx, trunkTop + trunkH*0.38, w*0.42, trunkH*0.85, 0, 0, Math.PI*2); ctx.fill();

        // Core golden glow
        const glowR = w * 0.30;
        const glow = ctx.createRadialGradient(cx, trunkTop + trunkH*0.28, 0, cx, trunkTop + trunkH*0.28, glowR);
        glow.addColorStop(0,    "rgba(255,253,230,0.92)");
        glow.addColorStop(0.06, "rgba(253,230,138,0.88)");
        glow.addColorStop(0.20, "rgba(251,191,36,0.70)");
        glow.addColorStop(0.45, "rgba(245,158,11,0.35)");
        glow.addColorStop(0.75, "rgba(217,119,6,0.12)");
        glow.addColorStop(1,    "rgba(146,64,14,0)");
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.ellipse(cx, trunkTop + trunkH*0.32, glowR, glowR*1.2, 0, 0, Math.PI*2); ctx.fill();

        // ── Roots — wide spreading ────────────────────────────────────────
        ctx.lineCap = "round";
        const rootDefs = [
            { sx: cx-22, sy: baseY+5,  cp1x: cx-80,  cp1y: baseY+2,  ex: cx-160, ey: baseY+10, w1: 0.020, w2: 0.008 },
            { sx: cx-18, sy: baseY+10, cp1x: cx-70,  cp1y: baseY+18, ex: cx-145, ey: baseY+28, w1: 0.016, w2: 0.006 },
            { sx: cx-15, sy: baseY+14, cp1x: cx-55,  cp1y: baseY+26, ex: cx-115, ey: baseY+38, w1: 0.012, w2: 0.005 },
            { sx: cx-10, sy: baseY+16, cp1x: cx-40,  cp1y: baseY+30, ex: cx-80,  ey: baseY+42, w1: 0.010, w2: 0.004 },
            { sx: cx+22, sy: baseY+5,  cp1x: cx+80,  cp1y: baseY+2,  ex: cx+160, ey: baseY+10, w1: 0.020, w2: 0.008 },
            { sx: cx+18, sy: baseY+10, cp1x: cx+70,  cp1y: baseY+18, ex: cx+145, ey: baseY+28, w1: 0.016, w2: 0.006 },
            { sx: cx+15, sy: baseY+14, cp1x: cx+55,  cp1y: baseY+26, ex: cx+115, ey: baseY+38, w1: 0.012, w2: 0.005 },
            { sx: cx+10, sy: baseY+16, cp1x: cx+40,  cp1y: baseY+30, ex: cx+80,  ey: baseY+42, w1: 0.010, w2: 0.004 },
        ];
        for (const r of rootDefs) {
            ctx.strokeStyle = "#0f1320"; ctx.lineWidth = w * r.w1;
            ctx.beginPath(); ctx.moveTo(r.sx, r.sy); ctx.quadraticCurveTo(r.cp1x, r.cp1y, r.ex, r.ey); ctx.stroke();
            ctx.strokeStyle = "#222838"; ctx.lineWidth = w * r.w2; ctx.globalAlpha = 0.6;
            ctx.beginPath(); ctx.moveTo(r.sx, r.sy); ctx.quadraticCurveTo(r.cp1x, r.cp1y, r.ex, r.ey); ctx.stroke();
            ctx.globalAlpha = 1;
        }
        // Root warm highlights
        for (const r of rootDefs.slice(0,2)) {
            ctx.strokeStyle = "#3a2008"; ctx.lineWidth = w * r.w2; ctx.globalAlpha = 0.45;
            ctx.beginPath(); ctx.moveTo(r.sx, r.sy); ctx.quadraticCurveTo(r.cp1x, r.cp1y, r.ex, r.ey); ctx.stroke();
            ctx.globalAlpha = 1;
        }
        for (const r of rootDefs.slice(4,6)) {
            ctx.strokeStyle = "#3a2008"; ctx.lineWidth = w * r.w2; ctx.globalAlpha = 0.45;
            ctx.beginPath(); ctx.moveTo(r.sx, r.sy); ctx.quadraticCurveTo(r.cp1x, r.cp1y, r.ex, r.ey); ctx.stroke();
            ctx.globalAlpha = 1;
        }

        // ── Trunk — dark blue-gray with bark texture ──────────────────────
        // Outer dark body left
        ctx.strokeStyle = "#0d1119"; ctx.lineWidth = w * 0.062;
        ctx.beginPath(); ctx.moveTo(cx - w*0.038, baseY);
        ctx.bezierCurveTo(cx - w*0.034, baseY - trunkH*0.4, cx - w*0.028, baseY - trunkH*0.7, cx, trunkTop);
        ctx.stroke();
        // Outer dark body right
        ctx.strokeStyle = "#0d1119"; ctx.lineWidth = w * 0.050;
        ctx.beginPath(); ctx.moveTo(cx + w*0.038, baseY);
        ctx.bezierCurveTo(cx + w*0.034, baseY - trunkH*0.4, cx + w*0.028, baseY - trunkH*0.7, cx, trunkTop);
        ctx.stroke();
        // Inner trunk fill — dark blue-gray
        ctx.strokeStyle = "#1a1f2e"; ctx.lineWidth = w * 0.044;
        ctx.beginPath(); ctx.moveTo(cx - w*0.030, baseY);
        ctx.bezierCurveTo(cx - w*0.026, baseY - trunkH*0.4, cx - w*0.020, baseY - trunkH*0.7, cx, trunkTop);
        ctx.stroke();
        ctx.strokeStyle = "#1a1f2e"; ctx.lineWidth = w * 0.036;
        ctx.beginPath(); ctx.moveTo(cx + w*0.030, baseY);
        ctx.bezierCurveTo(cx + w*0.026, baseY - trunkH*0.4, cx + w*0.020, baseY - trunkH*0.7, cx, trunkTop);
        ctx.stroke();
        // Bark grain stripes
        for (let g = 0; g < 4; g++) {
            const offX = (g - 1.5) * w * 0.006;
            ctx.strokeStyle = "#131720"; ctx.lineWidth = w * 0.003; ctx.globalAlpha = 0.7;
            ctx.beginPath(); ctx.moveTo(cx + offX, baseY - trunkH*0.05);
            ctx.bezierCurveTo(cx + offX*0.8, baseY - trunkH*0.4, cx + offX*0.6, baseY - trunkH*0.65, cx + offX*0.3, trunkTop + trunkH*0.1);
            ctx.stroke(); ctx.globalAlpha = 1;
        }
        // Warm glow center of trunk
        ctx.strokeStyle = "#7c3700"; ctx.lineWidth = w * 0.018; ctx.globalAlpha = 0.55;
        ctx.beginPath(); ctx.moveTo(cx - w*0.004, baseY - trunkH*0.08);
        ctx.bezierCurveTo(cx - w*0.002, baseY - trunkH*0.40, cx - w*0.001, baseY - trunkH*0.65, cx, trunkTop + trunkH*0.08);
        ctx.stroke();
        ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = w * 0.005; ctx.globalAlpha = 0.20;
        ctx.beginPath(); ctx.moveTo(cx, baseY - trunkH*0.12);
        ctx.bezierCurveTo(cx, baseY - trunkH*0.42, cx, baseY - trunkH*0.68, cx, trunkTop + trunkH*0.12);
        ctx.stroke(); ctx.globalAlpha = 1;

        // ── Branches ─────────────────────────────────────────────────────
        const bDefs = [
            { sx: cx - w*0.008, sy: trunkTop + trunkH*0.35, ex: cx - w*0.22, ey: trunkTop + trunkH*0.16, sw: 0.026 },
            { sx: cx + w*0.008, sy: trunkTop + trunkH*0.28, ex: cx + w*0.23, ey: trunkTop + trunkH*0.10, sw: 0.026 },
            { sx: cx - w*0.005, sy: trunkTop + trunkH*0.18, ex: cx - w*0.16, ey: trunkTop - trunkH*0.04, sw: 0.020 },
            { sx: cx + w*0.005, sy: trunkTop + trunkH*0.14, ex: cx + w*0.18, ey: trunkTop - trunkH*0.06, sw: 0.020 },
            { sx: cx,           sy: trunkTop + trunkH*0.08, ex: cx,           ey: trunkTop - trunkH*0.20, sw: 0.018 },
            { sx: cx - w*0.22,  sy: trunkTop + trunkH*0.16, ex: cx - w*0.32, ey: trunkTop - trunkH*0.06, sw: 0.014 },
            { sx: cx + w*0.23,  sy: trunkTop + trunkH*0.10, ex: cx + w*0.33, ey: trunkTop - trunkH*0.08, sw: 0.014 },
            { sx: cx - w*0.16,  sy: trunkTop - trunkH*0.04, ex: cx - w*0.25, ey: trunkTop - trunkH*0.24, sw: 0.011 },
            { sx: cx + w*0.18,  sy: trunkTop - trunkH*0.06, ex: cx + w*0.27, ey: trunkTop - trunkH*0.26, sw: 0.011 },
            { sx: cx,           sy: trunkTop - trunkH*0.20, ex: cx - w*0.02, ey: trunkTop - trunkH*0.42, sw: 0.009 },
        ];
        for (const b of bDefs) {
            const mx = (b.sx + b.ex) / 2 + (b.ex - b.sx) * 0.1;
            const my = (b.sy + b.ey) / 2 - Math.abs(b.ex - b.sx) * 0.15;
            ctx.strokeStyle = "#0f1320"; ctx.lineWidth = w * b.sw;
            ctx.beginPath(); ctx.moveTo(b.sx, b.sy); ctx.quadraticCurveTo(mx, my, b.ex, b.ey); ctx.stroke();
            ctx.strokeStyle = "#1a1f2e"; ctx.lineWidth = w * b.sw * 0.65;
            ctx.beginPath(); ctx.moveTo(b.sx, b.sy); ctx.quadraticCurveTo(mx, my, b.ex, b.ey); ctx.stroke();
            ctx.strokeStyle = "#7c3700"; ctx.lineWidth = w * b.sw * 0.28; ctx.globalAlpha = 0.40;
            ctx.beginPath(); ctx.moveTo(b.sx, b.sy); ctx.quadraticCurveTo(mx, my, b.ex, b.ey); ctx.stroke();
            ctx.globalAlpha = 1;
        }

        // ── Foliage — blurred by drawing multiple passes ──────────────────
        const drawFoliage = (fx: number, fy: number, fr: number, col: string, op: number) => {
            ctx.fillStyle = col; ctx.globalAlpha = op;
            // outer soft blob (3 circles of decreasing opacity)
            for (const [dr, dop] of [[fr * 1.25, 0.30], [fr * 1.05, 0.55], [fr, 1.0]] as [number, number][]) {
                ctx.globalAlpha = op * dop;
                ctx.beginPath(); ctx.arc(fx, fy, dr, 0, Math.PI * 2); ctx.fill();
            }
            ctx.globalAlpha = 1;
        };
        const foliage = [
            [cx,          trunkTop - trunkH*0.30, w*0.170, "#0d3d2e"],
            [cx - w*0.10, trunkTop - trunkH*0.16, w*0.118, "#0d3d2e"],
            [cx + w*0.10, trunkTop - trunkH*0.13, w*0.122, "#0d3d2e"],
            [cx,          trunkTop - trunkH*0.44, w*0.130, "#0d3d2e"],
            [cx - w*0.08, trunkTop - trunkH*0.50, w*0.092, "#124a38"],
            [cx + w*0.08, trunkTop - trunkH*0.47, w*0.092, "#124a38"],
            [cx - w*0.19, trunkTop + trunkH*0.04, w*0.098, "#0d3d2e"],
            [cx + w*0.20, trunkTop + trunkH*0.00, w*0.098, "#0d3d2e"],
            [cx - w*0.28, trunkTop - trunkH*0.09, w*0.074, "#0d3d2e"],
            [cx + w*0.28, trunkTop - trunkH*0.11, w*0.074, "#0d3d2e"],
            [cx - w*0.10, trunkTop - trunkH*0.16, w*0.085, "#1a5c42"],
            [cx + w*0.10, trunkTop - trunkH*0.13, w*0.088, "#1a5c42"],
            [cx,          trunkTop - trunkH*0.30, w*0.118, "#1a5c42"],
        ] as [number, number, number, string][];
        for (const [fx, fy, fr, col] of foliage) drawFoliage(fx, fy, fr, col, 0.88);
        // Teal shimmer
        for (const [fx, fy, fr] of foliage.slice(0, 8) as [number, number, number, string][]) {
            ctx.fillStyle = "#14b8a6"; ctx.globalAlpha = 0.10;
            ctx.beginPath(); ctx.arc(fx - fr*0.15, fy - fr*0.15, fr*0.42, 0, Math.PI*2); ctx.fill();
        }
        ctx.globalAlpha = 1;

        // ── Firefly sparkles ──────────────────────────────────────────────
        const sparkles = [
            [cx - w*0.08, trunkTop - trunkH*0.14], [cx + w*0.07, trunkTop - trunkH*0.10],
            [cx - w*0.15, trunkTop + trunkH*0.09], [cx + w*0.16, trunkTop + trunkH*0.07],
            [cx,          trunkTop - trunkH*0.40], [cx - w*0.05, trunkTop - trunkH*0.24],
            [cx + w*0.06, trunkTop - trunkH*0.28], [cx - w*0.20, trunkTop - trunkH*0.04],
            [cx + w*0.21, trunkTop - trunkH*0.06], [cx - w*0.03, trunkTop - trunkH*0.52],
            [cx + w*0.04, trunkTop - trunkH*0.48], [cx - w*0.25, trunkTop + trunkH*0.08],
        ] as [number, number][];
        const spkColors = ["#fbbf24","#fde68a","#fb923c","#fbbf24","#fde68a"];
        for (let i = 0; i < sparkles.length; i++) {
            const [spx, spy] = sparkles[i];
            const sc = spkColors[i % spkColors.length];
            const sg = ctx.createRadialGradient(spx, spy, 0, spx, spy, w * 0.028);
            sg.addColorStop(0, sc); sg.addColorStop(1, "transparent");
            ctx.fillStyle = sg; ctx.globalAlpha = 0.65;
            ctx.beginPath(); ctx.arc(spx, spy, w * 0.028, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = sc; ctx.globalAlpha = 1;
            ctx.beginPath(); ctx.arc(spx, spy, w * 0.008, 0, Math.PI * 2); ctx.fill();
        }

        // ── Letter cards on branches ──────────────────────────────────────
        const cardPos = [
            [cx - w*0.12, trunkTop - trunkH*0.13],
            [cx + w*0.10, trunkTop - trunkH*0.10],
            [cx - w*0.21, trunkTop + trunkH*0.06],
            [cx + w*0.20, trunkTop + trunkH*0.05],
            [cx,          trunkTop - trunkH*0.42],
            [cx + w*0.06, trunkTop - trunkH*0.30],
        ] as [number, number][];
        const cardColors = ["#fef3c7","#fce7f3","#e0f2fe","#dcfce7","#ffe4e6","#f3e8ff"];
        const cw = w * 0.055, ch = w * 0.065;
        for (let i = 0; i < cardPos.length; i++) {
            const [px, py] = cardPos[i];
            ctx.globalAlpha = 0.30; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(px, py - ch * 0.42); ctx.lineTo(px, py); ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.fillStyle = cardColors[i % cardColors.length];
            ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = 12;
            ctx.beginPath(); ctx.roundRect(px - cw/2, py, cw, ch, 3); ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = "rgba(0,0,0,0.11)";
            for (let row = 0; row < 3; row++) ctx.fillRect(px - cw/2 + cw*0.12, py + ch*0.22 + row*ch*0.22, cw*0.76, ch*0.07);
        }

        // ── Ground mound ──────────────────────────────────────────────────
        const groundGrad = ctx.createLinearGradient(0, baseY, 0, h);
        groundGrad.addColorStop(0, "#0a0d18"); groundGrad.addColorStop(1, "#04060e");
        ctx.fillStyle = groundGrad;
        ctx.beginPath();
        ctx.moveTo(0, baseY + h*0.025);
        ctx.bezierCurveTo(w*0.2, baseY - h*0.018, w*0.4, baseY - h*0.028, w/2, baseY - h*0.025);
        ctx.bezierCurveTo(w*0.6, baseY - h*0.028, w*0.8, baseY - h*0.018, w, baseY + h*0.025);
        ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();

        // ── Text + QR ────────────────────────────────────────────────────
        const isStory = h > w;
        const textY = isStory ? h * 0.70 : h * 0.67;

        // Title — with golden glow
        ctx.shadowColor = "rgba(251,191,36,0.7)"; ctx.shadowBlur = 36;
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${w * 0.072}px Georgia, serif`;
        ctx.textAlign = "center";
        ctx.fillText("Write your letter ✉️", w / 2, textY);
        ctx.shadowBlur = 0;

        // Subtitle line 1
        ctx.globalAlpha = 0.88;
        ctx.fillStyle = "#fde68a";
        ctx.font = `italic ${w * 0.036}px Georgia, serif`;
        ctx.fillText("Leave a piece of yourself on Hari's tree.", w / 2, textY + w * 0.062);
        ctx.globalAlpha = 1;

        // Subtitle line 2
        ctx.globalAlpha = 0.65;
        ctx.fillStyle = "#e2e8f0";
        ctx.font = `${w * 0.030}px Arial, sans-serif`;
        ctx.fillText("Your words will live here forever — anonymously.", w / 2, textY + w * 0.105);
        ctx.globalAlpha = 1;

        // Divider
        ctx.strokeStyle = "rgba(251,191,36,0.35)"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(w * 0.28, textY + w * 0.135); ctx.lineTo(w * 0.72, textY + w * 0.135); ctx.stroke();

        // QR code block
        const qrSize = w * 0.18;
        const qrX = w / 2 - qrSize / 2;
        const qrY = textY + w * 0.15;

        if (qrImg) {
            // QR background pill
            ctx.fillStyle = "rgba(10,14,26,0.85)";
            ctx.beginPath();
            ctx.roundRect(qrX - w * 0.02, qrY - w * 0.015, qrSize + w * 0.04, qrSize + w * 0.085, w * 0.02);
            ctx.fill();
            // Golden border
            ctx.strokeStyle = "rgba(251,191,36,0.45)"; ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(qrX - w * 0.02, qrY - w * 0.015, qrSize + w * 0.04, qrSize + w * 0.085, w * 0.02);
            ctx.stroke();
            // QR image
            ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
            // "Scan to write" label
            ctx.fillStyle = "#fbbf24";
            ctx.font = `bold ${w * 0.026}px Arial, sans-serif`;
            ctx.textAlign = "center";
            ctx.fillText("📱 Scan to write your letter", w / 2, qrY + qrSize + w * 0.052);
        } else {
            // Fallback: just URL text
            ctx.fillStyle = "#fbbf24";
            ctx.font = `bold ${w * 0.036}px Arial, sans-serif`;
            ctx.textAlign = "center";
            ctx.fillText("hariharanhub.com/tree", w / 2, qrY + qrSize * 0.5);
        }

        // Bottom URL
        ctx.globalAlpha = 0.45;
        ctx.fillStyle = "#ffffff";
        ctx.font = `${w * 0.024}px Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("hariharanhub.com/tree", w / 2, h * 0.975);
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
