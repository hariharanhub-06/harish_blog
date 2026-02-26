"use client";

import { useEffect, useState } from "react";
import {
    Plus,
    Loader2,
    RefreshCcw,
    MoreVertical,
    Trash2,
    Edit3,
    Clock,
    CheckCircle2,
    AlertCircle,
    X,
    Save,
    Layout
} from "lucide-react";

type Priority = "Low" | "Medium" | "High";
type Status = "To Do" | "In Progress" | "Done";

interface Task {
    id: string;
    title: string;
    description: string | null;
    priority: Priority;
    status: Status;
    displayOrder: number;
    createdAt: string;
    updatedAt: string;
}

const COLUMNS: Status[] = ["To Do", "In Progress", "Done"];

export default function KanbanModule() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [fetching, setFetching] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        setFetching(true);
        try {
            const res = await fetch("/api/admin/kanban");
            if (res.ok) {
                const data = await res.json();
                setTasks(data);
            }
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
        } finally {
            setFetching(false);
        }
    };

    const handleSaveTask = async () => {
        if (!editingTask?.title) return;
        setSaving(true);
        try {
            const method = editingTask.id ? "PUT" : "POST";
            const res = await fetch("/api/admin/kanban", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingTask),
            });

            if (res.ok) {
                const saved = await res.json();
                if (method === "POST") {
                    setTasks(prev => [...prev, saved]);
                } else {
                    setTasks(prev => prev.map(t => t.id === saved.id ? saved : t));
                }
                setEditingTask(null);
            }
        } catch (error) {
            console.error("Failed to save task:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteTask = async (id: string) => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        try {
            const res = await fetch(`/api/admin/kanban?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setTasks(prev => prev.filter(t => t.id !== id));
            }
        } catch (error) {
            console.error("Failed to delete task:", error);
        }
    };

    const moveTask = async (task: Task, newStatus: Status) => {
        try {
            const res = await fetch("/api/admin/kanban", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...task, status: newStatus }),
            });
            if (res.ok) {
                const updated = await res.json();
                setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
            }
        } catch (error) {
            console.error("Failed to move task:", error);
        }
    };

    const getPriorityColor = (priority: Priority) => {
        switch (priority) {
            case "High": return "bg-red-500";
            case "Medium": return "bg-amber-500";
            case "Low": return "bg-emerald-500";
            default: return "bg-gray-500";
        }
    };

    const getStatusIcon = (status: Status) => {
        switch (status) {
            case "To Do": return <Clock size={14} className="text-gray-400" />;
            case "In Progress": return <Loader2 size={14} className="text-blue-500 animate-spin" />;
            case "Done": return <CheckCircle2 size={14} className="text-emerald-500" />;
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2 uppercase tracking-tighter">
                        <Layout size={24} className="text-primary" />
                        Kanban Board
                        <button onClick={() => fetchTasks()} className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-all">
                            <RefreshCcw size={14} />
                        </button>
                    </h2>
                    <p className="text-secondary text-xs font-bold mt-0.5">Organize and track your tasks efficiently</p>
                </div>
                <button
                    onClick={() => setEditingTask({ status: "To Do", priority: "Medium" })}
                    className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Plus size={16} /> Add New Task
                </button>
            </div>

            {/* Board */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {COLUMNS.map(column => (
                    <div key={column} className="flex flex-col gap-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest flex items-center gap-2">
                                {column}
                                <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-[10px]">
                                    {tasks.filter(t => t.status === column).length}
                                </span>
                            </h3>
                        </div>
                        <div className="bg-gray-50/50 rounded-[2rem] p-4 min-h-[500px] border border-gray-100/50 space-y-4">
                            {tasks
                                .filter(t => t.status === column)
                                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                                .map(task => (
                                    <div
                                        key={task.id}
                                        className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative border-l-4"
                                        style={{ borderLeftColor: getPriorityColor(task.priority).replace('bg-', '') }}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest text-white ${getPriorityColor(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setEditingTask(task)}
                                                    className="p-1 hover:bg-gray-100 text-gray-400 hover:text-blue-500 rounded transition-colors"
                                                >
                                                    <Edit3 size={12} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTask(task.id)}
                                                    className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                        <h4 className="font-bold text-gray-900 text-sm mb-1">{task.title}</h4>
                                        {task.description && (
                                            <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">{task.description}</p>
                                        )}
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                                                {getStatusIcon(task.status)}
                                                {task.status}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {column !== "To Do" && (
                                                    <button
                                                        onClick={() => moveTask(task, COLUMNS[COLUMNS.indexOf(column) - 1])}
                                                        className="p-1.5 bg-gray-50 text-gray-400 hover:bg-gray-100 rounded-lg transition-all"
                                                        title="Move Back"
                                                    >
                                                        <Plus size={12} className="rotate-180" />
                                                    </button>
                                                )}
                                                {column !== "Done" && (
                                                    <button
                                                        onClick={() => moveTask(task, COLUMNS[COLUMNS.indexOf(column) + 1])}
                                                        className="p-1.5 bg-primary/5 text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                        title="Move Forward"
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            {tasks.filter(t => t.status === column).length === 0 && (
                                <div className="h-20 flex items-center justify-center">
                                    <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest">No tasks</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {editingTask && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-8 md:p-12 relative animate-in zoom-in-95 duration-300">
                        <button onClick={() => setEditingTask(null)} className="absolute top-8 right-8 p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-full transition-all">
                            <X size={24} />
                        </button>

                        <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-8">
                            {editingTask.id ? "Edit Task" : "Create New Task"}
                        </h3>

                        <div className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Task Title</label>
                                <input
                                    type="text"
                                    value={editingTask.title || ""}
                                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-primary"
                                    placeholder="What needs to be done?"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Description</label>
                                <textarea
                                    value={editingTask.description || ""}
                                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-primary min-h-[120px]"
                                    placeholder="Add more details..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Priority</label>
                                    <select
                                        value={editingTask.priority}
                                        onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as Priority })}
                                        className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 font-black uppercase text-[11px] tracking-widest focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Initial Status</label>
                                    <select
                                        value={editingTask.status}
                                        onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as Status })}
                                        className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 font-black uppercase text-[11px] tracking-widest focus:ring-2 focus:ring-primary"
                                    >
                                        {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={handleSaveTask}
                                disabled={saving || !editingTask.title}
                                className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                {editingTask.id ? "Update Task" : "Create Task"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
