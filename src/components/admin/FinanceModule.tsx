"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    PieChart as PieChartIcon,
    History,
    Plus,
    Calendar,
    ArrowRight,
    Search,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Loader2,
    LayoutDashboard,
    CreditCard,
    DollarSign,
    Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend
} from "recharts";

interface Transaction {
    id: string;
    amount: number;
    description: string;
    category: string;
    type: "expense" | "income" | "debt_pay";
    debtId?: string;
    date: string;
}

interface Debt {
    id: string;
    name: string;
    initialAmount: number;
    remainingAmount: number;
    notes: string;
    repaymentType: "single" | "split";
    dueDate: string | null;
    isActive: boolean;
}

interface ParsedEntry {
    type: "expense" | "income" | "debt_pay";
    item: string;
    amount: number;
    category: string;
    debtId?: string;
    isValid: boolean;
}

export default function FinanceModule() {
    const [activeTab, setActiveTab] = useState<"dashboard" | "log" | "debts" | "history">("dashboard");
    const [logInput, setLogInput] = useState("");
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [debts, setDebts] = useState<Debt[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dateRange, setDateRange] = useState("This Month");
    const [selectedCategory, setSelectedCategory] = useState("All");

    // Debt Modal States
    const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
    const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [debtForm, setDebtForm] = useState({
        name: "",
        initialAmount: "",
        remainingAmount: "",
        notes: "",
        repaymentType: "single" as "single" | "split",
        dueDate: ""
    });

    // Fetch initial data
    useEffect(() => {
        fetchData();
    }, [dateRange, selectedCategory]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [debtsRes, statsRes, transRes] = await Promise.all([
                fetch("/api/admin/finance/debts"),
                fetch(`/api/admin/finance/summary?range=${dateRange}`),
                fetch(`/api/admin/finance/transactions?limit=100${selectedCategory !== 'All' ? `&category=${selectedCategory}` : ''}`)
            ]);

            if (debtsRes.ok) setDebts(await debtsRes.json());
            if (statsRes.ok) setStats(await statsRes.json());
            if (transRes.ok) setTransactions(await transRes.json());
        } catch (error) {
            console.error("Failed to fetch finance data", error);
        } finally {
            setLoading(false);
        }
    };

    // Parser Logic
    const parsedEntries = useMemo(() => {
        if (!logInput.trim()) return [];

        const entries: ParsedEntry[] = [];
        let currentType: "expense" | "income" | "debt_pay" = "expense";

        const lines = logInput.split('\n');
        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;

            // Check for section headers
            if (trimmed.toLowerCase().includes("debts paid:") || trimmed.toLowerCase().includes("debt:")) {
                currentType = "debt_pay";
                return;
            }
            if (trimmed.toLowerCase().includes("expense:") || trimmed.toLowerCase().startsWith("expense")) {
                currentType = "expense";
                return;
            }
            if (trimmed.toLowerCase().includes("income:") || trimmed.toLowerCase().startsWith("income")) {
                currentType = "income";
                return;
            }

            // Improved parsing: Handle multiple pairs on the same line
            // regex to find patterns like "Name - Amount" or "Name Amount"
            const regex = /([a-zA-Z\s]+)(?:-?\s*)(\d+)/g;
            let match;
            let found = false;

            while ((match = regex.exec(trimmed)) !== null) {
                const item = match[1].trim();
                const amount = parseFloat(match[2]);

                if (item && !isNaN(amount)) {
                    const matchedDebt = debts.find(d => d.name.toLowerCase() === item.toLowerCase());
                    entries.push({
                        type: currentType,
                        item,
                        amount,
                        category: currentType === "debt_pay" ? (matchedDebt?.name || "Transfer") : (currentType === "income" ? "Revenue" : item),
                        debtId: currentType === "debt_pay" ? matchedDebt?.id : undefined,
                        isValid: true
                    });
                    found = true;
                }
            }

            if (!found && trimmed.length > 0) {
                entries.push({
                    type: currentType,
                    item: trimmed,
                    amount: 0,
                    category: "Unknown",
                    isValid: false
                });
            }
        });

        return entries;
    }, [logInput, debts]);

    const handleSaveLog = async () => {
        if (parsedEntries.length === 0 || parsedEntries.some(e => !e.isValid)) return;

        setSaving(true);
        try {
            for (const entry of parsedEntries) {
                await fetch("/api/admin/finance/transactions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        amount: entry.amount,
                        description: entry.item,
                        category: entry.category,
                        type: entry.type,
                        debtId: entry.debtId,
                        date: new Date().toISOString()
                    })
                });
            }
            setLogInput("");
            fetchData();
            alert("Entries saved successfully!");
        } catch (error) {
            console.error("Failed to save log", error);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveDebt = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = "/api/admin/finance/debts";
            const method = editingDebt ? "PUT" : "POST";
            const body = editingDebt
                ? {
                    ...editingDebt,
                    ...debtForm,
                    initialAmount: parseFloat(debtForm.initialAmount),
                    remainingAmount: parseFloat(debtForm.remainingAmount || debtForm.initialAmount)
                }
                : {
                    ...debtForm,
                    initialAmount: parseFloat(debtForm.initialAmount),
                    remainingAmount: parseFloat(debtForm.initialAmount)
                };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                setIsDebtModalOpen(false);
                setEditingDebt(null);
                setDebtForm({ name: "", initialAmount: "", remainingAmount: "", notes: "", repaymentType: "single", dueDate: "" });
                setError(null);
                fetchData();
            } else {
                const errData = await res.json();
                setError(errData.error || "Failed to save debt");
            }
        } catch (error) {
            console.error("Failed to save debt", error);
            setError("A network error occurred. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const openAddDebt = () => {
        setEditingDebt(null);
        setDebtForm({ name: "", initialAmount: "", remainingAmount: "", notes: "", repaymentType: "single", dueDate: "" });
        setError(null);
        setIsDebtModalOpen(true);
    };

    const openEditDebt = (debt: Debt) => {
        setEditingDebt(debt);
        setDebtForm({
            name: debt.name,
            initialAmount: debt.initialAmount.toString(),
            remainingAmount: debt.remainingAmount.toString(),
            notes: debt.notes,
            repaymentType: (debt.repaymentType as any) || "single",
            dueDate: debt.dueDate ? new Date(debt.dueDate).toISOString().split('T')[0] : ""
        });
        setError(null);
        setIsDebtModalOpen(true);
    };

    if (loading && !stats) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

    const summaryData = stats?.summary || [];
    const totalIncome = summaryData.find((s: any) => s.type === "income")?.total || 0;
    const totalExpense = summaryData.find((s: any) => s.type === "expense")?.total || 0;
    const debtPayments = summaryData.find((s: any) => s.type === "debt_pay")?.total || 0;
    const debtBalance = stats?.debtBalance || 0;
    const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense - debtPayments) / totalIncome) * 100) : 0;

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Wallet className="text-primary" size={32} />
                        Finance Hub
                    </h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Smart tracking and wealth analysis</p>
                </div>
                <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
                    {["dashboard", "log", "debts", "history"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Income" value={totalIncome} icon={TrendingUp} color="emerald" />
                <StatCard title="Total Expenses" value={totalExpense} icon={TrendingDown} color="red" />
                <StatCard title="Debt Balance" value={debtBalance} icon={CreditCard} color="orange" />
                <StatCard title="Savings Rate" value={`${savingsRate}%`} icon={LayoutDashboard} color="blue" />
            </div>

            <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {activeTab === "dashboard" && (
                    <>
                        {/* Charts Area */}
                        <div className="lg:col-span-8 space-y-8">
                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="font-black text-xl uppercase tracking-tight">Income vs Expense Trend</h3>
                                    <select
                                        value={dateRange}
                                        onChange={(e) => setDateRange(e.target.value)}
                                        className="bg-gray-50 border-0 rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option>Last 6 Months</option>
                                        <option>This Year</option>
                                    </select>
                                </div>
                                <div className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={stats?.trend || []}>
                                            <defs>
                                                <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#94a3b8' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#94a3b8' }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorInc)" />
                                            <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                    <h3 className="font-black text-lg uppercase tracking-tight mb-8">Net Cash Flow</h3>
                                    <div className="h-[250px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={
                                                // Group trend by month to calculate net flow
                                                Array.from((stats?.trend || []).reduce((acc: any, curr: any) => {
                                                    if (!acc.has(curr.month)) acc.set(curr.month, { month: curr.month, income: 0, expense: 0 });
                                                    const entry = acc.get(curr.month);
                                                    if (curr.type === 'income') entry.income += curr.total;
                                                    else entry.expense += curr.total;
                                                    return acc;
                                                }, new Map()).values()).map((m: any) => ({
                                                    ...m,
                                                    net: m.income - m.expense
                                                }))
                                            }>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="net" radius={[4, 4, 0, 0]}>
                                                    {
                                                        // Color based on value
                                                        (stats?.trend || []).map((entry: any, index: number) => (
                                                            <Cell key={`cell-${index}`} fill={entry.net >= 0 ? '#10b981' : '#ef4444'} />
                                                        ))
                                                    }
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                    <h3 className="font-black text-lg uppercase tracking-tight mb-8">Top Expenses</h3>
                                    <div className="space-y-4">
                                        {(stats?.categories || [])
                                            .filter((c: any) => c.type === 'expense')
                                            .sort((a: any, b: any) => b.value - a.value)
                                            .slice(0, 5)
                                            .map((cat: any, i: number) => {
                                                const max = Math.max(...(stats?.categories || []).filter((c: any) => c.type === 'expense').map((c: any) => c.value));
                                                return (
                                                    <div key={i} className="space-y-2">
                                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                                            <span>{cat.category}</span>
                                                            <span className="text-gray-900">₹{cat.value.toLocaleString()}</span>
                                                        </div>
                                                        <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${(cat.value / max) * 100}%` }}
                                                                className="h-full bg-red-400 rounded-full"
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Mini Log */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                <h3 className="font-black text-lg uppercase tracking-tight mb-6 flex items-center gap-2">
                                    <History size={18} className="text-primary" />
                                    Recent Log
                                </h3>
                                <div className="space-y-4">
                                    {transactions.slice(0, 8).map(tx => (
                                        <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-all group">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-xl ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : tx.type === 'debt_pay' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                                                    {tx.type === 'income' ? <TrendingUp size={14} /> : tx.type === 'debt_pay' ? <CreditCard size={14} /> : <TrendingDown size={14} />}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-900 group-hover:text-primary transition-colors">{tx.description}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">{tx.category}</p>
                                                </div>
                                            </div>
                                            <p className={`text-xs font-black ${tx.type === 'income' ? 'text-emerald-600' : 'text-gray-900'}`}>
                                                {tx.type === 'income' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setActiveTab("history")}
                                    className="w-full mt-6 py-3 border-2 border-dashed border-gray-100 rounded-2xl text-[10px] font-black uppercase text-gray-400 hover:border-primary hover:text-primary transition-all"
                                >
                                    View Full History
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === "debts" && (
                    <div className="lg:col-span-12 space-y-8">
                        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight">Debt Profiles</h3>
                                    <p className="text-sm font-bold text-gray-400 mt-2">Manage your creditors and payment structures.</p>
                                </div>
                                <button
                                    onClick={openAddDebt}
                                    className="px-6 py-3 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                                >
                                    <Plus size={16} />
                                    Add New Debt
                                </button>
                            </div>

                            {/* Overall Debt Payoff Status */}
                            {debts.length > 0 && (
                                <div className="mb-12 bg-gray-50/50 p-8 md:p-10 rounded-[2.5rem] border border-gray-100">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                                        <h4 className="text-xl font-black uppercase tracking-tight text-gray-900">Debt Payoff Status</h4>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Remaining</p>
                                                <p className="text-lg font-black text-primary">₹{debts.reduce((acc, d) => acc + d.remainingAmount, 0).toLocaleString()}</p>
                                            </div>
                                            <div className="w-px h-10 bg-gray-200" />
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Overall Progress</p>
                                                <p className="text-lg font-black text-emerald-600">
                                                    {debts.reduce((acc, d) => acc + d.initialAmount, 0) > 0
                                                        ? Math.round((1 - (debts.reduce((acc, d) => acc + d.remainingAmount, 0) / debts.reduce((acc, d) => acc + d.initialAmount, 0))) * 100)
                                                        : 0}%
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                        {debts.map(debt => {
                                            const paid = debt.initialAmount - debt.remainingAmount;
                                            const progress = debt.initialAmount > 0 ? (paid / debt.initialAmount) * 100 : 0;
                                            return (
                                                <div key={debt.id} className="space-y-3">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-xs font-black uppercase tracking-widest text-gray-900 truncate pr-4">{debt.name}</span>
                                                        <span className="text-xs font-black text-gray-900">{Math.round(progress)}%</span>
                                                    </div>
                                                    <div className="h-3 bg-white rounded-full overflow-hidden border border-gray-100">
                                                        <div
                                                            className="h-full bg-primary rounded-full transition-all duration-1000"
                                                            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                                        <span className="text-gray-400">Paid: <span className="text-gray-900">₹{paid.toLocaleString()}</span></span>
                                                        <span className="text-gray-400">Left: <span className="text-primary">₹{debt.remainingAmount.toLocaleString()}</span></span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                {debts.map(debt => (
                                    <div key={debt.id} className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all group">
                                        <div className="flex items-center gap-5 flex-1">
                                            <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                                                <CreditCard size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="text-base font-black text-gray-900 truncate">{debt.name}</h4>
                                                    <span className={`px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase ${debt.repaymentType === 'split' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {debt.repaymentType || 'Single'}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">
                                                    {debt.notes || 'No payment notes'}
                                                    {debt.dueDate && ` • Due ${new Date(debt.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-8 md:gap-12">
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Remaining</p>
                                                <p className="text-sm font-black text-primary">₹{debt.remainingAmount.toLocaleString()}</p>
                                            </div>
                                            <div className="text-right hidden sm:block">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total</p>
                                                <p className="text-xs font-bold text-gray-600">₹{debt.initialAmount.toLocaleString()}</p>
                                            </div>
                                            <div className="w-24 hidden lg:block">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Progress</p>
                                                <div className="h-1.5 bg-white rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary"
                                                        style={{ width: `${Math.min(100, Math.max(0, ((debt.initialAmount - debt.remainingAmount) / debt.initialAmount) * 100))}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditDebt(debt)}
                                                    className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-primary transition-all border border-transparent hover:border-gray-100"
                                                >
                                                    <ArrowRight size={16} />
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (confirm(`Delete debt ${debt.name}?`)) {
                                                            await fetch(`/api/admin/finance/debts?id=${debt.id}`, { method: "DELETE" });
                                                            fetchData();
                                                        }
                                                    }}
                                                    className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-red-500 transition-all border border-transparent hover:border-gray-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div >
                    </div >
                )
                }

                {
                    activeTab === "log" && (
                        <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Smart Log Input */}
                            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight">AI Smart Log</h3>
                                    <p className="text-sm font-bold text-gray-400 mt-2">Type your daily entries. I'll automatically detect the amounts and categories.</p>
                                </div>

                                <textarea
                                    value={logInput}
                                    onChange={(e) => setLogInput(e.target.value)}
                                    placeholder="Debts Paid: X - 5000&#10;Expense Food 500 Lunch 200&#10;Income Extra - 1000"
                                    className="w-full h-64 bg-gray-50 border-0 rounded-[2rem] p-8 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium leading-relaxed"
                                />

                                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                                        <AlertCircle size={12} />
                                        Tips
                                    </h4>
                                    <ul className="text-[11px] font-bold text-gray-500 space-y-1">
                                        <li>• Use headers like "Debts Paid:", "Expense", "Income"</li>
                                        <li>• Format: "Item Name - Amount" or "Item Name Amount"</li>
                                        <li>• Multiple entries per line are supported</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Live Preview */}
                            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col h-full">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-xl font-black uppercase tracking-tight">Live Intent Preview</h3>
                                    <div className="px-4 py-1.5 bg-gray-50 rounded-full text-[10px] font-black uppercase text-gray-400">
                                        {parsedEntries.length} Items Detected
                                    </div>
                                </div>

                                <div className="flex-1 overflow-auto space-y-3 pr-2">
                                    <AnimatePresence mode="popLayout">
                                        {parsedEntries.map((entry, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                className={`flex items-center justify-between p-4 rounded-2xl border ${entry.isValid ? 'bg-gray-50 border-gray-100' : 'bg-red-50 border-red-100'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2.5 rounded-xl ${entry.type === 'income' ? 'bg-emerald-500 text-white' : entry.type === 'debt_pay' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'}`}>
                                                        {entry.type === 'income' ? <TrendingUp size={16} /> : entry.type === 'debt_pay' ? <CreditCard size={16} /> : <TrendingDown size={16} />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-black text-gray-900">{entry.item}</span>
                                                            {entry.debtId && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[8px] font-black uppercase rounded">Linked: Debt</span>}
                                                        </div>
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{entry.category}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-gray-900">₹{entry.amount.toLocaleString()}</p>
                                                    {!entry.isValid && <p className="text-[8px] font-black text-red-500 uppercase">Invalid Amount</p>}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {parsedEntries.length === 0 && (
                                        <div className="flex flex-col items-center justify-center h-full text-center p-12 opacity-50">
                                            <LayoutDashboard size={48} className="text-gray-200 mb-4" />
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Waiting for input...</p>
                                        </div>
                                    )}
                                </div>

                                <button
                                    disabled={parsedEntries.length === 0 || parsedEntries.some(e => !e.isValid) || saving}
                                    onClick={handleSaveLog}
                                    className={`w-full mt-8 py-5 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs transition-all flex items-center justify-center gap-3 ${parsedEntries.length > 0 && !parsedEntries.some(e => !e.isValid) ? 'bg-primary text-white shadow-xl shadow-primary/30 hover:scale-105 active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                >
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                    Confirm and Post Entries
                                </button>
                            </div>
                        </div>
                    )
                }

                {
                    activeTab === "history" && (
                        <div className="lg:col-span-12">
                            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tight">Audit Log</h3>
                                        <p className="text-sm font-bold text-gray-400 mt-2">Browse and filter all financial transactions.</p>
                                    </div>
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <div className="relative flex-1 md:w-64">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                type="text"
                                                placeholder="Search items..."
                                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="p-3 bg-gray-50 border-0 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="All">All Categories</option>
                                            {/* Dynamic categories from stats */}
                                            {stats?.categories?.map((cat: any) => (
                                                <option key={cat.category} value={cat.category}>{cat.category}</option>
                                            ))}
                                            {/* Dynamic active debts */}
                                            {stats?.activeDebts?.map((debt: any) => (
                                                <option key={debt.id} value={debt.name}>{debt.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-gray-50">
                                                <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4">Date</th>
                                                <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                                                <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                                                <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                                                <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right pr-4">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {transactions.map((tx) => (
                                                <tr key={tx.id} className="group hover:bg-gray-50 transition-all">
                                                    <td className="py-6 pl-4">
                                                        <span className="text-xs font-bold text-gray-900">{new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                                                    </td>
                                                    <td className="py-6">
                                                        <span className="text-sm font-black text-gray-900 group-hover:text-primary transition-all">{tx.description}</span>
                                                    </td>
                                                    <td className="py-6">
                                                        <span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-500 uppercase tracking-widest">{tx.category}</span>
                                                    </td>
                                                    <td className="py-6">
                                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' :
                                                            tx.type === 'debt_pay' ? 'bg-blue-50 text-blue-600' :
                                                                'bg-red-50 text-red-600'
                                                            }`}>
                                                            {tx.type}
                                                        </span>
                                                    </td>
                                                    <td className="py-6 text-right pr-4">
                                                        <div className="flex items-center justify-end gap-3">
                                                            <span className={`text-sm font-black ${tx.type === 'income' ? 'text-emerald-600' : 'text-gray-900'}`}>
                                                                {tx.type === 'income' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                                                            </span>
                                                            <button
                                                                onClick={async () => {
                                                                    if (confirm("Delete this entry?")) {
                                                                        await fetch(`/api/admin/finance/transactions?id=${tx.id}`, { method: 'DELETE' });
                                                                        fetchData();
                                                                    }
                                                                }}
                                                                className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )
                }
            </main >

            {/* Debt Management Modal */}
            <AnimatePresence>
                {
                    isDebtModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsDebtModalOpen(false)}
                                className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                            <CreditCard size={24} />
                                        </div>
                                        {editingDebt ? "Edit Debt Profile" : "New Debt Profile"}
                                    </h3>
                                    <button
                                        onClick={() => setIsDebtModalOpen(false)}
                                        className="p-3 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-2xl transition-all"
                                    >
                                        <Plus className="rotate-45" size={20} />
                                    </button>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 text-center"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                <form onSubmit={handleSaveDebt} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Creditor Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={debtForm.name}
                                            onChange={(e) => setDebtForm({ ...debtForm, name: e.target.value })}
                                            placeholder="e.g. Bank Loan, Friend X"
                                            className="w-full px-6 py-4 bg-gray-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Initial Amount (₹)</label>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            required
                                            value={debtForm.initialAmount}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === "" || /^\d*\.?\d*$/.test(val)) {
                                                    setDebtForm({ ...debtForm, initialAmount: val });
                                                }
                                            }}
                                            placeholder="0.00"
                                            className="w-full px-6 py-4 bg-gray-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Repayment</label>
                                            <select
                                                value={debtForm.repaymentType}
                                                onChange={(e) => setDebtForm({ ...debtForm, repaymentType: e.target.value as any })}
                                                className="w-full px-6 py-4 bg-gray-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                                            >
                                                <option value="single">Single Payment</option>
                                                <option value="split">Split / EMI</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Target Date</label>
                                            <input
                                                type="date"
                                                value={debtForm.dueDate}
                                                onChange={(e) => setDebtForm({ ...debtForm, dueDate: e.target.value })}
                                                className="w-full px-6 py-4 bg-gray-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {editingDebt && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Current Remaining Balance (₹)</label>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                required
                                                value={debtForm.remainingAmount}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === "" || /^\d*\.?\d*$/.test(val)) {
                                                        setDebtForm({ ...debtForm, remainingAmount: val });
                                                    }
                                                }}
                                                placeholder="0.00"
                                                className="w-full px-6 py-4 bg-primary/5 border-2 border-primary/10 rounded-2xl text-sm font-black text-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                            />
                                            <p className="text-[9px] font-bold text-gray-400 pl-4 italic">* Correction only. Use Smart Log for daily payments.</p>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Payment Notes / Structure</label>
                                        <textarea
                                            value={debtForm.notes}
                                            onChange={(e) => setDebtForm({ ...debtForm, notes: e.target.value })}
                                            placeholder="e.g. 5% Interest, Monthly EMI of 2000"
                                            className="w-full px-6 py-4 bg-gray-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all h-24 resize-none"
                                        />
                                    </div>

                                    <div className="pt-4 flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsDebtModalOpen(false)}
                                            className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="flex-[2] py-4 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                                        >
                                            {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                            {editingDebt ? "Update Profile" : "Create Profile"}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div >
                    )
                }
            </AnimatePresence >
        </div >
    );
}

function StatCard({ title, value, icon: Icon, color }: any) {
    const colors: any = {
        emerald: "text-emerald-500 bg-emerald-50 shadow-emerald-100",
        red: "text-red-500 bg-red-50 shadow-red-100",
        orange: "text-orange-500 bg-orange-50 shadow-orange-100",
        blue: "text-blue-500 bg-blue-50 shadow-blue-100"
    };

    return (
        <div className={`bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4 group hover:-translate-y-1 transition-all`}>
            <div className={`p-4 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{title}</p>
                <h4 className="text-xl font-black text-gray-900 mt-0.5">
                    {typeof value === 'number' ? `₹${value.toLocaleString()}` : value}
                </h4>
            </div>
        </div>
    );
}

function CustomTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-gray-100 shadow-2xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-xs font-bold text-gray-900 uppercase">{entry.name}:</span>
                        <span className="text-xs font-black text-gray-900">₹{entry.value.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
}
