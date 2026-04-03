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
    logicConditions?: { dependsOnId?: string; requiredValue?: string };
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
    questions: FormQuestion[];
};

const THEMES = [
    { primary: "bg-blue-600", light: "bg-blue-50/50", border: "border-blue-500", ring: "focus:ring-blue-500", text: "text-blue-600" },
    { primary: "bg-emerald-600", light: "bg-emerald-50/50", border: "border-emerald-500", ring: "focus:ring-emerald-500", text: "text-emerald-600" },
    { primary: "bg-purple-600", light: "bg-purple-50/50", border: "border-purple-500", ring: "focus:ring-purple-500", text: "text-purple-600" },
    { primary: "bg-orange-500", light: "bg-orange-50/50", border: "border-orange-400", ring: "focus:ring-orange-400", text: "text-orange-500" },
    { primary: "bg-rose-500", light: "bg-rose-50/50", border: "border-rose-400", ring: "focus:ring-rose-400", text: "text-rose-500" }
];

export default function FormResponsePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const [form, setForm] = useState<Form | null>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [randomTheme] = useState(THEMES[Math.floor(Math.random() * THEMES.length)]);

    useEffect(() => {
        if (!id) return;
        fetchForm();
    }, [id]);

    const fetchForm = async () => {
        try {
            const res = await fetch(`/api/admin/forms/${id}`);
            if (res.ok) {
                const data = await res.json();
                if (!data.isPublished) {
                    setError("This form is not currently accepting responses.");
                } else {
                    setForm(data);
                    const initialAnswers: Record<string, any> = {};
                    data.questions.forEach((q: FormQuestion) => {
                        if (q.type === 'checkboxes') initialAnswers[q.id] = [];
                        else initialAnswers[q.id] = "";
                    });
                    setAnswers(initialAnswers);
                }
            } else {
                setError("Form not found.");
            }
        } catch (err) {
            setError("Failed to load form.");
        }
        setLoading(false);
    };

    const handleAnswerChange = (qId: string, val: any) => {
        setAnswers({ ...answers, [qId]: val });
    };

    const handleCheckboxChange = (qId: string, opt: string, checked: boolean) => {
        const current = answers[qId] || [];
        if (checked) {
            setAnswers({ ...answers, [qId]: [...current, opt] });
        } else {
            setAnswers({ ...answers, [qId]: current.filter((item: string) => item !== opt) });
        }
    };

    const evaluateCondition = (q: FormQuestion) => {
        if (!q.logicConditions || !q.logicConditions.dependsOnId) return true;
        const dependsAnswer = answers[q.logicConditions.dependsOnId];
        return String(dependsAnswer) === String(q.logicConditions.requiredValue);
    };

    // Parse logic blocks & sections
    const visibleQuestions = form?.questions.filter(q => evaluateCondition(q)) || [];

    // Group into sections by sectionId 
    const sections: FormQuestion[][] = [];
    let currentSection: FormQuestion[] = [];

    visibleQuestions.forEach((q, i) => {
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

    const isLastStep = currentStepIndex >= sections.length - 1;

    const navigateStep = (dir: number) => {
        // Validate required on current step before moving forward
        if (dir > 0) {
            const currentQ = sections[currentStepIndex];
            for (const q of currentQ) {
                if (q.required) {
                    const ans = answers[q.id];
                    if (!ans || (Array.isArray(ans) && ans.length === 0)) {
                        toast.error(`"${q.questionText}" is required.`);
                        return;
                    }
                }
            }
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setCurrentStepIndex(Math.max(0, Math.min(sections.length - 1, currentStepIndex + dir)));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Final validation
        const currentQ = sections[currentStepIndex];
        for (const q of currentQ) {
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
                method: "POST",
                headers: { "Content-Type": "application/json" },
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
            } else {
                toast.error("Failed to submit form.");
            }
        } catch (err) {
            toast.error("Network error.");
        }
        setSubmitting(false);
    };

    if (loading) {
        return <div className="min-h-screen bg-gray-50 flex justify-center items-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
    }

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

    if (submitted) {
        return (
            <div className="min-h-screen flex justify-center py-20 px-4 relative" style={{ backgroundColor: form?.themeColor ? `${form.themeColor}10` : '#fcfcfc' }}>
                <div className="absolute top-0 left-0 w-full h-40" style={{ backgroundColor: form?.themeColor || '#000' }}></div>
                <div className="max-w-2xl w-full bg-white p-10 rounded-3xl shadow-[0_20px_40px_rgb(0,0,0,0.08)] relative z-10 text-center space-y-4">
                    <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto" strokeWidth={2} />
                    <h1 className="text-4xl font-black text-gray-900">{form?.title}</h1>
                    <p className="text-gray-500 text-lg font-medium">Your response has been recorded. Thank you!</p>
                </div>
            </div>
        );
    }

    const currentQuestions = sections[currentStepIndex] || [];
    const themeBg = form?.themeColor ? form.themeColor : '#000'; // Default black or custom theme

    return (
        <div className="min-h-screen py-12 px-4 relative transition-colors duration-500" style={{ backgroundColor: `${themeBg}08` }}>
            <div className="absolute top-0 left-0 w-full h-[35vh] opacity-90 transition-colors duration-500" style={{ backgroundColor: themeBg }}></div>

            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6 relative z-10 pb-20">
                {/* Form Header */}
                <div className="bg-white rounded-[2rem] shadow-[0_16px_40px_rgb(0,0,0,0.06)] border border-gray-100 overflow-hidden relative">
                    {form?.themeColor && <div className="absolute top-0 left-0 w-full h-2 z-20" style={{ backgroundColor: form.themeColor }}></div>}

                    {form?.bannerUrl && (
                        <div className="w-full h-48 sm:h-64 relative">
                            <img src={form.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        </div>
                    )}

                    <div className={`p-8 sm:p-12 ${form?.bannerUrl ? 'pt-8' : 'pt-12'}`}>
                        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 tracking-tight" style={{ color: form?.bannerUrl ? undefined : themeBg }}>{form?.title}</h1>
                        {form?.description && <p className="text-gray-600 text-lg sm:text-xl whitespace-pre-wrap leading-relaxed font-medium">{form.description}</p>}
                        <div className="mt-8 pt-4 border-t border-gray-100 text-sm text-red-500 font-bold uppercase tracking-widest">* Required Fields</div>
                    </div>
                </div>

                {/* Question List for Current Section */}
                {currentQuestions.map((q) => (
                    <div key={q.id} className="bg-white p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_16px_40px_rgb(0,0,0,0.06)] transition-all duration-300">
                        {q.imageUrl && (
                            <img src={q.imageUrl} alt="Question Context" className="w-full rounded-2xl mb-6 object-cover max-h-80 border border-gray-100" />
                        )}
                        <label className="text-2xl font-black text-gray-900 mb-8 block leading-snug">
                            {q.questionText} {q.required && <span className="text-red-500 ml-1 select-none">*</span>}
                        </label>

                        <div className="mt-4">
                            {q.type === 'short_answer' && (
                                <input
                                    type="text"
                                    className={`w-full sm:w-3/4 border-b-2 border-gray-200 border-t-0 border-x-0 rounded-none bg-transparent px-0 py-3 focus:ring-0 text-xl font-medium transition-colors focus:border-[${themeBg}]`}
                                    placeholder="Your answer"
                                    style={{ outline: 'none' }}
                                    value={answers[q.id] || ""}
                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                    onFocus={(e) => e.target.style.borderColor = themeBg}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                />
                            )}

                            {q.type === 'paragraph' && (
                                <textarea
                                    className="w-full border-b-2 border-gray-200 border-t-0 border-x-0 rounded-none bg-transparent px-0 py-3 focus:ring-0 resize-none text-xl font-medium transition-colors"
                                    placeholder="Your answer"
                                    rows={4}
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
                                        <label key={i} className="flex items-start gap-4 cursor-pointer group p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                                            <div className="pt-1">
                                                <input
                                                    type="radio"
                                                    name={q.id}
                                                    value={opt}
                                                    checked={answers[q.id] === opt}
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
                                                <input
                                                    type="checkbox"
                                                    value={opt}
                                                    checked={answers[q.id]?.includes(opt)}
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
                                    <select
                                        value={answers[q.id] || ""}
                                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                        className="w-full border-2 border-gray-200 rounded-2xl p-4 focus:ring-2 focus:border-transparent text-xl font-medium bg-gray-50 transition-all"
                                        style={{ '--tw-ring-color': themeBg } as any}
                                    >
                                        <option value="" disabled>Choose an option</option>
                                        {q.options?.map((opt, i) => (
                                            <option key={i} value={opt}>{opt}</option>
                                        ))}
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
                                                <button
                                                    key={val}
                                                    type="button"
                                                    onClick={() => handleAnswerChange(q.id, val)}
                                                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl font-black transition-all duration-300 ${isSelected ? 'text-white shadow-xl scale-110' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
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
                                <div className="border-4 border-dashed border-gray-200 rounded-3xl p-12 flex flex-col items-center justify-center text-gray-500 bg-gray-50/50 hover:bg-gray-50 transition-colors group cursor-pointer relative overflow-hidden">
                                    {answers[q.id] ? (
                                        <>
                                            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
                                                <CheckCircle2 size={32} />
                                            </div>
                                            <span className="font-black text-xl text-gray-900">File attached successfully</span>
                                            <button type="button" className="text-red-500 font-bold mt-2 hover:underline z-20 relative" onClick={(e) => { e.stopPropagation(); handleAnswerChange(q.id, '') }}>Remove file</button>
                                        </>
                                    ) : (
                                        <>
                                            <UploadCloud className="mb-4 text-gray-400 group-hover:-translate-y-2 transition-transform duration-300" size={48} />
                                            <span className="font-black text-xl text-gray-700">Click to upload file</span>
                                            <span className="text-sm font-medium mt-2">Max 10MB</span>
                                            <input
                                                type="file"
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                onChange={(e) => {
                                                    // Mocking an upload delay for UI polish 
                                                    toast.loading('Uploading...', { id: 'upload' });
                                                    setTimeout(() => {
                                                        handleAnswerChange(q.id, e.target.files?.[0]?.name || 'uploaded_file');
                                                        toast.success('Uploaded!', { id: 'upload' });
                                                    }, 1000);
                                                }}
                                            />
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Navigation Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between pt-8 gap-4">
                    {sections.length > 1 && (
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest bg-white/50 px-4 py-2 rounded-full backdrop-blur-md">
                            Section {currentStepIndex + 1} of {sections.length}
                        </div>
                    )}

                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        {currentStepIndex > 0 && (
                            <button
                                type="button"
                                onClick={() => navigateStep(-1)}
                                className="px-6 py-4 bg-white text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition shadow-sm border border-gray-200 flex items-center gap-2 group flex-1 justify-center"
                            >
                                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                Back
                            </button>
                        )}

                        {!isLastStep ? (
                            <button
                                type="button"
                                onClick={() => navigateStep(1)}
                                className="px-8 py-4 text-white font-black rounded-2xl hover:opacity-90 transition shadow-[0_8px_20px_rgb(0,0,0,0.12)] hover:-translate-y-0.5 flex items-center gap-2 group flex-1 justify-center text-xl"
                                style={{ backgroundColor: themeBg }}
                            >
                                Next
                                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-10 py-4 text-white font-black rounded-2xl hover:opacity-90 transition shadow-[0_8px_30px_rgb(0,0,0,0.16)] hover:-translate-y-1 disabled:opacity-50 disabled:transform-none flex items-center gap-3 w-full sm:w-auto justify-center text-2xl"
                                style={{ backgroundColor: themeBg }}
                            >
                                {submitting && <Loader2 className="w-6 h-6 animate-spin" />}
                                Submit Form
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
