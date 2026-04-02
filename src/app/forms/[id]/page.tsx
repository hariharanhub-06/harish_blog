"use client";

import { useEffect, useState, use } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

type FormQuestion = {
    id: string;
    type: "short_answer" | "paragraph" | "multiple_choice" | "checkboxes" | "dropdown";
    questionText: string;
    required: boolean;
    options: string[] | null;
};

type Form = {
    id: string;
    title: string;
    description: string;
    isPublished: boolean;
    questions: FormQuestion[];
};

export default function FormResponsePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const [form, setForm] = useState<Form | null>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

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
                    // Initialize answers
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required
        if (!form) return;
        for (const q of form.questions) {
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
                <div className="max-w-xl w-full bg-white p-8 rounded-2xl shadow-sm text-center border-t-8 border-t-red-500">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Form Unavailable</h1>
                    <p className="text-gray-500">{error}</p>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#fcfcfc] flex justify-center py-20 px-4 relative">
                <div className="absolute top-0 left-0 w-full h-32 bg-primary"></div>
                <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative z-10 text-center space-y-4">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" strokeWidth={1.5} />
                    <h1 className="text-3xl font-bold text-gray-900">{form?.title}</h1>
                    <p className="text-gray-500 text-lg">Your response has been recorded. Thank you!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcfcfc] py-12 px-4 relative">
            <div className="absolute top-0 left-0 w-full h-[30vh] bg-primary"></div>

            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6 relative z-10 pb-20">
                <div className="bg-white p-8 rounded-2xl shadow-lg border-t-8 border-t-orange-400 border-x border-b border-gray-100">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{form?.title}</h1>
                    {form?.description && <p className="text-gray-600 whitespace-pre-wrap">{form.description}</p>}
                    <div className="mt-6 pt-4 border-t border-gray-100/50 text-sm text-red-500 font-medium">* Indicates required question</div>
                </div>

                {form?.questions.map((q, idx) => (
                    <div key={q.id} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <label className="text-lg font-bold text-gray-900 mb-6 block">
                            {q.questionText} {q.required && <span className="text-red-500 ml-1">*</span>}
                        </label>

                        {q.type === 'short_answer' && (
                            <input
                                type="text"
                                className="w-full sm:w-2/3 border-b-2 border-gray-200 focus:border-primary border-t-0 border-x-0 rounded-none bg-transparent px-0 py-2 focus:ring-0 text-lg"
                                placeholder="Your answer"
                                value={answers[q.id] || ""}
                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            />
                        )}

                        {q.type === 'paragraph' && (
                            <textarea
                                className="w-full border-b-2 border-gray-200 focus:border-primary border-t-0 border-x-0 rounded-none bg-transparent px-0 py-2 focus:ring-0 resize-none text-lg"
                                placeholder="Your answer"
                                rows={4}
                                value={answers[q.id] || ""}
                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            />
                        )}

                        {q.type === 'multiple_choice' && (
                            <div className="space-y-4">
                                {q.options?.map((opt, i) => (
                                    <label key={i} className="flex items-start gap-3 cursor-pointer group">
                                        <div className="pt-1">
                                            <input
                                                type="radio"
                                                name={q.id}
                                                value={opt}
                                                checked={answers[q.id] === opt}
                                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                className="w-5 h-5 text-primary focus:ring-primary border-gray-300"
                                            />
                                        </div>
                                        <span className="text-gray-800 text-lg">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {q.type === 'checkboxes' && (
                            <div className="space-y-4">
                                {q.options?.map((opt, i) => (
                                    <label key={i} className="flex items-start gap-3 cursor-pointer group">
                                        <div className="pt-1">
                                            <input
                                                type="checkbox"
                                                value={opt}
                                                checked={answers[q.id]?.includes(opt)}
                                                onChange={(e) => handleCheckboxChange(q.id, opt, e.target.checked)}
                                                className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                                            />
                                        </div>
                                        <span className="text-gray-800 text-lg">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {q.type === 'dropdown' && (
                            <div className="w-full sm:w-2/3">
                                <select
                                    value={answers[q.id] || ""}
                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl p-4 focus:ring-primary focus:border-primary text-lg bg-gray-50/50"
                                >
                                    <option value="" disabled>Choose</option>
                                    {q.options?.map((opt, i) => (
                                        <option key={i} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                ))}

                <div className="flex flex-col sm:flex-row items-center justify-between pt-6">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full sm:w-auto px-10 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition hover:shadow-xl hover:-translate-y-0.5 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:transform-none flex justify-center items-center gap-2 text-lg"
                    >
                        {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                        Submit
                    </button>
                    <button type="button" onClick={() => setAnswers({})} className="mt-4 sm:mt-0 text-gray-500 font-semibold text-sm hover:text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition">
                        Clear form
                    </button>
                </div>
            </form>
        </div>
    );
}
