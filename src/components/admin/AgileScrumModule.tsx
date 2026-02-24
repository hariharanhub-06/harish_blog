"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Plus,
    MoreVertical,
    ChevronDown,
    ChevronRight,
    Maximize2,
    Minimize2,
    Filter,
    Search,
    Layout as BoardIcon,
    List as BacklogIcon,
    BarChart2,
    Users,
    Clock,
    Flag,
    CheckSquare,
    Bug,
    Target,
    Zap,
    AlertCircle,
    Calendar,
    MessageSquare,
    Save,
    Trash2,
    X,
    Settings,
    ArrowUpRight,
    TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area
} from "recharts";
import toast from "react-hot-toast";

// --- Types ---

type Project = {
    id: string;
    name: string;
    key: string;
    description?: string;
    avatarUrl?: string;
    workflows?: Workflow[];
};

type Workflow = {
    id: string;
    projectId: string;
    statusOrder: string[];
};

type Epic = {
    id: string;
    title: string;
    color: string;
    status: string;
};

type Sprint = {
    id: string;
    name: string;
    status: "planned" | "active" | "closed";
    startDate?: string;
    endDate?: string;
    goal?: string;
};

type Issue = {
    id: string;
    title: string;
    description?: string;
    type: "story" | "task" | "bug" | "subtask";
    status: string;
    priority: "Lowest" | "Low" | "Medium" | "High" | "Highest";
    storyPoints: number;
    assignee?: string;
    epicId?: string;
    sprintId?: string;
    parentId?: string;
    position: number;
    subtasks?: Issue[];
};

type View = "board" | "backlog" | "reports" | "meetings";

export default function AgileScrumModule() {
    const [isZenMode, setIsZenMode] = useState(false);
    const [activeView, setActiveView] = useState<View>("board");
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [workflow, setWorkflow] = useState<Workflow | null>(null);
    const [epics, setEpics] = useState<Epic[]>([]);
    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
    const [editingIssue, setEditingIssue] = useState<Partial<Issue> | null>(null);

    // Initial Load
    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await fetch("/api/admin/agile/projects");
            if (res.ok) {
                const data = await res.json();
                setProjects(data);
                if (data.length > 0 && !selectedProject) {
                    setSelectedProject(data[0]);
                }
            }
        } catch (err) {
            console.error("Failed to fetch projects", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjectData = useCallback(async (projectId: string) => {
        setLoading(true);
        try {
            const [epicsRes, sprintsRes, issuesRes, workflowRes] = await Promise.all([
                fetch(`/api/admin/agile/epics?projectId=${projectId}`),
                fetch(`/api/admin/agile/sprints?projectId=${projectId}`),
                fetch(`/api/admin/agile/issues?projectId=${projectId}`),
                fetch(`/api/admin/agile/workflows?projectId=${projectId}`)
            ]);

            if (epicsRes.ok) setEpics(await epicsRes.json());
            if (sprintsRes.ok) setSprints(await sprintsRes.json());
            if (issuesRes.ok) setIssues(await issuesRes.json());
            if (workflowRes.ok) setWorkflow(await workflowRes.json());

        } catch (err) {
            console.error("Failed to fetch project data", err);
            toast.error("Failed to refresh project data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedProject) {
            fetchProjectData(selectedProject.id);
        }
    }, [selectedProject, fetchProjectData]);

    const handleSaveIssue = async (issueData: Partial<Issue>) => {
        if (!selectedProject) return;
        try {
            const res = await fetch("/api/admin/agile/issues", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...issueData, projectId: selectedProject.id })
            });
            if (res.ok) {
                toast.success(issueData.id ? "Issue updated" : "Issue created");
                fetchProjectData(selectedProject.id);
                setIsIssueModalOpen(false);
            }
        } catch (err) {
            toast.error("Failed to save issue");
        }
    };

    if (loading && projects.length === 0) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Initializing Workspace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`transition-all duration-500 ${isZenMode ? "fixed inset-0 z-[100] bg-white lg:ml-0" : "relative"}`}>
            {/* Header / Toolbar */}
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <select
                                className="appearance-none bg-white border border-gray-100 rounded-2xl px-5 py-3 pr-12 text-sm font-black text-gray-900 shadow-sm focus:ring-4 focus:ring-teal-500/10 transition-all cursor-pointer outline-none"
                                value={selectedProject?.id || ""}
                                onChange={(e) => setSelectedProject(projects.find(p => p.id === e.target.value) || null)}
                            >
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.key})</option>
                                ))}
                                <option value="new">+ Create New Project</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>

                        <div className="h-10 w-px bg-gray-100 hidden md:block" />

                        <nav className="flex bg-gray-50 p-1.5 rounded-2xl items-center gap-1">
                            {[
                                { id: "board", icon: BoardIcon, label: "Board" },
                                { id: "backlog", icon: BacklogIcon, label: "Backlog" },
                                { id: "reports", icon: BarChart2, label: "Reports" },
                                { id: "meetings", icon: MessageSquare, label: "Meetings" },
                            ].map(view => (
                                <button
                                    key={view.id}
                                    onClick={() => setActiveView(view.id as View)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-[1.1rem] text-xs font-black transition-all ${activeView === view.id
                                        ? "bg-white text-teal-600 shadow-sm shadow-black/5"
                                        : "text-gray-400 hover:text-gray-600"
                                        }`}
                                >
                                    <view.icon size={14} />
                                    <span className="hidden sm:inline">{view.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search workspace..."
                                className="bg-white border border-gray-100 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold w-full md:w-64 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all shadow-sm"
                            />
                        </div>
                        <button
                            onClick={() => setIsZenMode(!isZenMode)}
                            className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:text-teal-600 shadow-sm transition-all hover:scale-105 active:scale-95"
                        >
                            {isZenMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                        <button
                            onClick={() => {
                                setEditingIssue({ type: "story", priority: "Medium", status: workflow?.statusOrder[0] || "To Do", storyPoints: 0 });
                                setIsIssueModalOpen(true);
                            }}
                            className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-2xl font-black text-xs shadow-lg shadow-teal-600/20 hover:bg-teal-700 transition-all hover:scale-105 active:scale-95"
                        >
                            <Plus size={16} /> <span className="hidden sm:inline">New Issue</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* View Content */}
            <div className={`w-full overflow-hidden ${isZenMode ? "h-[calc(100vh-140px)] px-8" : "min-h-[600px]"}`}>
                <AnimatePresence mode="wait">
                    {activeView === "board" && (
                        <BoardView
                            key="board"
                            projectId={selectedProject?.id}
                            workflow={workflow}
                            issues={issues}
                            epics={epics}
                            onUpdateIssue={handleSaveIssue}
                        />
                    )}
                    {activeView === "backlog" && (
                        <BacklogView
                            key="backlog"
                            projectId={selectedProject?.id}
                            issues={issues}
                            sprints={sprints}
                            epics={epics}
                            onUpdateIssue={handleSaveIssue}
                        />
                    )}
                    {activeView === "reports" && (
                        <ReportsView
                            key="reports"
                            projectId={selectedProject?.id}
                            issues={issues}
                            sprints={sprints}
                        />
                    )}
                    {activeView === "meetings" && (
                        <MeetingsView
                            key="meetings"
                            projectId={selectedProject?.id}
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Issue Modal */}
            <IssueModal
                isOpen={isIssueModalOpen}
                onClose={() => setIsIssueModalOpen(false)}
                issue={editingIssue}
                onSave={handleSaveIssue}
                epics={epics}
                sprints={sprints}
                workflow={workflow}
            />
        </div>
    );
}

// --- Board View Component ---

function BoardView({ projectId, workflow, issues, epics, onUpdateIssue }: {
    projectId: string;
    workflow: Workflow | null;
    issues: Issue[];
    epics: Epic[];
    onUpdateIssue: (issue: Partial<Issue>) => Promise<void>;
}) {
    const statuses = workflow?.statusOrder || ["To Do", "In Progress", "Done"];
    const [activeSprint, setActiveSprint] = useState<any>(null);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="h-full"
        >
            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin h-full items-start">
                {statuses.map((status: string) => (
                    <div key={status} className="flex-shrink-0 w-80 flex flex-col h-full bg-gray-50/50 rounded-3xl border border-dashed border-gray-200/50">
                        <div className="p-4 flex items-center justify-between">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">
                                {status} <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-600 rounded-lg text-[9px] lowercase italic font-medium">
                                    {issues.filter((i: any) => i.status === status).length}
                                </span>
                            </h4>
                            <button className="p-1.5 text-gray-300 hover:text-teal-600 transition-colors">
                                <Plus size={14} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
                            {issues
                                .filter((i: any) => i.status === status)
                                .map((issue: any) => (
                                    <IssueCard
                                        key={issue.id}
                                        issue={issue}
                                        epic={epics.find((e: any) => e.id === issue.epicId)}
                                    />
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

function IssueCard({ issue, epic }: { issue: Issue; epic?: Epic }) {
    const typeIcons: any = {
        story: { icon: Target, color: "text-emerald-500", bg: "bg-emerald-50" },
        task: { icon: CheckSquare, color: "text-blue-500", bg: "bg-blue-50" },
        bug: { icon: Bug, color: "text-red-500", bg: "bg-red-50" },
        subtask: { icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
    };

    const priorityColors: any = {
        Highest: "text-red-700 bg-red-50",
        High: "text-orange-700 bg-orange-50",
        Medium: "text-amber-700 bg-amber-50",
        Low: "text-blue-700 bg-blue-50",
        Lowest: "text-gray-700 bg-gray-50",
    };

    const IconData = typeIcons[issue.type] || typeIcons.task;

    return (
        <motion.div
            layoutId={issue.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-black/5 cursor-grab active:cursor-grabbing group transition-all"
        >
            <div className="flex items-start justify-between mb-2">
                <div className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${priorityColors[issue.priority]}`}>
                    {issue.priority}
                </div>
                <button className="text-gray-300 group-hover:text-gray-600 transition-colors">
                    <MoreVertical size={14} />
                </button>
            </div>

            <h5 className="text-[13px] font-bold text-gray-900 leading-tight mb-3 group-hover:text-teal-600 transition-colors">
                {issue.title}
            </h5>

            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <div className="flex items-center gap-2">
                    <div className={`p-1 rounded-md ${IconData.bg} ${IconData.color}`}>
                        <IconData.icon size={10} />
                    </div>
                    {epic && (
                        <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-md border" style={{ borderColor: epic.color + '44', color: epic.color, backgroundColor: epic.color + '11' }}>
                            {epic.title}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {issue.storyPoints > 0 && (
                        <div className="w-5 h-5 flex items-center justify-center bg-gray-900 text-white rounded-full text-[9px] font-black">
                            {issue.storyPoints}
                        </div>
                    )}
                    <div className="w-6 h-6 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[10px] font-black text-teal-600">
                        {issue.assignee?.charAt(0) || "U"}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// --- Backlog View Component ---

function BacklogView({ projectId, issues, sprints, epics, onUpdateIssue }: {
    projectId: string;
    issues: Issue[];
    sprints: Sprint[];
    epics: Epic[];
    onUpdateIssue: (issue: Partial<Issue>) => Promise<void>;
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8 h-full overflow-y-auto pr-4 scrollbar-thin"
        >
            {/* Active/Future Sprints */}
            {sprints.filter((s: any) => s.status !== "closed").map((sprint: any) => (
                <div key={sprint.id} className="bg-white border border-gray-100 rounded-[2rem] shadow-sm overflow-hidden group">
                    <div className="bg-gray-50/50 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black ${sprint.status === "active" ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20" : "bg-gray-100 text-gray-400"}`}>
                                <Zap size={18} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                                    {sprint.name}
                                    {sprint.status === "active" && <span className="text-[8px] bg-teal-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest ml-2">Active</span>}
                                </h3>
                                <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                                    {sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : "No start date"} - {sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : "No end date"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Velocity</span>
                                <span className="text-xs font-black text-gray-900">{issues.filter((i: any) => i.sprintId === sprint.id).reduce((acc: number, i: any) => acc + (i.storyPoints || 0), 0)} pts</span>
                            </div>
                            <button className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-xs font-black shadow-sm hover:border-teal-600 hover:text-teal-600 transition-all">
                                {sprint.status === "active" ? "Complete Sprint" : "Start Sprint"}
                            </button>
                        </div>
                    </div>

                    <div className="p-2 space-y-1">
                        {issues.filter((i: any) => i.sprintId === sprint.id).map((issue: any) => (
                            <BacklogItem key={issue.id} issue={issue} epics={epics} />
                        ))}
                        {issues.filter((i: any) => i.sprintId === sprint.id).length === 0 && (
                            <div className="p-8 text-center border border-dashed border-gray-100 rounded-3xl m-4">
                                <p className="text-[10px] font-black uppercase text-gray-300 tracking-widest">No issues assigned. Drag and drop issues here.</p>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {/* Backlog */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-6">
                    <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                        Backlog <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-lg">{issues.filter((i: any) => !i.sprintId).length} issues</span>
                    </h3>
                    <button className="text-primary font-black text-xs hover:underline flex items-center gap-1">
                        <Plus size={14} /> Create Sprint
                    </button>
                </div>

                <div className="bg-white/60 backdrop-blur-xl border border-gray-100 rounded-[2rem] p-2 space-y-1 shadow-sm">
                    {issues.filter((i: any) => !i.sprintId).map((issue: any) => (
                        <BacklogItem key={issue.id} issue={issue} epics={epics} />
                    ))}
                    {issues.filter((i: any) => !i.sprintId).length === 0 && (
                        <div className="p-12 text-center">
                            <AlertCircle size={32} className="mx-auto text-gray-100 mb-3" />
                            <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Backlog is empty</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

function BacklogItem({ issue, epics }: { issue: Issue; epics: Epic[] }) {
    const typeIcons: any = {
        story: { icon: Target, color: "text-emerald-500" },
        task: { icon: CheckSquare, color: "text-blue-500" },
        bug: { icon: Bug, color: "text-red-500" },
    };
    const icon = typeIcons[issue.type]?.icon || Target;
    const epic = epics.find((e: any) => e.id === issue.epicId);

    return (
        <div className="flex items-center justify-between p-3 px-6 hover:bg-gray-50/80 rounded-2xl transition-all group cursor-pointer border border-transparent hover:border-gray-100">
            <div className="flex items-center gap-4 flex-1">
                <div className={typeIcons[issue.type]?.color}>
                    {icon({ size: 14 })}
                </div>
                <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest hidden sm:inline">{issue.id.slice(0, 4)}</span>
                <span className="text-xs font-bold text-gray-700 truncate group-hover:text-gray-900">{issue.title}</span>
                {epic && (
                    <span className="text-[7px] font-black uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: epic.color + "11", color: epic.color, border: `1px solid ${epic.color}22` }}>
                        {epic.title}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-4">
                <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg">
                    {issue.status}
                </div>
                <div className="w-6 h-6 rounded-lg bg-secondary text-white flex items-center justify-center text-[10px] font-black group-hover:scale-110 transition-transform shadow-sm">
                    {issue.storyPoints || 0}
                </div>
                <MoreVertical size={14} className="text-gray-200 opacity-0 group-hover:opacity-100 transition-all" />
            </div>
        </div>
    );
}

// --- Reports View Component ---

function ReportsView({ _projectId, issues, sprints }: {
    _projectId: string;
    issues: Issue[];
    sprints: Sprint[];
}) {
    const velocityData = [
        { name: "Sprint 1", points: 24, completed: 20 },
        { name: "Sprint 2", points: 32, completed: 28 },
        { name: "Sprint 3", points: 28, completed: 30 },
        { name: "Sprint 4", points: 40, completed: 35 },
    ];

    const burnDownData = [
        { day: "Day 1", remaining: 40, ideal: 40 },
        { day: "Day 2", remaining: 38, ideal: 35 },
        { day: "Day 3", remaining: 30, ideal: 30 },
        { day: "Day 4", remaining: 28, ideal: 25 },
        { day: "Day 5", remaining: 20, ideal: 20 },
        { day: "Day 6", remaining: 15, ideal: 15 },
        { day: "Day 7", remaining: 10, ideal: 10 },
        { day: "Day 8", remaining: 5, ideal: 5 },
        { day: "Day 9", remaining: 0, ideal: 0 },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full overflow-y-auto pr-4 scrollbar-thin pb-20"
        >
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm col-span-1 lg:col-span-2">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <TrendingUp className="text-teal-600" /> Velocity Tracking
                        </h3>
                        <p className="text-gray-400 text-xs font-bold mt-1 uppercase tracking-widest">Story Points per Sprint</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-teal-600" />
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Planned</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-400" />
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Completed</span>
                        </div>
                    </div>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={velocityData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                            <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="points" fill="#0d9488" radius={[8, 8, 0, 0]} barSize={40} />
                            <Bar dataKey="completed" fill="#34d399" radius={[8, 8, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h3 className="text-lg font-black text-gray-900 mb-8 flex items-center gap-3 tracking-tight">
                    <Clock className="text-blue-600" /> Sprint Burn-down
                </h3>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={burnDownData}>
                            <defs>
                                <linearGradient id="colorRemaining" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} />
                            <Tooltip />
                            <Area type="monotone" dataKey="remaining" stroke="#3b82f6" strokeWidth={4} fill="url(#colorRemaining)" />
                            <Line type="monotone" dataKey="ideal" stroke="#d1d5db" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12 transition-transform group-hover:scale-110 pointer-events-none">
                    <Target size={120} />
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-3 tracking-tight">
                    <AlertCircle className="text-red-500" /> Risk Radar
                </h3>
                <div className="space-y-4 relative z-10">
                    <div className="p-5 bg-red-50 rounded-3xl border border-red-100 flex items-start gap-4">
                        <div className="p-2 bg-white rounded-xl text-red-500 shadow-sm">
                            <Zap size={18} />
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-red-900 uppercase tracking-widest">Velocity Drop Alert</h4>
                            <p className="text-[11px] font-bold text-red-700 mt-1">Current sprint is 15% behind scheduled velocity. 3 high-priority items at risk.</p>
                        </div>
                    </div>
                    <div className="p-5 bg-blue-50 rounded-3xl border border-blue-100 flex items-start gap-4">
                        <div className="p-2 bg-white rounded-xl text-blue-500 shadow-sm">
                            <Clock size={18} />
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-blue-900 uppercase tracking-widest">Bottleneck Detected</h4>
                            <p className="text-[11px] font-bold text-blue-700 mt-1">"QA" column has been full for 3 days. Average story time in QA: 48h.</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// --- Meetings View Component ---

function MeetingsView({ _projectId }: { _projectId: string }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8 h-full overflow-y-auto pr-4 scrollbar-thin"
        >
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform duration-700">
                    <MessageSquare size={160} />
                </div>
                <div className="relative z-10 max-w-xl">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400 mb-3 block">Digital War Room</span>
                    <h2 className="text-3xl font-black tracking-tighter mb-4">Master Your Ceremonies.</h2>
                    <p className="text-gray-400 text-sm font-bold leading-relaxed mb-8">
                        Track Daily Standups, Sprint Planning, and Retrospectives. Capture the pulse of your team and convert impediments into action items instantly.
                    </p>
                    <div className="flex gap-4">
                        <button className="bg-teal-600 hover:bg-teal-500 text-white px-8 py-3 rounded-2xl font-black text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-teal-600/20">
                            Start Daily Standup
                        </button>
                        <button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-3 rounded-2xl font-black text-sm transition-all">
                            New Retrospective
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { type: "Daily Standup", date: "Today, 10:00 AM", mood: 8, attendees: 5 },
                    { type: "Sprint Planning", date: "Yesterday, 2:00 PM", mood: 7, attendees: 4 },
                    { type: "Sprint Retro", date: "3 Days ago", mood: 9, attendees: 6 },
                ].map((mt, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all group cursor-pointer">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all shadow-sm">
                                <Calendar size={20} />
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                                <TrendingUp size={12} /> Mood: {mt.mood}/10
                            </div>
                        </div>
                        <h4 className="text-lg font-black text-gray-900 mb-1">{mt.type}</h4>
                        <p className="text-xs font-bold text-gray-400 mb-6">{mt.date}</p>
                        <div className="flex items-center -space-x-2">
                            {[...Array(mt.attendees)].map((_, j) => (
                                <div key={j} className="w-8 h-8 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">
                                    {String.fromCharCode(65 + j)}
                                </div>
                            ))}
                            <div className="ml-6 text-[10px] font-black uppercase tracking-widest text-gray-300">
                                + {mt.attendees} Members
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

// --- Issue Modal Component ---

function IssueModal({ isOpen, onClose, issue, onSave, epics, sprints, workflow }: {
    isOpen: boolean;
    onClose: () => void;
    issue: Partial<Issue> | null;
    onSave: (issue: Partial<Issue>) => Promise<void>;
    epics: Epic[];
    sprints: Sprint[];
    workflow: Workflow | null;
}) {
    const [title, setTitle] = useState(issue?.title || "");
    const [description, setDescription] = useState(issue?.description || "");
    const [type, setType] = useState(issue?.type || "story");
    const [priority, setPriority] = useState(issue?.priority || "Medium");
    const [status, setStatus] = useState(issue?.status || "To Do");
    const [storyPoints, setStoryPoints] = useState(issue?.storyPoints || 0);
    const [epicId, setEpicId] = useState(issue?.epicId || "");
    const [sprintId, setSprintId] = useState(issue?.sprintId || "");

    useEffect(() => {
        if (issue) {
            setTitle(issue.title || "");
            setDescription(issue.description || "");
            setType(issue.type || "story");
            setPriority(issue.priority || "Medium");
            setStatus(issue.status || (workflow?.statusOrder[0] || "To Do"));
            setStoryPoints(issue.storyPoints || 0);
            setEpicId(issue.epicId || "");
            setSprintId(issue.sprintId || "");
        }
    }, [issue, workflow]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                onClick={onClose}
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-full max-h-[85vh]"
            >
                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-10 scrollbar-thin">
                    <div className="flex items-center space-x-4 mb-10">
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="bg-gray-50 border-0 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-500 focus:ring-2 focus:ring-teal-500 outline-none"
                        >
                            <option value="story">Story</option>
                            <option value="task">Task</option>
                            <option value="bug">Bug</option>
                            <option value="subtask">Subtask</option>
                        </select>
                        <span className="text-gray-300">/</span>
                        <input
                            placeholder="Issue Summary"
                            className="flex-1 text-2xl font-black text-gray-900 placeholder:text-gray-200 outline-none bg-transparent"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-8">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 block">Description</label>
                            <textarea
                                placeholder="Add issue details here... (supports Markdown)"
                                className="w-full min-h-[250px] bg-gray-50/50 rounded-3xl p-6 text-sm font-medium border border-gray-100 outline-none focus:ring-4 focus:ring-teal-500/5 transition-all"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Modal Sidebar */}
                <div className="w-full md:w-80 bg-gray-50 p-10 flex flex-col gap-8 border-l border-gray-100">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 block">Details</label>
                        <div className="space-y-6">
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-black text-gray-400">Status</span>
                                <select
                                    className="bg-white border rounded-xl px-4 py-3 text-xs font-black"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    {workflow?.statusOrder.map((s: string) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-black text-gray-400">Priority</span>
                                <select
                                    className="bg-white border rounded-xl px-4 py-3 text-xs font-black"
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                >
                                    <option value="Highest">Highest</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                    <option value="Lowest">Lowest</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-black text-gray-400">Story Points</span>
                                <input
                                    type="number"
                                    className="bg-white border rounded-xl px-4 py-3 text-xs font-black"
                                    value={storyPoints}
                                    onChange={(e) => setStoryPoints(parseInt(e.target.value) || 0)}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-black text-gray-400">Epic</span>
                                <select
                                    className="bg-white border rounded-xl px-4 py-3 text-xs font-black"
                                    value={epicId}
                                    onChange={(e) => setEpicId(e.target.value)}
                                >
                                    <option value="">None</option>
                                    {epics.map((e: any) => (
                                        <option key={e.id} value={e.id}>{e.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto flex flex-col gap-2">
                        <button
                            onClick={onClose}
                            className="w-full p-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-400 hover:bg-white transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onSave({ ...issue, title, description, type, priority, status, storyPoints, epicId, sprintId })}
                            className="w-full bg-teal-600 p-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-teal-600/20 hover:scale-[1.02] active:scale-98 transition-all"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-900 transition-colors hidden md:block"
                >
                    <X size={24} />
                </button>
            </motion.div>
        </div>
    );
}
