"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, Trash2, Edit2, Eye, EyeOff, Sparkles,
    BarChart2, RefreshCw, Share2, Loader2, X, ChevronLeft, Download,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface SmileTask {
    id: string;
    title: string;
    status: string;
    link: string;
    lines: string[];
    rareLines?: string[];
    rareChance?: number;
    posterBgGradient?: string;
    shareText?: string;
    createdAt?: string;
    stats?: {
        opens: number;
        reveals: number;
        retries: number;
        sharesDownload: number;
        sharesWeb: number;
        rareUnlocks: number;
    };
}

const DEFAULT_LINES = [
    "Error 404: Bad mood not found after reading this. 😄",
    "Warning: May cause uncontrollable smiling. Side effects include joy.",
    "You just leveled up: +100 happiness, +50 charm. 🎮",
    "Achievement unlocked: You made someone's day today. ✨",
    "Your vibe just walked in. Everyone noticed. 🌟",
    "Plot twist: You were the treasure all along. 💎",
    "Someone, somewhere, is smiling because you exist. 💫",
    "You carry sunshine in your pocket and don't even know it. ☀️",
    "You're someone's favorite notification. 🔔",
    "Scientifically proven: This message increases happiness by 100%.",
    "Breaking news: You are genuinely, magnificently enough. 📰",
    "You're not behind. You're exactly where you need to be. 🗺️",
    "Your laugh is the kind that makes strangers smile. 😊",
    "Fun fact: The world is slightly better because you're in it.",
    "Whoever sent you this has excellent taste in humans.",
    "Rare sighting: A genuinely good human. That's you. 🦋",
    "Your story isn't over. The best chapter is being written now. 📖",
    "You make ordinary moments feel cinematic. 🎬",
    "Some people brighten a room by entering. You're one of them. 💡",
    "You've been selected for a surprise upgrade: happiness. ⬆️",
    "Life called. It said you're one of the good ones. 📞",
    "Somewhere right now, someone is grateful you exist. 🙏",
    "Your energy is contagious — in the absolute best way. ⚡",
    "You didn't find this. This found you. The universe is weird like that. 🌌",
    "In another life, I'd still choose to make you smile. 💌",
    "Plot twist: You needed exactly this, exactly now. 🎭",
    "You probably saved someone's day just by being you. 🦸",
    "Side effect of reading this: Uncontrollable smiling. Consult no one.",
    "You're the main character. Don't let anyone convince you otherwise. 🎬",
    "Someone thought of you and smiled. True story. No notes.",
].join("\n");

const DEFAULT_RARE = [
    "Ultra rare ✨ You've been carrying too much lately. Put some of it down. You don't have to hold everything.",
    "Legend status unlocked 👑 Not everyone gets here. Most people scroll past. You didn't. That says something.",
    "This is the rare one 🌙 You're the kind of person stories are written about. Someone's already writing yours.",
].join("\n");

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

function buildPoster(task: SmileTask, line: string): string {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d")!;
    const [c1, c2] = (task.posterBgGradient || "#1a1a2e,#16213e").split(",");
    const grad = ctx.createLinearGradient(0, 0, 0, 1920);
    grad.addColorStop(0, c1.trim());
    grad.addColorStop(1, c2.trim());
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(200, 300, 320, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(900, 1600, 280, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = "500 50px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Someone sent you this 😊", 540, 260);
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(120, 300); ctx.lineTo(960, 300); ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 72px Arial, sans-serif";
    ctx.textAlign = "center";
    wrapText(ctx, `"${line}"`, 540, 860, 880, 96);
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.beginPath(); ctx.moveTo(120, 1550); ctx.lineTo(960, 1550); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "500 46px Arial, sans-serif";
    ctx.fillText("Tap to get yours 👇", 540, 1620);
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "400 38px Arial, sans-serif";
    const shareUrl = `${window.location.origin}${task.link || "/smile"}`;
    ctx.fillText(shareUrl, 540, 1700);
    return canvas.toDataURL("image/png");
}

const emptyForm = {
    title: "",
    status: "pause",
    link: "/smile",
    linesText: DEFAULT_LINES,
    rareLinesText: DEFAULT_RARE,
    rareChance: 10,
    posterBgGradient: "#1a1a2e,#16213e",
    shareText: "This made me smile 😄 Try yours →",
};

export default function SmileTaskModule() {
    const [tasks, setTasks] = useState<SmileTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<"list" | "editor">("list");
    const [editingTask, setEditingTask] = useState<SmileTask | null>(null);
    const [form, setForm] = useState({ ...emptyForm });
    const [saving, setSaving] = useState(false);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [posterPreview, setPosterPreview] = useState<{ task: SmileTask; line: string; url: string } | null>(null);

    function generatePoster(task: SmileTask) {
        const pool = task.lines?.length ? task.lines : DEFAULT_LINES.split("\n").filter(Boolean);
        const line = pool[Math.floor(Math.random() * pool.length)];
        const url = buildPoster(task, line);
        setPosterPreview({ task, line, url });
    }

    const sid = () => typeof window !== "undefined" ? (localStorage.getItem("admin_sessionId") || "") : "";

    async function fetchTasks() {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/smile", { headers: { "X-Session-Id": sid() } });
            if (res.ok) {
                setTasks(await res.json());
            } else {
                const err = await res.json().catch(() => ({}));
                if (res.status === 500 && err?.error?.includes?.("does not exist")) {
                    toast.error("Tables missing — run Repair DB first (Admin → DevTools)");
                }
            }
        } catch (e) {
            toast.error("Failed to load tasks. Check your connection.");
        }
        setLoading(false);
    }

    useEffect(() => { fetchTasks(); }, []);

    function openNew() {
        setEditingTask(null);
        setForm({ ...emptyForm });
        setView("editor");
    }

    function openEdit(task: SmileTask) {
        setEditingTask(task);
        setForm({
            title: task.title,
            status: task.status,
            link: task.link || "/smile",
            linesText: (task.lines || []).join("\n"),
            rareLinesText: (task.rareLines || []).join("\n"),
            rareChance: task.rareChance ?? 10,
            posterBgGradient: task.posterBgGradient || "#1a1a2e,#16213e",
            shareText: task.shareText || "This made me smile 😄 Try yours →",
        });
        setView("editor");
    }

    async function handleSave() {
        if (!form.title.trim()) return;
        setSaving(true);
        const lines = form.linesText.split("\n").map(l => l.trim()).filter(Boolean);
        const rareLines = form.rareLinesText.split("\n").map(l => l.trim()).filter(Boolean);
        const payload = {
            title: form.title,
            status: form.status,
            link: form.link,
            lines,
            rareLines,
            rareChance: form.rareChance,
            posterBgGradient: form.posterBgGradient,
            shareText: form.shareText,
        };
        try {
            const res = editingTask
                ? await fetch("/api/admin/smile", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json", "X-Session-Id": sid() },
                    body: JSON.stringify({ id: editingTask.id, ...payload }),
                })
                : await fetch("/api/admin/smile", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "X-Session-Id": sid() },
                    body: JSON.stringify(payload),
                });

            if (res.ok) {
                toast.success(editingTask ? "Task updated!" : "Smile task created!");
                setView("list");
                fetchTasks();
            } else {
                const err = await res.json().catch(() => ({}));
                const msg = err?.error || `Server error ${res.status}`;
                if (msg.includes("does not exist") || res.status === 500) {
                    toast.error("DB tables missing — go to Admin → Settings → Run Repair DB");
                } else {
                    toast.error(`Save failed: ${msg}`);
                }
            }
        } catch (e) {
            toast.error("Network error — could not save task.");
        }
        setSaving(false);
    }

    async function toggleStatus(task: SmileTask) {
        setTogglingId(task.id);
        const newStatus = task.status === "live" ? "pause" : "live";
        const res = await fetch("/api/admin/smile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "X-Session-Id": sid() },
            body: JSON.stringify({ id: task.id, status: newStatus }),
        });
        if (res.ok) {
            toast.success(newStatus === "live" ? "Task is now LIVE 🟢" : "Task paused");
        } else {
            toast.error("Failed to update status");
        }
        await fetchTasks();
        setTogglingId(null);
    }

    async function deleteTask(id: string) {
        if (!confirm("Delete this smile task and all its analytics?")) return;
        const res = await fetch("/api/admin/smile", {
            method: "DELETE",
            headers: { "Content-Type": "application/json", "X-Session-Id": sid() },
            body: JSON.stringify({ id }),
        });
        if (res.ok) toast.success("Task deleted");
        else toast.error("Delete failed");
        fetchTasks();
    }

    // ── EDITOR VIEW ──────────────────────────────────────────────────────────
    if (view === "editor") {
        const [bg1, bg2] = form.posterBgGradient.split(",");
        return (
            <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex items-center gap-4">
                    <button onClick={() => setView("list")} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                        <ChevronLeft size={20} className="text-gray-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                            {editingTask ? "Edit Smile Task" : "New Smile Task"}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mt-0.5">
                            Configure your viral smile experience
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left column */}
                    <div className="space-y-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                                Button Title (shown on floating button)
                            </label>
                            <input
                                value={form.title}
                                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                placeholder="3…2…1… Smile Incoming 😄"
                                className="w-full bg-gray-50 dark:bg-white/5 border-0 rounded-2xl p-4 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-primary transition-all"
                            />
                        </div>

                        {/* Status + Link row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Status</label>
                                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
                                    {(["live", "pause"] as const).map(s => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setForm(p => ({ ...p, status: s }))}
                                            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${form.status === s
                                                ? s === "live"
                                                    ? "bg-emerald-500 text-white shadow-md"
                                                    : "bg-white dark:bg-gray-700 shadow-md text-gray-900 dark:text-white"
                                                : "text-gray-400"}`}
                                        >
                                            {s === "live" ? "🟢 Live" : "⏸ Pause"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Share Link Path</label>
                                <input
                                    value={form.link}
                                    onChange={e => setForm(p => ({ ...p, link: e.target.value }))}
                                    className="w-full bg-gray-50 dark:bg-white/5 border-0 rounded-2xl p-3 text-gray-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-primary transition-all"
                                />
                            </div>
                        </div>

                        {/* Smile lines */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    Smile Lines (one per line)
                                </label>
                                <span className="text-[10px] text-gray-400">
                                    {form.linesText.split("\n").filter(Boolean).length} lines
                                </span>
                            </div>
                            <textarea
                                value={form.linesText}
                                onChange={e => setForm(p => ({ ...p, linesText: e.target.value }))}
                                rows={8}
                                className="w-full bg-gray-50 dark:bg-white/5 border-0 rounded-2xl p-4 text-gray-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-primary transition-all resize-none leading-relaxed"
                            />
                        </div>

                        {/* Rare lines + chance */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1">
                                    <Sparkles size={10} className="text-amber-400" /> Rare Lines
                                </label>
                                <span className="text-[10px] text-amber-400 font-bold">
                                    {form.rareChance}% chance
                                </span>
                            </div>
                            <textarea
                                value={form.rareLinesText}
                                onChange={e => setForm(p => ({ ...p, rareLinesText: e.target.value }))}
                                rows={3}
                                className="w-full bg-amber-950/20 border border-amber-500/20 rounded-2xl p-4 text-amber-100 dark:text-amber-200 text-sm font-medium focus:ring-2 focus:ring-amber-500 transition-all resize-none"
                            />
                            <div className="flex items-center gap-3 px-1">
                                <span className="text-[10px] text-gray-400 font-bold">0%</span>
                                <input
                                    type="range" min={0} max={100}
                                    value={form.rareChance}
                                    onChange={e => setForm(p => ({ ...p, rareChance: +e.target.value }))}
                                    className="flex-1 accent-amber-400"
                                />
                                <span className="text-[10px] text-gray-400 font-bold">100%</span>
                            </div>
                        </div>
                    </div>

                    {/* Right column */}
                    <div className="space-y-6">
                        {/* Poster gradient */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                                Poster Background Gradient
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[9px] text-gray-400 ml-1 uppercase tracking-wider">Top color</label>
                                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 rounded-2xl p-3">
                                        <input type="color" value={bg1?.trim() || "#1a1a2e"}
                                            onChange={e => setForm(p => ({ ...p, posterBgGradient: `${e.target.value},${bg2?.trim() || "#16213e"}` }))}
                                            className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent" />
                                        <span className="text-xs font-mono text-gray-600 dark:text-gray-300">{bg1?.trim()}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] text-gray-400 ml-1 uppercase tracking-wider">Bottom color</label>
                                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 rounded-2xl p-3">
                                        <input type="color" value={bg2?.trim() || "#16213e"}
                                            onChange={e => setForm(p => ({ ...p, posterBgGradient: `${bg1?.trim() || "#1a1a2e"},${e.target.value}` }))}
                                            className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent" />
                                        <span className="text-xs font-mono text-gray-600 dark:text-gray-300">{bg2?.trim()}</span>
                                    </div>
                                </div>
                            </div>
                            {/* Gradient preview */}
                            <div
                                className="w-full h-20 rounded-2xl flex items-center justify-center text-white/60 text-xs font-bold"
                                style={{ background: `linear-gradient(to bottom, ${bg1?.trim()}, ${bg2?.trim()})` }}
                            >
                                Poster Preview
                            </div>
                        </div>

                        {/* Share text */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Share Text</label>
                            <input
                                value={form.shareText}
                                onChange={e => setForm(p => ({ ...p, shareText: e.target.value }))}
                                className="w-full bg-gray-50 dark:bg-white/5 border-0 rounded-2xl p-4 text-gray-900 dark:text-white font-medium text-sm focus:ring-2 focus:ring-primary transition-all"
                            />
                        </div>

                        {/* Info box */}
                        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-800/30 rounded-2xl p-4 space-y-2">
                            <p className="text-blue-700 dark:text-blue-300 text-xs font-black uppercase tracking-widest">How it works</p>
                            <ul className="text-blue-600/80 dark:text-blue-400/80 text-xs space-y-1 font-medium">
                                <li>• Set status to <strong>Live</strong> → task appears in "Know About You" section</li>
                                <li>• Multiple tasks can be live at the same time</li>
                                <li>• Users get a random line from your list</li>
                                <li>• They share a poster with your site link</li>
                                <li>• New visitors land on <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">{form.link}</code></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Save button */}
                <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={() => setView("list")}
                        className="px-6 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                    >
                        Cancel
                    </button>
                    <motion.button
                        onClick={handleSave}
                        disabled={saving || !form.title.trim()}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-500/25 disabled:opacity-50"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                        {saving ? "Saving…" : editingTask ? "Save Changes" : "Create Task"}
                    </motion.button>
                </div>
            </div>
        );
    }

    // ── LIST VIEW ────────────────────────────────────────────────────────────
    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                        Smile <span className="text-rose-500 italic">Tasks</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
                        Viral interactive experiences · {tasks.length} task{tasks.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <motion.button
                    onClick={openNew}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-500/25"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                >
                    <Plus size={16} /> New Task
                </motion.button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                </div>
            ) : tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="text-5xl mb-4">😊</div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No smile tasks yet</h3>
                    <p className="text-gray-400 text-sm mb-4">Create your first viral smile experience</p>
                    <p className="text-amber-500 text-xs mb-6 font-bold">
                        ⚠️ First time? Run Repair DB below to create required tables.
                    </p>
                    <div className="flex gap-3 flex-wrap justify-center">
                        <button onClick={openNew} className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest">
                            <Plus size={14} /> Create First Task
                        </button>
                        <button
                            onClick={async () => {
                                const sid = localStorage.getItem("admin_sessionId") || "";
                                const t = toast.loading("Running DB repair…");
                                const res = await fetch("/api/repair-db", { headers: { "X-Session-Id": sid } });
                                const data = await res.json().catch(() => ({}));
                                toast.dismiss(t);
                                if (data.success) { toast.success("DB repaired! Try saving now."); fetchTasks(); }
                                else toast.error("Repair failed: " + (data.message || "unknown error"));
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest"
                        >
                            🔧 Run Repair DB
                        </button>
                    </div>
                </div>
            ) : (
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                {/* Header — desktop */}
                <div className="hidden sm:flex items-center px-4 py-2.5 bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-gray-800 gap-3">
                  <span className="w-20 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</span>
                  <span className="flex-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Title</span>
                  <span className="w-12 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">👁</span>
                  <span className="w-12 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">🎲</span>
                  <span className="w-12 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">📤</span>
                  <span className="w-12 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">👀</span>
                  <span className="w-36 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Actions</span>
                </div>

                {tasks.map((task, i) => {
                  const s = task.stats;
                  const totalShares = (s?.sharesDownload || 0) + (s?.sharesWeb || 0);
                  const isLive = task.status === "live";
                  return (
                    <div
                      key={task.id}
                      className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-4 py-3.5 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03] ${i < tasks.length - 1 ? "border-b border-gray-100 dark:border-gray-800" : ""}`}
                    >
                      {/* Status badge */}
                      <div className="sm:w-20 flex-shrink-0">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${isLive
                          ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>
                          {isLive ? "🟢 Live" : "⏸ Paused"}
                        </span>
                      </div>

                      {/* Title + meta */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-gray-900 dark:text-white truncate">{task.title}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{task.link} · {task.lines?.length || 0}L · {task.rareLines?.length || 0}R</p>
                      </div>

                      {/* Stats — desktop */}
                      <div className="hidden sm:flex items-center">
                        <span className="w-12 text-center text-xs font-bold text-blue-500">{s?.opens ?? 0}</span>
                        <span className="w-12 text-center text-xs font-bold text-purple-500">{s?.reveals ?? 0}</span>
                        <span className="w-12 text-center text-xs font-bold text-rose-500">{totalShares}</span>
                        <span className="w-12 text-center text-xs font-bold text-amber-500">{s?.rareUnlocks ?? 0}</span>
                      </div>

                      {/* Stats — mobile */}
                      <div className="flex sm:hidden gap-3 flex-wrap text-[10px] font-bold">
                        <span className="text-blue-500">👁 {s?.opens ?? 0}</span>
                        <span className="text-purple-500">🎲 {s?.reveals ?? 0}</span>
                        <span className="text-rose-500">📤 {totalShares}</span>
                        <span className="text-amber-500">👀 {s?.rareUnlocks ?? 0}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 sm:w-36 sm:justify-center flex-shrink-0">
                        <button onClick={() => generatePoster(task)} title="Story Poster"
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-500 transition-all">
                          <Sparkles size={14} />
                        </button>
                        <button onClick={() => toggleStatus(task)} disabled={togglingId === task.id}
                          title={isLive ? "Pause" : "Go Live"}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${isLive
                            ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 hover:bg-emerald-100"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
                          {togglingId === task.id ? <Loader2 size={14} className="animate-spin" /> : isLive ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button onClick={() => openEdit(task)} title="Edit"
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:text-blue-600 transition-all">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => deleteTask(task.id)} title="Delete"
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {/* ── Poster preview overlay ──────────────────────────────────── */}
            <AnimatePresence>
                {posterPreview && (
                    <motion.div
                        className="fixed inset-0 z-[300] flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setPosterPreview(null)}
                        />
                        <motion.div
                            className="relative bg-[#0f0f1a] rounded-3xl p-6 w-full max-w-xs shadow-2xl"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                        >
                            <button
                                onClick={() => setPosterPreview(null)}
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all"
                            >
                                <X size={16} />
                            </button>
                            <h3 className="text-white font-black text-base mb-1">Story Poster</h3>
                            <p className="text-white/40 text-xs mb-4 line-clamp-2">"{posterPreview.line}"</p>

                            <div className="w-full aspect-[9/16] rounded-xl overflow-hidden border border-white/10 mb-4">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={posterPreview.url} alt="Story poster" className="w-full h-full object-cover" />
                            </div>

                            <div className="flex gap-2 mb-2">
                                <button
                                    onClick={() => {
                                        const a = document.createElement("a");
                                        a.href = posterPreview.url;
                                        a.download = "smile-story.png";
                                        a.click();
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-2xl transition-all"
                                >
                                    <Download size={14} /> Download
                                </button>
                                <button
                                    onClick={async () => {
                                        const { url, line, task } = posterPreview;
                                        try {
                                            const blob = await (await fetch(url)).blob();
                                            const file = new File([blob], "smile-story.png", { type: "image/png" });
                                            if (navigator.share && navigator.canShare?.({ files: [file] })) {
                                                await navigator.share({ files: [file], title: task.title });
                                                return;
                                            }
                                        } catch {}
                                        const a = document.createElement("a");
                                        a.href = url;
                                        a.download = "smile-story.png";
                                        a.click();
                                    }}
                                    className="flex-[1.4] flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-black rounded-2xl"
                                >
                                    <Share2 size={14} /> Share to Story
                                </button>
                            </div>
                            <button
                                onClick={() => generatePoster(posterPreview.task)}
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 text-white/50 text-xs font-bold rounded-xl transition-all"
                            >
                                <RefreshCw size={12} /> New random line
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StatPill({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
    const colorMap: Record<string, string> = {
        blue: "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400",
        purple: "bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400",
        indigo: "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400",
        rose: "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400",
        amber: "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400",
    };
    return (
        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold ${colorMap[color]}`}>
            {icon} {label}: <strong>{value}</strong>
        </span>
    );
}
