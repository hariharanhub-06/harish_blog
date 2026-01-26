"use client";

import { useState, useEffect } from "react";
import { Sparkles, Save, Loader2, Brain, DollarSign, CircleHelp, MessageSquareText } from "lucide-react";

export default function AIAssistantModule() {
    const [config, setConfig] = useState({
        persona: "",
        pricing: "",
        faq: "",
        convincingTactics: ""
    });
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
                if (data) setConfig(data);
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
                setTimeout(() => setStatus("idle"), 3000);
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
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">AI Assistant <span className="text-orange-600 italic">Settings</span></h2>
                            <p className="text-secondary font-medium text-xs uppercase tracking-[0.2em]">Train your "Digital Twin" with your persona, pricing, and sales tactics.</p>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Persona & Character */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <Sparkles size={20} />
                            </div>
                            <h3 className="text-xl font-black">AI Persona & Character</h3>
                        </div>
                        <p className="text-gray-500 text-xs font-bold leading-relaxed">
                            Describe how the bot should behave. (e.g., "Professional, confident, uses business terminology, but remains humble and helpful.")
                        </p>
                        <textarea
                            value={config.persona}
                            onChange={(e) => setConfig({ ...config, persona: e.target.value })}
                            className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-orange-500 transition-all font-bold min-h-[200px]"
                            placeholder="I am the AI assistant of Hari Haran. My character is..."
                        />
                    </div>

                    {/* Pricing Knowledge */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                <DollarSign size={20} />
                            </div>
                            <h3 className="text-xl font-black">Service Pricing</h3>
                        </div>
                        <p className="text-gray-500 text-xs font-bold leading-relaxed">
                            List your services and their rough pricing. The AI will use this to answer project inquiries.
                        </p>
                        <textarea
                            value={config.pricing}
                            onChange={(e) => setConfig({ ...config, pricing: e.target.value })}
                            className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-orange-500 transition-all font-bold min-h-[200px]"
                            placeholder="Web Design: ₹XX,XXX&#10;Consulting: ₹X,XXX/hour..."
                        />
                    </div>

                    {/* FAQ & Knowledge */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                                <CircleHelp size={20} />
                            </div>
                            <h3 className="text-xl font-black">Common FAQs</h3>
                        </div>
                        <p className="text-gray-500 text-xs font-bold leading-relaxed">
                            Common questions users ask and how Hari answers them specifically.
                        </p>
                        <textarea
                            value={config.faq}
                            onChange={(e) => setConfig({ ...config, faq: e.target.value })}
                            className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-orange-500 transition-all font-bold min-h-[200px]"
                            placeholder="Q: Do you work with international clients?&#10;A: Yes, I have worked with..."
                        />
                    </div>

                    {/* Convincing Tactics */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                                <MessageSquareText size={20} />
                            </div>
                            <h3 className="text-xl font-black">Convincing Tactics</h3>
                        </div>
                        <p className="text-gray-500 text-xs font-bold leading-relaxed">
                            Strategies the AI should use to convert visitors. (e.g., "Mention how Hari's strategies saved client X 40% on overhead.")
                        </p>
                        <textarea
                            value={config.convincingTactics}
                            onChange={(e) => setConfig({ ...config, convincingTactics: e.target.value })}
                            className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-orange-500 transition-all font-bold min-h-[200px]"
                            placeholder="When a user asks about X, always mention Y to build trust..."
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className={`flex items-center space-x-3 px-10 py-5 rounded-[2rem] font-black text-xl shadow-2xl transition-all disabled:opacity-50 ${status === "success" ? "bg-emerald-500 text-white" : "bg-orange-600 text-white hover:scale-105 active:scale-95"
                            }`}
                    >
                        {saving ? <Loader2 className="animate-spin" /> : status === "success" ? <Sparkles size={24} /> : <Save size={24} />}
                        <span>{saving ? "Deploying Knowledge..." : status === "success" ? "Persona Updated!" : "Sync with AI"}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
