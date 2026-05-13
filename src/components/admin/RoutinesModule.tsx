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
        if (!routine.isActive) return false;
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header + Unified Filter Bar */}
            <div className="flex flex-col gap-6 bg-white dark:bg-[#1e1e1e] border border-gray-100 dark:border-gray-800 p-6 md:p-8 rounded-2xl shadow-sm transition-colors duration-300">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#3b71ca]/10 rounded-xl">
                            <ListTodo className="w-6 h-6 text-[#3b71ca]" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Routines & Habits</h1>
                            <div className="flex items-center gap-4 mt-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <TrendingUp size={11} /> Live Tracking
                                </span>
                                <div className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                                <span className="text-[10px] font-bold text-[#3b71ca]">{routines.length} Active Tasks</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl transition-colors">
                            <button
                                onClick={() => setView("grid")}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${view === "grid" ? "bg-white dark:bg-gray-700 text-[#3b71ca] shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
                            >
                                Checklist
                            </button>
                            <button
                                onClick={() => setView("analytics")}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${view === "analytics" ? "bg-white dark:bg-gray-700 text-[#3b71ca] shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
                            >
                                Analysis
                            </button>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-[#3b71ca] text-white px-5 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider shadow-lg shadow-[#3b71ca]/20 hover:translate-y-[-1px] active:translate-y-[0px] transition-all flex items-center gap-2"
                        >
                            <Plus size={16} /> New Routine
                        </button>
                    </div>
                </div>

                <div className="h-px bg-gray-100 dark:bg-gray-800 w-full" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Filter size={14} className="text-gray-400 mr-2" />
                        <button
                            onClick={() => handleFilterChange("week")}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${filterType === "week" ? "bg-[#3b71ca]/10 text-[#3b71ca]" : "text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                        >
                            This Week
                        </button>
                        <button
                            onClick={() => handleFilterChange("month")}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${filterType === "month" ? "bg-[#3b71ca]/10 text-[#3b71ca]" : "text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                        >
                            This Month
                        </button>
                    </div>

                    <div className="flex items-center gap-4 bg-gray-50/50 dark:bg-gray-800/30 px-5 py-2 rounded-xl border border-gray-100 dark:border-gray-800 transition-colors">
                        <button onClick={() => setStartDate(subDays(startDate, 1))} className="text-gray-400 hover:text-[#3b71ca] transition-colors"><ChevronLeft size={14} /></button>
                        <div className="flex items-center gap-3 px-2">
                            <CalendarIcon size={12} className="text-[#3b71ca]" />
                            <span className="text-[11px] font-black text-gray-900 dark:text-gray-100 min-w-[140px] text-center">
                                {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
                            </span>
                        </div>
                        <button onClick={() => setEndDate(addDays(endDate, 1))} className="text-gray-400 hover:text-[#3b71ca] transition-colors"><ChevronRight size={14} /></button>
                    </div>
                </div>
            </div>

            {view === "grid" ? (
                <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
                    <div className="overflow-x-auto scrollbar-hide">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[#3b71ca] dark:bg-[#3b71ca]/90">
                                    <th className="sticky left-0 bg-[#3b71ca] dark:bg-[#3b71ca] z-20 px-8 py-6 text-left border-b border-white/10 min-w-[300px]">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Habit Checklist</span>
                                    </th>
                                    {days.map((day) => (
                                        <th key={day.toISOString()} className={`px-4 py-6 border-b border-white/10 min-w-[80px] ${isSameDay(day, new Date()) ? "bg-white/10" : ""}`}>
                                            <div className="flex flex-col items-center">
                                                <span className={`text-[9px] font-black uppercase ${isSameDay(day, new Date()) ? "text-white" : "text-white/40"}`}>
                                                    {format(day, "EEE")}
                                                </span>
                                                <span className={`text-lg font-black ${isSameDay(day, new Date()) ? "text-white scale-110" : "text-white"}`}>
                                                    {format(day, "d")}
                                                </span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {routines.map((routine, ridx) => (
                                    <tr key={routine.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all duration-200">
                                        <td className="sticky left-0 bg-white dark:bg-[#1e1e1e] z-20 px-8 py-5 border-r border-gray-50 dark:border-gray-800 group-hover:shadow-[5px_0_15px_-5px_rgba(0,0,0,0.05)] transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1 text-left">
                                                    <h4 className="text-[13px] font-black text-gray-900 dark:text-white group-hover:text-[#3b71ca] transition-colors">{routine.title}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black text-white uppercase tracking-wider ${['bg-[#3b71ca]', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'][ridx % 5]
                                                            }`}>
                                                            {routine.category}
                                                        </span>
                                                        <div className="h-1 w-1 rounded-full bg-gray-200 dark:bg-gray-700" />
                                                        <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 capitalize">{routine.schedule?.type}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all ml-4">
                                                    <button
                                                        onClick={() => setShowEditModal(routine)}
                                                        className="p-1.5 hover:bg-[#3b71ca]/10 text-gray-400 hover:text-[#3b71ca] rounded-lg transition-all"
                                                    >
                                                        <Edit2 size={13} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(routine.id)}
                                                        className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-gray-400 hover:text-rose-500 rounded-lg transition-all"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                        {days.map((day) => {
                                            const due = isTaskDue(routine, day);
                                            const dateStr = format(day, "yyyy-MM-dd");
                                            const isDone = (logs || []).find(l => l.routineId === routine.id && l.date === dateStr)?.isCompleted;

                                            return (
                                                <td key={day.toISOString()} className={`px-4 py-5 text-center transition-all ${isSameDay(day, new Date()) ? "bg-[#3b71ca]/5" : ""}`}>
                                                    {due ? (
                                                        <button
                                                            onClick={() => toggleComplete(routine.id, day)}
                                                            className={`mx-auto w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 transform shadow-sm ${isDone
                                                                ? `${['bg-[#3b71ca]', 'bg-emerald-500', 'bg-amber-400', 'bg-rose-500', 'bg-cyan-500'][ridx % 5]} text-white shadow-md scale-105`
                                                                : "bg-white dark:bg-gray-800 text-gray-200 dark:text-gray-700 border-2 border-gray-50 dark:border-gray-800 hover:border-[#3b71ca] dark:hover:border-[#3b71ca] hover:text-[#3b71ca] hover:scale-105"}`}
                                                        >
                                                            {isDone ? <CheckCircle2 size={20} strokeWidth={2.5} /> : <Circle size={18} strokeWidth={2.5} />}
                                                        </button>
                                                    ) : (
                                                        <div className="mx-auto w-10 h-10 rounded-xl bg-gray-50/50 dark:bg-gray-800/10 border border-dotted border-gray-200 dark:border-gray-800 flex items-center justify-center opacity-30 select-none">
                                                            <div className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-700" />
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {(analytics || []).map((item, idx) => (
                        <div key={item.id} className={`${['bg-[#3b71ca]', 'bg-emerald-500', 'bg-amber-400', 'bg-rose-500', 'bg-cyan-500'][idx % 5]} p-8 rounded-2xl text-white shadow-lg hover:translate-y-[-4px] transition-all group overflow-hidden relative`}>
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform duration-500" />

                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="mb-4 flex flex-col items-center">
                                    <DonutChartComponent rate={item.completionRate || 0} />
                                </div>

                                <div className="space-y-1 mt-2">
                                    <h3 className="text-lg font-black truncate max-w-[180px] text-white tracking-tight">{item.title}</h3>
                                    <span className="text-[9px] font-black uppercase text-white/60 tracking-wider bg-white/10 px-3 py-1 rounded-full">{item.category}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 w-full mt-8 p-5 bg-white/10 backdrop-blur-md rounded-xl">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1">Success</span>
                                        <span className="text-lg font-black">{item.completedDays || 0}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1">Target</span>
                                        <span className="text-lg font-black">{item.totalExpected || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {(!analytics || analytics.length === 0) && (
                        <div className="col-span-full bg-white dark:bg-[#1e1e1e] p-16 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center text-center transition-colors">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-full mb-6">
                                <TrendingUp className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                            </div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">No Tracking Data</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">Start checking off your tasks to see your consistency analytics here.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Combined Modal for Add/Edit */}
            {(showAddModal || showEditModal) && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowAddModal(false); setShowEditModal(null); }} />
                    <div className="bg-white dark:bg-[#1e1e1e] w-full max-w-lg rounded-2xl p-10 shadow-2xl relative animate-in zoom-in-95 duration-300 transition-colors">
                        <button
                            onClick={() => { setShowAddModal(false); setShowEditModal(null); }}
                            className="absolute top-6 right-6 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        >
                            <X size={18} />
                        </button>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-[#3b71ca] rounded-xl shadow-lg shadow-[#3b71ca]/20">
                                <Settings2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">{showAddModal ? "New Routine" : "Edit Routine"}</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Habit Configuration</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Routine Label</label>
                                <input
                                    type="text"
                                    value={showEditModal ? showEditModal.title : newRoutine.title}
                                    onChange={e => showEditModal ? setShowEditModal({ ...showEditModal, title: e.target.value }) : setNewRoutine({ ...newRoutine, title: e.target.value })}
                                    placeholder="e.g. Daily Standup..."
                                    className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl p-4 text-sm font-bold text-gray-900 dark:text-white focus:border-[#3b71ca] focus:ring-0 outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Frequency</label>
                                    <select
                                        value={showEditModal ? showEditModal.schedule?.type : newRoutine.schedule.type}
                                        onChange={e => {
                                            const val = e.target.value as any;
                                            if (showEditModal) setShowEditModal({ ...showEditModal, schedule: { ...showEditModal.schedule, type: val } });
                                            else setNewRoutine({ ...newRoutine, schedule: { ...newRoutine.schedule, type: val } });
                                        }}
                                        className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl p-4 text-sm font-bold text-gray-900 dark:text-white focus:border-[#3b71ca] outline-none transition-all cursor-pointer"
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Category</label>
                                    <input
                                        type="text"
                                        value={showEditModal ? showEditModal.category || "" : newRoutine.category}
                                        onChange={e => showEditModal ? setShowEditModal({ ...showEditModal, category: e.target.value }) : setNewRoutine({ ...newRoutine, category: e.target.value })}
                                        placeholder="Tag..."
                                        className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl p-4 text-sm font-bold text-gray-900 dark:text-white focus:border-[#3b71ca] outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {(showEditModal ? (showEditModal.schedule?.type === "weekly") : (newRoutine.schedule.type === "weekly")) && (
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Days of Week</label>
                                    <div className="flex flex-wrap gap-2">
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
                                                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-black transition-all border ${isActive
                                                        ? "bg-[#3b71ca] text-white border-[#3b71ca] shadow-md shadow-[#3b71ca]/10"
                                                        : "bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-800"
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
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Days of Month</label>
                                    <div className="grid grid-cols-7 gap-1 h-32 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 custom-scrollbar">
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
                                                    className={`aspect-square rounded-lg text-[9px] font-black transition-all border ${isActive
                                                        ? "bg-[#3b71ca] text-white border-[#3b71ca]"
                                                        : "bg-white dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-800"
                                                        }`}
                                                >
                                                    {date}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 flex gap-4">
                                <button
                                    onClick={() => { setShowAddModal(false); setShowEditModal(null); }}
                                    className="flex-1 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 py-3 rounded-xl font-black text-[11px] uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => showAddModal ? handleAction("add", newRoutine) : handleAction("edit", showEditModal)}
                                    className="flex-1 bg-[#3b71ca] text-white py-3 rounded-xl font-black text-[11px] uppercase tracking-wider shadow-xl shadow-[#3b71ca]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    {showAddModal ? "Save Routine" : "Apply Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
