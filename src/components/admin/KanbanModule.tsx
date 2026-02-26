"use client";

import { useEffect, useState } from "react";
import {
    Plus,
    Loader2,
    RefreshCcw,
    Trash2,
    Edit3,
    Clock,
    CheckCircle2,
    X,
    Save,
    Layout,
    Settings2,
    ChevronLeft,
    ChevronRight,
    Palette
} from "lucide-react";

type Priority = "Low" | "Medium" | "High";

interface KanbanColumn {
    id: string;
    name: string;
    color: string;
    displayOrder: number;
}

interface Task {
    id: string;
    title: string;
    description: string | null;
    priority: Priority;
    columnId: string;
    displayOrder: number;
    createdAt: string;
    updatedAt: string;
}

export default function KanbanModule() {
    const [columns, setColumns] = useState<KanbanColumn[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [fetching, setFetching] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);
    const [editingColumn, setEditingColumn] = useState<Partial<KanbanColumn> | null>(null);
    const [isManagingColumns, setIsManagingColumns] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setFetching(true);
        try {
            const [colsRes, tasksRes] = await Promise.all([
                fetch("/api/admin/kanban/columns"),
                fetch("/api/admin/kanban")
            ]);

            if (colsRes.ok && tasksRes.ok) {
                const [colsData, tasksData] = await Promise.all([
                    colsRes.json(),
                    tasksRes.json()
                ]);
                setColumns(colsData);
                setTasks(tasksData);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setFetching(false);
        }
    };

    const handleSaveTask = async () => {
        if (!editingTask?.title || !editingTask.columnId) return;
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

    const handleSaveColumn = async () => {
        if (!editingColumn?.name) return;
        setSaving(true);
        try {
            const method = editingColumn.id ? "PUT" : "POST";
            const res = await fetch("/api/admin/kanban/columns", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...editingColumn,
                    displayOrder: editingColumn.displayOrder ?? columns.length
                }),
            });

            if (res.ok) {
                const saved = await res.json();
                if (method === "POST") {
                    setColumns(prev => [...prev, saved].sort((a, b) => a.displayOrder - b.displayOrder));
                } else {
                    setColumns(prev => prev.map(c => c.id === saved.id ? saved : c).sort((a, b) => a.displayOrder - b.displayOrder));
                }
                setEditingColumn(null);
            }
        } catch (error) {
            console.error("Failed to save column:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteColumn = async (id: string) => {
        const tasksInCol = tasks.filter(t => t.columnId === id).length;
        if (tasksInCol > 0) {
            alert(`Cannot delete column: ${tasksInCol} tasks are still in this column. Please move or delete them first.`);
            return;
        }
        if (!confirm("Are you sure you want to delete this column?")) return;

        try {
            const res = await fetch(`/api/admin/kanban/columns?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setColumns(prev => prev.filter(c => c.id !== id));
            }
        } catch (error) {
            console.error("Failed to delete column:", error);
        }
    };

    const moveTask = async (task: Task, direction: 'prev' | 'next') => {
        const currentIndex = columns.findIndex(c => c.id === task.columnId);
        const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

        if (nextIndex < 0 || nextIndex >= columns.length) return;

        const newColumnId = columns[nextIndex].id;

        try {
            const res = await fetch("/api/admin/kanban", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...task, columnId: newColumnId }),
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
                        <button onClick={() => fetchData()} className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-all">
                            <RefreshCcw size={14} />
                        </button>
                    </h2>
                    <p className="text-secondary text-xs font-bold mt-0.5">Organize and track your tasks efficiently</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsManagingColumns(!isManagingColumns)}
                        className="bg-white text-gray-900 border-2 border-gray-900 px-4 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2"
                    >
                        <Settings2 size={16} /> {isManagingColumns ? "Close Management" : "Manage Columns"}
                    </button>
                    <button
                        onClick={() => setEditingTask({ columnId: columns[0]?.id, priority: "Medium" })}
                        className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Plus size={16} /> Add New Task
                    </button>
                </div>
            </div>

            {/* Column Management UI */}
            {isManagingColumns && (
                <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white animate-in slide-in-from-top-4 duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-black uppercase text-sm tracking-widest flex items-center gap-2">
                            <Settings2 size={18} className="text-teal-400" />
                            Manage Board Columns
                        </h3>
                        <button
                            onClick={() => setEditingColumn({ name: "", color: "#3b82f6", displayOrder: columns.length })}
                            className="bg-teal-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-600 transition-all"
                        >
                            <Plus size={14} className="inline mr-1" /> Add Column
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {columns.map(col => (
                            <div key={col.id} className="bg-gray-800 p-4 rounded-2xl border border-gray-700 flex justify-between items-center group">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: col.color }} />
                                    <span className="font-bold text-sm">{col.name}</span>
                                </div>
                                <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-all">
                                    <button onClick={() => setEditingColumn(col)} className="p-2 hover:bg-gray-700 rounded-lg transition-all">
                                        <Edit3 size={14} />
                                    </button>
                                    <button onClick={() => handleDeleteColumn(col.id)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-all">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Board */}
            <div className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide">
                {columns.map(column => (
                    <div key={column.id} className="flex flex-col gap-4 min-w-[320px] max-w-[320px] shrink-0">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: column.color }} />
                                {column.name}
                                <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-[10px]">
                                    {tasks.filter(t => t.columnId === column.id).length}
                                </span>
                            </h3>
                        </div>
                        <div
                            className="bg-gray-50/50 rounded-[2rem] p-4 min-h-[500px] border border-gray-100/50 space-y-4 transition-all"
                            style={{ borderTop: `4px solid ${column.color}` }}
                        >
                            {tasks
                                .filter(t => t.columnId === column.id)
                                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                                .map(task => (
                                    <div
                                        key={task.id}
                                        className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative"
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
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                {new Date(task.createdAt).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {columns.indexOf(column) !== 0 && (
                                                    <button
                                                        onClick={() => moveTask(task, 'prev')}
                                                        className="p-1.5 bg-gray-50 text-gray-400 hover:bg-gray-100 rounded-lg transition-all"
                                                        title="Move Back"
                                                    >
                                                        <ChevronLeft size={14} />
                                                    </button>
                                                )}
                                                {columns.indexOf(column) !== columns.length - 1 && (
                                                    <button
                                                        onClick={() => moveTask(task, 'next')}
                                                        className="p-1.5 bg-gray-900 text-white hover:bg-black rounded-lg transition-all shadow-md"
                                                        title="Move Forward"
                                                    >
                                                        <ChevronRight size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            {tasks.filter(t => t.columnId === column.id).length === 0 && (
                                <div className="h-20 flex items-center justify-center">
                                    <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest">No tasks</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Task Modal */}
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
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Column</label>
                                    <select
                                        value={editingTask.columnId}
                                        onChange={(e) => setEditingTask({ ...editingTask, columnId: e.target.value })}
                                        className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 font-black uppercase text-[11px] tracking-widest focus:ring-2 focus:ring-primary"
                                    >
                                        {columns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={handleSaveTask}
                                disabled={saving || !editingTask.title || !editingTask.columnId}
                                className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                {editingTask.id ? "Update Task" : "Create Task"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Column Modal */}
            {editingColumn && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 md:p-12 relative animate-in zoom-in-95 duration-300">
                        <button onClick={() => setEditingColumn(null)} className="absolute top-8 right-8 p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-full transition-all">
                            <X size={24} />
                        </button>

                        <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-8">
                            {editingColumn.id ? "Edit Column" : "Add Column"}
                        </h3>

                        <div className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Column Name</label>
                                <input
                                    type="text"
                                    value={editingColumn.name || ""}
                                    onChange={(e) => setEditingColumn({ ...editingColumn, name: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-primary"
                                    placeholder="e.g., Testing"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 flex items-center gap-2">
                                    <Palette size={14} /> Column Accent Color
                                </label>
                                <div className="grid grid-cols-5 gap-3">
                                    {["#64748b", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#06b6d4"].map(hex => (
                                        <button
                                            key={hex}
                                            onClick={() => setEditingColumn({ ...editingColumn, color: hex })}
                                            className={`aspect-square rounded-xl transition-all ${editingColumn.color === hex ? 'ring-4 ring-gray-900 scale-110' : 'hover:scale-105'}`}
                                            style={{ backgroundColor: hex }}
                                        />
                                    ))}
                                </div>
                                <input
                                    type="color"
                                    value={editingColumn.color || "#3b82f6"}
                                    onChange={(e) => setEditingColumn({ ...editingColumn, color: e.target.value })}
                                    className="w-full h-10 rounded-xl cursor-pointer bg-gray-50 border-0 p-1 mt-2"
                                />
                            </div>

                            <button
                                onClick={handleSaveColumn}
                                disabled={saving || !editingColumn.name}
                                className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                {editingColumn.id ? "Update Column" : "Create Column"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
