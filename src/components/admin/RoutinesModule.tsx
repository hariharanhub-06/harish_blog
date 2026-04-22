"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Plus,
    Trash2,
    CheckCircle2,
    Circle,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    ListTodo,
    Calendar as CalendarIcon,
    Loader2,
    Settings2,
    X,
    Filter,
    MoreHorizontal,
    Edit2,
    CalendarDays
} from "lucide-react";
import {
    format,
    addDays,
    subDays,
    startOfToday,
    isSameDay,
    getDay,
    getDate,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    parseISO,
    differenceInDays
} from "date-fns";
import { toast } from "react-hot-toast";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip as RechartsTooltip
} from "recharts";

interface Routine {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    schedule: {
        type: "daily" | "weekly" | "monthly";
        days?: number[];
        dates?: number[];
    };
    displayOrder: number;
    isActive: boolean;
}

interface RoutineLog {
    routineId: string;
    date: string;
    isCompleted: boolean;
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function RoutinesModule() {
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [logs, setLogs] = useState<RoutineLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(subDays(startOfToday(), 6));
    const [endDate, setEndDate] = useState(startOfToday());
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState<Routine | null>(null);
    const [filterType, setFilterType] = useState<"week" | "month" | "custom">("week");

    const [newRoutine, setNewRoutine] = useState<{
        title: string;
        category: string;
        schedule: {
            type: "daily" | "weekly" | "monthly";
            days: number[];
            dates: number[];
        }
    }>({
        title: "",
        category: "Daily",
        schedule: { type: "daily", days: [], dates: [] }
    });

    const [analytics, setAnalytics] = useState<any[]>([]);
    const [view, setView] = useState<"grid" | "analytics">("grid");

    // Dynamic grid days based on date range (capped for sanity in grid view, e.g. max 31 days)
    const days = useMemo(() => {
        const diff = differenceInDays(endDate, startDate) + 1;
        const count = Math.min(Math.max(diff, 1), 31);
        return Array.from({ length: count }).map((_, i) => addDays(startDate, i));
    }, [startDate, endDate]);

    useEffect(() => {
        fetchData();
    }, [startDate, endDate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const sStr = format(startDate, "yyyy-MM-dd");
            const eStr = format(endDate, "yyyy-MM-dd");
            const [routinesRes, logsRes, analyticsRes] = await Promise.all([
                fetch("/api/admin/routines"),
                fetch(`/api/admin/routines/logs?startDate=${sStr}&endDate=${eStr}`),
                fetch(`/api/admin/routines/analytics?startDate=${sStr}&endDate=${eStr}`)
            ]);

            if (routinesRes.ok && logsRes.ok && analyticsRes.ok) {
                const routinesData = await routinesRes.json();
                const logsData = await logsRes.json();
                const analyticsData = await analyticsRes.json();
                setRoutines(Array.isArray(routinesData) ? routinesData : []);
                setLogs(Array.isArray(logsData) ? logsData : []);
                setAnalytics(Array.isArray(analyticsData) ? analyticsData : []);
            }
        } catch (error) {
            toast.error("Failed to fetch routine data");
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (type: "week" | "month") => {
        setFilterType(type);
        if (type === "week") {
            setStartDate(startOfWeek(new Date()));
            setEndDate(endOfWeek(new Date()));
        } else {
            setStartDate(startOfMonth(new Date()));
            setEndDate(endOfMonth(new Date()));
        }
    };

    const isTaskDue = (routine: Routine, date: Date) => {
        const schedule = routine.schedule;
        if (!schedule || schedule.type === "daily") return true;
        if (schedule.type === "weekly") return schedule.days?.includes(getDay(date)) || false;
        if (schedule.type === "monthly") return schedule.dates?.includes(getDate(date)) || false;
        return true;
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
                // Update analytics inline
                refreshAnalytics();
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const refreshAnalytics = () => {
        const sStr = format(startDate, "yyyy-MM-dd");
        const eStr = format(endDate, "yyyy-MM-dd");
        fetch(`/api/admin/routines/analytics?startDate=${sStr}&endDate=${eStr}`)
            .then(r => r.json())
            .then(data => setAnalytics(Array.isArray(data) ? data : []))
            .catch(() => setAnalytics([]));
    };

    const handleAction = async (type: "add" | "edit", routineData: any) => {
        try {
            const res = await fetch("/api/admin/routines", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(routineData)
            });
            if (res.ok) {
                toast.success(`Routine ${type === "add" ? "added" : "updated"} successfully`);
                setShowAddModal(false);
                setShowEditModal(null);
                fetchData();
            }
        } catch (error) {
            toast.error("Operation failed");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? All related logs will be deleted.")) return;
        try {
            const res = await fetch(`/api/admin/routines?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setRoutines(prev => prev.filter(r => r.id !== id));
                toast.success("Routine deleted");
                refreshAnalytics();
            }
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    const DonutChartComponent = ({ rate }: { rate: number }) => {
        const data = [
            { name: "Done", value: rate },
            { name: "Remaining", value: 100 - rate }
        ];
        return (
            <div className="h-40 w-40 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={8}
                            dataKey="value"
                            startAngle={90}
                            endAngle={450}
                            stroke="none"
                        >
                            <Cell fill="rgba(255,255,255,1)" />
                            <Cell fill="rgba(255,255,255,0.15)" />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-white">{Math.round(rate)}%</span>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header + Unified Filter Bar */}
            <div className="flex flex-col gap-6 bg-white/70 backdrop-blur-xl border border-gray-100 p-8 rounded-[40px] shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl">
                            <ListTodo className="w-8 h-8 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Routines & Habits</h1>
                            <div className="flex items-center gap-4 mt-1">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <TrendingUp size={12} /> Live Tracking
                                </span>
                                <div className="h-1 w-1 rounded-full bg-gray-300" />
                                <span className="text-xs font-bold text-indigo-500">{routines.length} Active Tasks</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-gray-100/80 p-1.5 rounded-2xl border border-gray-100">
                            <button
                                onClick={() => setView("grid")}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${view === "grid" ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5" : "text-gray-400 hover:text-gray-600"}`}
                            >
                                Checklist
                            </button>
                            <button
                                onClick={() => setView("analytics")}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${view === "analytics" ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5" : "text-gray-400 hover:text-gray-600"}`}
                            >
                                Analysis
                            </button>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs shadow-xl shadow-indigo-600/20 hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-2"
                        >
                            <Plus size={18} /> New Routine
                        </button>
                    </div>
                </div>

                <div className="h-px bg-gray-100 w-full" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-gray-400 mr-2" />
                        <button
                            onClick={() => handleFilterChange("week")}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${filterType === "week" ? "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100" : "text-gray-400 hover:bg-gray-50"}`}
                        >
                            This Week
                        </button>
                        <button
                            onClick={() => handleFilterChange("month")}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${filterType === "month" ? "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100" : "text-gray-400 hover:bg-gray-50"}`}
                        >
                            This Month
                        </button>
                    </div>

                    <div className="flex items-center gap-4 bg-gray-50/50 px-6 py-3 rounded-[24px] border border-gray-100 ring-1 ring-black/5">
                        <button onClick={() => setStartDate(subDays(startDate, 1))} className="text-gray-400 hover:text-indigo-600 transition-colors"><ChevronLeft size={16} /></button>
                        <div className="flex items-center gap-3 px-2">
                            <CalendarIcon size={14} className="text-indigo-500" />
                            <span className="text-xs font-black text-gray-900 min-w-[160px] text-center">
                                {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
                            </span>
                        </div>
                        <button onClick={() => setEndDate(addDays(endDate, 1))} className="text-gray-400 hover:text-indigo-600 transition-colors"><ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>

            {view === "grid" ? (
                <div className="bg-white rounded-[40px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden">
                    <div className="overflow-x-auto scrollbar-hide">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-indigo-600 divide-x divide-white/10">
                                    <th className="sticky left-0 bg-indigo-600 z-20 px-10 py-8 text-left border-b border-indigo-500 min-w-[320px]">
                                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60">Habit Architecture</span>
                                    </th>
                                    {days.map((day) => (
                                        <th key={day.toISOString()} className={`px-4 py-8 border-b border-indigo-500 min-w-[85px] ${isSameDay(day, new Date()) ? "bg-white/10" : ""}`}>
                                            <div className="flex flex-col items-center">
                                                <span className={`text-[10px] font-black uppercase ${isSameDay(day, new Date()) ? "text-white" : "text-white/40"}`}>
                                                    {format(day, "EEE")}
                                                </span>
                                                <span className={`text-xl font-black ${isSameDay(day, new Date()) ? "text-white scale-110" : "text-white/80"}`}>
                                                    {format(day, "d")}
                                                </span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {routines.map((routine, ridx) => (
                                    <tr key={routine.id} className="group hover:bg-indigo-50/10 transition-all duration-300">
                                        <td className="sticky left-0 bg-white z-20 px-10 py-7 border-r border-gray-50 group-hover:shadow-[10px_0_20px_-10px_rgba(0,0,0,0.05)] transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1.5 text-left">
                                                    <h4 className="text-sm font-black text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{routine.title}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black text-white uppercase tracking-tighter ${['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'][ridx % 5]
                                                            }`}>
                                                            {routine.category}
                                                        </span>
                                                        <div className="h-1 w-1 rounded-full bg-gray-200" />
                                                        <span className="text-[9px] font-bold text-gray-400 capitalize">{routine.schedule?.type}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all ml-4">
                                                    <button
                                                        onClick={() => setShowEditModal(routine)}
                                                        className="p-2 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded-xl transition-all"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(routine.id)}
                                                        className="p-2 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                        {days.map((day) => {
                                            const due = isTaskDue(routine, day);
                                            const dateStr = format(day, "yyyy-MM-dd");
                                            const isDone = (logs || []).find(l => l.routineId === routine.id && l.date === dateStr)?.isCompleted;

                                            return (
                                                <td key={day.toISOString()} className={`px-4 py-7 text-center transition-all ${isSameDay(day, new Date()) ? "bg-indigo-50/20" : ""}`}>
                                                    {due ? (
                                                        <button
                                                            onClick={() => toggleComplete(routine.id, day)}
                                                            className={`mx-auto w-11 h-11 rounded-[16px] flex items-center justify-center transition-all duration-300 transform shadow-sm ${isDone
                                                                ? `${['bg-indigo-600', 'bg-emerald-500', 'bg-amber-400', 'bg-rose-500', 'bg-cyan-500'][ridx % 5]} text-white shadow-lg scale-105`
                                                                : "bg-white text-gray-200 border-2 border-gray-50 hover:border-indigo-300 hover:text-indigo-400 hover:scale-105"}`}
                                                        >
                                                            {isDone ? <CheckCircle2 size={24} strokeWidth={2.5} /> : <Circle size={20} strokeWidth={3} />}
                                                        </button>
                                                    ) : (
                                                        <div className="mx-auto w-11 h-11 rounded-[16px] bg-gray-50/50 border border-dotted border-gray-200 flex items-center justify-center opacity-30 select-none">
                                                            <div className="h-1 w-1 rounded-full bg-gray-300" />
                                                        </div>
                                                    )}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {(analytics || []).map((item, idx) => (
                        <div key={item.id} className={`${['bg-indigo-600', 'bg-emerald-500', 'bg-amber-400', 'bg-rose-500', 'bg-cyan-500'][idx % 5]} p-10 rounded-[48px] text-white shadow-2xl hover:-translate-y-2 transition-all group overflow-hidden relative`}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />

                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="mb-6 flex flex-col items-center filter drop-shadow-2xl">
                                    <DonutChartComponent rate={item.completionRate || 0} />
                                </div>

                                <div className="space-y-1 mt-2">
                                    <h3 className="text-xl font-black truncate max-w-[200px]">{item.title}</h3>
                                    <span className="text-[10px] font-black uppercase text-white/50 tracking-[0.2em] bg-white/10 px-3 py-1 rounded-full">{item.category}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 w-full mt-10 p-6 bg-white/10 backdrop-blur-md rounded-3xl">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Success</span>
                                        <span className="text-xl font-black">{item.completedDays || 0}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Expected</span>
                                        <span className="text-xl font-black">{item.totalExpected || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {(!analytics || analytics.length === 0) && (
                        <div className="col-span-full bg-white p-20 rounded-[48px] border border-dashed border-gray-200 flex flex-col items-center text-center">
                            <div className="p-5 bg-gray-50 rounded-full mb-6">
                                <TrendingUp className="w-12 h-12 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">Architect Your Habits</h3>
                            <p className="text-sm text-gray-500 max-w-sm">No data found for the selected timeframe. Consistency is built day by day.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Combined Modal for Add/Edit */}
            {(showAddModal || showEditModal) && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => { setShowAddModal(false); setShowEditModal(null); }} />
                    <div className="bg-white w-full max-w-xl rounded-[48px] p-12 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => { setShowAddModal(false); setShowEditModal(null); }}
                            className="absolute top-8 right-8 p-3 rounded-2xl hover:bg-gray-100 transition-all text-gray-400 hover:text-gray-900"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-4 bg-indigo-600 rounded-3xl shadow-lg shadow-indigo-600/20">
                                <Settings2 className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900">{showAddModal ? "Initialize Habit" : "Modify Habit"}</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Configuration Module</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Routine Name</label>
                                <input
                                    type="text"
                                    value={showEditModal ? showEditModal.title : newRoutine.title}
                                    onChange={e => showEditModal ? setShowEditModal({ ...showEditModal, title: e.target.value }) : setNewRoutine({ ...newRoutine, title: e.target.value })}
                                    placeholder="Enter habit name..."
                                    className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-[24px] p-6 text-sm font-black placeholder:text-gray-300 focus:border-indigo-600/20 focus:bg-white focus:outline-none transition-all shadow-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Architectural Frequency</label>
                                    <select
                                        value={showEditModal ? showEditModal.schedule?.type : newRoutine.schedule.type}
                                        onChange={e => {
                                            const val = e.target.value as any;
                                            if (showEditModal) setShowEditModal({ ...showEditModal, schedule: { ...showEditModal.schedule, type: val } });
                                            else setNewRoutine({ ...newRoutine, schedule: { ...newRoutine.schedule, type: val } });
                                        }}
                                        className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-[24px] p-5 text-sm font-black focus:border-indigo-600/20 focus:bg-white focus:outline-none transition-all shadow-sm cursor-pointer"
                                    >
                                        <option value="daily">Continuous (Daily)</option>
                                        <option value="weekly">Interval (Weekly)</option>
                                        <option value="monthly">Episodic (Monthly)</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Tag Group</label>
                                    <input
                                        type="text"
                                        value={showEditModal ? showEditModal.category || "" : newRoutine.category}
                                        onChange={e => showEditModal ? setShowEditModal({ ...showEditModal, category: e.target.value }) : setNewRoutine({ ...newRoutine, category: e.target.value })}
                                        placeholder="Category..."
                                        className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-[24px] p-5 text-sm font-black focus:border-indigo-600/20 focus:bg-white focus:outline-none transition-all shadow-sm"
                                    />
                                </div>
                            </div>

                            {(showEditModal ? (showEditModal.schedule?.type === "weekly") : (newRoutine.schedule.type === "weekly")) && (
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Selected Cadence (Days)</label>
                                    <div className="flex flex-wrap gap-2.5">
                                        {DAYS_OF_WEEK.map((day, idx) => {
                                            const isActive = showEditModal ? showEditModal.schedule?.days?.includes(idx) : newRoutine.schedule.days.includes(idx);
                                            return (
                                                <button
                                                    key={day}
                                                    onClick={() => {
                                                        if (showEditModal) {
                                                            const d = [...(showEditModal.schedule?.days || [])];
                                                            const i = d.indexOf(idx);
                                                            if (i > -1) d.splice(i, 1); else d.push(idx);
                                                            setShowEditModal({ ...showEditModal, schedule: { ...showEditModal.schedule, days: d } });
                                                        } else {
                                                            const d = [...newRoutine.schedule.days];
                                                            const i = d.indexOf(idx);
                                                            if (i > -1) d.splice(i, 1); else d.push(idx);
                                                            setNewRoutine({ ...newRoutine, schedule: { ...newRoutine.schedule, days: d } });
                                                        }
                                                    }}
                                                    className={`flex-1 py-4 px-2 rounded-2xl text-[10px] font-black transition-all border-2 ${isActive
                                                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-600/20 scale-105"
                                                        : "bg-gray-50/50 text-gray-400 border-gray-100 hover:bg-gray-100"
                                                        }`}
                                                >
                                                    {day}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {(showEditModal ? (showEditModal.schedule?.type === "monthly") : (newRoutine.schedule.type === "monthly")) && (
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Active Epochs (Dates)</label>
                                    <div className="grid grid-cols-7 gap-2 h-48 overflow-y-auto p-4 custom-scrollbar bg-gray-50/50 rounded-[32px] border border-gray-100">
                                        {Array.from({ length: 31 }).map((_, i) => {
                                            const date = i + 1;
                                            const isActive = showEditModal ? showEditModal.schedule?.dates?.includes(date) : newRoutine.schedule.dates.includes(date);
                                            return (
                                                <button
                                                    key={date}
                                                    onClick={() => {
                                                        if (showEditModal) {
                                                            const d = [...(showEditModal.schedule?.dates || [])];
                                                            const i = d.indexOf(date);
                                                            if (i > -1) d.splice(i, 1); else d.push(date);
                                                            setShowEditModal({ ...showEditModal, schedule: { ...showEditModal.schedule, dates: d } });
                                                        } else {
                                                            const d = [...newRoutine.schedule.dates];
                                                            const i = d.indexOf(date);
                                                            if (i > -1) d.splice(i, 1); else d.push(date);
                                                            setNewRoutine({ ...newRoutine, schedule: { ...newRoutine.schedule, dates: d } });
                                                        }
                                                    }}
                                                    className={`aspect-square rounded-xl text-[10px] font-black transition-all border-2 ${isActive
                                                        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/10 scale-105"
                                                        : "bg-white text-gray-400 border-gray-100 hover:bg-indigo-50/50"
                                                        }`}
                                                >
                                                    {date}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 flex gap-6">
                                <button
                                    onClick={() => { setShowAddModal(false); setShowEditModal(null); }}
                                    className="flex-1 bg-gray-50 text-gray-500 py-6 rounded-[24px] font-black text-xs hover:bg-gray-100 transition-all border border-gray-100"
                                >
                                    Dismiss
                                </button>
                                <button
                                    onClick={() => showAddModal ? handleAction("add", newRoutine) : handleAction("edit", showEditModal)}
                                    className="flex-1 bg-indigo-600 text-white py-6 rounded-[24px] font-black text-xs shadow-2xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    {showAddModal ? "Initialize" : "Commit Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
