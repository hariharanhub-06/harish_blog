"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState, useMemo } from "react";
import {
    Plus,
    Trash2,
    Save,
    Calculator,
    FileText,
    TrendingUp,
    ShieldCheck,
    ArrowRight,
    Users,
    Layers,
    Clock,
    CheckCircle2,
    AlertCircle,
    Download,
    Link as LinkIcon,
    History,
    Check,
    X,
    Briefcase,
    Globe,
    Zap,
    Layout as LayoutIcon,
    Percent,
    Loader2
} from "lucide-react";
import { createQuote, getQuotes, deleteQuote } from "@/lib/actions/quote-actions";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const toast = {
    success: (msg: string) => alert(msg),
    error: (msg: string) => alert("Error: " + msg)
};

export default function PricingQuoteSystem() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [pricingData, setPricingData] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // PDF Generator
    const handleDownloadPDF = (quote: any) => {
        const doc = new jsPDF() as any;

        // Brand Header
        doc.setFillColor(15, 15, 15);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("HARIHARAN DIGITAL SOLUTIONS", 15, 25);
        doc.setFontSize(10);
        doc.text("Official Project Proposal", 15, 33);

        // Project Intro
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(14);
        doc.text(`Project: ${quote.projectName}`, 15, 55);
        doc.setFontSize(10);
        doc.text(`Prepared for: ${quote.clientName}`, 15, 62);
        doc.text(`Date: ${new Date(quote.createdAt).toLocaleDateString()}`, 195, 62, { align: 'right' });

        // Deliverables Table
        const rows = [];
        if (quote.deliverables?.pages) {
            quote.deliverables.pages.forEach((p: any) => {
                rows.push([`Page Implementation: ${p.type}`, "Included"]);
            });
        }
        if (quote.deliverables?.features) {
            quote.deliverables.features.forEach((f: any) => {
                rows.push([`Advanced Feature: ${f}`, "Included"]);
            });
        }
        if (quote.deliverables?.crm) {
            rows.push(["Full CRM Suite & Automations", "Active"]);
        }

        (doc as any).autoTable({
            startY: 75,
            head: [['Deliverable Component', 'Status']],
            body: rows,
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229] },
            styles: { fontSize: 9, cellPadding: 5 }
        });

        // Investment Summary
        const finalY = (doc as any).lastAutoTable.finalY + 20;
        doc.setFillColor(245, 245, 245);
        doc.rect(15, finalY, 180, 20, 'F');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Total Project Investment:", 25, finalY + 13);
        doc.setTextColor(79, 70, 229);
        doc.setFontSize(16);
        doc.text(`INR ${Number(quote.finalPrice).toLocaleString()}`, 185, finalY + 13, { align: 'right' });

        // Footer
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(8);
        doc.text("Thank you for choosing Hariharan Digital Solutions. This is a computer-generated document.", 105, 285, { align: 'center' });

        doc.save(`${quote.projectName}_Proposal.pdf`);
        toast.success("PDF Downloaded!");
    };

    // Calculator Selection State
    const [selection, setSelection] = useState({
        clientName: "",
        projectName: "",
        pages: [] as { id: string, type: string, sellingPrice: number, internalCost: number, count: number }[],
        features: [] as string[],
        includeCRM: false,
        complexity: "Standard",
        clientValue: "Small Business",
        timeline: "Standard",
        scopeClarity: "Fixed Scope",
        discountId: ""
    });

    const sessionId = typeof window !== "undefined" ? localStorage.getItem("admin_sessionId") || "" : "";

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [pricingRes, historyRes] = await Promise.all([
                fetch("/api/admin/pricing", { headers: { "X-Session-Id": sessionId } }),
                getQuotes()
            ]);

            if (pricingRes.ok) {
                const data = await pricingRes.json();
                setPricingData(data);
            }
            if (historyRes.success) {
                setHistory(historyRes.quotes || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // 🔹 CALCULATIONS ENGINE
    const totals = useMemo(() => {
        if (!pricingData) return null;

        // 1. Base Project Cost (Internal Only)
        const baseInternalCost = pricingData.baseCosts.reduce((sum: number, c: any) => sum + Number(c.internalCost), 0);

        // 2. Page Subtotal
        const pageSellingTotal = selection.pages.reduce((sum, p) => sum + (p.sellingPrice * p.count), 0);
        const pageInternalTotal = selection.pages.reduce((sum, p) => sum + (p.internalCost * p.count), 0);

        // 3. Features Subtotal
        const selectedFeatureRates = pricingData.featureRates.filter((f: any) =>
            selection.features.includes(f.id) || (selection.includeCRM && f.category === "CRM")
        );
        const featureSellingTotal = selectedFeatureRates.reduce((sum: number, f: any) => sum + Number(f.sellingPrice), 0);
        const featureInternalTotal = selectedFeatureRates.reduce((sum: number, f: any) => sum + Number(f.internalCost), 0);

        // 4. Base Price (Client)
        const baseSellingPrice = pageSellingTotal + featureSellingTotal;

        // 5. Multipliers
        const complexityMult = pricingData.multipliers.find((m: any) => m.label === selection.complexity)?.value || 1.0;
        const clientMult = pricingData.multipliers.find((m: any) => m.label === selection.clientValue)?.value || 1.0;
        const timelineCharge = pricingData.multipliers.find((m: any) => m.label === selection.timeline)?.value || 0;
        const scopeRisk = pricingData.multipliers.find((m: any) => m.label === selection.scopeClarity)?.value || 0;

        // Adjusted Price Calculation
        const adjustedPrice = baseSellingPrice * Number(complexityMult) * Number(clientMult);

        // Final Price
        const scopeIncrease = adjustedPrice * (Number(scopeRisk) / 100);
        const finalPriceBeforeDiscount = adjustedPrice + Number(timelineCharge) + scopeIncrease;

        // Discount
        const discountRate = pricingData.discounts.find((d: any) => d.id === selection.discountId)?.maxDiscount || 0;
        const discountAmount = finalPriceBeforeDiscount * (Number(discountRate) / 100);
        const finalClientPrice = Math.round(finalPriceBeforeDiscount - discountAmount);

        // 6. Profit Analysis (Admin Only)
        const totalInternalCost = Math.round(baseInternalCost + pageInternalTotal + featureInternalTotal);
        const expectedProfit = finalClientPrice - totalInternalCost;
        const margin = finalClientPrice > 0 ? (expectedProfit / finalClientPrice) * 100 : 0;

        return {
            baseInternalCost,
            finalClientPrice,
            totalInternalCost,
            expectedProfit,
            margin,
            baseSellingPrice,
            pageSellingTotal,
            featureSellingTotal,
            discountAmount
        };
    }, [pricingData, selection]);

    const handleSaveQuote = async () => {
        if (!selection.clientName || !selection.projectName) {
            alert("Please enter Client and Project name");
            return;
        }

        setIsSaving(true);
        const res = await createQuote({
            projectName: selection.projectName,
            clientName: selection.clientName,
            configuration: selection,
            finalPrice: totals?.finalClientPrice,
            internalCost: totals?.totalInternalCost,
            expectedProfit: totals?.expectedProfit,
            profitMargin: totals?.margin,
            deliverables: {
                pages: selection.pages,
                features: selection.features,
                crm: selection.includeCRM
            },
            timeline: selection.timeline
        });

        if (res.success) {
            toast.success("Quote saved successfully!");
            fetchData();
        } else {
            toast.error(res.error || "Failed to save");
        }
        setIsSaving(false);
    };

    const handleRateUpdate = async (type: string, data: any) => {
        try {
            const res = await fetch("/api/admin/pricing", {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Session-Id": sessionId },
                body: JSON.stringify({ type, action: "update", data })
            });
            if (res.ok) {
                toast.success("Rate updated successfully!");
                fetchData();
            }
        } catch (err) {
            toast.error("Failed to update rate");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Hydrating Pricing Engine...</p>
        </div>
    );

    return (
        <div className="space-y-16 pb-20 max-w-7xl mx-auto selection:bg-primary/10">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full">
                        <ShieldCheck size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Admin Secured</span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                        Pricing <span className="text-primary italic">&</span> Quote <span className="text-primary">System.</span>
                    </h1>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Internal Decision Engine | Hariharan Digital Solutions</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                        className="p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-xl transition-all shadow-sm group"
                    >
                        <History className="text-gray-400 group-hover:text-primary transition-colors" size={20} />
                    </button>
                    <button
                        onClick={handleSaveQuote}
                        disabled={isSaving}
                        className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-gray-900/20 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Store Project Estimate
                    </button>
                </div>
            </div>

            {/* MAIN CALCULATOR GRID */}
            <div className="grid lg:grid-cols-1 gap-12">

                {/* 🔹 SECTION 1: CUSTOMER INPUT */}
                <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:bg-primary/10 transition-all" />
                    <div className="relative z-10 grid md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 italic">Client Identity</label>
                            <input
                                type="text"
                                placeholder="Enter Client Full Name..."
                                value={selection.clientName}
                                onChange={(e) => setSelection({ ...selection, clientName: e.target.value })}
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-[1.5rem] px-8 py-5 text-sm font-black transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 italic">Project Concept</label>
                            <input
                                type="text"
                                placeholder="E.g., Enterprise E-commerce Portal..."
                                value={selection.projectName}
                                onChange={(e) => setSelection({ ...selection, projectName: e.target.value })}
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-[1.5rem] px-8 py-5 text-sm font-black transition-all outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* 🔹 TABLE 1: BASE COST STRUCTURE (INTERNAL ONLY) */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 ml-6 flex items-center gap-3">
                        <ShieldCheck size={14} className="text-red-500" /> Table 1 — Base Project Cost Structure
                    </h3>
                    <div className="bg-white rounded-[3rem] p-1 border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50/50">
                                    <th className="py-6 px-10">Component</th>
                                    <th className="py-6 px-10">Internal Cost (₹)</th>
                                    <th className="py-6 px-10">Type</th>
                                    <th className="py-6 px-10">Audit Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {pricingData.baseCosts.map((c: any) => (
                                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="py-6 px-10 text-sm font-black text-gray-900 italic">{c.component}</td>
                                        <td className="py-6 px-10">
                                            <input
                                                type="number"
                                                defaultValue={c.internalCost}
                                                onBlur={(e) => handleRateUpdate("base", { ...c, internalCost: parseFloat(e.target.value) })}
                                                className="bg-transparent border-b border-dashed border-gray-200 focus:border-primary text-sm font-black text-primary outline-none w-24"
                                            />
                                        </td>
                                        <td className="py-6 px-10">
                                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${c.type === 'Fixed' ? 'bg-blue-50 text-blue-500' : c.type === 'Risk' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                                {c.type}
                                            </span>
                                        </td>
                                        <td className="py-6 px-10 text-xs text-gray-400 font-bold">{c.notes}</td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-900 text-white">
                                    <td className="py-8 px-10 text-xs font-black uppercase tracking-widest italic">Base Calculations</td>
                                    <td className="py-8 px-10">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-gray-500 uppercase leading-none mb-1">Total Internal</span>
                                            <span className="text-2xl font-black">₹{totals?.baseInternalCost.toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="py-8 px-10" colSpan={2}>
                                        <div className="flex gap-10">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-gray-500 uppercase leading-none mb-1">Min Selling (x1.6)</span>
                                                <span className="text-xl font-black text-emerald-400">₹{(Math.round(totals?.baseInternalCost * 1.6)).toLocaleString()}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-gray-500 uppercase leading-none mb-1">Target Selling (x2.2)</span>
                                                <span className="text-xl font-black text-primary">₹{(Math.round(totals?.baseInternalCost * 2.2)).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 🔹 ROW 2: PAGES & FEATURES SELECTORS */}
                <div className="grid xl:grid-cols-2 gap-12">

                    {/* TABLE 2: PAGES */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 ml-6 flex items-center gap-3">
                            < Globe size={14} className="text-blue-500" /> Table 2 — Website Page Pricing
                        </h3>
                        <div className="bg-white rounded-[3rem] p-1 border border-gray-100 shadow-sm overflow-hidden h-full">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50/50">
                                        <th className="py-6 px-10">Page Type</th>
                                        <th className="py-6 px-10">Price (₹)</th>
                                        <th className="py-6 px-10 text-center">Count</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {pricingData.pageRates.map((p: any) => {
                                        const selected = selection.pages.find(item => item.id === p.id);
                                        return (
                                            <tr key={p.id} className={`hover:bg-gray-50/50 transition-colors ${selected ? 'bg-blue-50/20' : ''}`}>
                                                <td className="py-6 px-10">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-gray-900">{p.pageType}</span>
                                                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Internal: ₹{p.internalCost}</span>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-10">
                                                    <input
                                                        type="number"
                                                        defaultValue={p.sellingPrice}
                                                        onBlur={(e) => handleRateUpdate("page", { ...p, sellingPrice: parseFloat(e.target.value) })}
                                                        className="bg-transparent border-b border-dashed border-gray-200 focus:border-primary text-sm font-black text-gray-900 outline-none w-24"
                                                    />
                                                </td>
                                                <td className="py-6 px-10">
                                                    <div className="flex items-center justify-center gap-4 bg-gray-50 py-2 px-4 rounded-xl border border-gray-100">
                                                        <button
                                                            onClick={() => {
                                                                const current = selection.pages.find(i => i.id === p.id);
                                                                if (!current) return;
                                                                if (current.count === 1) {
                                                                    setSelection({ ...selection, pages: selection.pages.filter(i => i.id !== p.id) });
                                                                } else {
                                                                    setSelection({ ...selection, pages: selection.pages.map(i => i.id === p.id ? { ...i, count: i.count - 1 } : i) });
                                                                }
                                                            }}
                                                            className="text-gray-400 hover:text-red-500 font-black"
                                                        >-</button>
                                                        <span className="text-xs font-black w-4 text-center">{selected?.count || 0}</span>
                                                        <button
                                                            onClick={() => {
                                                                const current = selection.pages.find(i => i.id === p.id);
                                                                if (current) {
                                                                    setSelection({ ...selection, pages: selection.pages.map(i => i.id === p.id ? { ...i, count: i.count + 1 } : i) });
                                                                } else {
                                                                    setSelection({ ...selection, pages: [...selection.pages, { id: p.id, type: p.pageType, sellingPrice: p.sellingPrice, internalCost: p.internalCost, count: 1 }] });
                                                                }
                                                            }}
                                                            className="text-gray-400 hover:text-primary font-black"
                                                        >+</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    <tr className="bg-gray-50">
                                        <td colSpan={2} className="py-6 px-10 text-xs font-black uppercase tracking-widest italic text-gray-400 text-right">Subtotal</td>
                                        <td className="py-6 px-10 text-xl font-black text-gray-900 text-center">₹{totals?.pageSellingTotal.toLocaleString()}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* TABLE 3 & 4: FEATURES & CRM */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 ml-6 flex items-center gap-3">
                            <Zap size={14} className="text-orange-500" /> Table 3 & 4 — Feature & CRM Selection
                        </h3>
                        <div className="bg-white rounded-[3rem] p-1 border border-gray-100 shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50/50">
                                        <th className="py-6 px-10">Feature / Module</th>
                                        <th className="py-6 px-10">Price (₹)</th>
                                        <th className="py-6 px-10 text-center">Select</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    <tr className="bg-gray-900">
                                        <td colSpan={3} className="py-2 px-10 text-[8px] font-black text-gray-500 uppercase tracking-[0.3em]">Core Platform Features</td>
                                    </tr>
                                    {pricingData.featureRates.filter((f: any) => f.category === 'Feature').map((f: any) => (
                                        <tr key={f.id} className={`hover:bg-gray-50/50 transition-colors ${selection.features.includes(f.id) ? 'bg-orange-50/20' : ''}`}>
                                            <td className="py-6 px-10 text-sm font-black text-gray-900">{f.feature}</td>
                                            <td className="py-6 px-10">
                                                <input
                                                    type="number"
                                                    defaultValue={f.sellingPrice}
                                                    onBlur={(e) => handleRateUpdate("feature", { ...f, sellingPrice: parseFloat(e.target.value) })}
                                                    className="bg-transparent border-b border-dashed border-gray-200 focus:border-primary text-sm font-black text-gray-900 outline-none w-24"
                                                />
                                            </td>
                                            <td className="py-6 px-10 text-center">
                                                <button
                                                    onClick={() => setSelection({ ...selection, features: selection.features.includes(f.id) ? selection.features.filter(id => id !== f.id) : [...selection.features, f.id] })}
                                                    className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${selection.features.includes(f.id) ? 'bg-orange-500 border-orange-500 text-white' : 'bg-gray-50 border-gray-100 text-transparent'}`}
                                                >
                                                    <Check size={16} strokeWidth={4} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-900 flex-row">
                                        <td colSpan={2} className="py-6 px-10 text-sm font-black text-white italic">Include full CRM Suite?</td>
                                        <td className="py-6 px-10 text-center">
                                            <button
                                                onClick={() => setSelection({ ...selection, includeCRM: !selection.includeCRM })}
                                                className={`w-14 h-8 rounded-full border-2 p-1 transition-all flex ${selection.includeCRM ? 'bg-emerald-500 border-emerald-500' : 'bg-gray-800 border-gray-700'}`}
                                            >
                                                <div className={`w-5 h-5 rounded-full bg-white transition-all ${selection.includeCRM ? 'ml-6' : 'ml-0'}`} />
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* 🔹 SECTION 5: MULTIPLIERS */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 ml-6 flex items-center gap-3">
                        <TrendingUp size={14} className="text-purple-500" /> Table 5 — Project Multipliers & Risk Adjustments
                    </h3>
                    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 px-2">
                        {[
                            { label: "Complexity Level", field: "complexity", category: "Complexity" },
                            { label: "Client Value", field: "clientValue", category: "Client Value" },
                            { label: "Delivery Timeline", field: "timeline", category: "Timeline" },
                            { label: "Scope Clarity", field: "scopeClarity", category: "Scope Risk" },
                        ].map(mGroup => (
                            <div key={mGroup.field} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 italic">{mGroup.label}</label>
                                <select
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-4 text-xs font-black outline-none appearance-none cursor-pointer"
                                    value={(selection as any)[mGroup.field]}
                                    onChange={(e) => setSelection({ ...selection, [mGroup.field]: e.target.value })}
                                >
                                    {pricingData.multipliers.filter((m: any) => m.category === mGroup.category).map((m: any) => (
                                        <option key={m.id} value={m.label}>
                                            {m.label} ({m.isPercentage ? `+${m.value}%` : mGroup.category === 'Timeline' && m.value > 0 ? `+₹${m.value}` : `x${m.value}`})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 🔹 FINAL RESULT ENGINE & DISCOUNT */}
                <div className="grid lg:grid-cols-2 gap-12 pt-10">
                    {/* TABLE 7: DISCOUNT */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 ml-6 flex items-center gap-3">
                            <Percent size={14} className="text-pink-500" /> Table 7 — Strategic Discount Control
                        </h3>
                        <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm space-y-8">
                            <div className="grid grid-cols-2 gap-4">
                                {pricingData.discounts.map((d: any) => (
                                    <button
                                        key={d.id}
                                        onClick={() => setSelection({ ...selection, discountId: selection.discountId === d.id ? "" : d.id })}
                                        className={`p-6 rounded-[2rem] border-2 text-left transition-all ${selection.discountId === d.id ? 'bg-pink-50 border-pink-500 text-pink-600 shadow-xl shadow-pink-500/10' : 'bg-gray-50 border-transparent text-gray-400 hover:border-gray-100'}`}
                                    >
                                        <p className="text-[10px] font-black uppercase tracking-widest mb-1">{d.condition}</p>
                                        <p className="text-xl font-black italic">{d.maxDiscount}% Off</p>
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-4 bg-red-50 p-6 rounded-[2rem] border border-red-100">
                                <AlertCircle size={24} className="text-red-500 shrink-0" />
                                <p className="text-[10px] text-red-700 font-bold leading-relaxed uppercase tracking-tighter">
                                    System Constraint: Discounts cannot reduce profit margin below <span className="underline italic">40%</span>.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* TABLE 6: AUTOMATIC CALCULATOR DISPLAY */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 ml-6 flex items-center gap-3">
                            <Calculator size={14} className="text-emerald-500" /> Table 6 — Automatic Price Consolidation
                        </h3>
                        <div className="bg-gray-900 rounded-[3rem] p-10 text-white space-y-10 shadow-[0_30px_60px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[100px] -mr-40 -mt-40 group-hover:bg-primary/30 transition-all duration-700" />

                            <div className="relative z-10 space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Final Projected Client Price</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black italic tracking-tighter">₹{totals?.finalClientPrice.toLocaleString()}</span>
                                    <span className="text-emerald-500 font-black text-xs">All Applied.</span>
                                </div>
                            </div>

                            <div className="relative z-10 grid grid-cols-2 gap-10 pt-10 border-t border-white/5">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">Est. Internal Cost</p>
                                    <p className="text-2xl font-black text-gray-300">₹{totals?.totalInternalCost.toLocaleString()}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">Expected Profit</p>
                                    <p className="text-2xl font-black text-emerald-400">₹{totals?.expectedProfit.toLocaleString()}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">Profit Margin</p>
                                    <p className={`text-2xl font-black ${totals && totals.margin >= 40 ? 'text-emerald-500' : 'text-orange-500'}`}>
                                        {totals?.margin.toFixed(1)}%
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">Decision Status</p>
                                    <p className={`text-2xl font-black ${totals && totals.margin >= 40 ? 'text-primary' : 'text-red-500'}`}>
                                        {totals && totals.margin >= 40 ? 'PROCEED' : 'RENEGOTIATE'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🔹 HISTORY TABLE */}
                <div className="space-y-6 pt-10" id="history">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 ml-6 flex items-center gap-3">
                        <History size={14} /> Table 9 — Stored Estimates & Project History
                    </h3>
                    <div className="bg-white rounded-[3rem] p-1 border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50/50">
                                    <th className="py-6 px-10">Project / Client</th>
                                    <th className="py-6 px-10">Build Specs</th>
                                    <th className="py-6 px-10">Revenue (₹)</th>
                                    <th className="py-6 px-10 text-emerald-500">Profit (₹)</th>
                                    <th className="py-6 px-10">Timestamp</th>
                                    <th className="py-6 px-10 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {history.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center text-gray-400 font-bold text-xs uppercase tracking-widest">No historical estimates found</td>
                                    </tr>
                                ) : (
                                    history.map((q: any) => (
                                        <tr key={q.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-6 px-10">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-gray-900">{q.projectName}</span>
                                                    <span className="text-[10px] font-bold text-gray-400 italic">Client: {q.clientName}</span>
                                                </div>
                                            </td>
                                            <td className="py-6 px-10">
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="text-[8px] font-black bg-blue-50 text-blue-500 px-2 py-1 rounded-md uppercase tracking-tighter">
                                                        {(q.configuration?.pages || []).reduce((s: number, p: any) => s + p.count, 0)} Pages
                                                    </span>
                                                    {(q.configuration?.includeCRM) && (
                                                        <span className="text-[8px] font-black bg-emerald-50 text-emerald-500 px-2 py-1 rounded-md uppercase tracking-tighter">CRM Suite</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-6 px-10 text-sm font-black text-gray-900">₹{Number(q.finalPrice).toLocaleString()}</td>
                                            <td className="py-6 px-10 text-sm font-black text-emerald-500 bg-emerald-50/20 italic">₹{Number(q.expectedProfit).toLocaleString()}</td>
                                            <td className="py-6 px-10 text-[10px] text-gray-400 font-black">{new Date(q.createdAt).toLocaleDateString()}</td>
                                            <td className="py-6 px-10">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        onClick={() => handleDownloadPDF(q)}
                                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-primary transition-colors"
                                                        title="Download Proposal PDF"
                                                    >
                                                        <Download size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const url = `${window.location.origin}/quote/${q.quoteToken}`;
                                                            navigator.clipboard.writeText(url);
                                                            toast.success("Client link copied!");
                                                        }}
                                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-500 transition-colors"
                                                        title="Copy Shareable Link"
                                                    >
                                                        <LinkIcon size={14} />
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            if (confirm("Delete this estimate?")) {
                                                                await deleteQuote(q.id);
                                                                fetchData();
                                                            }
                                                        }}
                                                        className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* PROFESSIONAL ACCOUNTABILITY BANNER */}
            <div className="bg-gray-900 rounded-[3rem] p-12 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-primary/20 rounded-full blur-[120px] -mr-80 -mt-80 group-hover:bg-primary/30 transition-all duration-1000" />
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                    <div className="space-y-4 max-w-2xl text-center lg:text-left">
                        <div className="w-20 h-20 bg-primary/20 text-primary rounded-[2rem] flex items-center justify-center mx-auto lg:mx-0">
                            <ShieldCheck size={40} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-4xl font-black tracking-tight">Financial <span className="text-primary italic">Decision</span> Accountability.</h2>
                        <p className="text-gray-400 text-sm font-bold leading-relaxed uppercase tracking-widest text-[10px]">By utilizing this pricing engine, you are committing to maintaining the <span className="text-white underline">40% minimum profit threshold</span> required for digital agency scalability. High-margin projects fuel innovation.</p>
                    </div>
                    <button className="whitespace-nowrap bg-primary text-white px-12 py-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/40">
                        Acknowledge & Sync Revenue
                    </button>
                </div>
            </div>
        </div>
    );
}
