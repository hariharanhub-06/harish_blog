"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Loader2, Plus, Edit, Trash2, Link as LinkIcon, Eye, Save, Trash, X, FileText, ImageIcon, Settings, MessageSquare, ArrowRight, CornerDownRight, UploadCloud, Link, BarChart3, PieChart as PieChartIcon, Download } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { uploadToImageKit } from "@/lib/imagekit-upload";
import ImageCropper from "./ImageCropper";

type Form = {
    id: string;
    title: string;
    description: string;
    isPublished: boolean;
    createdAt: string;
    bannerUrl?: string; // Base64 or URL
    bannerPosition?: string;
    themeColor?: string;
    postSubmissionAction?: string;
    postSubmissionData?: string;
    customSuccessMessage?: string;
    automationEnabled?: boolean;
    automationChannels?: string[];
    automationTemplate?: string;
};

type QuestionType = "short_answer" | "paragraph" | "multiple_choice" | "checkboxes" | "dropdown" | "linear_scale" | "file_upload" | "section_header";

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
    const [selectedResponses, setSelectedResponses] = useState<Set<string>>(new Set());
    const [responsesView, setResponsesView] = useState<"table" | "analytics">("table");
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [isCropping, setIsCropping] = useState(false);

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

        let curSectionName = "";
        const finalQuestions = builderQuestions.map(q => {
            if (q.type === "section_header") {
                curSectionName = q.questionText;
                return { ...q, sectionId: curSectionName };
            }
            return { ...q, sectionId: curSectionName || '' };
        });

        try {
            const res = await fetch(`/api/admin/forms/${activeForm.id}`, {
                method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...activeForm, isPublished: finalPublished, questions: finalQuestions }),
            });
            if (res.ok) { setIsPublished(finalPublished); toast.success("Saved"); }
        } catch (e) { toast.error("Failed to save"); }
    };

    // File Upload Handler with ImageKit
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | Blob | File, callback: (url: string) => void) => {
        let file: File | Blob;
        if (e instanceof Blob || e instanceof File) {
            file = e;
        } else {
            file = (e as React.ChangeEvent<HTMLInputElement>).target.files?.[0] || new Blob();
        }

        if (!file || (file instanceof Blob && file.size === 0)) return;

        const tid = toast.loading("Uploading to ImageKit...");
        try {
            const url = await uploadToImageKit(file, 'forms');
            callback(url);
            toast.success("Uploaded successfully!", { id: tid });
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Upload failed", { id: tid });
        }
    };

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setImageToCrop(reader.result as string);
            setIsCropping(true);
        };
        reader.readAsDataURL(file);
    };

    const onCropComplete = async (croppedBlob: Blob) => {
        setIsCropping(false);
        if (!activeForm) return;
        await handleFileUpload(croppedBlob, (url) => setActiveForm({ ...activeForm, bannerUrl: url }));
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

    const handleExportCSV = (ids?: string[]) => {
        const rowsToExport = ids ? responses.filter(r => ids.includes(r.id)) : responses;
        if (rowsToExport.length === 0) { toast.error("No responses to export"); return; }

        const headers = ["Timestamp", ...builderQuestions.map(q => q.questionText)];
        const csvRows = rowsToExport.map(r => {
            const timestamp = new Date(r.createdAt).toLocaleString();
            const answers = builderQuestions.map(q => {
                const ans = r.answers?.find((a: any) => a.questionId === q.id);
                const text = ans?.answerText || (ans?.answerChoices ? JSON.parse(ans.answerChoices).join(", ") : "-");
                return `"${text.replace(/"/g, '""')}"`;
            });
            return [timestamp, ...answers].join(",");
        });

        const csvContent = [headers.join(","), ...csvRows].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${activeForm?.title || 'Form'}_Responses.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDeleteResponses = async (ids: string[]) => {
        if (!confirm(`Are you sure you want to delete ${ids.length} response(s)?`)) return;
        try {
            const res = await fetch(`/api/admin/forms/${activeForm?.id}/responses`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ responseIds: ids })
            });
            if (res.ok) {
                toast.success("Deleted");
                setResponses(responses.filter(r => !ids.includes(r.id)));
                setSelectedResponses(new Set());
            }
        } catch (e) { toast.error("Delete failed"); }
    };

    const handleSendManualNotification = (r: any) => {
        if (!activeForm) return;
        // This simulates sending the automation template with replaced tags
        let template = activeForm.automationTemplate || "No template configured.";
        builderQuestions.forEach(q => {
            if (!q.questionText) return;
            const ans = r.answers?.find((a: any) => a.questionId === q.id);
            const text = ans?.answerText || (ans?.answerChoices ? (typeof ans.answerChoices === 'string' ? JSON.parse(ans.answerChoices).join(", ") : ans.answerChoices.join(", ")) : "-");

            // Escape questionText for Regex
            const escapedTag = q.questionText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            template = template.replace(new RegExp(`{{${escapedTag}}}`, 'g'), text);
        });

        const channels = (activeForm.automationChannels || []).join(", ");
        toast((t) => (
            <div className="flex flex-col gap-2 min-w-[300px]">
                <div className="flex items-center justify-between border-b pb-2 mb-1">
                    <span className="font-black text-xs uppercase tracking-widest text-primary">Mock {channels || 'No Channels'} Sent</span>
                    <button onClick={() => toast.dismiss(t.id)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
                </div>
                <div className="text-sm font-medium text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {template}
                </div>
                <div className="mt-2 pt-2 border-t text-[10px] text-gray-400 italic">
                    Note: Integration is currently in Sandbox/Mock mode.
                </div>
            </div>
        ), { duration: 6000, position: 'top-right' });
    };

    const availableSections = builderQuestions.filter(q => q.type === 'section_header').map(q => q.questionText).filter(Boolean);

    const analyticsData = useMemo(() => {
        if (view !== "responses" || responses.length === 0) return [];
        return builderQuestions.map(q => {
            if (['multiple_choice', 'dropdown', 'checkboxes'].includes(q.type)) {
                const counts: Record<string, number> = {};
                (q.options || []).forEach(opt => counts[opt] = 0);

                responses.forEach(r => {
                    const ans = r.answers?.find((a: any) => a.questionId === q.id);
                    if (ans) {
                        if (q.type === 'checkboxes') {
                            try {
                                const choices = JSON.parse(ans.answerChoices || "[]");
                                choices.forEach((c: string) => { if (counts[c] !== undefined) counts[c]++; });
                            } catch (e) { }
                        } else {
                            if (counts[ans.answerText] !== undefined) counts[ans.answerText]++;
                        }
                    }
                });

                return {
                    questionId: q.id,
                    questionText: q.questionText,
                    type: q.type,
                    data: Object.entries(counts).map(([name, value]) => ({ name, value }))
                };
            }
            return null;
        }).filter(Boolean);
    }, [view, responses, builderQuestions]);

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

    if (view === "responses") {
        const isAllSelected = responses.length > 0 && selectedResponses.size === responses.length;

        const toggleSelectAll = () => {
            if (isAllSelected) setSelectedResponses(new Set());
            else setSelectedResponses(new Set(responses.map(r => r.id)));
        };

        const toggleSelectOne = (id: string) => {
            const next = new Set(selectedResponses);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            setSelectedResponses(next);
        };

        return (
            <div className="space-y-6 animate-in fade-in">
                <div className="flex justify-between items-center bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Responses ({responses.length})</h2>
                        <button onClick={() => setView("list")} className="text-sm text-gray-400 hover:text-primary mt-1">&larr; Back to Forms List</button>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mr-4 transition-colors">
                            <button onClick={() => setResponsesView("table")} className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${responsesView === 'table' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}><FileText size={14} /> Table</button>
                            <button onClick={() => setResponsesView("analytics")} className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${responsesView === 'analytics' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}><BarChart3 size={14} /> Analytics</button>
                        </div>
                        <button onClick={() => handleExportCSV()} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-xs font-bold transition text-gray-700 dark:text-gray-200">
                            <FileText size={14} /> Export CSV
                        </button>
                    </div>
                </div>

                {selectedResponses.size > 0 && (
                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl flex items-center justify-between sticky top-4 z-50 backdrop-blur-md animate-in slide-in-from-top-4">
                        <span className="font-bold text-primary ml-2">{selectedResponses.size} selected</span>
                        <div className="flex gap-2">
                            <button onClick={() => handleExportCSV(Array.from(selectedResponses))} className="bg-white text-primary border border-primary/20 px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/5 transition">Export Selected</button>
                            <button onClick={() => {
                                const selected = responses.filter(r => selectedResponses.has(r.id));
                                selected.forEach(r => handleSendManualNotification(r));
                                toast.success("Triggered batch notifications (Mock)");
                            }} className="bg-white text-primary border border-primary/20 px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/5 transition">Send Batch Message</button>
                            <button onClick={() => handleDeleteResponses(Array.from(selectedResponses))} className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-600 transition flex items-center gap-2">
                                <Trash2 size={16} /> Delete
                            </button>
                        </div>
                    </div>
                )}

                {responsesView === "table" ? (
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-x-auto transition-colors">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-gray-800 text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                    <th className="p-4 w-10">
                                        <input type="checkbox" checked={isAllSelected} onChange={toggleSelectAll} className="w-5 h-5 rounded border-gray-300 dark:border-gray-700 text-primary focus:ring-primary bg-transparent" />
                                    </th>
                                    <th className="p-4 whitespace-nowrap">Timestamp</th>
                                    {builderQuestions.map((q, i) => <th key={i} className="p-4 truncate max-w-[200px]">{q.questionText}</th>)}
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {responses.length === 0 ? <tr><td colSpan={builderQuestions.length + 3} className="p-8 text-center text-gray-400 dark:text-gray-600 font-bold uppercase tracking-widest text-xs">No responses yet.</td></tr>
                                    : responses.map(r => (
                                        <tr key={r.id} className={`border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-white/5 transition ${selectedResponses.has(r.id) ? 'bg-primary/5 dark:bg-primary/10' : ''}`}>
                                            <td className="p-4">
                                                <input type="checkbox" checked={selectedResponses.has(r.id)} onChange={() => toggleSelectOne(r.id)} className="w-5 h-5 rounded border-gray-300 dark:border-gray-700 text-primary focus:ring-primary bg-transparent" />
                                            </td>
                                            <td className="p-4 text-[11px] font-bold text-gray-600 dark:text-gray-300 whitespace-nowrap group-hover:text-primary transition-colors">{new Date(r.createdAt).toLocaleString()}</td>
                                            {builderQuestions.map((q, j) => {
                                                const ans = r.answers?.find((a: any) => a.questionId === q.id);
                                                const text = ans?.answerText || (ans?.answerChoices ? (typeof ans.answerChoices === 'string' ? JSON.parse(ans.answerChoices).join(", ") : ans.answerChoices.join(", ")) : "-");
                                                const isImage = q.type === 'file_upload' && text?.startsWith('data:image');

                                                return (
                                                    <td key={j} className="p-4 text-sm text-gray-800 dark:text-gray-200 truncate max-w-[200px] font-medium" title={isImage || text?.includes('imagekit.io') ? "Click to view image" : text}>
                                                        {isImage || text?.includes('imagekit.io') ? (
                                                            <button onClick={() => { setPreviewImage(text); setIsPreviewOpen(true); }} className="relative group flex items-center gap-2">
                                                                <div className="w-10 h-10 rounded-lg border border-gray-100 dark:border-gray-800 overflow-hidden shadow-md group-hover:scale-110 transition-transform bg-gray-50 dark:bg-white/5">
                                                                    <img src={text} className="w-full h-full object-cover" />
                                                                </div>
                                                                <Eye size={14} className="text-gray-400 group-hover:text-primary transition" />
                                                            </button>
                                                        ) : (
                                                            <span className="line-clamp-1">{text}</span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button onClick={() => handleSendManualNotification(r)} className="w-9 h-9 flex items-center justify-center text-primary hover:bg-primary/10 rounded-lg transition" title="Send Notification">
                                                        <MessageSquare size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteResponses([r.id])} className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition" title="Delete">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                        {analyticsData.length === 0 ? (
                            <div className="col-span-full py-20 text-center bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-gray-800 border-dashed border-2">
                                <PieChartIcon size={40} className="mx-auto text-gray-200 dark:text-gray-700 mb-4" />
                                <h3 className="text-lg font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight">No analytics available</h3>
                                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1 uppercase tracking-widest">Questions like Multiple Choice & Checkboxes show stats here.</p>
                            </div>
                        ) : analyticsData.map((item: any, idx) => (
                            <div key={idx} className="bg-white dark:bg-[#1e1e1e] p-7 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-[400px] transition-colors">
                                <h3 className="text-sm font-black mb-6 line-clamp-2 min-h-[40px] text-gray-800 dark:text-white uppercase tracking-tight">{item.questionText}</h3>
                                <div className="flex-1 w-full min-h-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={item.data} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fontWeight: 900, fill: '#6b7280' }} />
                                            <Tooltip
                                                cursor={{ fill: '#f9fafb', opacity: 0.1 }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold', fontSize: '12px', backgroundColor: '#fff', color: '#000' }}
                                            />
                                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                                                {item.data.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={['#3b71ca', '#10b981', '#6366f1', '#f59e0b', '#ef4444'][index % 5]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-6 pt-4 border-t border-gray-50 dark:border-gray-800 flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <span>{item.type.replace('_', ' ')}</span>
                                    <span className="bg-[#3b71ca]/10 text-[#3b71ca] px-2.5 py-1 rounded-lg">{responses.length} Responded</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {/* Image Preview Modal */}
                <AnimatePresence>
                    {isPreviewOpen && previewImage && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsPreviewOpen(false)}
                                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="relative max-w-5xl max-h-full aspect-auto bg-white rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"
                            >
                                <button
                                    onClick={() => setIsPreviewOpen(false)}
                                    className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all"
                                >
                                    <X size={24} />
                                </button>
                                <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
                                    <img src={previewImage} alt="Preview" className="max-w-full max-h-[80vh] object-contain rounded-xl" />
                                </div>
                                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                                    <span className="font-bold text-gray-500 uppercase tracking-widest text-xs">Response Attachment</span>
                                    <div className="flex gap-3">
                                        <a href={previewImage} target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-200 transition">Open Original</a>
                                        <a href={previewImage} download="submission_image.png" className="px-6 py-2 bg-primary text-white font-bold rounded-xl text-sm hover:opacity-90 transition flex items-center gap-2"><Download size={14} /> Download</a>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    if (view === "builder" || view === "settings") {
        return (
            <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto pb-20">
                <div className="flex items-center justify-between sticky top-0 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md pt-4 pb-4 z-40 border-b border-gray-100 dark:border-gray-800 mb-6 px-4 transition-colors">
                    <button onClick={() => setView("list")} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#3b71ca] transition-colors">&larr; Back to hub</button>

                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mx-auto transition-colors">
                        <button onClick={() => setView("builder")} className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition ${view === 'builder' ? 'bg-white dark:bg-gray-700 shadow-sm text-[#3b71ca]' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'}`}>Questions</button>
                        <button onClick={() => setView("settings")} className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition flex items-center gap-1.5 ${view === 'settings' ? 'bg-white dark:bg-gray-700 shadow-sm text-[#3b71ca]' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'}`}><Settings size={12} /> Settings</button>
                    </div>

                    <div className="flex gap-2">
                        {isPublished && <button onClick={copyShareLink} className="flex gap-2 items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition"><LinkIcon size={14} /> <span className="hidden lg:inline">Copy Link</span></button>}
                        <button onClick={() => handleSaveForm()} className="flex gap-2 items-center px-4 py-2 bg-[#3b71ca] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition shadow-lg shadow-[#3b71ca]/20 hover:-translate-y-0.5"><Save size={14} /> <span className="hidden lg:inline">{isPublished ? 'Save' : 'Save Draft'}</span></button>
                        <button onClick={() => handleSaveForm(!isPublished)} className={`flex gap-2 items-center px-4 py-2 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition ${isPublished ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'} shadow-lg hover:-translate-y-0.5`}><span className="hidden sm:inline">{isPublished ? "Unpublish" : "Publish"}</span></button>
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

                                <div className="pt-6 border-t border-gray-100">
                                    <label className="block text-sm font-bold text-gray-700 mb-4">Brand Theme Color</label>
                                    <div className="flex gap-4 flex-wrap">
                                        {[
                                            { name: 'Blue', color: '#2563eb' },
                                            { name: 'Emerald', color: '#059669' },
                                            { name: 'Purple', color: '#7c3aed' },
                                            { name: 'Orange', color: '#ea580c' },
                                            { name: 'Rose', color: '#e11d48' },
                                            { name: 'Black', color: '#111827' }
                                        ].map(t => (
                                            <button
                                                key={t.color}
                                                type="button"
                                                onClick={() => setActiveForm({ ...activeForm, themeColor: t.color })}
                                                className={`w-12 h-12 rounded-2xl transition-all border-4 ${activeForm.themeColor === t.color ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-transparent hover:scale-105'}`}
                                                style={{ backgroundColor: t.color }}
                                                title={t.name}
                                            />
                                        ))}
                                    </div>
                                </div>
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
                            <div className="relative group">
                                <label className="block h-48 bg-gray-50 relative group overflow-hidden border-b border-gray-100 cursor-pointer">
                                    {activeForm.bannerUrl ? (
                                        <img
                                            src={activeForm.bannerUrl}
                                            alt="Form Banner"
                                            className="w-full h-full object-cover transition-all duration-300"
                                            style={{ objectPosition: activeForm.bannerPosition || 'center' }}
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                            <div className="flex flex-col items-center gap-2"><UploadCloud className="text-gray-300" size={32} /><span className="font-bold text-sm">Click to upload custom Banner</span></div>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-4 gap-4">
                                        <span className="text-white font-bold tracking-widest uppercase text-xs border border-white/40 px-4 py-2 rounded-xl backdrop-blur-sm">Change Banner</span>
                                        {activeForm.bannerUrl && (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setPreviewImage(activeForm.bannerUrl!);
                                                    setIsPreviewOpen(true);
                                                }}
                                                className="p-3 bg-white/20 hover:bg-white/40 text-white rounded-xl backdrop-blur-md transition-all border border-white/30"
                                            >
                                                <Eye size={20} />
                                            </button>
                                        )}
                                    </div>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
                                </label>

                                {activeForm.bannerUrl && (
                                    <div className="absolute bottom-4 right-4 flex gap-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-xl shadow-lg border border-white/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {['top', 'center', 'bottom'].map((pos) => (
                                            <button
                                                key={pos}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setActiveForm({ ...activeForm, bannerPosition: pos });
                                                }}
                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition ${activeForm.bannerPosition === pos || (!activeForm.bannerPosition && pos === 'center') ? 'bg-[#3b71ca] text-white' : 'text-gray-400 hover:text-gray-600'}`}
                                            >
                                                {pos}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-8 space-y-4 border-l-8 border-l-primary relative">
                                <input type="text" value={activeForm.title} onChange={e => setActiveForm({ ...activeForm, title: e.target.value })} className="w-full text-2xl font-black text-gray-900 border-none outline-none focus:ring-0 px-0 bg-transparent" placeholder="Form Title" />
                                <textarea value={activeForm.description} onChange={e => setActiveForm({ ...activeForm, description: e.target.value })} className="w-full text-gray-500 border-none outline-none focus:ring-0 px-0 resize-none h-12 bg-transparent text-base" placeholder="Form Description" />
                            </div>
                        </div>

                        {builderQuestions.map((q, idx) => (
                            <div key={idx} className="relative group transition-all">
                                {q.type === 'section_header' ? (
                                    <div className="bg-primary/90 text-white p-8 sm:p-10 rounded-3xl shadow-sm border border-primary relative overflow-hidden group">
                                        <div className="absolute top-0 right-12 w-24 h-2 bg-white/30 rounded-b-xl border-t-0"></div>
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 space-y-2">
                                                <input type="text" value={q.questionText} onChange={e => updateQuestion(idx, { questionText: e.target.value })} className="w-full text-xl font-black bg-transparent border-none focus:ring-0 px-0 placeholder-white/70" placeholder="Section Title" />
                                                <input type="text" value={q.options?.[0] || ''} onChange={e => updateQuestion(idx, { options: [e.target.value] })} className="w-full text-sm font-medium bg-transparent border-none focus:ring-0 px-0 placeholder-white/50" placeholder="Optional description..." />
                                            </div>
                                            <button onClick={() => removeQuestion(idx)} className="text-white/60 hover:text-white transition p-2 hover:bg-black/10 rounded-lg"><Trash2 size={20} /></button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100/60 flex flex-col gap-6 relative">
                                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                            <div className="flex-1 space-y-3 w-full">
                                                <input type="text" value={q.questionText} onChange={e => updateQuestion(idx, { questionText: e.target.value })} className="w-full text-lg font-bold bg-transparent border-none rounded-none border-b-2 border-gray-100 p-2 focus:border-primary focus:ring-0 px-0 transition-colors" placeholder="Question" />

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

                                            <select value={q.type} onChange={e => updateQuestion(idx, { type: e.target.value as QuestionType })} className="bg-gray-50 border-none rounded-xl p-3 ring-1 ring-gray-200 focus:ring-primary text-sm font-semibold flex-shrink-0 w-full sm:w-auto">
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

                                        <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-2">
                                            <div className="flex-1"></div>
                                            <div className="flex items-center gap-4">
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
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button onClick={() => addQuestion("multiple_choice")} className="flex-1 py-5 bg-white border-2 border-dashed border-gray-200 rounded-3xl text-gray-500 font-bold hover:bg-primary/5 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 shadow-sm">
                                <Plus size={20} /> Add New Question
                            </button>
                            <button onClick={() => setBuilderQuestions([...builderQuestions, { type: 'section_header', questionText: `Section ${availableSections.length + 2}`, required: false, options: [''] }])}
                                className="sm:w-1/3 py-5 bg-primary/5 border-2 border-dashed border-primary/30 rounded-3xl text-primary font-bold hover:bg-primary/10 hover:border-primary transition-all flex items-center justify-center gap-2 shadow-sm">
                                <Plus size={20} /> Add Section Break
                            </button>
                        </div>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                <div><h2 className="text-xl font-black tracking-tight mb-1 text-gray-900 dark:text-white uppercase">Forms Hub</h2><p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Create automated dynamic forms.</p></div>
                <button onClick={handleCreateForm} className="flex items-center gap-2 px-6 py-2.5 bg-[#3b71ca] text-white font-black text-[11px] uppercase tracking-wider rounded-xl hover:bg-[#3b71ca]/90 transition shadow-lg shadow-[#3b71ca]/20 hover:-translate-y-0.5"><Plus size={16} /> New Form</button>
            </div>
            {forms.length === 0 ? (
                <div className="text-center py-24 bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 border-dashed border-2">
                    <div className="w-16 h-16 bg-[#3b71ca]/5 rounded-full flex items-center justify-center mx-auto mb-6 text-[#3b71ca]"><FileText size={28} /></div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No forms created yet</h3>
                    <button onClick={handleCreateForm} className="text-[#3b71ca] font-black hover:underline text-sm uppercase tracking-widest">Create First Form</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {forms.map(form => (
                        <div key={form.id} className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all group flex flex-col relative overflow-hidden">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 line-clamp-1 mt-2 uppercase tracking-tight">{form.title}</h3>
                            <div className="flex items-center justify-between pt-5 border-t border-gray-50 dark:border-gray-800 mt-auto">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(form.createdAt).toLocaleDateString()}</span>
                                <div className="flex items-center gap-1.5">
                                    <button onClick={() => handleEditForm(form.id)} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#3b71ca]/10 hover:text-[#3b71ca] transition-colors text-gray-400 dark:text-gray-500" title="Edit Form"><Edit size={14} /></button>
                                    <button onClick={() => handleViewResponses(form.id)} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#3b71ca]/10 hover:text-[#3b71ca] transition-colors text-gray-400 dark:text-gray-500" title="View Responses"><Eye size={14} /></button>
                                    <button onClick={() => handleDeleteForm(form.id)} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 transition-colors text-gray-400 dark:text-gray-500" title="Delete Form"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Image Preview Modal */}
            <AnimatePresence>
                {isPreviewOpen && previewImage && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsPreviewOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative max-w-5xl max-h-full aspect-auto bg-white rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"
                        >
                            <button
                                onClick={() => setIsPreviewOpen(false)}
                                className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all"
                            >
                                <X size={24} />
                            </button>
                            <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
                                <img src={previewImage} alt="Preview" className="max-w-full max-h-[80vh] object-contain rounded-xl" />
                            </div>
                            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                                <span className="font-bold text-gray-500 uppercase tracking-widest text-xs">Response Attachment</span>
                                <div className="flex gap-3">
                                    <a href={previewImage} target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-200 transition">Open Original</a>
                                    <a href={previewImage} download="submission_image.png" className="px-6 py-2 bg-primary text-white font-bold rounded-xl text-sm hover:opacity-90 transition flex items-center gap-2"><Download size={14} /> Download</a>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Cropper Modal */}
            {isCropping && imageToCrop && (
                <ImageCropper
                    image={imageToCrop}
                    onCropComplete={onCropComplete}
                    onCancel={() => setIsCropping(false)}
                    aspectRatio={19 / 6}
                />
            )}
        </div>
    );
}
