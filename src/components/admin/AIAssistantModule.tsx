"use client";

import { useState, useEffect } from "react";
import { Sparkles, Save, Loader2, Brain, DollarSign, CircleHelp, MessageSquareText } from "lucide-react";

export default function AIAssistantModule() {
    const [config, setConfig] = useState({
        knowledgeBase: ""
    });
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await fetch("/api/admin/ai-config");
            if (res.ok) {
                const data = await res.json();
                if (data) {
                    setConfig({ knowledgeBase: data.knowledgeBase || "" });
                    if (data.updatedAt) setLastUpdated(new Date(data.updatedAt).toLocaleString());
                }
            }
        } catch (error) {
            console.error("Failed to fetch AI config", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setStatus("idle");
        try {
            const res = await fetch("/api/admin/ai-config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config),
            });
            if (res.ok) {
                setStatus("success");
                setLastUpdated(new Date().toLocaleString());
                setTimeout(() => setStatus("idle"), 5000);
            } else {
                setStatus("error");
            }
        } catch (error) {
            setStatus("error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-[80px] -mr-32 -mt-32" />
                <div className="relative z-10">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="p-4 bg-orange-500/10 text-orange-600 rounded-2xl shadow-inner">
                            <Brain size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">AI Master <span className="text-orange-600 italic">Knowledge Base</span></h2>
                            <p className="text-secondary font-medium text-xs uppercase tracking-[0.2em]">Upload your stories, pricing, strategies, and facts in one place.</p>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                {status !== "idle" && (
                    <div className={`p-6 rounded-[2rem] border animate-in slide-in-from-top-4 duration-500 font-bold text-center ${status === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-red-50 border-red-100 text-red-800"
                        }`}>
                        {status === "success"
                            ? "✨ AI Brain Sync Successful! Your Knowledge Base is now live."
                            : "❌ Sync Failed! Please check your internet connection and try again."}
                    </div>
                )}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-sm space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                                    <Sparkles size={20} />
                                </div>
                                <h3 className="text-2xl font-black">Full Knowledge Training</h3>
                            </div>
                            <p className="text-gray-500 text-sm font-bold leading-relaxed max-w-2xl">
                                Paste your detailed background, exact service pricing, convincing strategies, and FAQs here.
                                The AI will read this entire block to act as your digital twin.
                            </p>
                            {lastUpdated && (
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Last Synced: {lastUpdated}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className={`flex items-center space-x-3 px-10 py-5 rounded-[2rem] font-black text-xl shadow-2xl transition-all disabled:opacity-50 shrink-0 ${status === "success" ? "bg-emerald-500 text-white" : "bg-orange-600 text-white hover:scale-105 active:scale-95"
                                }`}
                        >
                            {saving ? <Loader2 className="animate-spin" /> : status === "success" ? <Sparkles size={24} /> : <Save size={24} />}
                            <span>{saving ? "Deploying..." : status === "success" ? "Sync Complete!" : "Update AI"}</span>
                        </button>
                    </div>

                    <textarea
                        value={config.knowledgeBase}
                        onChange={(e) => setConfig({ ...config, knowledgeBase: e.target.value })}
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-[2rem] p-8 md:p-10 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-bold min-h-[500px] text-lg leading-relaxed placeholder:text-gray-300 outline-none"
                        placeholder="Paste everything about yourself here...&#10;&#10;1. Who am I?&#10;2. My professional character...&#10;3. Service Pricing List...&#10;4. My sales strategies...&#10;5. Common Questions & Answers..."
                    />
                </div>
            </form>
        </div>
    );
}
