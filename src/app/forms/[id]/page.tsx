"use client";

import { useEffect, useState, use } from "react";
import { Loader2, CheckCircle2, ChevronRight, ChevronLeft, UploadCloud, X, ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

type QuestionType = "short_answer" | "paragraph" | "multiple_choice" | "checkboxes" | "dropdown" | "linear_scale" | "file_upload" | "section_header";

type FormQuestion = {
    id: string;
    type: QuestionType;
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
    bannerPosition?: string;
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
            const res = await fetch(`/api/forms/${id}`);
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

    // Group into sections by section headers to create the Wizard pages
    const sections: FormQuestion[][] = [];
    if (form) {
        let currentSection: FormQuestion[] = [];
        form.questions.forEach((q) => {
            if (q.type === 'section_header') {
                if (currentSection.length > 0) sections.push([...currentSection]);
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
                    const idx = sections.findIndex(sec => sec.some(sq => sq.type === 'section_header' && sq.questionText === targetId));
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
                setSubmitted(true);
                if (form?.postSubmissionAction === "redirect_url" || form?.postSubmissionAction === "whatsapp_group") {
                    if (form.postSubmissionData) {
                        toast.success("Form Submitted! Redirecting in 3 seconds...");
                        setTimeout(() => {
                            window.location.href = form.postSubmissionData!;
                        }, 3000);
                        return;
                    }
                }
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
                    <p className="text-gray-600 text-lg font-medium whitespace-pre-wrap mb-4">
                        {form?.customSuccessMessage || "Your response has been recorded. Thank you!"}
                    </p>
                    {(form?.postSubmissionAction === "redirect_url" || form?.postSubmissionAction === "whatsapp_group") && form.postSubmissionData && (
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/5 text-primary font-bold rounded-2xl animate-pulse border border-primary/10">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Redirecting to your destination soon...
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative font-sans text-gray-900 selection:bg-primary/20 bg-gray-100">
            {/* Theming Overlay Wrapper */}
            <div className="min-h-screen selection:bg-primary/20 backdrop-blur-[100px] pb-20">
                <div className="fixed top-0 left-0 w-full h-full opacity-40 transition-colors duration-[2s]" style={{ background: `radial-gradient(circle at 20% 30%, ${themeBg}33 0%, transparent 50%), radial-gradient(circle at 80% 70%, ${themeBg}22 0%, transparent 50%)` }}></div>
                <div className="absolute top-0 left-0 w-full h-[40vh] opacity-90 transition-colors duration-[2s] rounded-b-[4rem]" style={{ backgroundColor: themeBg }}></div>
                <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[100px] opacity-30 bg-white mix-blend-overlay"></div>

                <form onSubmit={e => isNextSubmit ? handleSubmit(e) : e.preventDefault()} className="max-w-2xl mx-auto space-y-8 relative z-10 pt-12 pb-24 px-4 sm:px-0">

                    <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] shadow-[0_32px_64px_rgb(0,0,0,0.1)] border border-white/50 overflow-hidden relative transition-all duration-500 hover:shadow-[0_40px_80px_rgb(0,0,0,0.15)]">
                        {form?.bannerUrl && (
                            <div className="w-full h-48 sm:h-64 relative bg-gray-100 overflow-hidden">
                                <img
                                    src={form.bannerUrl}
                                    alt="Banner"
                                    className="w-full h-full object-cover transition-all duration-700"
                                    style={{ objectPosition: (form as any).bannerPosition || 'center' }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>
                        )}

                        <div className={`p-6 sm:p-12 ${form?.bannerUrl ? 'pt-6 sm:pt-8' : 'pt-8 sm:pt-12'}`}>
                            {form?.themeColor && <div className="absolute top-0 left-0 w-full h-2 z-20" style={{ backgroundColor: form.themeColor }}></div>}
                            <h1 className="text-2xl sm:text-4xl font-black mb-4 tracking-tight leading-tight" style={{ color: form?.bannerUrl ? '#111827' : themeBg }}>{form?.title}</h1>
                            {form?.description && <p className="text-gray-600 text-sm sm:text-base font-medium whitespace-pre-wrap leading-relaxed opacity-80">{form.description}</p>}
                            <div className="mt-6 sm:mt-8 pt-5 border-t border-gray-100/80 text-[10px] text-red-500 font-black uppercase tracking-[0.2em] bg-red-50/50 inline-block px-4 py-2 rounded-full border border-red-100/50">Required Fields</div>
                        </div>
                    </div>

                    {currentQuestions.map((q, i) => (
                        q.type === 'section_header' ? (
                            <div key={q.id || Math.random()} className="bg-white/20 backdrop-blur-xl border border-white/40 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-14 text-center my-8 sm:my-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-2 group-hover:h-3 transition-all duration-500" style={{ backgroundColor: themeBg }}></div>
                                <h2 className="text-2xl sm:text-4xl font-black tracking-tight" style={{ color: themeBg }}>{q.questionText}</h2>
                                {q.options?.[0] && <p className="text-gray-600 font-bold mt-4 text-lg opacity-80">{q.options[0]}</p>}
                                <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full blur-3xl opacity-10" style={{ backgroundColor: themeBg }}></div>
                            </div>
                        ) : (
                            <motion.div
                                key={q.id || Math.random()}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05, duration: 0.6 }}
                                className="bg-white/80 backdrop-blur-2xl p-6 sm:p-12 rounded-[2rem] sm:rounded-[3.5rem] shadow-[0_24px_48px_rgba(0,0,0,0.04)] border border-white/50 hover:shadow-[0_32px_64px_rgba(0,0,0,0.08)] transition-all duration-500 relative group overflow-hidden active:scale-[0.99]"
                            >
                                {q.required && <div className="absolute top-0 right-16 w-16 h-1.5 bg-red-500 rounded-b-xl border-t-0 shadow-[0_4px_12px_rgba(239,68,68,0.3)]"></div>}

                                {q.imageUrl && (
                                    <div className="relative rounded-3xl overflow-hidden mb-10 shadow-lg border border-white/40">
                                        <img src={q.imageUrl} alt="Context" className="w-full object-cover max-h-96 transition-transform duration-700 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                                    </div>
                                )}
                                <label className="text-[1.25rem] sm:text-2xl font-black text-gray-900 mb-6 sm:mb-8 block leading-tight tracking-tight">
                                    {q.questionText} {q.required && <span className="text-red-500 ml-1 select-none font-bold text-xl sm:text-3xl leading-none opacity-40">*</span>}
                                </label>

                                <div className="mt-8">
                                    {(q.type === 'short_answer' || q.type === 'paragraph') && (
                                        <div className="relative group/input">
                                            <input
                                                type={q.type === 'short_answer' ? "text" : "textarea"}
                                                className={`w-full ${q.type === 'short_answer' ? 'sm:w-4/5' : ''} border-b-4 border-gray-100 border-t-0 border-x-0 rounded-none bg-transparent px-2 py-2 sm:py-4 focus:ring-0 text-lg sm:text-2xl font-bold transition-all duration-300 placeholder:text-gray-200`}
                                                placeholder="Write your answer here..."
                                                style={{ outline: 'none' }}
                                                value={answers[q.id] || ""}
                                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                onFocus={(e) => e.target.style.borderColor = themeBg}
                                                onBlur={(e) => e.target.style.borderColor = '#f3f4f6'}
                                            />
                                            <div className="absolute bottom-0 left-0 w-0 h-1 transition-all duration-500 group-focus-within/input:w-full" style={{ backgroundColor: themeBg }}></div>
                                        </div>
                                    )}

                                    {q.type === 'multiple_choice' && (
                                        <div className="space-y-4">
                                            {q.options?.map((opt, i) => {
                                                const isSelected = answers[q.id] === opt;
                                                return (
                                                    <label key={i} className={`flex items-center gap-4 sm:gap-6 cursor-pointer group/opt p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] transition-all duration-400 border-2 ${isSelected ? 'bg-primary/5 border-primary/20 shadow-inner' : 'bg-gray-50/50 border-transparent hover:bg-white hover:border-gray-100 hover:shadow-md'}`}>
                                                        <div className="relative">
                                                            <input type="radio"
                                                                name={q.id} value={opt} checked={isSelected}
                                                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                                className="w-8 h-8 opacity-0 absolute cursor-pointer z-10"
                                                            />
                                                            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isSelected ? 'border-primary ring-4 ring-primary/10' : 'border-gray-300 group-hover/opt:border-primary/40'}`}>
                                                                {isSelected && <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-primary animate-pulse" />}
                                                            </div>
                                                        </div>
                                                        <span className={`text-lg sm:text-xl font-bold transition-colors ${isSelected ? 'text-primary' : 'text-gray-700'}`}>{opt}</span>
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    )}

                                    {q.type === 'checkboxes' && (
                                        <div className="space-y-4">
                                            {q.options?.map((opt, i) => {
                                                const currentAnswers = answers[q.id] ? (Array.isArray(answers[q.id]) ? answers[q.id] : JSON.parse(answers[q.id])) : [];
                                                const isChecked = currentAnswers.includes(opt);
                                                return (
                                                    <label key={i} className={`flex items-center gap-4 sm:gap-6 cursor-pointer group/opt p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] transition-all duration-400 border-2 ${isChecked ? 'bg-green-50/50 border-green-200/50 shadow-inner' : 'bg-gray-50/50 border-transparent hover:bg-white hover:border-gray-100 hover:shadow-md'}`}>
                                                        <div className="relative">
                                                            <input type="checkbox" value={opt} checked={isChecked}
                                                                onChange={(e) => handleCheckboxChange(q.id, opt, e.target.checked)}
                                                                className="w-8 h-8 opacity-0 absolute cursor-pointer z-10"
                                                            />
                                                            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${isChecked ? 'bg-green-500 border-green-500 scale-110 shadow-lg shadow-green-200' : 'border-gray-300 group-hover/opt:border-green-400/40'}`}>
                                                                {isChecked && <X size={16} className="text-white" />}
                                                            </div>
                                                        </div>
                                                        <span className={`text-lg sm:text-xl font-bold transition-colors ${isChecked ? 'text-green-700' : 'text-gray-700'}`}>{opt}</span>
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    )}

                                    {q.type === 'dropdown' && (
                                        <div className="relative">
                                            <select value={answers[q.id] || ""} onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                className="w-full sm:w-2/3 border-4 border-gray-50 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 pr-12 focus:ring-4 focus:border-primary/20 text-lg sm:text-xl font-black bg-white appearance-none transition-all shadow-sm hover:shadow-md outline-none cursor-pointer"
                                                style={{ '--tw-ring-color': themeBg } as any}
                                            >
                                                <option value="" disabled className="text-gray-300">Choose option...</option>
                                                {q.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                                            </select>
                                            <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                <ChevronRight className="rotate-90 w-6 h-6" />
                                            </div>
                                        </div>
                                    )}

                                    {q.type === "linear_scale" && (
                                        <div className="flex flex-col items-center pt-6">
                                            <div className="flex gap-4 sm:gap-6 justify-center w-full mb-8">
                                                {Array.from({ length: (parseInt(q.options?.[1] || '5') - parseInt(q.options?.[0] || '1')) + 1 }).map((_, i) => {
                                                    const val = String(parseInt(q.options?.[0] || '1') + i);
                                                    const isSelected = answers[q.id] === val;
                                                    return (
                                                        <button key={val} type="button" onClick={() => handleAnswerChange(q.id, val)}
                                                            className={`w-14 h-14 sm:w-20 sm:h-20 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center text-2xl font-black transition-all duration-500 shadow-sm ${isSelected ? 'text-white shadow-2xl scale-125 z-10' : 'bg-gray-50/50 text-gray-400 border border-white hover:bg-white hover:text-gray-600 hover:scale-105'}`}
                                                            style={{ backgroundColor: isSelected ? themeBg : undefined }}
                                                        >
                                                            {val}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                            <div className="flex justify-between w-full sm:w-1/2 px-4 text-xs font-black text-gray-400 uppercase tracking-[0.2em] italic">
                                                <span>{q.options?.[0] || '1'}</span>
                                                <span className="h-px bg-gray-100 flex-1 mx-8 self-center" />
                                                <span>{q.options?.[1] || '5'}</span>
                                            </div>
                                        </div>
                                    )}

                                    {q.type === "file_upload" && (
                                        <div className="space-y-6">
                                            <label className={`border-4 border-dashed rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-20 flex flex-col items-center justify-center transition-all duration-500 group cursor-pointer relative overflow-hidden ${answers[q.id] ? 'bg-green-50/30 border-green-200/50' : 'bg-white/40 border-gray-100 hover:bg-white hover:border-gray-200 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]'}`}>
                                                {answers[q.id] ? (
                                                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                                                        <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center text-white mb-6 shadow-xl shadow-green-200 scale-110">
                                                            <CheckCircle2 size={40} />
                                                        </div>
                                                        <span className="font-black text-2xl text-gray-900 mb-2">Ready to submit!</span>
                                                        <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Click again to replace</p>
                                                        <button type="button" className="mt-8 px-6 py-2 bg-red-50 text-red-500 font-black rounded-xl text-xs hover:bg-red-100 transition-colors" onClick={(e) => { e.preventDefault(); handleAnswerChange(q.id, '') }}>Remove attachment</button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-24 h-24 rounded-[2rem] bg-gray-50 flex items-center justify-center text-gray-300 mb-8 transition-transform group-hover:scale-110 group-hover:bg-primary/5 group-hover:text-primary">
                                                            <UploadCloud size={56} />
                                                        </div>
                                                        <span className="font-black text-3xl text-gray-900 mb-3">Add your file</span>
                                                        <span className="text-gray-400 font-medium">Drag & Drop or Click to browse</span>
                                                        <div className="mt-8 bg-white px-6 py-2 rounded-full shadow-sm border border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Supports images up to 5MB</div>
                                                    </div>
                                                )}
                                                <input type="file" className="hidden"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        const tid = toast.loading('Uploading attachment...', { id: 'upload' });
                                                        try {
                                                            const { uploadToImageKit } = await import("@/lib/imagekit-upload");
                                                            const url = await uploadToImageKit(file, 'responses');
                                                            handleAnswerChange(q.id, url);
                                                            toast.success('Upload complete!', { id: tid });
                                                        } catch (error) {
                                                            toast.error('Upload failed', { id: tid });
                                                        }
                                                    }}
                                                />
                                            </label>
                                            {answers[q.id] && (
                                                <div className="relative rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl group/img">
                                                    <img src={answers[q.id]} className="w-full aspect-[16/10] object-cover transition-transform duration-1000 group-hover/img:scale-110" alt="Preview" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                                    <div className="absolute bottom-8 left-8 text-white font-black text-lg drop-shadow-md flex items-center gap-3">
                                                        <ImageIcon size={24} /> Attachment Preview
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )
                    ))}

                    {/* Premium Navigation Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between pt-12 gap-8 mt-16 px-4">
                        {sections.length > 1 ? (
                            <div className="flex items-center gap-4 text-xs font-black text-gray-400 uppercase tracking-[0.3em] bg-white/40 backdrop-blur-xl px-10 py-5 rounded-full border border-white/50 shadow-sm order-2 sm:order-1">
                                Progress <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mx-2" /> <span className="text-gray-900">{Math.round((stepHistory.length / sections.length) * 100)}%</span>
                            </div>
                        ) : <div className="order-2 sm:order-1" />}

                        <div className="flex items-center gap-5 w-full sm:w-auto order-1 sm:order-2">
                            {stepHistory.length > 1 && (
                                <button type="button" onClick={() => navigateStep('back')}
                                    className="px-8 py-6 bg-white/60 backdrop-blur-md text-gray-700 font-extrabold rounded-[2rem] hover:bg-white transition-all shadow-sm border-2 border-white flex items-center gap-3 group flex-1 justify-center min-w-[140px] active:scale-95"
                                >
                                    <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                                    Back
                                </button>
                            )}

                            {!isNextSubmit ? (
                                <button type="button" onClick={() => navigateStep('next')}
                                    className="px-12 py-6 text-white font-black rounded-[2.5rem] hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex items-center gap-3 group flex-1 justify-center text-2xl min-w-[180px]"
                                    style={{ backgroundColor: themeBg }}
                                >
                                    Next Step
                                    <ChevronRight className="w-7 h-7 group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : (
                                <button type="button" onClick={() => handleSubmit()} disabled={submitting}
                                    className="px-14 py-8 text-white font-black rounded-[3rem] hover:scale-105 active:scale-95 transition-all shadow-[0_32px_64px_rgba(0,0,0,0.3)] disabled:opacity-50 disabled:transform-none flex items-center gap-4 w-full sm:w-auto justify-center text-3xl min-w-[280px]"
                                    style={{ backgroundColor: themeBg }}
                                >
                                    {submitting && <Loader2 className="w-8 h-8 animate-spin" />}
                                    Complete Form
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
