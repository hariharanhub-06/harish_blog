"use client";

import { useState, useMemo } from "react";
import {
    Calculator,
    ChevronRight,
    Copy,
    Save,
    TrendingUp,
    Clock,
    DollarSign,
    CheckCircle2,
    AlertCircle,
    FileText,
    ArrowRight,
    Users,
    Layers,
    X
} from "lucide-react";

interface PricingCalculatorProps {
    leadName?: string;
    leadMessage?: string;
    onSave?: (notes: string) => void;
    onClose?: () => void;
}

const PACKAGES = [
    { id: "basic", name: "Basic Website", base: 15000 },
    { id: "pro", name: "Professional Website", base: 22000 },
    { id: "crm", name: "Website + CRM System", base: 32000 }
];

const ADDONS = [
    { id: "blog", name: "Blog System", price: 3000 },
    { id: "crm_custom", name: "CRM Customization", price: 5000 },
    { id: "advanced_ui", name: "Advanced UI", price: 4000 },
    { id: "seo", name: "SEO Setup", price: 3000 },
    { id: "content", name: "Content Upload", price: 2000 }
];

const COMPLEXITY = [
    { label: "Simple", multiplier: 1.0 },
    { label: "Medium", multiplier: 1.2 },
    { label: "Advanced", multiplier: 1.4 }
];

export default function PricingCalculator({ leadName, leadMessage, onSave, onClose }: PricingCalculatorProps) {
    // Client Price State
    const [selectedPackage, setSelectedPackage] = useState(PACKAGES[0].id);
    const [extraPages, setExtraPages] = useState(0);
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
    const [complexityIndex, setComplexityIndex] = useState(0);
    const [isFastDelivery, setIsFastDelivery] = useState(false);

    // Internal Cost State
    const [estHours, setEstHours] = useState(20);
    const [hourlyRate, setHourlyRate] = useState(500);
    const [toolsCost, setToolsCost] = useState(2000);
    const [riskPercent, setRiskPercent] = useState(10);

    // Calculations
    const calculations = useMemo(() => {
        const pkg = PACKAGES.find(p => p.id === selectedPackage)!;
        const addonsTotal = selectedAddons.reduce((sum, id) => {
            const addon = ADDONS.find(a => a.id === id);
            return sum + (addon?.price || 0);
        }, 0);
        const pagesTotal = extraPages * 2000;

        const baseSubtotal = pkg.base + addonsTotal + pagesTotal;
        const complexityMultiplier = COMPLEXITY[complexityIndex].multiplier;
        const urgencyFee = isFastDelivery ? 5000 : 0;

        const clientPrice = Math.round(baseSubtotal * complexityMultiplier) + urgencyFee;

        const laborCost = estHours * hourlyRate;
        const internalBase = laborCost + toolsCost;
        const buffer = internalBase * (riskPercent / 100);
        const totalInternalCost = Math.round(internalBase + buffer);

        const profit = clientPrice - totalInternalCost;
        const margin = clientPrice > 0 ? (profit / clientPrice) * 100 : 0;

        return {
            clientPrice,
            totalInternalCost,
            profit,
            margin,
            pkgName: pkg.name
        };
    }, [selectedPackage, selectedAddons, extraPages, complexityIndex, isFastDelivery, estHours, hourlyRate, toolsCost, riskPercent]);

    const toggleAddon = (id: string) => {
        setSelectedAddons(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
    };

    const generateQuote = () => {
        const dateStr = new Date().toLocaleDateString();
        const pkg = PACKAGES.find(p => p.id === selectedPackage)!;
        const addons = selectedAddons.map(id => ADDONS.find(a => a.id === id)?.name).join(", ");

        return `
PROPOSAL FOR ${leadName?.toUpperCase() || "CLIENT"}
Date: ${dateStr}

1. UNDERSTANDING OF REQUIREMENT:
Based on our initial discussion: 
${leadMessage || "Project inquiry via website."}

2. PROPOSED SOLUTION:
We recommend our ${pkg.name} package. ${selectedAddons.length > 0 ? "This includes add-ons like: " + addons + "." : ""}

3. SCOPE OF WORK:
- Design & Development of ${pkg.name}
- Mobile-Responsive Layout
- ${extraPages > 0 ? `+ ${extraPages} Additional Page(s)` : ""}
${selectedAddons.map(id => `- ${ADDONS.find(a => a.id === id)?.name}`).join("\n")}
- Professional Deployment

4. PROJECT TIMELINE:
Expected completion within ${isFastDelivery ? "3-5" : "7-10"} business days.

5. INVESTMENT:
Net Project Fee: ₹${calculations.clientPrice.toLocaleString()}

6. PAYMENT TERMS:
- 50% Advance to commence work.
- 50% On completion and before final handover.

7. NEXT STEPS:
To proceed, please acknowledge this proposal. We will luego share the formal service agreement and invoice for the advance payment.

Best Regards,
Hariharan
hariharanhub.com
`;
    };

    const copyToClipboard = () => {
        const text = generateQuote();
        navigator.clipboard.writeText(text);
        alert("Quote copied to clipboard!");
    };

    return (
        <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-gray-100 shadow-2xl w-full max-w-5xl mx-auto overflow-hidden animate-in fade-in zoom-in duration-500">
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <Calculator size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 leading-none">Quote Generator</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Configure pricing & internal costs</p>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-full transition-all">
                        <X size={20} />
                    </button>
                )}
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
                {/* Column 1: Pricing Config */}
                <div className="space-y-8">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={16} className="text-blue-500" />
                        <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Pricing Config</h3>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-gray-900 block ml-2">Package Type</label>
                        <div className="space-y-2">
                            {PACKAGES.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setSelectedPackage(p.id)}
                                    className={`w-full p-4 rounded-2xl text-left border transition-all ${selectedPackage === p.id ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-blue-200'}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black uppercase tracking-tight">{p.name}</span>
                                        <span className={`text-[10px] font-bold ${selectedPackage === p.id ? 'text-blue-100' : 'text-gray-400'}`}>₹{p.base.toLocaleString()}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <div className="flex justify-between items-center ml-2">
                            <label className="text-[10px] font-black uppercase text-gray-900">Extra Pages (₹2k/ea)</label>
                            <span className="text-xs font-black text-blue-600">{extraPages}</span>
                        </div>
                        <input
                            type="range" min="0" max="20"
                            value={extraPages}
                            onChange={(e) => setExtraPages(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-gray-900 block ml-2">Complexity & Urgency</label>
                        <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100">
                            {COMPLEXITY.map((c, i) => (
                                <button
                                    key={c.label}
                                    onClick={() => setComplexityIndex(i)}
                                    className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${complexityIndex === i ? 'bg-white text-blue-600 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {c.label}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setIsFastDelivery(!isFastDelivery)}
                            className={`w-full py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 border ${isFastDelivery ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
                        >
                            {isFastDelivery ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                            Fast Delivery (+₹5k)
                        </button>
                    </div>
                </div>

                {/* Column 2: Add-ons & Internal Cost */}
                <div className="space-y-8 lg:border-l lg:border-gray-100 lg:pl-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Layers size={16} className="text-indigo-500" />
                            <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Features & Add-ons</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {ADDONS.map(addon => (
                                <button
                                    key={addon.id}
                                    onClick={() => toggleAddon(addon.id)}
                                    className={`p-3 rounded-xl border text-left flex justify-between items-center transition-all ${selectedAddons.includes(addon.id) ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-100 text-gray-500'}`}
                                >
                                    <span className="text-[10px] font-bold uppercase tracking-tight">{addon.name}</span>
                                    <span className="text-[9px] font-black">₹{addon.price.toLocaleString()}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 space-y-6">
                        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg w-fit">
                            <Clock size={12} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Internal Cost Model (Admin Only)</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Est. Hours</label>
                                <input
                                    type="number"
                                    value={estHours}
                                    onChange={(e) => setEstHours(parseInt(e.target.value) || 0)}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-1 focus:ring-red-200 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Hourly Rate</label>
                                <input
                                    type="number"
                                    value={hourlyRate}
                                    onChange={(e) => setHourlyRate(parseInt(e.target.value) || 0)}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-1 focus:ring-red-200 outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Buffer %</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range" min="0" max="50"
                                    value={riskPercent}
                                    onChange={(e) => setRiskPercent(parseInt(e.target.value))}
                                    className="flex-1 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-red-500"
                                />
                                <span className="text-[10px] font-black text-red-600 w-8">{riskPercent}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 3: Summary & Output */}
                <div className="space-y-8 lg:border-l lg:border-gray-100 lg:pl-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <ArrowRight size={16} className="text-emerald-500" />
                            <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Financial Summary</h3>
                        </div>

                        <div className="bg-gray-900 rounded-[2rem] p-8 text-white space-y-6 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-blue-500/20 transition-all"></div>

                            <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Final Client Price</p>
                                <p className="text-4xl font-black italic tracking-tighter">₹{calculations.clientPrice.toLocaleString()}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                                <div>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-0.5">Internal Cost</p>
                                    <p className="text-lg font-black text-gray-300">₹{calculations.totalInternalCost.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-0.5">Margin</p>
                                    <p className={`text-lg font-black ${calculations.margin > 30 ? 'text-emerald-400' : 'text-blue-400'}`}>
                                        {calculations.margin.toFixed(1)}%
                                    </p>
                                </div>
                            </div>

                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex justify-between items-center">
                                <p className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Net Profit</p>
                                <p className="text-xl font-black text-emerald-400">₹{calculations.profit.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={copyToClipboard}
                            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            <Copy size={16} /> Copy Client Quote
                        </button>

                        {onSave && (
                            <button
                                onClick={() => onSave(generateQuote())}
                                className="w-full py-5 border border-gray-200 text-gray-900 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
                            >
                                <Save size={16} /> Save to Lead Notes
                            </button>
                        )}
                    </div>

                    <div className="bg-orange-50/50 border border-orange-100 rounded-[1.5rem] p-5">
                        <div className="flex gap-3">
                            <AlertCircle size={16} className="text-orange-500 shrink-0" />
                            <p className="text-[10px] text-orange-700 font-bold leading-relaxed">
                                Quote output includes scope, timeline, and final price only. <span className="underline italic">Profit data is strictly hidden from client output.</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
