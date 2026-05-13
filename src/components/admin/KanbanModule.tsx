"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
    Plus,
    Loader2,
    RefreshCcw,
    Trash2,
    Edit3,
    X,
    Save,
    Layout,
    Settings2,
    Palette,
    GripVertical
} from "lucide-react";
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    type DragStartEvent,
    type DragOverEvent,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    horizontalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

// --- Sortable Task Component ---
function SortableTask({ task, onEdit, onDelete }: { task: Task, onEdit: (t: Task) => void, onDelete: (id: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id, data: { type: "Task", task } });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    const getPriorityColor = (priority: Priority) => {
        switch (priority) {
            case "High": return "bg-red-500";
            case "Medium": return "bg-amber-500";
            case "Low": return "bg-emerald-500";
            default: return "bg-gray-500";
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white dark:bg-[#1e1e1e] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group relative cursor-default"
        >
            <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest text-white ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                </span>
                <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <div {...attributes} {...listeners} className="p-1 hover:bg-gray-100 text-gray-400 cursor-grab active:cursor-grabbing rounded">
                        <GripVertical size={12} />
                    </div>
                    <button
                        onClick={() => onEdit(task)}
                        className="p-1 hover:bg-gray-100 text-gray-400 hover:text-blue-500 rounded transition-colors"
                    >
                        <Edit3 size={12} />
                    </button>
                    <button
                        onClick={() => onDelete(task.id)}
                        className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>
            <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-1">{task.title}</h4>
            {task.description && (
                <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2 mb-2 leading-relaxed">{task.description}</p>
            )}
            <div className="text-[8px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest mt-2 border-t border-gray-50 dark:border-gray-800/50 pt-2">
                {new Date(task.createdAt).toLocaleDateString()}
            </div>
        </div>
    );
}

// --- Sortable Column Component ---
function SortableColumn({ column, tasks, onEdit, onAddTask, onEditTask, onDeleteTask }: {
    column: KanbanColumn,
    tasks: Task[],
    onEdit: (c: KanbanColumn) => void,
    onAddTask: (colId: string) => void,
    onEditTask: (t: Task) => void,
    onDeleteTask: (id: string) => void
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: column.id, data: { type: "Column", column } });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex flex-col gap-4 min-w-[200px] flex-1"
        >
            <div className="flex items-center justify-between px-2 group">
                <div
                    {...attributes}
                    {...listeners}
                    className="flex items-center gap-2 cursor-grab active:cursor-grabbing flex-1 overflow-hidden"
                >
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: column.color }} />
                    <h3 className="font-black text-gray-900 dark:text-white uppercase text-[10px] tracking-widest truncate">
                        {column.name}
                    </h3>
                    <span className="bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full text-[9px] shrink-0">
                        {tasks.length}
                    </span>
                </div>
                <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                    <button onClick={() => onAddTask(column.id)} className="p-1 hover:bg-gray-100 text-gray-400 rounded">
                        <Plus size={12} />
                    </button>
                    <button onClick={() => onEdit(column)} className="p-1 hover:bg-gray-100 text-gray-400 rounded">
                        <Edit3 size={12} />
                    </button>
                </div>
            </div>
            <div
                className="bg-gray-50/50 dark:bg-gray-800/20 rounded-[1.5rem] p-3 min-h-[400px] border border-gray-100/50 dark:border-white/5 space-y-3 transition-all"
                style={{ borderTop: `4px solid ${column.color}` }}
            >
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map(task => (
                        <SortableTask
                            key={task.id}
                            task={task}
                            onEdit={onEditTask}
                            onDelete={onDeleteTask}
                        />
                    ))}
                </SortableContext>
                {tasks.length === 0 && (
                    <div className="h-20 flex items-center justify-center">
                        <p className="text-[8px] text-gray-300 font-black uppercase tracking-widest">Empty</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function KanbanModule() {
    const [columns, setColumns] = useState<KanbanColumn[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [fetching, setFetching] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);
    const [editingColumn, setEditingColumn] = useState<Partial<KanbanColumn> | null>(null);
    const [isManagingColumns, setIsManagingColumns] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeType, setActiveType] = useState<"Column" | "Task" | null>(null);

    const sessionId = typeof window !== "undefined" ? localStorage.getItem("admin_sessionId") || "" : "";

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setFetching(true);
        try {
            const [colsRes, tasksRes] = await Promise.all([
                fetch("/api/admin/kanban/columns", { headers: { "X-Session-Id": sessionId } }),
                fetch("/api/admin/kanban", { headers: { "X-Session-Id": sessionId } })
            ]);
            if (colsRes.ok && tasksRes.ok) {
                const [colsData, tasksData]: [KanbanColumn[], Task[]] = await Promise.all([colsRes.json(), tasksRes.json()]);
                setColumns(colsData.sort((a, b) => a.displayOrder - b.displayOrder));
                setTasks(tasksData.sort((a, b) => a.displayOrder - b.displayOrder));
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setFetching(false);
        }
    };

    // --- Drag Handlers ---
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveId(active.id as string);
        setActiveType(active.data.current?.type);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        if (activeType === "Task") {
            const activeTask = tasks.find(t => t.id === active.id);
            if (!activeTask) return;

            const overId = over.id as string;

            // Check if hovering over a column or another task
            const overColumn = columns.find(c => c.id === overId);
            const overTask = tasks.find(t => t.id === overId);

            let newColumnId = activeTask.columnId;
            if (overColumn) {
                newColumnId = overColumn.id;
            } else if (overTask) {
                newColumnId = overTask.columnId;
            }

            if (newColumnId !== activeTask.columnId) {
                setTasks(prev => {
                    const activeIndex = prev.findIndex(t => t.id === active.id);
                    const overIndex = prev.findIndex(t => t.id === overId);

                    const updated = [...prev];
                    updated[activeIndex] = { ...updated[activeIndex], columnId: newColumnId };

                    // Reorder within tasks array if needed
                    if (overTask) {
                        return arrayMove(updated, activeIndex, overIndex);
                    }
                    return updated;
                });
            }
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        setActiveType(null);
        if (!over) return;

        if (activeType === "Column") {
            if (active.id !== over.id) {
                const oldIndex = columns.findIndex(c => c.id === active.id);
                const newIndex = columns.findIndex(c => c.id === over.id);
                const newCols = arrayMove(columns, oldIndex, newIndex).map((col, idx) => ({ ...col, displayOrder: idx }));
                setColumns(newCols);
                // Sync with DB
                try {
                    await fetch("/api/admin/kanban/columns", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json", "X-Session-Id": sessionId },
                        body: JSON.stringify(newCols.map(c => ({ id: c.id, displayOrder: c.displayOrder })))
                    });
                } catch (err) {
                    console.error("Sync columns failed:", err);
                    toast.error("Failed to save column order — refresh to reset");
                    fetchData(); // Rollback optimistic state
                }
            }
        } else if (activeType === "Task") {
            const activeIndex = tasks.findIndex(t => t.id === active.id);
            const overIndex = tasks.findIndex(t => t.id === over.id);

            let resultTasks = [...tasks];
            if (activeIndex !== overIndex) {
                resultTasks = arrayMove(tasks, activeIndex, overIndex);
            }

            // Normalize displayOrder for all tasks in their respective columns
            const columnGroups: Record<string, Task[]> = {};
            resultTasks.forEach(t => {
                if (!columnGroups[t.columnId]) columnGroups[t.columnId] = [];
                columnGroups[t.columnId].push(t);
            });

            const finalTasks: Task[] = [];
            Object.keys(columnGroups).forEach(colId => {
                columnGroups[colId].forEach((t, idx) => {
                    finalTasks.push({ ...t, displayOrder: idx });
                });
            });

            setTasks(finalTasks);

            // Sync with DB
            try {
                await fetch("/api/admin/kanban", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json", "X-Session-Id": sessionId },
                    body: JSON.stringify(finalTasks.map(t => ({ id: t.id, columnId: t.columnId, displayOrder: t.displayOrder })))
                });
            } catch (err) {
                console.error("Sync tasks failed:", err);
                toast.error("Failed to save task order — refresh to reset");
                fetchData(); // Rollback optimistic state
            }
        }
    };

    const handleSaveTask = async () => {
        if (!editingTask?.title || !editingTask.columnId) return;
        setSaving(true);
        try {
            const method = editingTask.id ? "PUT" : "POST";
            const res = await fetch("/api/admin/kanban", {
                method,
                headers: { "Content-Type": "application/json", "X-Session-Id": sessionId },
                body: JSON.stringify(editingTask),
            });
            if (res.ok) {
                const saved = await res.json();
                if (method === "POST") setTasks(prev => [...prev, saved]);
                else setTasks(prev => prev.map(t => t.id === saved.id ? saved : t));
                setEditingTask(null);
            }
        } catch (error) { console.error("Failed to save task:", error); }
        finally { setSaving(false); }
    };

    const handleDeleteTask = async (id: string) => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        try {
            const res = await fetch(`/api/admin/kanban?id=${id}`, { method: "DELETE", headers: { "X-Session-Id": sessionId } });
            if (res.ok) setTasks(prev => prev.filter(t => t.id !== id));
        } catch (error) { console.error("Failed to delete task:", error); }
    };

    const handleSaveColumn = async () => {
        if (!editingColumn?.name) return;
        setSaving(true);
        try {
            const method = editingColumn.id ? "PUT" : "POST";
            const res = await fetch("/api/admin/kanban/columns", {
                method,
                headers: { "Content-Type": "application/json", "X-Session-Id": sessionId },
                body: JSON.stringify({ ...editingColumn, displayOrder: editingColumn.displayOrder ?? columns.length }),
            });
            if (res.ok) {
                const saved = await res.json();
                if (method === "POST") setColumns(prev => [...prev, saved].sort((a, b) => a.displayOrder - b.displayOrder));
                else setColumns(prev => prev.map(c => c.id === saved.id ? saved : c).sort((a, b) => a.displayOrder - b.displayOrder));
                setEditingColumn(null);
            }
        } catch (error) { console.error("Failed to save column:", error); }
        finally { setSaving(false); }
    };

    const handleDeleteColumn = async (id: string) => {
        const tasksInCol = tasks.filter(t => t.columnId === id).length;
        if (tasksInCol > 0) {
            alert(`Cannot delete column: ${tasksInCol} tasks are still in this column.`);
            return;
        }
        if (!confirm("Are you sure you want to delete this column?")) return;
        try {
            const res = await fetch(`/api/admin/kanban/columns?id=${id}`, { method: "DELETE", headers: { "X-Session-Id": sessionId } });
            if (res.ok) setColumns(prev => prev.filter(c => c.id !== id));
        } catch (error) { console.error("Failed to delete column:", error); }
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
                        Agile Kanban
                        <button onClick={() => fetchData()} className="p-1.5 bg-gray-100 font-bold hover:bg-gray-200 text-gray-600 rounded-lg transition-all">
                            <RefreshCcw size={14} />
                        </button>
                    </h2>
                    <p className="text-secondary text-[10px] font-bold mt-0.5 uppercase tracking-widest opacity-60">Fluid Workflow Management</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsManagingColumns(!isManagingColumns)}
                        className={`px-4 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 ${isManagingColumns ? 'bg-primary text-white shadow-lg' : 'bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white border-2 border-gray-900 dark:border-white/20 hover:border-primary/50'}`}
                    >
                        <Settings2 size={16} /> {isManagingColumns ? "Close Editor" : "Edit Columns"}
                    </button>
                    <button
                        onClick={() => columns.length > 0 && setEditingTask({ columnId: columns[0].id, priority: "Medium" })}
                        disabled={columns.length === 0}
                        title={columns.length === 0 ? "Create a column first" : undefined}
                        className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        <Plus size={16} /> New Task
                    </button>
                </div>
            </div>

            {/* Column Management Modal-style Section */}
            {isManagingColumns && (
                <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white animate-in zoom-in-95 duration-300 shadow-2xl overflow-hidden relative border-4 border-primary/20">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-[80px] rounded-full -mr-24 -mt-24" />
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black uppercase text-xs tracking-[0.2em] text-teal-400">Workflow Configuration</h3>
                            <button
                                onClick={() => setEditingColumn({ name: "", color: "#3b82f6", displayOrder: columns.length })}
                                className="bg-white text-gray-900 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-teal-400 hover:text-white transition-all shadow-lg"
                            >
                                <Plus size={12} className="inline mr-1" /> Add List
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {columns.map(col => (
                                <div key={col.id} className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700/50 flex flex-col items-center gap-3 group">
                                    <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: col.color }} />
                                    <span className="font-black uppercase tracking-wider text-[9px] truncate w-full text-center">{col.name}</span>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => setEditingColumn(col)} className="p-1.5 hover:bg-gray-700 rounded-lg">
                                            <Edit3 size={10} />
                                        </button>
                                        <button onClick={() => handleDeleteColumn(col.id)} className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg">
                                            <Trash2 size={10} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Fluid Board */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex flex-row gap-4 items-start w-full">
                    <SortableContext items={columns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
                        {columns.map(column => (
                            <SortableColumn
                                key={column.id}
                                column={column}
                                tasks={tasks.filter(t => t.columnId === column.id)}
                                onEdit={setEditingColumn}
                                onAddTask={(colId) => setEditingTask({ columnId: colId, priority: "Medium" })}
                                onEditTask={setEditingTask}
                                onDeleteTask={handleDeleteTask}
                            />
                        ))}
                    </SortableContext>
                </div>

                <DragOverlay dropAnimation={{
                    sideEffects: defaultDropAnimationSideEffects({
                        styles: { active: { opacity: "0.5" } }
                    })
                }}>
                    {activeId ? (
                        activeType === "Column" ? (
                            <div className="bg-white dark:bg-[#1e1e1e] p-3 rounded-xl shadow-2xl border-2 border-primary w-[200px] opacity-90 cursor-grabbing">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: columns.find(c => c.id === activeId)?.color }} />
                                    <span className="font-black uppercase text-[9px] tracking-widest dark:text-white">{columns.find(c => c.id === activeId)?.name}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-[#1e1e1e] p-4 rounded-2xl shadow-2xl border-2 border-primary w-[240px] opacity-90 cursor-grabbing">
                                <h4 className="font-bold text-gray-900 dark:text-white text-xs">{tasks.find(t => t.id === activeId)?.title}</h4>
                            </div>
                        )
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Task Modal */}
            {editingTask && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-[2rem] shadow-2xl w-full max-w-lg p-8 relative animate-in zoom-in-95 duration-300 transition-colors">
                        <button onClick={() => setEditingTask(null)} className="absolute top-8 right-8 p-2 hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-300 hover:text-red-500 rounded-full transition-all">
                            <X size={20} />
                        </button>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight mb-6 uppercase">
                            {editingTask.id ? "Edit Task" : "New Task"}
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-2">Title</label>
                                <input
                                    type="text"
                                    value={editingTask.title || ""}
                                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-800/50 border-0 rounded-xl px-4 py-3 font-bold text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary shadow-inner transition-colors"
                                    placeholder="Task title..."
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-2">Description</label>
                                <textarea
                                    value={editingTask.description || ""}
                                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-800/50 border-0 rounded-xl px-4 py-3 font-bold text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary min-h-[100px] shadow-inner transition-colors"
                                    placeholder="Details..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-2">Priority</label>
                                    <select
                                        value={editingTask.priority}
                                        onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as Priority })}
                                        className="w-full bg-gray-50 dark:bg-gray-800/50 border-0 rounded-xl px-4 py-3 font-black uppercase text-[9px] tracking-widest focus:ring-2 focus:ring-primary dark:text-white transition-colors"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-2">Column</label>
                                    <select
                                        value={editingTask.columnId}
                                        onChange={(e) => setEditingTask({ ...editingTask, columnId: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-800/50 border-0 rounded-xl px-4 py-3 font-black uppercase text-[9px] tracking-widest focus:ring-2 focus:ring-primary dark:text-white transition-colors"
                                    >
                                        {columns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={handleSaveTask}
                                disabled={saving || !editingTask.title}
                                className="w-full bg-primary text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
                            >
                                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                {editingTask.id ? "Save Task" : "Create Task"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Column Modal */}
            {editingColumn && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[210] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8 relative animate-in slide-in-from-bottom-6 duration-300">
                        <button onClick={() => setEditingColumn(null)} className="absolute top-8 right-8 p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-full transition-all">
                            <X size={20} />
                        </button>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight mb-6 uppercase">
                            {editingColumn.id ? "Edit List" : "New List"}
                        </h3>
                        <div className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-2">Name</label>
                                <input
                                    type="text"
                                    value={editingColumn.name || ""}
                                    onChange={(e) => setEditingColumn({ ...editingColumn, name: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-800/50 border-0 rounded-xl px-4 py-3 font-bold text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary shadow-inner transition-colors"
                                    placeholder="e.g. Done"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-2 flex items-center gap-2">
                                    <Palette size={12} /> Color Accent
                                </label>
                                <div className="grid grid-cols-5 gap-2">
                                    {["#64748b", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#06b6d4"].map(hex => (
                                        <button
                                            key={hex}
                                            onClick={() => setEditingColumn({ ...editingColumn, color: hex })}
                                            className={`aspect-square rounded-xl transition-all shadow-sm ${editingColumn.color === hex ? 'ring-4 ring-gray-900 scale-110' : 'hover:scale-105'}`}
                                            style={{ backgroundColor: hex }}
                                        />
                                    ))}
                                </div>
                                <div className="flex items-center gap-3 mt-2 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-xl">
                                    <input type="color" value={editingColumn.color || "#3b82f6"} onChange={(e) => setEditingColumn({ ...editingColumn, color: e.target.value })} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0" />
                                    <span className="text-[9px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest">{editingColumn.color || "#3b82f6"}</span>
                                </div>
                            </div>
                            <button
                                onClick={handleSaveColumn}
                                disabled={saving || !editingColumn.name}
                                className="w-full bg-primary text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                {editingColumn.id ? "Apply Changes" : "Create List"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
