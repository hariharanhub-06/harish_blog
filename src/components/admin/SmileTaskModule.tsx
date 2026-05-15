"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, Trash2, Edit2, Eye, EyeOff, Sparkles,
    BarChart2, RefreshCw, Share2, Loader2, X, ChevronLeft,
} from "lucide-react";

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

    const sid = () => typeof window !== "undefined" ? (localStorage.getItem("admin_sessionId") || "") : "";

    async function fetchTasks() {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/smile", { headers: { "X-Session-Id": sid() } });
            if (res.ok) setTasks(await res.json());
        } catch { }
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
            if (editingTask) {
                await fetch("/api/admin/smile", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json", "X-Session-Id": sid() },
                    body: JSON.stringify({ id: editingTask.id, ...payload }),
                });
            } else {
                await fetch("/api/admin/smile", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "X-Session-Id": sid() },
                    body: JSON.stringify(payload),
                });
            }
            setView("list");
            fetchTasks();
        } catch { }
        setSaving(false);
    }

    async function toggleStatus(task: SmileTask) {
        setTogglingId(task.id);
        const newStatus = task.status === "live" ? "pause" : "live";
        await fetch("/api/admin/smile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "X-Session-Id": sid() },
            body: JSON.stringify({ id: task.id, status: newStatus }),
        });
        await fetchTasks();
        setTogglingId(null);
    }

    async function deleteTask(id: string) {
        if (!confirm("Delete this smile task and all its analytics?")) return;
        await fetch("/api/admin/smile", {
            method: "DELETE",
            headers: { "Content-Type": "application/json", "X-Session-Id": sid() },
            body: JSON.stringify({ id }),
        });
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
                                <li>• Set status to <strong>Live</strong> → floating button appears on homepage</li>
                                <li>• Only <strong>one task</strong> can be live at a time</li>
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
                    <p className="text-gray-400 text-sm mb-6">Create your first viral smile experience</p>
                    <button onClick={openNew} className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest">
                        <Plus size={14} /> Create First Task
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {tasks.map(task => {
                        const s = task.stats;
                        const totalShares = (s?.sharesDownload || 0) + (s?.sharesWeb || 0);
                        return (
                            <motion.div
                                key={task.id}
                                className="bg-white dark:bg-[#1e1e1e] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 flex-wrap mb-3">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${task.status === "live"
                                                ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                                                : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>
                                                {task.status === "live" ? "🟢 Live" : "⏸ Paused"}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                {task.lines?.length || 0} lines · {task.rareLines?.length || 0} rare
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1 truncate">{task.title}</h3>
                                        <p className="text-gray-400 text-xs font-medium">{task.link}</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => toggleStatus(task)}
                                            disabled={togglingId === task.id}
                                            className={`p-2.5 rounded-xl transition-all ${task.status === "live"
                                                ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 hover:bg-emerald-100"
                                                : "bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                                            title={task.status === "live" ? "Pause" : "Go Live"}
                                        >
                                            {togglingId === task.id
                                                ? <Loader2 size={16} className="animate-spin" />
                                                : task.status === "live" ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                        <button
                                            onClick={() => openEdit(task)}
                                            className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:text-blue-600 transition-all"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => deleteTask(task.id)}
                                            className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Analytics pills */}
                                {s && (
                                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-50 dark:border-gray-800/50">
                                        <StatPill icon="👁" label="Opens" value={s.opens} color="blue" />
                                        <StatPill icon="🎲" label="Reveals" value={s.reveals} color="purple" />
                                        <StatPill icon="🔀" label="Retries" value={s.retries} color="indigo" />
                                        <StatPill icon="📤" label="Shares" value={totalShares} color="rose" />
                                        <StatPill icon="👀" label="Rare" value={s.rareUnlocks} color="amber" />
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}
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
