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
    ChevronRight,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    const [saving, setSaving] = useState(false);

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
        setSaving(true);
        try {
            const method = currentQuiz.id ? "PUT" : "POST";
            const url = currentQuiz.id ? `/api/admin/quizzes/${currentQuiz.id}` : "/api/admin/quizzes";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(currentQuiz)
            });

            if (res.ok) {
                setIsEditing(false);
                fetchQuizzes();
            }
        } catch (error) {
            console.error("Save failed", error);
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
                        <div key={quiz.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${quiz.isPublished ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                                    <Gamepad2 size={24} />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEdit(quiz)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-primary transition-colors">
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(quiz.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{quiz.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">{quiz.description}</p>

                            <div className="mt-4 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <span className="flex items-center gap-1"><Clock size={12} /> {quiz.timeLimit}s</span>
                                <span className="flex items-center gap-1"><Target size={12} /> {quiz.questions?.length || 0} Questions</span>
                                <span className={`flex items-center gap-1 ${quiz.isPublished ? 'text-emerald-500' : 'text-orange-500'}`}>
                                    {quiz.isPublished ? <Check size={12} /> : <X size={12} />}
                                    {quiz.isPublished ? 'Published' : 'Draft'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function QuizEditor({ quiz, onSave, onCancel, onChange, saving }: any) {
    const [activeSection, setActiveSection] = useState("basic"); // basic, questions

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
                                    className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                    placeholder="Enter quiz title..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Category</label>
                                <input
                                    type="text"
                                    value={quiz.category}
                                    onChange={(e) => onChange({ ...quiz, category: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Description</label>
                            <textarea
                                value={quiz.description}
                                onChange={(e) => onChange({ ...quiz, description: e.target.value })}
                                className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all h-32"
                                placeholder="What is this quiz about?"
                            />
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
                                    onChange={(e) => onChange({ ...quiz, timeLimit: parseInt(e.target.value) })}
                                    className="w-20 bg-gray-50 border-0 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {quiz.questions?.map((q: any, qIdx: number) => (
                            <div key={q.id || qIdx} className="bg-gray-50 rounded-2xl p-6 relative border border-gray-100">
                                <button
                                    onClick={() => removeQuestion(q.id)}
                                    className="absolute top-4 right-4 p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-black text-xs">{qIdx + 1}</span>
                                        <input
                                            type="text"
                                            value={q.questionText}
                                            onChange={(e) => updateQuestion(q.id, { questionText: e.target.value })}
                                            className="flex-1 bg-transparent border-b-2 border-gray-200 focus:border-primary px-0 py-1 text-base font-bold transition-all outline-none"
                                            placeholder="Enter question text..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                        {q.options?.map((opt: any, oIdx: number) => (
                                            <div key={opt.id || oIdx} className={`flex items-center gap-3 p-3 rounded-xl transition-all border ${opt.isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-100'}`}>
                                                <button
                                                    onClick={() => {
                                                        const newOpts = q.options.map((o: any, idx: number) => ({
                                                            ...o, isCorrect: idx === oIdx
                                                        }));
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
                                                    placeholder={`Option ${oIdx + 1}`}
                                                />
                                            </div>
                                        ))}
                                        {q.options?.length < 4 && (
                                            <button
                                                onClick={() => {
                                                    const newOpts = [...q.options, { id: Math.random().toString(), optionText: "", isCorrect: false }];
                                                    updateQuestion(q.id, { options: newOpts });
                                                }}
                                                className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:text-primary hover:border-primary/20 transition-all font-bold text-xs"
                                            >
                                                <PlusCircle size={14} /> Add Option
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={addQuestion}
                            className="w-full py-8 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all group"
                        >
                            <PlusCircle size={32} className="group-hover:scale-110 transition-transform" />
                            <span className="font-bold text-sm tracking-tight">Add Question</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <button
                    onClick={onCancel}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-100 transition-all"
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
