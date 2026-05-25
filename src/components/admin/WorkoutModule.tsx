"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Dumbbell,
  Search,
  Plus,
  Play,
  Trash2,
  Edit3,
  GripVertical,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  Timer,
  BarChart2,
  Library,
  ClipboardList,
  SkipForward,
  RefreshCw,
  Loader2,
  Download,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Exercise {
  id: string;
  externalId: string | null;
  name: string;
  bodyPart: string | null;
  target: string | null;
  equipment: string | null;
  gifUrl: string | null;
  secondaryMuscles: string[] | null;
  instructions: string[] | null;
  isCustom: boolean;
}

interface WorkoutPlan {
  id: string;
  name: string;
  description: string | null;
  goal: string | null;
  difficulty: string | null;
  displayOrder: number;
  createdAt: string;
}

interface PlanExercise {
  id: string;
  planId: string;
  exerciseId: string;
  durationSeconds: number;
  restSeconds: number;
  displayOrder: number;
  exercise: {
    name: string;
    bodyPart: string | null;
    target: string | null;
    equipment: string | null;
    gifUrl: string | null;
  };
}

interface WorkoutLog {
  id: string;
  planId: string | null;
  planName: string | null;
  date: string;
  durationMinutes: number;
  totalSeconds: number;
  feeling: string;
  exercisesCompleted: number;
  notes: string | null;
}

type WorkoutView = "library" | "plans" | "active" | "progress";
type WorkoutPhase = "exercise" | "rest" | "done";

const BODY_PARTS = ["all", "chest", "back", "upper legs", "lower legs", "upper arms", "lower arms", "shoulders", "waist", "neck", "cardio"];
const BODY_PART_LABELS: Record<string, string> = {
  all: "All",
  chest: "Chest",
  back: "Back",
  "upper legs": "Legs",
  "lower legs": "Calves",
  "upper arms": "Arms",
  "lower arms": "Forearms",
  shoulders: "Shoulders",
  waist: "Core",
  neck: "Neck",
  cardio: "Cardio",
};

const FEELING_OPTIONS = [
  { value: "great", emoji: "😄", label: "Great" },
  { value: "good", emoji: "🙂", label: "Good" },
  { value: "okay", emoji: "😐", label: "Okay" },
  { value: "tired", emoji: "😓", label: "Tired" },
];

// ── Flipbook image (CSS-only crossfade between start/end frames) ──────────────

const FLIPBOOK_STYLE = `
  @keyframes wbf1{0%,35%{opacity:1}50%{opacity:0}85%{opacity:0}100%{opacity:1}}
  @keyframes wbf2{0%,35%{opacity:0}50%{opacity:1}85%{opacity:1}100%{opacity:0}}
`;

function FlipbookImage({ gifUrl, secondaryMuscles, name, className }: { gifUrl: string | null; secondaryMuscles: string[] | null; name: string; className?: string }) {
  const frame2 = secondaryMuscles?.[0]?.startsWith("http") ? secondaryMuscles[0] : null;
  const animated = !!(gifUrl && frame2);

  if (!gifUrl) {
    return (
      <div className={`flex items-center justify-center bg-[#111] ${className}`}>
        <Dumbbell size={32} className="text-white/20" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#111] ${className}`}>
      {animated && <style>{FLIPBOOK_STYLE}</style>}
      <img
        src={gifUrl}
        alt={name}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
        style={animated ? { animation: "wbf1 1.6s ease-in-out infinite" } : undefined}
      />
      {frame2 && (
        <img
          src={frame2}
          alt={name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ animation: "wbf2 1.6s ease-in-out infinite" }}
        />
      )}
    </div>
  );
}

// ── Sortable Plan Exercise Row ─────────────────────────────────────────────────

function SortablePlanExercise({
  pe,
  onEdit,
  onDelete,
}: {
  pe: PlanExercise;
  onEdit: (pe: PlanExercise) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: pe.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 bg-[#1a1a1a] border border-white/10 rounded-xl p-3"
    >
      <button {...attributes} {...listeners} className="text-white/30 hover:text-white/60 cursor-grab active:cursor-grabbing">
        <GripVertical size={16} />
      </button>
      {pe.exercise.gifUrl ? (
        <img src={pe.exercise.gifUrl} alt={pe.exercise.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" loading="lazy" />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
          <Dumbbell size={20} className="text-white/30" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{pe.exercise.name}</p>
        <p className="text-white/40 text-xs">{pe.exercise.target} · {pe.exercise.equipment}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-green-400 text-xs font-mono">{pe.durationSeconds}s work</p>
        <p className="text-blue-400 text-xs font-mono">{pe.restSeconds}s rest</p>
      </div>
      <button onClick={() => onEdit(pe)} className="text-white/40 hover:text-white p-1">
        <Edit3 size={14} />
      </button>
      <button onClick={() => onDelete(pe.id)} className="text-white/40 hover:text-red-400 p-1">
        <Trash2 size={14} />
      </button>
    </div>
  );
}

// ── Countdown Ring ─────────────────────────────────────────────────────────────

function CountdownRing({ seconds, total, phase }: { seconds: number; total: number; phase: WorkoutPhase }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const progress = total > 0 ? (seconds / total) * circ : 0;
  const color = phase === "exercise" ? "#22c55e" : "#3b82f6";

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144">
        <circle cx="72" cy="72" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <circle
          cx="72"
          cy="72"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${progress} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.9s linear" }}
        />
      </svg>
      <div className="text-center z-10">
        <p className="text-4xl font-bold text-white font-mono">{seconds}</p>
        <p className="text-xs uppercase tracking-widest" style={{ color }}>{phase === "exercise" ? "WORK" : "REST"}</p>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function WorkoutModule() {
  const sessionId = typeof window !== "undefined" ? localStorage.getItem("admin_sessionId") || "" : "";
  const headers = { "Content-Type": "application/json", "X-Session-Id": sessionId };

  // ── View state
  const [view, setView] = useState<WorkoutView>("library");

  // ── Library state
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [libBodyPart, setLibBodyPart] = useState("all");
  const [libLocation, setLibLocation] = useState<"all" | "home" | "gym">("all");
  const [libSearch, setLibSearch] = useState("");
  const [loadingLib, setLoadingLib] = useState(false);
  const [fetchingApi, setFetchingApi] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customForm, setCustomForm] = useState({ name: "", bodyPart: "", target: "", equipment: "", gifUrl: "", instructions: "" });

  // ── Plans state
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [planExercises, setPlanExercises] = useState<PlanExercise[]>([]);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planForm, setPlanForm] = useState({ name: "", description: "", goal: "strength", difficulty: "intermediate" });
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerBodyPart, setPickerBodyPart] = useState("all");
  const [pickerLocation, setPickerLocation] = useState<"all" | "home" | "gym">("all");
  const [pickerExercises, setPickerExercises] = useState<Exercise[]>([]);
  const [loadingPicker, setLoadingPicker] = useState(false);
  const [editingPE, setEditingPE] = useState<PlanExercise | null>(null);
  const [peForm, setPEForm] = useState({ durationSeconds: 30, restSeconds: 15 });

  // ── Active workout state (at module level so it persists across view switches)
  const [activeExercises, setActiveExercises] = useState<PlanExercise[]>([]);
  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null);
  const [phase, setPhase] = useState<WorkoutPhase>("exercise");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null);
  const [logFeeling, setLogFeeling] = useState("good");
  const [logNotes, setLogNotes] = useState("");
  const [savingLog, setSavingLog] = useState(false);

  // ── Progress state
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [logStats, setLogStats] = useState({ totalWorkouts: 0, totalSeconds: 0, avgDurationMinutes: 0, streak: 0 });
  const [logRange, setLogRange] = useState("30");
  const [loadingLogs, setLoadingLogs] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ── Library fetch ──────────────────────────────────────────────────────────

  const fetchExercises = useCallback(async (bp: string, search: string, loc: string) => {
    setLoadingLib(true);
    try {
      const params = new URLSearchParams();
      if (bp !== "all") params.set("bodyPart", bp);
      if (search) params.set("q", search);
      if (loc !== "all") params.set("location", loc);
      const res = await fetch(`/api/admin/workout/exercises?${params}`, { headers });
      const data = await res.json();
      setExercises(data.exercises || []);
    } catch { /* silent */ } finally {
      setLoadingLib(false);
    }
  }, [sessionId]);

  useEffect(() => {
    const t = setTimeout(() => fetchExercises(libBodyPart, libSearch, libLocation), 300);
    return () => clearTimeout(t);
  }, [libBodyPart, libSearch, libLocation, fetchExercises]);

  const fetchFromExerciseDB = async () => {
    setFetchingApi(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/admin/workout/exercises?source=exercisedb`, { headers });
      const data = await res.json();
      if (!res.ok) {
        setFetchError(data.error || `Error ${res.status}`);
      } else {
        await fetchExercises(libBodyPart, libSearch, libLocation);
      }
    } catch (e: unknown) {
      setFetchError(e instanceof Error ? e.message : "Network error");
    } finally {
      setFetchingApi(false);
    }
  };

  // ── Plans fetch ────────────────────────────────────────────────────────────

  const fetchPlans = useCallback(async () => {
    const res = await fetch("/api/admin/workout/plans", { headers });
    const data = await res.json();
    setPlans(data);
  }, [sessionId]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const fetchPlanExercises = useCallback(async (planId: string) => {
    setLoadingPlan(true);
    try {
      const res = await fetch(`/api/admin/workout/plans/${planId}/exercises`, { headers });
      const data = await res.json();
      setPlanExercises(data);
    } catch { /* silent */ } finally {
      setLoadingPlan(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (selectedPlan) fetchPlanExercises(selectedPlan.id);
  }, [selectedPlan, fetchPlanExercises]);

  // ── Picker fetch ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!showExercisePicker) return;
    const fetch_ = async () => {
      setLoadingPicker(true);
      try {
        const params = new URLSearchParams();
        if (pickerBodyPart !== "all") params.set("bodyPart", pickerBodyPart);
        if (pickerSearch) params.set("q", pickerSearch);
        if (pickerLocation !== "all") params.set("location", pickerLocation);
        const res = await fetch(`/api/admin/workout/exercises?${params}`, { headers });
        const data = await res.json();
        setPickerExercises(data.exercises || []);
      } catch { /* silent */ } finally {
        setLoadingPicker(false);
      }
    };
    const t = setTimeout(fetch_, 300);
    return () => clearTimeout(t);
  }, [showExercisePicker, pickerSearch, pickerBodyPart, pickerLocation, sessionId]);

  // ── Plan CRUD ──────────────────────────────────────────────────────────────

  const savePlan = async () => {
    if (!planForm.name.trim()) return;
    if (editingPlan) {
      await fetch("/api/admin/workout/plans", {
        method: "PUT",
        headers,
        body: JSON.stringify({ id: editingPlan.id, ...planForm }),
      });
    } else {
      await fetch("/api/admin/workout/plans", {
        method: "POST",
        headers,
        body: JSON.stringify(planForm),
      });
    }
    setShowPlanModal(false);
    setEditingPlan(null);
    setPlanForm({ name: "", description: "", goal: "strength", difficulty: "intermediate" });
    fetchPlans();
  };

  const deletePlan = async (id: string) => {
    if (!confirm("Delete this plan?")) return;
    await fetch(`/api/admin/workout/plans?id=${id}`, { method: "DELETE", headers });
    if (selectedPlan?.id === id) setSelectedPlan(null);
    fetchPlans();
  };

  // ── Plan exercise CRUD ─────────────────────────────────────────────────────

  const addExerciseToPlan = async (exercise: Exercise) => {
    if (!selectedPlan) return;
    await fetch(`/api/admin/workout/plans/${selectedPlan.id}/exercises`, {
      method: "POST",
      headers,
      body: JSON.stringify({ exerciseId: exercise.id }),
    });
    fetchPlanExercises(selectedPlan.id);
    setShowExercisePicker(false);
  };

  const updatePlanExercise = async () => {
    if (!editingPE) return;
    await fetch(`/api/admin/workout/plans/${editingPE.planId}/exercises`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ id: editingPE.id, ...peForm }),
    });
    setEditingPE(null);
    fetchPlanExercises(editingPE.planId);
  };

  const deletePlanExercise = async (peId: string) => {
    if (!selectedPlan) return;
    await fetch(`/api/admin/workout/plans/${selectedPlan.id}/exercises?id=${peId}`, { method: "DELETE", headers });
    setPlanExercises((prev) => prev.filter((p) => p.id !== peId));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !selectedPlan) return;
    const oldIndex = planExercises.findIndex((e) => e.id === active.id);
    const newIndex = planExercises.findIndex((e) => e.id === over.id);
    const reordered = arrayMove(planExercises, oldIndex, newIndex).map((e, i) => ({ ...e, displayOrder: i }));
    setPlanExercises(reordered);
    await fetch(`/api/admin/workout/plans/${selectedPlan.id}/exercises`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(reordered.map((e) => ({ id: e.id, displayOrder: e.displayOrder }))),
    });
  };

  // ── Active workout ─────────────────────────────────────────────────────────

  const startWorkout = (plan: WorkoutPlan, exercises: PlanExercise[]) => {
    if (exercises.length === 0) return;
    setActivePlan(plan);
    setActiveExercises(exercises);
    setCurrentIndex(0);
    setPhase("exercise");
    setSecondsLeft(exercises[0].durationSeconds);
    setWorkoutStartTime(Date.now());
    setView("active");
  };

  // Countdown tick
  useEffect(() => {
    if (phase === "done" || secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, secondsLeft]);

  // Phase transitions
  useEffect(() => {
    if (secondsLeft > 0 || phase === "done") return;
    if (phase === "exercise") {
      const isLast = currentIndex >= activeExercises.length - 1;
      if (isLast) {
        setPhase("done");
      } else {
        setPhase("rest");
        setSecondsLeft(activeExercises[currentIndex].restSeconds);
      }
    } else if (phase === "rest") {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      setPhase("exercise");
      setSecondsLeft(activeExercises[next].durationSeconds);
    }
  }, [secondsLeft, phase, currentIndex, activeExercises]);

  const skipRest = () => {
    const next = currentIndex + 1;
    setCurrentIndex(next);
    setPhase("exercise");
    setSecondsLeft(activeExercises[next].durationSeconds);
  };

  const saveLog = async () => {
    if (!activePlan || !workoutStartTime) return;
    setSavingLog(true);
    const totalSeconds = Math.round((Date.now() - workoutStartTime) / 1000);
    await fetch("/api/admin/workout/logs", {
      method: "POST",
      headers,
      body: JSON.stringify({
        planId: activePlan.id,
        planName: activePlan.name,
        date: new Date().toISOString().split("T")[0],
        durationMinutes: Math.round(totalSeconds / 60),
        totalSeconds,
        feeling: logFeeling,
        exercisesCompleted: activeExercises.length,
        notes: logNotes || null,
      }),
    });
    setSavingLog(false);
    setLogFeeling("good");
    setLogNotes("");
    setView("progress");
    fetchLogs(logRange);
  };

  // ── Progress ───────────────────────────────────────────────────────────────

  const fetchLogs = useCallback(async (range: string) => {
    setLoadingLogs(true);
    try {
      const end = new Date().toISOString().split("T")[0];
      const start = new Date(Date.now() - parseInt(range) * 86400000).toISOString().split("T")[0];
      const res = await fetch(`/api/admin/workout/logs?start=${start}&end=${end}`, { headers });
      const data = await res.json();
      setLogs(data.logs || []);
      setLogStats(data.stats || {});
    } catch { /* silent */ } finally {
      setLoadingLogs(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (view === "progress") fetchLogs(logRange);
  }, [view, logRange, fetchLogs]);

  const deleteLog = async (id: string) => {
    await fetch(`/api/admin/workout/logs?id=${id}`, { method: "DELETE", headers });
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  // ── Chart data ─────────────────────────────────────────────────────────────

  const chartData = (() => {
    const days = parseInt(logRange);
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(Date.now() - (days - 1 - i) * 86400000).toISOString().split("T")[0];
      const count = logs.filter((l) => l.date === d).length;
      return { date: d.slice(5), workouts: count };
    });
  })();

  // ── Custom exercise ────────────────────────────────────────────────────────

  const saveCustomExercise = async () => {
    if (!customForm.name.trim()) return;
    await fetch("/api/admin/workout/exercises", {
      method: "POST",
      headers,
      body: JSON.stringify({ ...customForm, instructions: customForm.instructions ? customForm.instructions.split("\n") : [] }),
    });
    setShowCustomModal(false);
    setCustomForm({ name: "", bodyPart: "", target: "", equipment: "", gifUrl: "", instructions: "" });
    fetchExercises(libBodyPart, libSearch);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const currentEx = activeExercises[currentIndex];
  const totalWorkTime = activeExercises.reduce((s, e) => s + e.durationSeconds + e.restSeconds, 0);

  return (
    <div className="flex flex-col h-full min-h-screen bg-[#0e0e0e] text-white">

      {/* Header + nav */}
      {view !== "active" && (
        <div className="flex items-center gap-2 px-6 pt-6 pb-4 border-b border-white/10 flex-wrap">
          <Dumbbell size={22} className="text-green-400" />
          <h1 className="text-lg font-semibold mr-4">Workout Tracker</h1>
          {(["library", "plans", "progress"] as WorkoutView[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                view === v ? "bg-green-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {v === "library" ? "Exercise Library" : v === "plans" ? "My Plans" : "Progress"}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-auto">

        {/* ── LIBRARY VIEW ───────────────────────────────────────────────── */}
        {view === "library" && (
          <div className="p-6">
            <div className="flex gap-3 mb-4 flex-wrap">
              <div className="relative flex-1 min-w-48">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  value={libSearch}
                  onChange={(e) => setLibSearch(e.target.value)}
                  placeholder="Search exercises..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-green-500"
                />
              </div>
              <button
                onClick={fetchFromExerciseDB}
                disabled={fetchingApi}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded-xl text-sm font-medium transition-colors"
              >
                {fetchingApi ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                Load from ExerciseDB
              </button>
              <button
                onClick={() => setShowCustomModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm transition-colors"
              >
                <Plus size={15} />
                Custom
              </button>
            </div>

            {fetchError && (
              <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                Failed to load: {fetchError}
              </div>
            )}

            {/* Home / Gym section toggle */}
            <div className="flex gap-2 mb-4 p-1 bg-white/5 rounded-2xl">
              {[
                { id: "all", label: "All" },
                { id: "home", label: "🏠 Home Workout" },
                { id: "gym", label: "🏋️ Gym Workout" },
              ].map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => setLibLocation(loc.id as "all" | "home" | "gym")}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                    libLocation === loc.id ? "bg-green-600 text-white shadow-lg shadow-green-900/30" : "text-white/50 hover:text-white"
                  }`}
                >
                  {loc.label}
                </button>
              ))}
            </div>

            {/* Body part tabs */}
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
              {BODY_PARTS.map((bp) => (
                <button
                  key={bp}
                  onClick={() => setLibBodyPart(bp)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                    libBodyPart === bp ? "bg-green-600 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
                  }`}
                >
                  {BODY_PART_LABELS[bp] || bp}
                </button>
              ))}
            </div>

            {loadingLib ? (
              <div className="flex justify-center py-16">
                <Loader2 size={28} className="animate-spin text-green-400" />
              </div>
            ) : exercises.length === 0 ? (
              <div className="text-center py-16 text-white/40">
                <Dumbbell size={40} className="mx-auto mb-3 opacity-30" />
                <p>No exercises yet. Click "Load from ExerciseDB" to populate the library.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {exercises.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => setSelectedExercise(ex)}
                    className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden hover:border-green-500/50 transition-colors text-left group"
                  >
                    <FlipbookImage gifUrl={ex.gifUrl} secondaryMuscles={ex.secondaryMuscles} name={ex.name} className="w-full h-40" />
                    <div className="p-3">
                      <p className="text-white text-xs font-medium leading-tight line-clamp-2 mb-2">{ex.name}</p>
                      <div className="flex gap-1 flex-wrap">
                        {ex.target && (
                          <span className="px-1.5 py-0.5 bg-green-500/15 text-green-400 rounded text-[10px]">{ex.target}</span>
                        )}
                        {ex.equipment && (
                          <span className="px-1.5 py-0.5 bg-white/5 text-white/40 rounded text-[10px]">{ex.equipment}</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PLANS VIEW ─────────────────────────────────────────────────── */}
        {view === "plans" && (
          <div className="flex h-full min-h-[calc(100vh-120px)]">
            {/* Left: plan list */}
            <div className="w-64 flex-shrink-0 border-r border-white/10 p-4 flex flex-col gap-2">
              <button
                onClick={() => { setEditingPlan(null); setPlanForm({ name: "", description: "", goal: "strength", difficulty: "intermediate" }); setShowPlanModal(true); }}
                className="flex items-center gap-2 w-full px-3 py-2 bg-green-600 hover:bg-green-500 rounded-xl text-sm font-medium transition-colors mb-2"
              >
                <Plus size={16} /> New Plan
              </button>
              {plans.length === 0 && (
                <p className="text-white/30 text-xs text-center mt-4">No plans yet</p>
              )}
              {plans.map((p) => (
                <div
                  key={p.id}
                  className={`relative group rounded-xl p-3 cursor-pointer transition-colors ${
                    selectedPlan?.id === p.id ? "bg-green-600/20 border border-green-500/40" : "bg-white/5 hover:bg-white/8 border border-transparent"
                  }`}
                  onClick={() => setSelectedPlan(p)}
                >
                  <p className="text-sm font-medium text-white truncate pr-12">{p.name}</p>
                  {p.goal && <p className="text-xs text-white/40 capitalize">{p.goal} · {p.difficulty}</p>}
                  <div className="absolute right-2 top-2 hidden group-hover:flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setEditingPlan(p); setPlanForm({ name: p.name, description: p.description || "", goal: p.goal || "strength", difficulty: p.difficulty || "intermediate" }); setShowPlanModal(true); }} className="p-1 text-white/40 hover:text-white">
                      <Edit3 size={12} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deletePlan(p.id); }} className="p-1 text-white/40 hover:text-red-400">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: plan builder */}
            <div className="flex-1 p-6">
              {!selectedPlan ? (
                <div className="flex flex-col items-center justify-center h-full text-white/30 gap-3">
                  <ClipboardList size={40} className="opacity-30" />
                  <p>Select a plan to build it</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-white">{selectedPlan.name}</h2>
                      {selectedPlan.goal && <p className="text-white/40 text-sm capitalize">{selectedPlan.goal} · {selectedPlan.difficulty}</p>}
                    </div>
                    <button
                      onClick={() => startWorkout(selectedPlan, planExercises)}
                      disabled={planExercises.length === 0}
                      className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-40 rounded-xl font-medium transition-colors"
                    >
                      <Play size={16} /> Start Workout
                    </button>
                  </div>

                  {loadingPlan ? (
                    <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-green-400" /></div>
                  ) : (
                    <>
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={planExercises.map((e) => e.id)} strategy={verticalListSortingStrategy}>
                          <div className="flex flex-col gap-2 mb-4">
                            {planExercises.map((pe) => (
                              <SortablePlanExercise
                                key={pe.id}
                                pe={pe}
                                onEdit={(pe) => { setEditingPE(pe); setPEForm({ durationSeconds: pe.durationSeconds, restSeconds: pe.restSeconds }); }}
                                onDelete={deletePlanExercise}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                      <button
                        onClick={() => { setPickerSearch(""); setPickerBodyPart("all"); setShowExercisePicker(true); }}
                        className="flex items-center gap-2 w-full px-4 py-3 border border-dashed border-white/20 rounded-xl text-white/40 hover:text-white hover:border-white/40 transition-colors"
                      >
                        <Plus size={16} /> Add Exercise
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── ACTIVE VIEW ────────────────────────────────────────────────── */}
        {view === "active" && (
          <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
            {phase !== "done" && currentEx && (
              <>
                {/* Top bar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                  <button onClick={() => { if (confirm("Stop workout?")) setView("plans"); }} className="text-white/40 hover:text-white">
                    <X size={20} />
                  </button>
                  <div className="text-center">
                    <p className="text-sm font-medium text-white">{activePlan?.name}</p>
                    <p className="text-xs text-white/40">Exercise {currentIndex + 1} of {activeExercises.length}</p>
                  </div>
                  <div className="w-8" />
                </div>

                {/* Progress bar */}
                <div className="w-full h-1 bg-white/10">
                  <div
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{ width: `${((currentIndex) / activeExercises.length) * 100}%` }}
                  />
                </div>

                {/* GIF */}
                <div className="flex-1 flex flex-col items-center px-6 py-6 gap-6 max-w-lg mx-auto w-full">
                  <div className={`w-full rounded-2xl overflow-hidden transition-opacity duration-300 ${phase === "rest" ? "opacity-40" : "opacity-100"}`}>
                    <FlipbookImage
                      gifUrl={currentEx.exercise.gifUrl}
                      secondaryMuscles={null}
                      name={currentEx.exercise.name}
                      className="w-full h-72"
                    />
                  </div>

                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-1">{currentEx.exercise.name}</h2>
                    <p className="text-white/40 text-sm capitalize">
                      {currentEx.exercise.target}{currentEx.exercise.equipment ? ` · ${currentEx.exercise.equipment}` : ""}
                    </p>
                  </div>

                  <CountdownRing
                    seconds={secondsLeft}
                    total={phase === "exercise" ? currentEx.durationSeconds : currentEx.restSeconds}
                    phase={phase}
                  />

                  {phase === "rest" && (
                    <button
                      onClick={skipRest}
                      className="flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/15 rounded-xl text-sm transition-colors"
                    >
                      <SkipForward size={16} /> Skip Rest
                    </button>
                  )}

                  {/* Upcoming */}
                  {currentIndex + 1 < activeExercises.length && (
                    <div className="w-full bg-white/5 rounded-xl p-3 flex items-center gap-3">
                      <p className="text-white/30 text-xs">NEXT</p>
                      {activeExercises[currentIndex + 1].exercise.gifUrl && (
                        <img src={activeExercises[currentIndex + 1].exercise.gifUrl!} alt="" className="w-10 h-10 rounded-lg object-cover" loading="lazy" />
                      )}
                      <div>
                        <p className="text-white/80 text-sm">{activeExercises[currentIndex + 1].exercise.name}</p>
                        <p className="text-white/30 text-xs">{activeExercises[currentIndex + 1].durationSeconds}s work</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Done screen */}
            {phase === "done" && (
              <div className="flex flex-col items-center justify-center flex-1 px-6 py-10 gap-6 max-w-md mx-auto w-full">
                <div className="text-6xl">🏆</div>
                <h2 className="text-2xl font-bold text-white">Workout Complete!</h2>
                <div className="flex gap-4 w-full">
                  <div className="flex-1 bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-green-400">{activeExercises.length}</p>
                    <p className="text-white/40 text-xs mt-1">Exercises</p>
                  </div>
                  <div className="flex-1 bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-blue-400">
                      {workoutStartTime ? Math.round((Date.now() - workoutStartTime) / 60000) : 0}m
                    </p>
                    <p className="text-white/40 text-xs mt-1">Duration</p>
                  </div>
                </div>

                <div className="w-full">
                  <p className="text-white/60 text-sm mb-3">How did it feel?</p>
                  <div className="flex gap-2 mb-4">
                    {FEELING_OPTIONS.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => setLogFeeling(f.value)}
                        className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border transition-colors ${
                          logFeeling === f.value ? "border-green-500 bg-green-500/10" : "border-white/10 bg-white/5 hover:bg-white/8"
                        }`}
                      >
                        <span className="text-2xl">{f.emoji}</span>
                        <span className="text-xs text-white/60">{f.label}</span>
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    placeholder="Notes (optional)"
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 resize-none mb-4"
                  />
                  <button
                    onClick={saveLog}
                    disabled={savingLog}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded-xl font-medium transition-colors"
                  >
                    {savingLog ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                    Save Workout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PROGRESS VIEW ──────────────────────────────────────────────── */}
        {view === "progress" && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex gap-2">
                {["7", "30", "90"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setLogRange(r)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      logRange === r ? "bg-green-600 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
                    }`}
                  >
                    {r}d
                  </button>
                ))}
              </div>
              {loadingLogs && <Loader2 size={16} className="animate-spin text-white/40" />}
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total Workouts", value: logStats.totalWorkouts, color: "text-green-400" },
                { label: "Current Streak", value: `${logStats.streak}d`, color: "text-yellow-400" },
                { label: "Avg Duration", value: `${logStats.avgDurationMinutes}m`, color: "text-blue-400" },
                { label: "Total Time", value: `${Math.round((logStats.totalSeconds || 0) / 60)}m`, color: "text-purple-400" },
              ].map((s) => (
                <div key={s.label} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-white/40 text-xs mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5 mb-6">
              <p className="text-white/60 text-sm mb-4">Workouts per day</p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 10 }} />
                  <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                  <Area type="monotone" dataKey="workouts" stroke="#22c55e" fill="url(#wg)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Log history */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10">
                <p className="text-white/60 text-sm font-medium">Workout History</p>
              </div>
              {logs.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-8">No workouts logged yet</p>
              ) : (
                <div className="divide-y divide-white/5">
                  {logs.map((log) => {
                    const feeling = FEELING_OPTIONS.find((f) => f.value === log.feeling);
                    return (
                      <div key={log.id} className="flex items-center gap-4 px-5 py-3">
                        <span className="text-xl">{feeling?.emoji || "🙂"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{log.planName || "Workout"}</p>
                          <p className="text-white/40 text-xs">{log.date} · {log.durationMinutes}m · {log.exercisesCompleted} exercises</p>
                        </div>
                        <button onClick={() => deleteLog(log.id)} className="text-white/20 hover:text-red-400 p-1 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── MODALS ─────────────────────────────────────────────────────────── */}

      {/* Exercise detail drawer */}
      {selectedExercise && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setSelectedExercise(null)}>
          <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <FlipbookImage gifUrl={selectedExercise.gifUrl} secondaryMuscles={selectedExercise.secondaryMuscles} name={selectedExercise.name} className="w-full h-64 rounded-t-2xl" />
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-white">{selectedExercise.name}</h3>
                <button onClick={() => setSelectedExercise(null)} className="text-white/40 hover:text-white p-1">
                  <X size={18} />
                </button>
              </div>
              <div className="flex gap-2 flex-wrap mb-4">
                {selectedExercise.target && <span className="px-2 py-1 bg-green-500/15 text-green-400 rounded-full text-xs">{selectedExercise.target}</span>}
                {selectedExercise.bodyPart && <span className="px-2 py-1 bg-blue-500/15 text-blue-400 rounded-full text-xs capitalize">{selectedExercise.bodyPart}</span>}
                {selectedExercise.equipment && <span className="px-2 py-1 bg-white/5 text-white/40 rounded-full text-xs">{selectedExercise.equipment}</span>}
              </div>
              {selectedExercise.instructions && selectedExercise.instructions.length > 0 && (
                <div className="mb-4">
                  <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-2">Instructions</p>
                  <ol className="space-y-2">
                    {selectedExercise.instructions.map((step, i) => (
                      <li key={i} className="text-white/70 text-sm flex gap-2">
                        <span className="text-green-400 font-mono text-xs mt-0.5 flex-shrink-0">{i + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {selectedPlan && (
                <button
                  onClick={async () => { await addExerciseToPlan(selectedExercise); setSelectedExercise(null); setView("plans"); }}
                  className="w-full py-2.5 bg-green-600 hover:bg-green-500 rounded-xl text-sm font-medium transition-colors"
                >
                  Add to "{selectedPlan.name}"
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Plan modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-white mb-5">{editingPlan ? "Edit Plan" : "New Plan"}</h3>
            <div className="space-y-3">
              <input value={planForm.name} onChange={(e) => setPlanForm((f) => ({ ...f, name: e.target.value }))} placeholder="Plan name *" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-500" />
              <input value={planForm.description} onChange={(e) => setPlanForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-500" />
              <div className="flex gap-3">
                <select value={planForm.goal} onChange={(e) => setPlanForm((f) => ({ ...f, goal: e.target.value }))} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 text-white">
                  {["strength", "cardio", "flexibility", "mobility", "weight loss"].map((g) => <option key={g} value={g} className="bg-[#1a1a1a]">{g}</option>)}
                </select>
                <select value={planForm.difficulty} onChange={(e) => setPlanForm((f) => ({ ...f, difficulty: e.target.value }))} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 text-white">
                  {["beginner", "intermediate", "advanced"].map((d) => <option key={d} value={d} className="bg-[#1a1a1a]">{d}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowPlanModal(false); setEditingPlan(null); }} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm transition-colors">Cancel</button>
              <button onClick={savePlan} className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 rounded-xl text-sm font-medium transition-colors">
                {editingPlan ? "Save" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit plan exercise modal */}
      {editingPE && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-base font-bold text-white mb-1">{editingPE.exercise.name}</h3>
            <p className="text-white/40 text-xs mb-5">Adjust timing</p>
            <div className="flex gap-4 mb-5">
              <div className="flex-1">
                <label className="text-white/50 text-xs block mb-1">Work (seconds)</label>
                <input
                  type="number"
                  min={5}
                  max={300}
                  value={peForm.durationSeconds}
                  onChange={(e) => setPEForm((f) => ({ ...f, durationSeconds: parseInt(e.target.value) || 30 }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-green-400 font-mono focus:outline-none focus:border-green-500"
                />
              </div>
              <div className="flex-1">
                <label className="text-white/50 text-xs block mb-1">Rest (seconds)</label>
                <input
                  type="number"
                  min={0}
                  max={300}
                  value={peForm.restSeconds}
                  onChange={(e) => setPEForm((f) => ({ ...f, restSeconds: parseInt(e.target.value) || 15 }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-blue-400 font-mono focus:outline-none focus:border-green-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditingPE(null)} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm transition-colors">Cancel</button>
              <button onClick={updatePlanExercise} className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 rounded-xl text-sm font-medium transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise picker slide-over */}
      {showExercisePicker && (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-end">
          <div className="bg-[#1a1a1a] w-full max-w-md h-full flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Add Exercise</h3>
              <button onClick={() => setShowExercisePicker(false)} className="text-white/40 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="px-4 py-3 border-b border-white/10 space-y-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input value={pickerSearch} onChange={(e) => setPickerSearch(e.target.value)} placeholder="Search..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-2 text-sm focus:outline-none focus:border-green-500" />
              </div>
              {/* Home / Gym toggle */}
              <div className="flex gap-1 p-0.5 bg-white/5 rounded-xl">
                {[
                  { id: "all", label: "All" },
                  { id: "home", label: "🏠 Home" },
                  { id: "gym", label: "🏋️ Gym" },
                ].map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => setPickerLocation(loc.id as "all" | "home" | "gym")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      pickerLocation === loc.id ? "bg-green-600 text-white" : "text-white/50 hover:text-white"
                    }`}
                  >
                    {loc.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {BODY_PARTS.map((bp) => (
                  <button key={bp} onClick={() => setPickerBodyPart(bp)} className={`px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap flex-shrink-0 transition-colors ${pickerBodyPart === bp ? "bg-green-600 text-white" : "bg-white/5 text-white/50"}`}>
                    {BODY_PART_LABELS[bp] || bp}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {loadingPicker ? (
                <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-green-400" /></div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {pickerExercises.map((ex) => (
                    <button key={ex.id} onClick={() => addExerciseToPlan(ex)} className="bg-[#111] hover:border-green-500/60 border border-white/10 rounded-2xl overflow-hidden text-left transition-colors group">
                      <FlipbookImage gifUrl={ex.gifUrl} secondaryMuscles={ex.secondaryMuscles} name={ex.name} className="w-full h-32" />
                      <div className="p-2.5">
                        <p className="text-white text-xs font-medium leading-tight line-clamp-2 mb-1">{ex.name}</p>
                        <p className="text-white/40 text-[10px] truncate">{ex.target}{ex.equipment ? ` · ${ex.equipment}` : ""}</p>
                        <div className="mt-2 flex items-center gap-1 text-green-400 text-[10px] font-medium">
                          <Plus size={11} /> Add to plan
                        </div>
                      </div>
                    </button>
                  ))}
                  {pickerExercises.length === 0 && !loadingPicker && (
                    <p className="text-white/30 text-sm text-center py-6">No exercises found</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom exercise modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-md p-6 max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-5">Add Custom Exercise</h3>
            <div className="space-y-3">
              <input value={customForm.name} onChange={(e) => setCustomForm((f) => ({ ...f, name: e.target.value }))} placeholder="Exercise name *" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-500" />
              <div className="flex gap-3">
                <input value={customForm.bodyPart} onChange={(e) => setCustomForm((f) => ({ ...f, bodyPart: e.target.value }))} placeholder="Body part" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-500" />
                <input value={customForm.target} onChange={(e) => setCustomForm((f) => ({ ...f, target: e.target.value }))} placeholder="Target muscle" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-500" />
              </div>
              <input value={customForm.equipment} onChange={(e) => setCustomForm((f) => ({ ...f, equipment: e.target.value }))} placeholder="Equipment" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-500" />
              <input value={customForm.gifUrl} onChange={(e) => setCustomForm((f) => ({ ...f, gifUrl: e.target.value }))} placeholder="GIF URL (optional)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-500" />
              <textarea value={customForm.instructions} onChange={(e) => setCustomForm((f) => ({ ...f, instructions: e.target.value }))} placeholder="Instructions (one per line)" rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 resize-none" />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowCustomModal(false)} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm transition-colors">Cancel</button>
              <button onClick={saveCustomExercise} className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 rounded-xl text-sm font-medium transition-colors">Add Exercise</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
