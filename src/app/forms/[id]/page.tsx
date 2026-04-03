"use client";

import { useEffect, useState, use } from "react";
import { Loader2, CheckCircle2, ChevronRight, ChevronLeft, UploadCloud } from "lucide-react";
import toast from "react-hot-toast";

type FormQuestion = {
    id: string;
    type: "short_answer" | "paragraph" | "multiple_choice" | "checkboxes" | "dropdown" | "linear_scale" | "file_upload";
    questionText: string;
    required: boolean;
    options: string[] | null;
    imageUrl?: string;
    sectionId?: string;
    logicConditions?: Record<string, string>; // Maps answer value to a target sectionId
};

type Form = {
    id: string;
    title: string;
    description: string;
    isPublished: boolean;
    bannerUrl?: string;
    themeColor?: string;
    postSubmissionAction?: string;
    postSubmissionData?: string;
    customSuccessMessage?: string;
    questions: FormQuestion[];
};

const THEMES = [
    { primary: "#2563eb" }, // Blue
    { primary: "#059669" }, // Emerald 
    { primary: "#7c3aed" }, // Purple
    { primary: "#ea580c" }, // Orange
    { primary: "#e11d48" }  // Rose
];

export default function FormResponsePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const [form, setForm] = useState<Form | null>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    // UI steps 
    const [stepHistory, setStepHistory] = useState<number[]>([0]);
    const currentStepIndex = stepHistory[stepHistory.length - 1];

    const [randomTheme] = useState(THEMES[Math.floor(Math.random() * THEMES.length)].primary);

    useEffect(() => {
        if (!id) return;
        fetchForm();
    }, [id]);

    const fetchForm = async () => {
        try {
            const res = await fetch(`/api/admin/forms/${id}`);
            if (res.ok) {
                const data = await res.json();
                if (!data.isPublished) setError("This form is not currently accepting responses.");
                else {
                    setForm(data);
                    const initialAnswers: Record<string, any> = {};
                    data.questions.forEach((q: FormQuestion) => {
                        if (q.type === 'checkboxes') initialAnswers[q.id] = [];
                        else initialAnswers[q.id] = "";
                    });
                    setAnswers(initialAnswers);
                }
            } else setError("Form not found.");
        } catch (err) { setError("Failed to load form."); }
        setLoading(false);
    };

    const handleAnswerChange = (qId: string, val: any) => setAnswers({ ...answers, [qId]: val });

    const handleCheckboxChange = (qId: string, opt: string, checked: boolean) => {
        const current = answers[qId] || [];
        setAnswers({ ...answers, [qId]: checked ? [...current, opt] : current.filter((item: string) => item !== opt) });
    };

    // Group into sections by sectionId to create the Wizard pages
    const sections: FormQuestion[][] = [];
    if (form) {
        let currentSection: FormQuestion[] = [];
        form.questions.forEach((q) => {
            if (q.sectionId && currentSection.length > 0 && currentSection[0].sectionId !== q.sectionId) {
                sections.push([...currentSection]);
                currentSection = [q];
            } else if (q.sectionId && currentSection.length === 0) {
                currentSection.push(q);
            } else if (!q.sectionId && currentSection.length > 0 && currentSection[0].sectionId) {
                sections.push([...currentSection]);
                currentSection = [q];
            } else {
                currentSection.push(q);
            }
        });
        if (currentSection.length > 0) sections.push(currentSection);
    }

    const currentQuestions = sections[currentStepIndex] || [];

    // Evaluate if Next is actually "Submit" due to routing
    let isNextSubmit = currentStepIndex >= sections.length - 1;
    let explicitRoutedSectionIndex = -1;

    // Check routing logic for the active section based on current answers
    currentQuestions.forEach(q => {
        if (q.logicConditions && (q.type === 'multiple_choice' || q.type === 'dropdown')) {
            const ans = answers[q.id];
            if (ans && q.logicConditions[ans]) {
                const targetId = q.logicConditions[ans];
                if (targetId === "submit") isNextSubmit = true;
                else {
                    const idx = sections.findIndex(sec => sec[0]?.sectionId === targetId);
                    if (idx !== -1) explicitRoutedSectionIndex = idx;
                }
            }
        }
    });

    const navigateStep = (dir: 'next' | 'back') => {
        if (dir === 'next') {
            // Validate required
            for (const q of currentQuestions) {
                if (q.required) {
                    const ans = answers[q.id];
                    if (!ans || (Array.isArray(ans) && ans.length === 0)) {
                        toast.error(`"${q.questionText}" is required.`);
                        return;
                    }
                }
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });

            if (explicitRoutedSectionIndex !== -1) {
                setStepHistory([...stepHistory, explicitRoutedSectionIndex]);
            } else {
                setStepHistory([...stepHistory, currentStepIndex + 1]);
            }
        } else {
            // GO BACK via history stack
            if (stepHistory.length > 1) {
                const newHistory = [...stepHistory];
                newHistory.pop();
                setStepHistory(newHistory);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // Final validation
        for (const q of currentQuestions) {
            if (q.required) {
                const ans = answers[q.id];
                if (!ans || (Array.isArray(ans) && ans.length === 0)) {
                    toast.error(`"${q.questionText}" is required.`);
                    return;
                }
            }
        }

        setSubmitting(true);
        try {
            const res = await fetch(`/api/forms/${id}/submit`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ answers }),
            });

            if (res.ok) {
                if (form?.postSubmissionAction === "redirect_url" || form?.postSubmissionAction === "whatsapp_group") {
                    if (form.postSubmissionData) {
                        toast.success("Redirecting...");
                        window.location.href = form.postSubmissionData;
                        return;
                    }
                }
                setSubmitted(true);
            } else toast.error("Failed to submit form.");
        } catch (err) { toast.error("Network error."); }
        setSubmitting(false);
    };

    if (loading) return <div className="min-h-screen bg-gray-50 flex justify-center items-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center py-20 px-4">
                <div className="max-w-xl w-full bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center border-t-8 border-t-red-500">
                    <h1 className="text-2xl font-black text-gray-900 mb-2">Unavailable</h1>
                    <p className="text-gray-500 font-medium">{error}</p>
                </div>
            </div>
        );
    }

    const themeBg = form?.themeColor || randomTheme;

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center py-20 px-4 relative overflow-hidden" style={{ backgroundColor: `${themeBg}15` }}>
                {/* CSS Animated Background Nodes for Polish */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-40 animate-pulse" style={{ backgroundColor: themeBg, animationDuration: '4s' }}></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] opacity-30 animate-pulse" style={{ backgroundColor: themeBg, animationDuration: '7s' }}></div>

                <div className="max-w-2xl w-full bg-white p-12 rounded-[2.5rem] shadow-[0_20px_60px_rgb(0,0,0,0.08)] relative z-10 text-center space-y-6">
                    <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center bg-gray-50 shadow-inner">
                        <CheckCircle2 className="w-14 h-14" style={{ color: themeBg }} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900">{form?.title}</h1>
                    <p className="text-gray-600 text-lg font-medium whitespace-pre-wrap">
                        {form?.customSuccessMessage || "Your response has been recorded. Thank you!"}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-10 px-4 relative transition-colors duration-500 overflow-hidden" style={{ backgroundColor: `${themeBg}0A` }}>
            {/* Animated Background Gradients for Wow Factor */}
            <div className="absolute top-0 left-0 w-full h-[50vh] opacity-90 transition-colors duration-[2s] rounded-b-[4rem]" style={{ backgroundColor: themeBg }}></div>
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[100px] opacity-30 bg-white mix-blend-overlay"></div>
            <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full blur-[150px] opacity-20 bg-black mix-blend-overlay"></div>

            <form onSubmit={e => isNextSubmit ? handleSubmit(e) : e.preventDefault()} className="max-w-3xl mx-auto space-y-8 relative z-10 pb-24">

                <div className="bg-white rounded-[2.5rem] shadow-[0_16px_40px_rgb(0,0,0,0.08)] border border-gray-100 overflow-hidden relative transition-transform duration-500 hover:shadow-[0_20px_50px_rgb(0,0,0,0.12)]">
                    {form?.bannerUrl && (
                        <div className="w-full h-48 sm:h-72 relative bg-gray-100">
                            <img src={form.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                        </div>
                    )}

                    <div className={`p-8 sm:p-14 ${form?.bannerUrl ? 'pt-8' : 'pt-14'}`}>
                        {form?.themeColor && <div className="absolute top-0 left-0 w-full h-2 z-20" style={{ backgroundColor: form.themeColor }}></div>}
                        <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight leading-tight" style={{ color: form?.bannerUrl ? '#111827' : themeBg }}>{form?.title}</h1>
                        {form?.description && <p className="text-gray-600 text-[1.1rem] whitespace-pre-wrap leading-relaxed font-medium">{form.description}</p>}
                        <div className="mt-8 pt-5 border-t border-gray-100/80 text-xs text-red-500 font-bold uppercase tracking-widest bg-red-50/50 inline-block px-3 py-1.5 rounded-lg">* Required Fields</div>
                    </div>
                </div>

                {currentQuestions.map((q) => (
                    <div key={q.id} className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 hover:border-gray-200 transition-all duration-300 relative group overflow-hidden">
                        {q.required && <div className="absolute top-0 right-12 w-12 h-1 bg-red-500 rounded-b-xl border-t-0 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>}

                        {q.imageUrl && <img src={q.imageUrl} alt="Context" className="w-full rounded-2xl mb-8 object-cover max-h-96 border border-gray-100 shadow-sm" />}
                        <label className="text-2xl font-black text-gray-900 mb-8 block leading-snug">
                            {q.questionText} {q.required && <span className="text-red-500 ml-1 select-none font-bold text-3xl leading-none">*</span>}
                        </label>

                        <div className="mt-6">
                            {(q.type === 'short_answer' || q.type === 'paragraph') && (
                                <input
                                    type={q.type === 'short_answer' ? "text" : "textarea"}
                                    className={`w-full ${q.type === 'short_answer' ? 'sm:w-3/4' : ''} border-b-2 border-gray-200 border-t-0 border-x-0 rounded-none bg-transparent px-0 py-3 focus:ring-0 text-xl font-medium transition-colors`}
                                    placeholder="Your answer"
                                    style={{ outline: 'none' }}
                                    value={answers[q.id] || ""}
                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                    onFocus={(e) => e.target.style.borderColor = themeBg}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                />
                            )}

                            {q.type === 'multiple_choice' && (
                                <div className="space-y-4">
                                    {q.options?.map((opt, i) => (
                                        <label key={i} className="flex items-start gap-5 cursor-pointer group p-4 rounded-2xl hover:bg-gray-50/80 transition-colors border-2 border-transparent hover:border-gray-100 relative">
                                            <div className="pt-1">
                                                <input type="radio"
                                                    name={q.id} value={opt} checked={answers[q.id] === opt}
                                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                    className="w-6 h-6 border-2 border-gray-300 focus:ring-2 focus:ring-offset-2 transition-all cursor-pointer"
                                                    style={{ color: themeBg }}
                                                />
                                            </div>
                                            <span className="text-gray-800 text-xl font-medium">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {q.type === 'checkboxes' && (
                                <div className="space-y-4">
                                    {q.options?.map((opt, i) => (
                                        <label key={i} className="flex items-start gap-4 cursor-pointer group p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                                            <div className="pt-1">
                                                <input type="checkbox" value={opt} checked={answers[q.id]?.includes(opt)}
                                                    onChange={(e) => handleCheckboxChange(q.id, opt, e.target.checked)}
                                                    className="w-6 h-6 border-2 border-gray-300 rounded focus:ring-2 focus:ring-offset-2 transition-all cursor-pointer"
                                                    style={{ color: themeBg }}
                                                />
                                            </div>
                                            <span className="text-gray-800 text-xl font-medium">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {q.type === 'dropdown' && (
                                <div className="w-full sm:w-2/3">
                                    <select value={answers[q.id] || ""} onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                        className="w-full border-2 border-gray-200 rounded-2xl p-4 focus:ring-2 focus:border-transparent text-xl font-medium bg-gray-50 hover:bg-gray-100 transition-all outline-none"
                                        style={{ '--tw-ring-color': themeBg } as any}
                                    >
                                        <option value="" disabled>Choose option...</option>
                                        {q.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                            )}

                            {q.type === "linear_scale" && (
                                <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                                    <span className="font-bold text-gray-500 uppercase tracking-widest text-sm">{q.options?.[0] || '1'}</span>
                                    <div className="flex gap-2 sm:gap-4 justify-center w-full sm:w-auto">
                                        {Array.from({ length: (parseInt(q.options?.[1] || '5') - parseInt(q.options?.[0] || '1')) + 1 }).map((_, i) => {
                                            const val = String(parseInt(q.options?.[0] || '1') + i);
                                            const isSelected = answers[q.id] === val;
                                            return (
                                                <button key={val} type="button" onClick={() => handleAnswerChange(q.id, val)}
                                                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl font-black transition-all duration-300 ${isSelected ? 'text-white shadow-xl scale-110' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                    style={{ backgroundColor: isSelected ? themeBg : undefined }}
                                                >
                                                    {val}
                                                </button>
                                            )
                                        })}
                                    </div>
                                    <span className="font-bold text-gray-500 uppercase tracking-widest text-sm">{q.options?.[1] || '5'}</span>
                                </div>
                            )}

                            {q.type === "file_upload" && (
                                <label className="border-4 border-dashed border-gray-200 hover:border-gray-300 rounded-3xl p-12 flex flex-col items-center justify-center text-gray-500 bg-gray-50/50 hover:bg-gray-50 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                                    {answers[q.id] ? (
                                        <>
                                            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-sm scale-in">
                                                <CheckCircle2 size={32} />
                                            </div>
                                            <span className="font-black text-xl text-gray-900 truncate max-w-xs">{answers[q.id].length > 100 ? 'File Uploaded (Image Base64)' : answers[q.id]}</span>
                                            <button type="button" className="text-red-500 font-bold mt-3 hover:underline z-20 relative px-4 py-2 bg-red-50 rounded-lg text-sm" onClick={(e) => { e.preventDefault(); handleAnswerChange(q.id, '') }}>Remove file</button>
                                        </>
                                    ) : (
                                        <>
                                            <UploadCloud className="mb-4 text-gray-400 group-hover:-translate-y-2 group-hover:text-gray-600 transition-all duration-300" size={56} />
                                            <span className="font-black text-2xl text-gray-800">Click to upload file</span>
                                            <span className="text-sm font-medium mt-3 bg-white px-4 py-1.5 rounded-full shadow-sm text-gray-500">Max 2MB (Image natively supported)</span>
                                            <input type="file" className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    toast.loading('Encoding file...', { id: 'upload' });
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => { handleAnswerChange(q.id, reader.result as string); toast.success('Upload complete!', { id: 'upload' }); };
                                                    reader.readAsDataURL(file);
                                                }}
                                            />
                                        </>
                                    )}
                                </label>
                            )}
                        </div>
                    </div>
                ))}

                {/* Navigation Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between pt-8 gap-6 mt-12 bg-white/40 backdrop-blur-md p-6 rounded-[2rem] border border-white shadow-sm">
                    {sections.length > 1 ? (
                        <div className="flex items-center gap-2 text-sm font-black text-gray-500 uppercase tracking-widest px-6 py-3 rounded-full bg-white shadow-sm">
                            Step {stepHistory.length}
                        </div>
                    ) : <div />}

                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        {stepHistory.length > 1 && (
                            <button type="button" onClick={() => navigateStep('back')}
                                className="px-6 py-4 bg-white text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition shadow-sm border border-gray-200 flex items-center gap-2 group flex-1 justify-center min-w-[120px]"
                            >
                                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                Back
                            </button>
                        )}

                        {!isNextSubmit ? (
                            <button type="button" onClick={() => navigateStep('next')}
                                className="px-8 py-4 text-white font-black rounded-2xl hover:opacity-90 transition shadow-[0_8px_25px_rgb(0,0,0,0.15)] hover:-translate-y-1 flex items-center gap-2 group flex-1 justify-center text-xl min-w-[150px]"
                                style={{ backgroundColor: themeBg }}
                            >
                                Next
                                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </button>
                        ) : (
                            <button type="button" onClick={() => handleSubmit()} disabled={submitting}
                                className="px-10 py-4 text-white font-black rounded-2xl hover:opacity-90 transition shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-1 disabled:opacity-50 disabled:transform-none flex items-center gap-3 w-full sm:w-auto justify-center text-2xl min-w-[200px]"
                                style={{ backgroundColor: themeBg }}
                            >
                                {submitting && <Loader2 className="w-6 h-6 animate-spin" />}
                                Submit
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
