"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Edit, Trash2, Link as LinkIcon, Eye, Save, Trash, X, FileText } from "lucide-react";
import toast from "react-hot-toast";

type Form = {
    id: string;
    title: string;
    description: string;
    isPublished: boolean;
    createdAt: string;
};

type QuestionType = "short_answer" | "paragraph" | "multiple_choice" | "checkboxes" | "dropdown";

type FormQuestion = {
    id?: string;
    type: QuestionType;
    questionText: string;
    required: boolean;
    options: string[] | null;
};

export default function FormsModule() {
    const [view, setView] = useState<"list" | "builder" | "responses">("list");
    const [forms, setForms] = useState<Form[]>([]);
    const [loading, setLoading] = useState(true);

    const [activeFormId, setActiveFormId] = useState<string | null>(null);
    const [builderTitle, setBuilderTitle] = useState("");
    const [builderDescription, setBuilderDescription] = useState("");
    const [builderQuestions, setBuilderQuestions] = useState<FormQuestion[]>([]);
    const [isPublished, setIsPublished] = useState(false);

    const [responses, setResponses] = useState<any[]>([]);

    useEffect(() => {
        if (view === "list") {
            fetchForms();
        }
    }, [view]);

    const fetchForms = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/forms");
            if (res.ok) {
                const data = await res.json();
                setForms(data);
            }
        } catch (error) {
            toast.error("Failed to load forms");
        }
        setLoading(false);
    };

    const handleCreateForm = async () => {
        const title = "Untitled Form";
        try {
            const res = await fetch("/api/admin/forms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description: "" }),
            });
            if (res.ok) {
                const newForm = await res.json();
                handleEditForm(newForm.id);
            }
        } catch (error) {
            toast.error("Failed to create form");
        }
    };

    const handleEditForm = async (id: string) => {
        setLoading(true);
        setView("builder");
        setActiveFormId(id);
        try {
            const res = await fetch(`/api/admin/forms/${id}`);
            if (res.ok) {
                const data = await res.json();
                setBuilderTitle(data.title);
                setBuilderDescription(data.description || "");
                setIsPublished(data.isPublished);
                setBuilderQuestions(data.questions || []);
            }
        } catch (error) {
            toast.error("Failed to load form details");
            setView("list");
        }
        setLoading(false);
    };

    const handleDeleteForm = async (id: string) => {
        if (!confirm("Are you sure you want to delete this form?")) return;
        try {
            const res = await fetch(`/api/admin/forms/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Form deleted");
                fetchForms();
            }
        } catch (error) {
            toast.error("Failed to delete form");
        }
    };

    const handleViewResponses = async (id: string) => {
        setLoading(true);
        setView("responses");
        setActiveFormId(id);
        try {
            // First fetch the form to get the questions
            let formRes = await fetch(`/api/admin/forms/${id}`);
            let formData = await formRes.json();
            setBuilderQuestions(formData.questions || []);

            const res = await fetch(`/api/admin/forms/${id}/responses`);
            if (res.ok) {
                const data = await res.json();
                setResponses(data);
            }
        } catch (error) {
            toast.error("Failed to load responses");
            setView("list");
        }
        setLoading(false);
    };

    const handleSaveForm = async (publishStatus?: boolean) => {
        if (!activeFormId) return;

        const finalPublished = publishStatus !== undefined ? publishStatus : isPublished;

        try {
            const res = await fetch(`/api/admin/forms/${activeFormId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: builderTitle,
                    description: builderDescription,
                    isPublished: finalPublished,
                    questions: builderQuestions,
                }),
            });
            if (res.ok) {
                setIsPublished(finalPublished);
                toast.success("Form saved successfully");
            }
        } catch (error) {
            toast.error("Failed to save form");
        }
    };

    const addQuestion = (type: QuestionType) => {
        setBuilderQuestions([
            ...builderQuestions,
            { type, questionText: "New Question", required: false, options: ["Option 1"] }
        ]);
    };

    const updateQuestion = (index: number, updates: Partial<FormQuestion>) => {
        const newQs = [...builderQuestions];
        newQs[index] = { ...newQs[index], ...updates };
        setBuilderQuestions(newQs);
    };

    const removeQuestion = (index: number) => {
        const newQs = [...builderQuestions];
        newQs.splice(index, 1);
        setBuilderQuestions(newQs);
    };

    const copyShareLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/forms/${activeFormId}`);
        toast.success("Link copied!");
    };

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
    }

    if (view === "responses") {
        return (
            <div className="space-y-6 animate-in fade-in">
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h2 className="text-2xl font-bold">Responses ({responses.length})</h2>
                        <button onClick={() => setView("list")} className="text-sm text-gray-400 hover:text-primary mt-1">
                            &larr; Back to Forms
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-sm">
                                <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Timestamp</th>
                                {builderQuestions.map((q, i) => (
                                    <th key={i} className="p-4 font-semibold text-gray-600 truncate max-w-xs">{q.questionText}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {responses.length === 0 ? (
                                <tr><td colSpan={builderQuestions.length + 1} className="p-8 text-center text-gray-400">No responses yet.</td></tr>
                            ) : responses.map((r, i) => (
                                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                    <td className="p-4 text-sm text-gray-600 whitespace-nowrap">{new Date(r.createdAt).toLocaleString()}</td>
                                    {builderQuestions.map((q, j) => {
                                        const ans = r.answers?.find((a: any) => a.questionId === q.id);
                                        const text = ans?.answerText || (ans?.answerChoices ? JSON.parse(ans.answerChoices).join(", ") : "-");
                                        return <td key={j} className="p-4 text-sm text-gray-900 truncate max-w-xs">{text}</td>;
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (view === "builder") {
        return (
            <div className="space-y-6 animate-in fade-in max-w-3xl mx-auto pb-20">
                <div className="flex items-center justify-between sticky top-0 bg-[#fcfcfc]/80 backdrop-blur-md pt-4 pb-4 z-10 border-b border-gray-100 mb-6">
                    <button onClick={() => setView("list")} className="text-sm text-gray-400 hover:text-primary">&larr; Back</button>
                    <div className="flex gap-2">
                        {isPublished && (
                            <button onClick={copyShareLink} className="flex gap-2 items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-bold transition">
                                <LinkIcon size={16} /> Copy Link
                            </button>
                        )}
                        <button onClick={() => handleSaveForm()} className="flex gap-2 items-center px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-bold transition">
                            <Save size={16} /> Save Draft
                        </button>
                        <button onClick={() => handleSaveForm(!isPublished)} className={`flex gap-2 items-center px-4 py-2 text-white rounded-lg text-sm font-bold transition ${isPublished ? 'bg-orange-500 hover:bg-orange-600' : 'bg-primary hover:bg-primary/90'}`}>
                            {isPublished ? "Unpublish" : "Publish"}
                        </button>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border-t-8 border-t-primary border-x border-b border-gray-100 space-y-4">
                    <input
                        type="text"
                        value={builderTitle}
                        onChange={e => setBuilderTitle(e.target.value)}
                        className="w-full text-3xl font-black text-gray-900 border-none outline-none focus:ring-0 px-0"
                        placeholder="Form Title"
                    />
                    <textarea
                        value={builderDescription}
                        onChange={e => setBuilderDescription(e.target.value)}
                        className="w-full text-gray-600 border-none outline-none focus:ring-0 px-0 resize-none h-20"
                        placeholder="Form Description"
                    />
                </div>

                {builderQuestions.map((q, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 relative group">
                        <div className="flex items-start justify-between gap-4">
                            <input
                                type="text"
                                value={q.questionText}
                                onChange={e => updateQuestion(idx, { questionText: e.target.value })}
                                className="flex-1 text-lg font-semibold bg-gray-50 border-none rounded-lg p-3 ring-1 ring-gray-200 focus:ring-primary"
                                placeholder="Question"
                            />
                            <select
                                value={q.type}
                                onChange={e => updateQuestion(idx, { type: e.target.value as QuestionType })}
                                className="bg-gray-50 border-none rounded-lg p-3 ring-1 ring-gray-200 focus:ring-primary text-sm font-medium"
                            >
                                <option value="short_answer">Short Answer</option>
                                <option value="paragraph">Paragraph</option>
                                <option value="multiple_choice">Multiple Choice</option>
                                <option value="checkboxes">Checkboxes</option>
                                <option value="dropdown">Dropdown</option>
                            </select>
                        </div>

                        <div className="pl-2">
                            {q.type === "short_answer" && <div className="text-gray-400 border-b border-gray-200 w-1/2 pb-1 text-sm inline-block">Short answer text</div>}
                            {q.type === "paragraph" && <div className="text-gray-400 border-b border-gray-200 w-full pb-1 text-sm inline-block max-w-xl">Long answer text...</div>}

                            {["multiple_choice", "checkboxes", "dropdown"].includes(q.type) && (
                                <div className="space-y-2">
                                    {q.options?.map((opt, oIdx) => (
                                        <div key={oIdx} className="flex items-center gap-3">
                                            <div className={`w-4 h-4 border-2 border-gray-300 ${q.type === 'multiple_choice' ? 'rounded-full' : 'rounded-sm'}`} />
                                            <input
                                                type="text"
                                                value={opt}
                                                onChange={e => {
                                                    const newOpts = [...(q.options || [])];
                                                    newOpts[oIdx] = e.target.value;
                                                    updateQuestion(idx, { options: newOpts });
                                                }}
                                                className="border-none focus:ring-0 p-0 text-gray-700 w-full"
                                                placeholder={`Option ${oIdx + 1}`}
                                            />
                                            <button onClick={() => {
                                                const newOpts = [...(q.options || [])];
                                                newOpts.splice(oIdx, 1);
                                                updateQuestion(idx, { options: newOpts });
                                            }} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><X size={14} /></button>
                                        </div>
                                    ))}
                                    <button onClick={() => {
                                        updateQuestion(idx, { options: [...(q.options || []), `Option ${(q.options?.length || 0) + 1}`] });
                                    }} className="text-sm font-medium text-primary hover:underline hover:text-primary/80 flex items-center gap-2 mt-2">
                                        <Plus size={14} /> Add option
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end items-center gap-4 pt-4 border-t border-gray-100 mt-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                                <span>Required</span>
                                <div className={`relative w-10 h-6 transition-colors rounded-full ${q.required ? 'bg-primary' : 'bg-gray-300'}`}>
                                    <input type="checkbox" checked={q.required} onChange={e => updateQuestion(idx, { required: e.target.checked })} className="sr-only" />
                                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${q.required ? 'translate-x-4' : ''}`} />
                                </div>
                            </label>
                            <div className="w-px h-6 bg-gray-200" />
                            <button onClick={() => removeQuestion(idx)} className="text-gray-400 hover:text-red-500 transition p-2 hover:bg-red-50 rounded-lg">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                <button onClick={() => addQuestion("multiple_choice")} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-bold hover:bg-gray-50 hover:border-primary hover:text-primary transition flex items-center justify-center gap-2">
                    <Plus size={20} /> Add Question
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-bold">Forms Manager</h2>
                    <p className="text-gray-500 text-sm mt-1">Create and manage your interactive forms.</p>
                </div>
                <button
                    onClick={handleCreateForm}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition shadow-lg shadow-primary/20"
                >
                    <Plus size={18} /> New Form
                </button>
            </div>

            {forms.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 border-dashed border-2">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <FileText size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No forms created yet</h3>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">Create a form to collect information, feedback, or applications from your audience.</p>
                    <button onClick={handleCreateForm} className="text-primary font-bold hover:underline">Create your first form</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {forms.map(form => (
                        <div key={form.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-primary/20 transition-all group flex flex-col group relative">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${form.isPublished ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                                    {form.isPublished ? "Published" : "Draft"}
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2 truncate" title={form.title}>{form.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-6 flex-1">{form.description || "No description"}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <span className="text-xs font-semibold text-gray-400">{new Date(form.createdAt).toLocaleDateString()}</span>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => handleEditForm(form.id)} className="w-8 h-8 rounded-lg bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition" title="Edit Form">
                                        <Edit size={14} />
                                    </button>
                                    <button onClick={() => handleViewResponses(form.id)} className="w-8 h-8 rounded-lg bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition" title="View Responses">
                                        <Eye size={14} />
                                    </button>
                                    <button onClick={() => handleDeleteForm(form.id)} className="w-8 h-8 rounded-lg bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition" title="Delete Form">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
