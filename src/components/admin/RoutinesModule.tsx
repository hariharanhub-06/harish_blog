"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Trash2,
    CheckCircle2,
    Circle,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    ListTodo,
    Filter,
    BarChart3,
    Calendar as CalendarIcon,
    MoreVertical,
    Edit3,
    Loader2
} from "lucide-react";
import { format, addDays, subDays, startOfToday, isSameDay, parseISO } from "date-fns";
import { toast } from "react-hot-toast";

interface Routine {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    displayOrder: number;
    isActive: boolean;
}

interface RoutineLog {
    routineId: string;
    date: string;
    isCompleted: boolean;
}

export default function RoutinesModule() {
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [logs, setLogs] = useState<RoutineLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(subDays(startOfToday(), 6));
    const [showAddModal, setShowAddModal] = useState(false);
    const [newRoutine, setNewRoutine] = useState({ title: "", description: "", category: "Daily" });
    const [analytics, setAnalytics] = useState<any[]>([]);
    const [view, setView] = useState<"grid" | "analytics">("grid");

    const days = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

    useEffect(() => {
        fetchData();
    }, [startDate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [routinesRes, logsRes, analyticsRes] = await Promise.all([
                fetch("/api/admin/routines"),
                fetch(`/api/admin/routines/logs?startDate=${format(days[0], "yyyy-MM-dd")}&endDate=${format(days[6], "yyyy-MM-dd")}`),
                fetch("/api/admin/routines/analytics")
            ]);

            if (routinesRes.ok && logsRes.ok && analyticsRes.ok) {
                const routinesData = await routinesRes.json();
                const logsData = await logsRes.json();
                const analyticsData = await analyticsRes.json();
                setRoutines(routinesData);
                setLogs(logsData);
                setAnalytics(analyticsData);
            }
        } catch (error) {
            toast.error("Failed to fetch routine data");
        } finally {
            setLoading(false);
        }
    };

    const toggleComplete = async (routineId: string, date: Date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        const existingLog = logs.find(l => l.routineId === routineId && l.date === dateStr);
        const newStatus = !existingLog?.isCompleted;

        try {
            const res = await fetch("/api/admin/routines/logs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ routineId, date: dateStr, isCompleted: newStatus })
            });

            if (res.ok) {
                setLogs(prev => {
                    const filtered = prev.filter(l => !(l.routineId === routineId && l.date === dateStr));
                    return [...filtered, { routineId, date: dateStr, isCompleted: newStatus }];
                });
                // Refresh analytics in background
                fetch("/api/admin/routines/analytics")
                    .then(r => r.json())
                    .then(data => setAnalytics(data));
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleAddRoutine = async () => {
        if (!newRoutine.title) return;
        try {
            const res = await fetch("/api/admin/routines", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newRoutine)
            });
            if (res.ok) {
                toast.success("Routine added");
                setShowAddModal(false);
                setNewRoutine({ title: "", description: "", category: "Daily" });
                fetchData();
            }
        } catch (error) {
            toast.error("Failed to add routine");
        }
    };

    const handleDeleteRoutine = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            const res = await fetch(`/api/admin/routines?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setRoutines(prev => prev.filter(r => r.id !== id));
                toast.success("Routine deleted");
            }
        } catch (error) {
            toast.error("Failed to delete routine");
        }
    };

    if (loading && routines.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm font-medium text-gray-500">Loading your routines...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-500/10 rounded-xl">
                        <ListTodo className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-900">Routine Checklist</h1>
                        <p className="text-sm text-gray-500 font-medium">Track and analyze your daily habits</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex bg-gray-100 p-1 rounded-xl mr-2">
                        <button
                            onClick={() => setView("grid")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === "grid" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                        >
                            Grid
                        </button>
                        <button
                            onClick={() => setView("analytics")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === "analytics" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                        >
                            Analytics
                        </button>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Plus size={16} />
                        Add Task
                    </button>
                </div>
            </div>

            {view === "grid" ? (
                <div className="bg-white/70 backdrop-blur-xl border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                    {/* Grid Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setStartDate(subDays(startDate, 7))}
                                className="p-2 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100 text-gray-400 hover:text-gray-900"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <div className="flex flex-col items-center min-w-[200px]">
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Schedule View</span>
                                <span className="text-sm font-bold text-gray-900">
                                    {format(days[0], "MMM d")} - {format(days[6], "MMM d, yyyy")}
                                </span>
                            </div>
                            <button
                                onClick={() => setStartDate(addDays(startDate, 7))}
                                className="p-2 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100 text-gray-400 hover:text-gray-900"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                            <CalendarIcon size={14} />
                            <span>Today: {format(new Date(), "EEEE, MMMM d")}</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto scrollbar-hide">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="sticky left-0 bg-white/90 backdrop-blur z-10 px-6 py-4 text-left border-b border-gray-100 min-w-[240px]">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Routine Task</span>
                                    </th>
                                    {days.map((day) => (
                                        <th key={day.toISOString()} className={`px-4 py-4 text-center border-b border-gray-100 min-w-[100px] ${isSameDay(day, new Date()) ? "bg-primary/5 ring-1 ring-inset ring-primary/10" : ""}`}>
                                            <div className="flex flex-col items-center">
                                                <span className={`text-[10px] font-black uppercase tracking-tighter ${isSameDay(day, new Date()) ? "text-primary" : "text-gray-400"}`}>
                                                    {format(day, "EEE")}
                                                </span>
                                                <span className={`text-lg font-black ${isSameDay(day, new Date()) ? "text-primary scale-110" : "text-gray-900"}`}>
                                                    {format(day, "d")}
                                                </span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {routines.map((routine) => (
                                    <tr key={routine.id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="sticky left-0 bg-white/90 backdrop-blur z-10 px-6 py-5 border-r border-gray-50 transition-all group-hover:bg-white group-hover:shadow-[4px_0_12px_rgba(0,0,0,0.02)]">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900 leading-snug">{routine.title}</span>
                                                    {routine.category && (
                                                        <span className="text-[9px] font-black uppercase text-indigo-500 tracking-wider">
                                                            {routine.category}
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteRoutine(routine.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                        {days.map((day) => {
                                            const dateStr = format(day, "yyyy-MM-dd");
                                            const isDone = logs.find(l => l.routineId === routine.id && l.date === dateStr)?.isCompleted;
                                            return (
                                                <td key={day.toISOString()} className={`px-4 py-5 text-center transition-all ${isSameDay(day, new Date()) ? "bg-primary/5" : ""}`}>
                                                    <button
                                                        onClick={() => toggleComplete(routine.id, day)}
                                                        className={`mx-auto w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 transform ${isDone
                                                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-110"
                                                            : "bg-gray-50 text-gray-200 border border-gray-100 hover:border-emerald-200 hover:text-emerald-300 hover:scale-105"}`}
                                                    >
                                                        {isDone ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                                    </button>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {analytics.map((item) => (
                        <div key={item.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{item.title}</h3>
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Total Stats</p>
                                </div>
                                <div className={`p-2 rounded-xl ${item.completionRate > 70 ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-500"}`}>
                                    <TrendingUp size={16} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Completion Rate</span>
                                    <span className="font-black text-gray-900">{Math.round(item.completionRate)}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${item.completionRate > 80 ? "bg-emerald-500" :
                                                item.completionRate > 50 ? "bg-indigo-500" : "bg-amber-500"
                                            }`}
                                        style={{ width: `${item.completionRate}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-gray-400">
                                    <span>{item.completedDays} / {item.totalDays} Days Done</span>
                                    <span>Target: 100%</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {analytics.length === 0 && (
                        <div className="col-span-full bg-gray-50/50 border border-dashed border-gray-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                            <BarChart3 className="w-12 h-12 text-gray-300 mb-4" />
                            <h3 className="font-bold text-gray-900 mb-1">No Analytics Data</h3>
                            <p className="text-sm text-gray-500">Add tasks and mark them complete to see your progress.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Add Routine Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                    <div className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-black text-gray-900 mb-6">New Routine Task</h3>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Task Title</label>
                                <input
                                    type="text"
                                    value={newRoutine.title}
                                    onChange={e => setNewRoutine({ ...newRoutine, title: e.target.value })}
                                    placeholder="e.g., Morning Meditation"
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Category</label>
                                <input
                                    type="text"
                                    value={newRoutine.category || ""}
                                    onChange={e => setNewRoutine({ ...newRoutine, category: e.target.value })}
                                    placeholder="e.g., Health, Work"
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 bg-gray-100 text-gray-500 py-3.5 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddRoutine}
                                    className="flex-1 bg-primary text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Create Task
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
