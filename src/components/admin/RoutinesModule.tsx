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
    Calendar as CalendarIcon,
    Loader2,
    CalendarDays,
    Settings2,
    X
} from "lucide-react";
import { format, addDays, subDays, startOfToday, isSameDay, getDay, getDate } from "date-fns";
import { toast } from "react-hot-toast";

interface Routine {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    schedule: {
        type: "daily" | "weekly" | "monthly";
        days?: number[]; // 0-6 for weekly
        dates?: number[]; // 1-31 for monthly
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
    const [showAddModal, setShowAddModal] = useState(false);
    const [newRoutine, setNewRoutine] = useState<{
        title: string;
        description: string;
        category: string;
        schedule: {
            type: "daily" | "weekly" | "monthly";
            days: number[];
            dates: number[];
        }
    }>({
        title: "",
        description: "",
        category: "Daily",
        schedule: { type: "daily", days: [], dates: [] }
    });
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

    const isTaskDue = (routine: Routine, date: Date) => {
        const schedule = routine.schedule;
        if (!schedule || schedule.type === "daily") return true;
        if (schedule.type === "weekly") {
            return schedule.days?.includes(getDay(date)) || false;
        }
        if (schedule.type === "monthly") {
            return schedule.dates?.includes(getDate(date)) || false;
        }
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
                fetch("/api/admin/routines/analytics")
                    .then(r => r.json())
                    .then(data => setAnalytics(data));
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleAddRoutine = async () => {
        if (!newRoutine.title) {
            toast.error("Title is required");
            return;
        }

        // Validation for weekly/monthly
        if (newRoutine.schedule.type === "weekly" && newRoutine.schedule.days.length === 0) {
            toast.error("Please select at least one day");
            return;
        }
        if (newRoutine.schedule.type === "monthly" && newRoutine.schedule.dates.length === 0) {
            toast.error("Please select at least one date");
            return;
        }

        try {
            console.log("Submitting routine:", newRoutine);
            const res = await fetch("/api/admin/routines", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newRoutine)
            });
            const result = await res.json();

            if (res.ok) {
                toast.success("Routine added successfully");
                setShowAddModal(false);
                setNewRoutine({
                    title: "",
                    description: "",
                    category: "Daily",
                    schedule: { type: "daily", days: [], dates: [] }
                });
                fetchData();
            } else {
                toast.error(result.error || "Failed to add routine");
                console.error("Add routine failed:", result);
            }
        } catch (error) {
            console.error("Add routine error:", error);
            toast.error("Network error while adding routine");
        }
    };

    const toggleDaySelection = (day: number) => {
        setNewRoutine(prev => {
            const currentDays = [...prev.schedule.days];
            const index = currentDays.indexOf(day);
            if (index > -1) currentDays.splice(index, 1);
            else currentDays.push(day);
            return { ...prev, schedule: { ...prev.schedule, days: currentDays } };
        });
    };

    const toggleDateSelection = (date: number) => {
        setNewRoutine(prev => {
            const currentDates = [...prev.schedule.dates];
            const index = currentDates.indexOf(date);
            if (index > -1) currentDates.splice(index, 1);
            else currentDates.push(date);
            return { ...prev, schedule: { ...prev.schedule, dates: currentDates } };
        });
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
                        <h1 className="text-xl font-black text-gray-900 leading-tight">Routine Checklist</h1>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Habit & Task Performance</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex bg-gray-100/50 p-1 rounded-xl">
                        <button
                            onClick={() => setView("grid")}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${view === "grid" ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                        >
                            Log View
                        </button>
                        <button
                            onClick={() => setView("analytics")}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${view === "analytics" ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                        >
                            Performance
                        </button>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-xl font-black text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Plus size={16} />
                        New Task
                    </button>
                </div>
            </div>

            {view === "grid" ? (
                <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-[32px] shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50/50 to-transparent">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setStartDate(subDays(startDate, 7))}
                                className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all border border-gray-100 text-gray-400 hover:text-primary"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <div className="flex flex-col items-center">
                                <span className="text-lg font-black text-gray-900">
                                    {format(days[0], "MMM d")} - {format(days[6], "MMM d, yyyy")}
                                </span>
                            </div>
                            <button
                                onClick={() => setStartDate(addDays(startDate, 7))}
                                className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all border border-gray-100 text-gray-400 hover:text-primary"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="px-8 py-5 text-left border-b border-gray-100 bg-gray-50/30">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Routines</span>
                                    </th>
                                    {days.map((day) => (
                                        <th key={day.toISOString()} className={`px-4 py-5 text-center border-b border-gray-100 ${isSameDay(day, new Date()) ? "bg-primary/5" : "bg-gray-50/30"}`}>
                                            <div className="flex flex-col">
                                                <span className={`text-[10px] font-black uppercase ${isSameDay(day, new Date()) ? "text-primary" : "text-gray-400"}`}>
                                                    {format(day, "EEE")}
                                                </span>
                                                <span className={`text-lg font-black ${isSameDay(day, new Date()) ? "text-primary" : "text-gray-900"}`}>
                                                    {format(day, "d")}
                                                </span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {routines.map((routine) => (
                                    <tr key={routine.id} className="group hover:bg-gray-50/20 transition-all">
                                        <td className="px-8 py-6 max-w-[300px]">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-gray-900">{routine.title}</span>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="text-[9px] font-black uppercase text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                                                        {routine.category}
                                                    </span>
                                                    <span className="text-[9px] font-black uppercase text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                                        {routine.schedule?.type}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        {days.map((day) => {
                                            const due = isTaskDue(routine, day);
                                            const dateStr = format(day, "yyyy-MM-dd");
                                            const isDone = logs.find(l => l.routineId === routine.id && l.date === dateStr)?.isCompleted;

                                            return (
                                                <td key={day.toISOString()} className={`px-4 py-6 text-center ${isSameDay(day, new Date()) ? "bg-primary/5" : ""}`}>
                                                    {due ? (
                                                        <button
                                                            onClick={() => toggleComplete(routine.id, day)}
                                                            className={`mx-auto w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 transform shadow-sm ${isDone
                                                                ? "bg-emerald-500 text-white shadow-emerald-500/30 scale-105"
                                                                : "bg-white text-gray-200 border border-gray-100 hover:border-emerald-300 hover:text-emerald-400 hover:scale-105"}`}
                                                        >
                                                            {isDone ? <CheckCircle2 size={24} strokeWidth={2.5} /> : <Circle size={20} />}
                                                        </button>
                                                    ) : (
                                                        <div className="mx-auto w-8 h-8 rounded-xl bg-gray-50 border border-dotted border-gray-200 flex items-center justify-center opacity-40">
                                                            <span className="text-[8px] font-black uppercase text-gray-300">N/A</span>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {analytics.map((item) => (
                        <div key={item.id} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <h3 className="font-black text-gray-900 group-hover:text-primary transition-colors">{item.title}</h3>
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Global Statistics</p>
                                </div>
                                <div className={`p-2.5 rounded-2xl ${item.completionRate > 75 ? "bg-emerald-50 text-emerald-600 shadow-sm" : "bg-gray-50 text-gray-500"}`}>
                                    <TrendingUp size={20} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Success Rate</span>
                                    <span className="text-2xl font-black text-gray-900">{Math.round(item.completionRate)}%</span>
                                </div>
                                <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className={`h-full transition-all duration-1000 ${item.completionRate > 80 ? "bg-emerald-500" :
                                                item.completionRate > 50 ? "bg-indigo-500" : "bg-amber-500"
                                            }`}
                                        style={{ width: `${item.completionRate}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-gray-400">
                                    <span>{item.completedDays} / {item.totalDays} Checkpoints</span>
                                    <span>Target: 100%</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Routine Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowAddModal(false)} />
                    <div className="bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-primary/10 rounded-2xl">
                                <Settings2 className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900">Task Configuration</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Task Name</label>
                                <input
                                    type="text"
                                    value={newRoutine.title}
                                    onChange={e => setNewRoutine({ ...newRoutine, title: e.target.value })}
                                    placeholder="Enter habit name..."
                                    className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-5 text-sm font-bold placeholder:text-gray-300 focus:border-primary/20 focus:bg-white focus:outline-none transition-all shadow-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Frequency</label>
                                    <select
                                        value={newRoutine.schedule.type}
                                        onChange={e => setNewRoutine({ ...newRoutine, schedule: { ...newRoutine.schedule, type: e.target.value as any } })}
                                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-4 text-sm font-bold focus:border-primary/20 focus:bg-white focus:outline-none transition-all shadow-sm cursor-pointer"
                                    >
                                        <option value="daily">Every Day</option>
                                        <option value="weekly">Weekly Selected Days</option>
                                        <option value="monthly">Monthly Selected Dates</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Category</label>
                                    <input
                                        type="text"
                                        value={newRoutine.category}
                                        onChange={e => setNewRoutine({ ...newRoutine, category: e.target.value })}
                                        placeholder="e.g. Health"
                                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-4 text-sm font-bold focus:border-primary/20 focus:bg-white focus:outline-none transition-all shadow-sm"
                                    />
                                </div>
                            </div>

                            {newRoutine.schedule.type === "weekly" && (
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Select Active Days</label>
                                    <div className="flex flex-wrap gap-2">
                                        {DAYS_OF_WEEK.map((day, idx) => (
                                            <button
                                                key={day}
                                                onClick={() => toggleDaySelection(idx)}
                                                className={`flex-1 py-3 px-1 rounded-xl text-[10px] font-black transition-all border-2 ${newRoutine.schedule.days.includes(idx)
                                                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
                                                        : "bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100"
                                                    }`}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {newRoutine.schedule.type === "monthly" && (
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Select Dates</label>
                                    <div className="grid grid-cols-7 gap-1.5 h-48 overflow-y-auto p-2 border border-gray-100 rounded-2xl scrollbar-hide">
                                        {Array.from({ length: 31 }).map((_, i) => {
                                            const date = i + 1;
                                            return (
                                                <button
                                                    key={date}
                                                    onClick={() => toggleDateSelection(date)}
                                                    className={`aspect-square rounded-lg text-[10px] font-black transition-all border-2 ${newRoutine.schedule.dates.includes(date)
                                                            ? "bg-primary text-white border-primary"
                                                            : "bg-gray-50 text-gray-400 border-transparent hover:bg-primary/5"
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
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 bg-gray-50 text-gray-500 py-4 rounded-2xl font-black text-xs hover:bg-gray-100 transition-all border border-gray-100"
                                >
                                    Dismiss
                                </button>
                                <button
                                    onClick={handleAddRoutine}
                                    className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-xs shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Confirm Task
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
