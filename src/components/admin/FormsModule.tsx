"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Plus, Edit, Trash2, Link as LinkIcon, Eye, Save, Trash, X, FileText, ImageIcon, Settings, MessageSquare, ArrowRight, CornerDownRight, UploadCloud, Link } from "lucide-react";
import toast from "react-hot-toast";

type Form = {
    id: string;
    title: string;
    description: string;
    isPublished: boolean;
    createdAt: string;
    bannerUrl?: string; // Base64 or URL
    themeColor?: string;
    postSubmissionAction?: string;
    postSubmissionData?: string;
    customSuccessMessage?: string;
    automationEnabled?: boolean;
    automationChannels?: string[];
    automationTemplate?: string;
};

type QuestionType = "short_answer" | "paragraph" | "multiple_choice" | "checkboxes" | "dropdown" | "linear_scale" | "file_upload";

type FormQuestion = {
    id?: string;
    type: QuestionType;
    questionText: string;
    required: boolean;
    options: string[] | null;
    imageUrl?: string; // Base64
    sectionId?: string;
    logicConditions?: Record<string, string>; // { "Option 1": "sec-2" , "Option 2": "submit"}
};

export default function FormsModule() {
    const [view, setView] = useState<"list" | "builder" | "settings" | "responses">("list");
    const [forms, setForms] = useState<Form[]>([]);
    const [loading, setLoading] = useState(true);

    const [activeForm, setActiveForm] = useState<Form | null>(null);
    const [builderQuestions, setBuilderQuestions] = useState<FormQuestion[]>([]);
    const [isPublished, setIsPublished] = useState(false);

    const [responses, setResponses] = useState<any[]>([]);

    useEffect(() => {
        if (view === "list") fetchForms();
    }, [view]);

    const fetchForms = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/forms");
            if (res.ok) setForms(await res.json());
        } catch (e) { toast.error("Failed to load forms"); }
        setLoading(false);
    };

    const handleCreateForm = async () => {
        try {
            const res = await fetch("/api/admin/forms", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: "Untitled Form", description: "" }),
            });
            if (res.ok) {
                const newForm = await res.json();
                handleEditForm(newForm.id);
            }
        } catch (e) { toast.error("Failed to create form"); }
    };

    const handleEditForm = async (id: string) => {
        setLoading(true);
        setView("builder");
        try {
            const res = await fetch(`/api/admin/forms/${id}`);
            if (res.ok) {
                const data = await res.json();
                setActiveForm(data);
                setIsPublished(data.isPublished);
                setBuilderQuestions(data.questions || []);
            }
        } catch (e) { setView("list"); }
        setLoading(false);
    };

    const handleDeleteForm = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            const res = await fetch(`/api/admin/forms/${id}`, { method: "DELETE" });
            if (res.ok) fetchForms();
        } catch (e) { }
    };

    const handleViewResponses = async (id: string) => {
        setLoading(true); setView("responses");
        try {
            const formRes = await fetch(`/api/admin/forms/${id}`);
            setBuilderQuestions((await formRes.json()).questions || []);
            const res = await fetch(`/api/admin/forms/${id}/responses`);
            if (res.ok) setResponses(await res.json());
        } catch (e) { setView("list"); }
        setLoading(false);
    };

    const handleSaveForm = async (publishStatus?: boolean) => {
        if (!activeForm) return;
        const finalPublished = publishStatus !== undefined ? publishStatus : isPublished;
        try {
            const res = await fetch(`/api/admin/forms/${activeForm.id}`, {
                method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...activeForm, isPublished: finalPublished, questions: builderQuestions }),
            });
            if (res.ok) { setIsPublished(finalPublished); toast.success("Saved"); }
        } catch (e) { toast.error("Failed to save"); }
    };

    // File Upload Handler Base64
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { toast.error("Image too large (Max 2MB for DB storage)"); return; }
        const reader = new FileReader();
        reader.onloadend = () => callback(reader.result as string);
        reader.readAsDataURL(file);
    };

    const addQuestion = (type: QuestionType) => {
        setBuilderQuestions([
            ...builderQuestions,
            { type, questionText: "New Question", required: false, options: type === "linear_scale" ? ["1", "5"] : ["Option 1"] }
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
        navigator.clipboard.writeText(`${window.location.origin}/forms/${activeForm?.id}`);
        toast.success("Link copied!");
    };

    // Unique Sections available
    const availableSections = Array.from(new Set(builderQuestions.map(q => q.sectionId).filter(Boolean))) as string[];

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

    if (view === "responses") {
        return (
            <div className="space-y-6 animate-in fade-in">
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h2 className="text-2xl font-bold">Responses ({responses.length})</h2>
                        <button onClick={() => setView("list")} className="text-sm text-gray-400 hover:text-primary mt-1">&larr; Back to Forms</button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-sm">
                                <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Timestamp</th>
                                {builderQuestions.map((q, i) => <th key={i} className="p-4 font-semibold text-gray-600 truncate max-w-xs">{q.questionText}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {responses.length === 0 ? <tr><td colSpan={builderQuestions.length + 1} className="p-8 text-center text-gray-400">No responses yet.</td></tr>
                                : responses.map(r => (
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

    if (view === "builder" || view === "settings") {
        return (
            <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto pb-20">
                <div className="flex items-center justify-between sticky top-0 bg-[#fcfcfc]/90 backdrop-blur-md pt-4 pb-4 z-40 border-b border-gray-100 mb-6">
                    <button onClick={() => setView("list")} className="text-sm text-gray-400 hover:text-primary">&larr; Back</button>

                    <div className="flex bg-gray-100/50 p-1 rounded-xl mx-auto">
                        <button onClick={() => setView("builder")} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${view === 'builder' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900'}`}>Questions</button>
                        <button onClick={() => setView("settings")} className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-1 ${view === 'settings' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900'}`}><Settings size={14} /> Settings</button>
                    </div>

                    <div className="flex gap-2">
                        {isPublished && <button onClick={copyShareLink} className="flex gap-2 items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition"><LinkIcon size={16} /> <span className="hidden sm:inline">Copy Link</span></button>}
                        <button onClick={() => handleSaveForm()} className="flex gap-2 items-center px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-sm font-bold transition"><Save size={16} /> <span className="hidden sm:inline">Save Draft</span></button>
                        <button onClick={() => handleSaveForm(!isPublished)} className={`flex gap-2 items-center px-4 py-2 text-white rounded-xl text-sm font-bold transition ${isPublished ? 'bg-orange-500 hover:bg-orange-600' : 'bg-primary hover:bg-primary/90'}`}>{isPublished ? "Unpublish" : "Publish"}</button>
                    </div>
                </div>

                {view === "settings" && activeForm && (
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100/60 pb-12">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><ArrowRight className="text-primary" /> Post-Submission Setup</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">After hitting Submit...</label>
                                    <select
                                        value={activeForm.postSubmissionAction || 'message'}
                                        onChange={e => setActiveForm({ ...activeForm, postSubmissionAction: e.target.value })}
                                        className="w-full bg-gray-50 border-none rounded-xl p-4 ring-1 ring-gray-200 focus:ring-primary text-gray-800"
                                    >
                                        <option value="message">Show Success Message</option>
                                        <option value="redirect_url">Redirect to URL Link</option>
                                        <option value="whatsapp_group">Invite to WhatsApp Group</option>
                                    </select>
                                </div>

                                {activeForm.postSubmissionAction === 'message' || !activeForm.postSubmissionAction ? (
                                    <div className="animate-in fade-in">
                                        <label className="block text-sm font-bold text-gray-500 mb-2">Custom Success Message</label>
                                        <textarea
                                            value={activeForm.customSuccessMessage || ''}
                                            onChange={e => setActiveForm({ ...activeForm, customSuccessMessage: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-xl p-4 ring-1 ring-gray-200 focus:ring-primary resize-y min-h-[100px]"
                                            placeholder="Your response has been recorded. Thank you!"
                                        />
                                    </div>
                                ) : (
                                    <div className="animate-in slide-in-from-top-2">
                                        <label className="block text-sm font-bold text-gray-500 mb-2">Redirect URL / Link</label>
                                        <input
                                            type="url"
                                            value={activeForm.postSubmissionData || ''}
                                            onChange={e => setActiveForm({ ...activeForm, postSubmissionData: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-xl p-4 ring-1 ring-gray-200 focus:ring-primary"
                                            placeholder="https://..."
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100/60">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold flex items-center gap-2"><MessageSquare className="text-primary" /> Automated Messaging</h3>
                                <label className="flex items-center cursor-pointer">
                                    <div className={`relative w-12 h-7 transition-colors rounded-full ${activeForm.automationEnabled ? 'bg-primary' : 'bg-gray-300'}`}>
                                        <input type="checkbox" checked={activeForm.automationEnabled || false} onChange={e => setActiveForm({ ...activeForm, automationEnabled: e.target.checked })} className="sr-only" />
                                        <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform ${activeForm.automationEnabled ? 'translate-x-5' : ''}`} />
                                    </div>
                                </label>
                            </div>

                            {activeForm.automationEnabled && (
                                <div className="space-y-6 pt-4 border-t border-gray-100 animate-in fade-in">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">Channels</label>
                                        <div className="flex gap-4">
                                            {['Email', 'WhatsApp', 'SMS'].map(ch => {
                                                const channels = activeForm.automationChannels || [];
                                                const isActive = channels.includes(ch.toLowerCase());
                                                return (
                                                    <label key={ch} className={`px-4 py-2 rounded-xl border-2 cursor-pointer transition select-none flex items-center gap-2 ${isActive ? 'border-primary bg-primary/5 text-primary font-bold' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isActive}
                                                            onChange={e => {
                                                                if (e.target.checked) setActiveForm({ ...activeForm, automationChannels: [...channels, ch.toLowerCase()] });
                                                                else setActiveForm({ ...activeForm, automationChannels: channels.filter(c => c !== ch.toLowerCase()) });
                                                            }}
                                                            className="sr-only"
                                                        />
                                                        {ch}
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Message Template Tags <span className="text-gray-400 font-normal ml-2">Click to insert at end</span></label>
                                        <div className="flex gap-2 mb-3 flex-wrap">
                                            {builderQuestions.filter(q => ['short_answer', 'paragraph', 'multiple_choice', 'dropdown'].includes(q.type)).map((q, i) => (
                                                <button
                                                    key={i} type="button"
                                                    onClick={() => setActiveForm({ ...activeForm, automationTemplate: (activeForm.automationTemplate || '') + ` {{${q.questionText}}}` })}
                                                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-600 transition"
                                                >
                                                    {`{{${q.questionText}}}`}
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            value={activeForm.automationTemplate || ''}
                                            onChange={e => setActiveForm({ ...activeForm, automationTemplate: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-xl p-4 ring-1 ring-gray-200 focus:ring-primary min-h-[160px] font-mono text-sm resize-y"
                                            placeholder="Hello {{Name}},\nThank you for opting into our specific branch! You selected {{Role}}... "
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {view === "builder" && activeForm && (
                    <>
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100/60 overflow-hidden mb-6 relative group">
                            {/* Banner Field with FilePicker */}
                            <label className="block h-48 bg-gray-50 relative group overflow-hidden border-b border-gray-100 cursor-pointer">
                                {activeForm.bannerUrl ? (
                                    <img src={activeForm.bannerUrl} alt="Form Banner" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2"><UploadCloud className="text-gray-300" size={32} /><span className="font-bold text-sm">Click to upload custom Banner</span></div>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-4">
                                    <span className="text-white font-bold tracking-widest uppercase text-sm">Change Banner</span>
                                </div>
                                <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, (b64) => setActiveForm({ ...activeForm, bannerUrl: b64 }))} />
                            </label>

                            <div className="p-8 space-y-4 border-l-8 border-l-primary relative">
                                <input type="text" value={activeForm.title} onChange={e => setActiveForm({ ...activeForm, title: e.target.value })} className="w-full text-4xl font-black text-gray-900 border-none outline-none focus:ring-0 px-0 bg-transparent" placeholder="Form Title" />
                                <textarea value={activeForm.description} onChange={e => setActiveForm({ ...activeForm, description: e.target.value })} className="w-full text-gray-600 border-none outline-none focus:ring-0 px-0 resize-none h-20 bg-transparent text-lg" placeholder="Form Description" />
                            </div>
                        </div>

                        {builderQuestions.map((q, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100/60 flex flex-col gap-6 relative group transition-all">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-3">
                                        <input type="text" value={q.questionText} onChange={e => updateQuestion(idx, { questionText: e.target.value })} className="w-full text-xl font-bold bg-transparent border-none rounded-none border-b-2 border-gray-100 p-2 focus:border-primary focus:ring-0 px-0 transition-colors" placeholder="Question" />

                                        {/* Question Image Preview & Uploader */}
                                        {q.imageUrl ? (
                                            <div className="relative group/qImg max-w-sm rounded-xl overflow-hidden mt-4 border border-gray-100">
                                                <img src={q.imageUrl} alt="Context" className="w-full h-auto" />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover/qImg:opacity-100 transition">
                                                    <button onClick={() => updateQuestion(idx, { imageUrl: '' })} className="bg-red-500 text-white rounded-full p-2"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="cursor-pointer inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary transition mt-2">
                                                <ImageIcon size={16} /> Add Image Context
                                                <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, base64 => updateQuestion(idx, { imageUrl: base64 }))} />
                                            </label>
                                        )}
                                    </div>

                                    <select value={q.type} onChange={e => updateQuestion(idx, { type: e.target.value as QuestionType })} className="bg-gray-50 border-none rounded-xl p-3 ring-1 ring-gray-200 focus:ring-primary text-sm font-semibold flex-shrink-0">
                                        <option value="short_answer">Short Answer</option>
                                        <option value="paragraph">Paragraph</option>
                                        <option value="multiple_choice">Multiple Choice</option>
                                        <option value="checkboxes">Checkboxes</option>
                                        <option value="dropdown">Dropdown</option>
                                        <option value="linear_scale">Linear Scale</option>
                                        <option value="file_upload">File Upload</option>
                                    </select>
                                </div>

                                <div className="pt-2">
                                    {q.type === "short_answer" && <div className="text-gray-400 border-b border-dashed border-gray-300 w-1/2 pb-2 text-sm inline-block">Short answer text</div>}
                                    {q.type === "paragraph" && <div className="text-gray-400 border-b border-dashed border-gray-300 w-full pb-2 text-sm inline-block max-w-xl">Long answer text...</div>}

                                    {["multiple_choice", "checkboxes", "dropdown"].includes(q.type) && (
                                        <div className="space-y-4">
                                            {q.options?.map((opt, oIdx) => (
                                                <div key={oIdx} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-gray-50 hover:bg-gray-100/50 p-2 pl-3 rounded-xl transition">
                                                    <div className={`w-5 h-5 flex-shrink-0 border-2 border-gray-300 mt-1 sm:mt-0 ${q.type === 'multiple_choice' || q.type === 'dropdown' ? 'rounded-full' : 'rounded-md'}`} />
                                                    <input
                                                        type="text"
                                                        value={opt}
                                                        onChange={e => {
                                                            const newOpts = [...(q.options || [])];
                                                            const oldVal = newOpts[oIdx];
                                                            const newVal = e.target.value;
                                                            newOpts[oIdx] = newVal;

                                                            // Update Logic map keys if option changed
                                                            let newLogic = { ...q.logicConditions };
                                                            if (newLogic[oldVal]) {
                                                                newLogic[newVal] = newLogic[oldVal];
                                                                delete newLogic[oldVal];
                                                            }
                                                            updateQuestion(idx, { options: newOpts, logicConditions: newLogic });
                                                        }}
                                                        className="border-none focus:ring-0 p-0 text-gray-800 font-medium text-lg w-full bg-transparent flex-1"
                                                        placeholder={`Option ${oIdx + 1}`}
                                                    />

                                                    {/* Visual Section Routing for Multiple Choice / Dropdown */}
                                                    {(q.type === 'multiple_choice' || q.type === 'dropdown') && (
                                                        <select
                                                            className="text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-lg p-2 focus:ring-primary w-full sm:w-auto"
                                                            value={q.logicConditions?.[opt] || ''}
                                                            onChange={e => {
                                                                const routeVal = e.target.value;
                                                                const newLogic = { ...(q.logicConditions || {}) };
                                                                if (routeVal === '') delete newLogic[opt]; // Default continue
                                                                else newLogic[opt] = routeVal;
                                                                updateQuestion(idx, { logicConditions: newLogic });
                                                            }}
                                                        >
                                                            <option value="" className="text-gray-400">Continue to next section</option>
                                                            <option value="submit" className="font-bold text-gray-900">Submit form</option>
                                                            {availableSections.map(sec => <option key={sec} value={sec}>Go to Section: {sec}</option>)}
                                                        </select>
                                                    )}

                                                    <button onClick={() => {
                                                        const newOpts = [...(q.options || [])];
                                                        newOpts.splice(oIdx, 1);
                                                        const newLogic = { ...q.logicConditions };
                                                        delete newLogic[opt];
                                                        updateQuestion(idx, { options: newOpts, logicConditions: newLogic });
                                                    }} className="text-gray-400 hover:text-red-500 p-1 bg-white rounded-md shadow-sm sm:shadow-none"><X size={16} /></button>
                                                </div>
                                            ))}
                                            <button onClick={() => updateQuestion(idx, { options: [...(q.options || []), `Option ${(q.options?.length || 0) + 1}`] })}
                                                className="text-sm font-bold text-primary hover:text-primary/80 flex items-center gap-2 mt-4 ml-1">
                                                <Plus size={16} /> Add option
                                            </button>
                                        </div>
                                    )}

                                    {q.type === "linear_scale" && (
                                        <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100 w-max">
                                            <div className="flex flex-col gap-2 relative">
                                                <input type="number" className="w-16 rounded-lg border-gray-200 text-center font-bold font-mono" value={q.options?.[0] || '1'} onChange={e => {
                                                    const newOpts = [...(q.options || ['1', '5'])]; newOpts[0] = e.target.value; updateQuestion(idx, { options: newOpts });
                                                }} />
                                                <span className="text-xs font-bold text-gray-400 uppercase text-center mt-2">Min</span>
                                            </div>
                                            <div className="w-12 h-0.5 bg-gray-300 mb-6 relative"><div className="absolute -top-3 left-1/2 -translate-x-1/2 text-gray-400">TO</div></div>
                                            <div className="flex flex-col gap-2 relative">
                                                <input type="number" className="w-16 rounded-lg border-gray-200 text-center font-bold font-mono" value={q.options?.[1] || '5'} onChange={e => {
                                                    const newOpts = [...(q.options || ['1', '5'])]; newOpts[1] = e.target.value; updateQuestion(idx, { options: newOpts });
                                                }} />
                                                <span className="text-xs font-bold text-gray-400 uppercase text-center mt-2">Max</span>
                                            </div>
                                        </div>
                                    )}

                                    {q.type === "file_upload" && (
                                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                                            <UploadCloud className="mb-2" opacity={0.5} size={32} />
                                            <span className="font-semibold text-sm">Responders will upload a file here.</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end items-center gap-6 pt-6 border-t border-gray-100 mt-2">
                                    <div className="flex-1 flex items-center">
                                        {/* Quick Section ID Definition for Page Breaks */}
                                        <input type="text" placeholder="Section Name (e.g., 'Payment')" value={q.sectionId || ''} onChange={e => updateQuestion(idx, { sectionId: e.target.value })} className="bg-gray-50 text-xs font-bold border-none rounded-lg p-2 focus:ring-1 focus:ring-primary w-48 text-gray-600" />
                                    </div>

                                    <label className="flex items-center gap-3 text-sm font-bold text-gray-700 cursor-pointer">
                                        <div className={`relative w-10 h-6 transition-colors rounded-full ${q.required ? 'bg-primary' : 'bg-gray-300'}`}>
                                            <input type="checkbox" checked={q.required} onChange={e => updateQuestion(idx, { required: e.target.checked })} className="sr-only" />
                                            <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${q.required ? 'translate-x-[15px]' : ''}`} />
                                        </div>
                                        <span>Required</span>
                                    </label>
                                    <div className="w-px h-6 bg-gray-200" />
                                    <button onClick={() => removeQuestion(idx)} className="text-gray-400 hover:text-red-500 transition p-2 hover:bg-red-50 rounded-lg"><Trash2 size={20} /></button>
                                </div>
                            </div>
                        ))}

                        <button onClick={() => addQuestion("multiple_choice")} className="w-full py-5 bg-white border-2 border-dashed border-gray-200 rounded-3xl text-gray-500 font-bold hover:bg-primary/5 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 shadow-sm">
                            <Plus size={20} /> Add New Question
                        </button>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/60">
                <div><h2 className="text-3xl font-black tracking-tight mb-1">Forms Hub</h2><p className="text-gray-500 text-sm font-medium">Create automated dynamic forms.</p></div>
                <button onClick={handleCreateForm} className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition shadow-lg shadow-primary/20 hover:-translate-y-0.5"><Plus size={18} /> New Form</button>
            </div>
            {forms.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/60 border-dashed border-2">
                    <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 text-primary"><FileText size={32} /></div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No forms created yet</h3>
                    <button onClick={handleCreateForm} className="text-primary font-bold hover:underline text-lg">Create First Form</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {forms.map(form => (
                        <div key={form.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all group flex flex-col relative overflow-hidden">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 mt-2">{form.title}</h3>
                            <div className="flex items-center justify-between pt-5 border-t border-gray-100 mt-auto">
                                <span className="text-xs font-bold text-gray-400">{new Date(form.createdAt).toLocaleDateString()}</span>
                                <div className="flex items-center gap-1.5">
                                    <button onClick={() => handleEditForm(form.id)} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-primary/10 hover:text-primary" title="Edit Form"><Edit size={16} /></button>
                                    <button onClick={() => handleViewResponses(form.id)} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-primary/10 hover:text-primary" title="View Responses"><Eye size={16} /></button>
                                    <button onClick={() => handleDeleteForm(form.id)} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-red-100 hover:text-red-600" title="Delete Form"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
