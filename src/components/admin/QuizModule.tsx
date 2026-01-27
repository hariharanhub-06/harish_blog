"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Search,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    Gamepad2,
    Clock,
    Target,
    Check,
    X,
    Save,
    PlusCircle,
    Loader2,
    Image as ImageIcon,
    Upload,
    FileText,
    Users,
    BarChart2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { uploadToImageKit } from "@/lib/imagekit-upload"; // Import ImageKit helper
import QuizResultsModal from "./QuizResultsModal";

interface Quiz {
    id: string;
    title: string;
    description: string;
    category: string;
    coverImage: string;
    isPublished: boolean;
    timeLimit: number;
    questions?: any[];
}

export default function QuizModule() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState<Partial<Quiz> | null>(null);
    const [selectedStatsQuiz, setSelectedStatsQuiz] = useState<Quiz | null>(null);
    const [saving, setSaving] = useState(false);
    const router = useRouter(); // Import needed

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const res = await fetch("/api/admin/quizzes");
            if (res.ok) {
                const data = await res.json();
                setQuizzes(data);
            }
        } catch (error) {
            console.error("Failed to fetch quizzes", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        setCurrentQuiz({
            title: "",
            description: "",
            category: "General",
            coverImage: "",
            isPublished: false,
            timeLimit: 30,
            questions: []
        });
        setIsEditing(true);
    };

    const handleEdit = (quiz: Quiz) => {
        setCurrentQuiz(quiz);
        setIsEditing(true);
    };

    const handleStats = (quiz: Quiz) => {
        setSelectedStatsQuiz(quiz);
    };

    const handleHostLive = async (quizId: string) => {
        try {
            const res = await fetch("/api/quiz/live/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quizId })
            });
            const data = await res.json();
            if (data.success) {
                router.push(`/admin/live/${data.sessionId}`);
            } else {
                alert("Failed to create live session");
            }
        } catch (error) {
            console.error("Host live failed", error);
            alert("Failed to start live session");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this quiz?")) return;
        try {
            const res = await fetch(`/api/admin/quizzes/${id}`, { method: "DELETE" });
            if (res.ok) {
                setQuizzes(quizzes.filter(q => q.id !== id));
            }
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    const handleSave = async () => {
        if (!currentQuiz?.title) return alert("Title is required");
        if (!currentQuiz.questions || currentQuiz.questions.length === 0) {
            return alert("Please add at least one question to the quiz.");
        }

        setSaving(true);
        console.log("Saving quiz data:", currentQuiz);

        try {
            const method = currentQuiz.id ? "PUT" : "POST";
            const url = currentQuiz.id ? `/api/admin/quizzes/${currentQuiz.id}` : "/api/admin/quizzes";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(currentQuiz)
            });

            const result = await res.json();
            console.log("Save result:", result);

            if (res.ok) {
                setIsEditing(false);
                fetchQuizzes();
            } else {
                alert(`Failed to save: ${result.error || 'Unknown error'}`);
            }
        } catch (error: any) {
            console.error("Save failed", error);
            alert(`Save failed: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <Gamepad2 className="text-primary" size={24} />
                        Quiz Manager
                    </h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Manage interactive quizzes and live sessions</p>
                </div>
                <button
                    onClick={handleCreateNew}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                >
                    <Plus size={18} />
                    Create New Quiz
                </button>
            </div>

            {isEditing ? (
                <QuizEditor
                    quiz={currentQuiz as Quiz}
                    onSave={handleSave}
                    onCancel={() => setIsEditing(false)}
                    onChange={setCurrentQuiz}
                    saving={saving}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map((quiz) => (
                        <div key={quiz.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-2xl ${quiz.timeLimit === 60 ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                    <Gamepad2 size={24} />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleStats(quiz)}
                                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
                                        title="View Analytics"
                                    >
                                        <BarChart2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(quiz)}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(quiz.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="font-black text-xl text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem] leading-tight">
                                {quiz.title}
                            </h3>
                            <p className="text-gray-500 text-sm mb-6 line-clamp-2 min-h-[2.5rem] font-medium">
                                {quiz.description}
                            </p>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                    <Clock size={14} />
                                    <span>{quiz.timeLimit}s</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                    <Target size={14} />
                                    <span>{quiz.questions?.length || 0} Qs</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${quiz.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {quiz.isPublished ? 'Published' : 'Draft'}
                                </span>
                                <button
                                    onClick={() => handleHostLive(quiz)}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                                >
                                    <Users size={14} />
                                    Host Live
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedStatsQuiz && (
                <QuizResultsModal
                    quizId={selectedStatsQuiz.id}
                    quizTitle={selectedStatsQuiz.title}
                    onClose={() => setSelectedStatsQuiz(null)}
                />
            )}
        </div>
    );
}

function QuizEditor({ quiz, onSave, onCancel, onChange, saving }: any) {
    const [activeSection, setActiveSection] = useState("basic"); // basic, questions
    const [bulkInput, setBulkInput] = useState("");
    const [showBulk, setShowBulk] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const url = await uploadToImageKit(file, "quizzes");
            onChange({ ...quiz, coverImage: url });
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const parseBulkQuestions = () => {
        if (!bulkInput.trim()) return;
        const questionBlocks = bulkInput.split(/\n\s*\n/).filter(block => block.trim());
        const newQuestions = questionBlocks.map((block, idx) => {
            const lines = block.trim().split('\n');
            const questionText = lines[0].replace(/^\d+[\.\)]\s*/, '').trim();
            const options: any[] = [];
            let correctLetters: string[] = [];

            lines.forEach(line => {
                if (line.match(/^[A-H]\)/i)) {
                    options.push({
                        id: Math.random().toString(36).substr(2, 9),
                        optionText: line.replace(/^[A-H]\)/i, '').trim(),
                        isCorrect: false
                    });
                } else if (line.toLowerCase().startsWith('answer:')) {
                    const ansText = line.split(':')[1].trim().toUpperCase();
                    correctLetters = ansText.split(/[\s,]+/).filter(Boolean);
                }
            });

            // Map the correct answer letters to the options
            correctLetters.forEach(letter => {
                const charToIndex = letter.charCodeAt(0) - 65;
                if (options[charToIndex]) {
                    options[charToIndex].isCorrect = true;
                }
            });

            return {
                id: Math.random().toString(36).substr(2, 9),
                questionText,
                points: 1000,
                timeLimit: 30,
                displayOrder: (quiz.questions?.length || 0) + idx,
                options
            };
        });
        onChange({ ...quiz, questions: [...(quiz.questions || []), ...newQuestions] });
        setBulkInput("");
        setShowBulk(false);
    };

    const addQuestion = () => {
        const newQuestion = {
            id: Math.random().toString(36).substr(2, 9),
            questionText: "New Question",
            points: 1000,
            timeLimit: 30,
            displayOrder: quiz.questions?.length || 0,
            options: [
                { id: '1', optionText: "", isCorrect: false },
                { id: '2', optionText: "", isCorrect: false }
            ]
        };
        onChange({ ...quiz, questions: [...(quiz.questions || []), newQuestion] });
    };

    const updateQuestion = (qId: string, updates: any) => {
        const newQuestions = quiz.questions.map((q: any) =>
            q.id === qId ? { ...q, ...updates } : q
        );
        onChange({ ...quiz, questions: newQuestions });
    };

    const removeQuestion = (qId: string) => {
        onChange({ ...quiz, questions: quiz.questions.filter((q: any) => q.id !== qId) });
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="flex border-b border-gray-100">
                <button
                    onClick={() => setActiveSection("basic")}
                    className={`flex-1 px-6 py-4 font-bold text-sm transition-all ${activeSection === "basic" ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Basic Info
                </button>
                <button
                    onClick={() => setActiveSection("questions")}
                    className={`flex-1 px-6 py-4 font-bold text-sm transition-all ${activeSection === "questions" ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Questions ({quiz.questions?.length || 0})
                </button>
            </div>

            <div className="p-6">
                {activeSection === "basic" ? (
                    <div className="space-y-6 max-w-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Quiz Title</label>
                                <input
                                    type="text"
                                    value={quiz.title}
                                    onChange={(e) => onChange({ ...quiz, title: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                    placeholder="Enter quiz title..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Category</label>
                                <input
                                    type="text"
                                    value={quiz.category}
                                    onChange={(e) => onChange({ ...quiz, category: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Quiz Description</label>
                            <textarea
                                value={quiz.description}
                                onChange={(e) => onChange({ ...quiz, description: e.target.value })}
                                className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all h-24"
                                placeholder="What is this quiz about?"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Thumbnail (19:6 Aspect Ratio)</label>
                            <div className="flex flex-col gap-4">
                                {quiz.coverImage ? (
                                    <div className="relative w-full aspect-[19/6] rounded-2xl overflow-hidden border border-gray-100 group">
                                        <Image src={quiz.coverImage} alt="Thumbnail" fill className="object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                onClick={() => onChange({ ...quiz, coverImage: "" })}
                                                className="p-3 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex gap-4 items-center">
                                            <div className="flex-1">
                                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        {uploading ? (
                                                            <Loader2 className="animate-spin text-primary" size={24} />
                                                        ) : (
                                                            <>
                                                                <Upload className="w-8 h-8 mb-2 text-gray-400" />
                                                                <p className="text-xs text-gray-500 font-bold">Click to upload thumbnail</p>
                                                            </>
                                                        )}
                                                    </div>
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                                </label>
                                            </div>
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="text-[10px] font-black uppercase text-gray-300">OR</span>
                                            </div>
                                            <div className="w-1/3">
                                                <input
                                                    type="text"
                                                    value={quiz.coverImage}
                                                    onChange={(e) => onChange({ ...quiz, coverImage: e.target.value })}
                                                    className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                                    placeholder="Paste URL..."
                                                />
                                            </div>
                                        </div>
                                        <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">Optimal: 19:6 Aspect Ratio</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="published"
                                    checked={quiz.isPublished}
                                    onChange={(e) => onChange({ ...quiz, isPublished: e.target.checked })}
                                    className="w-5 h-5 rounded-lg border-gray-300 text-primary focus:ring-primary/20"
                                />
                                <label htmlFor="published" className="text-sm font-bold text-gray-700">Published</label>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="text-gray-400" size={18} />
                                <label className="text-sm font-bold text-gray-700">Time Limit (sec)</label>
                                <input
                                    type="number"
                                    value={quiz.timeLimit}
                                    onChange={(e) => onChange({ ...quiz, timeLimit: parseInt(e.target.value) || 30 })}
                                    className="w-20 bg-gray-50 border-0 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-black text-gray-900 uppercase tracking-tight text-lg">Manage Questions</h3>
                            <button
                                onClick={() => setShowBulk(!showBulk)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-200 transition-all"
                            >
                                <FileText size={14} />
                                {showBulk ? "Cancel Import" : "Bulk Import Questions"}
                            </button>
                        </div>

                        {showBulk && (
                            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 space-y-4 mb-8">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-primary text-sm uppercase">Bulk Import</h4>
                                    <button
                                        onClick={parseBulkQuestions}
                                        className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-xs"
                                    >
                                        Import
                                    </button>
                                </div>
                                <textarea
                                    value={bulkInput}
                                    onChange={(e) => setBulkInput(e.target.value)}
                                    className="w-full h-48 bg-white border border-gray-200 rounded-xl p-4 text-xs font-mono"
                                    placeholder="1. Question... Answer: A"
                                />
                            </div>
                        )}

                        <div className="space-y-12">
                            {quiz.questions?.map((q: any, qIdx: number) => (
                                <div key={q.id || qIdx} className="bg-gray-50 rounded-2xl p-6 relative border border-gray-100">
                                    <button
                                        onClick={() => removeQuestion(q.id)}
                                        className="absolute top-4 right-4 p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-black text-xs shrink-0">{qIdx + 1}</span>
                                            <input
                                                type="text"
                                                value={q.questionText}
                                                onChange={(e) => updateQuestion(q.id, { questionText: e.target.value })}
                                                className="flex-1 bg-transparent border-b-2 border-gray-200 focus:border-primary px-0 py-1 text-base font-bold outline-none"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {q.options?.map((opt: any, oIdx: number) => (
                                                <div key={opt.id || oIdx} className={`flex items-center gap-3 p-3 rounded-xl border ${opt.isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-100'}`}>
                                                    <button
                                                        onClick={() => {
                                                            const newOpts = q.options.map((o: any, idx: number) =>
                                                                idx === oIdx ? { ...o, isCorrect: !o.isCorrect } : o
                                                            );
                                                            updateQuestion(q.id, { options: newOpts });
                                                        }}
                                                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${opt.isCorrect ? 'bg-emerald-500 text-white' : 'border-2 border-gray-200'}`}
                                                    >
                                                        {opt.isCorrect && <Check size={14} />}
                                                    </button>
                                                    <input
                                                        type="text"
                                                        value={opt.optionText}
                                                        onChange={(e) => {
                                                            const newOpts = q.options.map((o: any, idx: number) =>
                                                                idx === oIdx ? { ...o, optionText: e.target.value } : o
                                                            );
                                                            updateQuestion(q.id, { options: newOpts });
                                                        }}
                                                        className="flex-1 bg-transparent text-sm font-bold outline-none"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={addQuestion}
                                className="w-full py-8 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all group"
                            >
                                <PlusCircle size={32} />
                                <span className="font-bold text-sm">Add Question</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <button
                    onClick={onCancel}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-100 transition-all font-bold"
                >
                    Cancel
                </button>
                <button
                    onClick={onSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50"
                >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Save Quiz
                </button>
            </div>
        </div>
    );
}
