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
    Filter,
    Flame,
    Zap,
    ChevronDown,
    Check
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
import AnalyticsTab from "./finance/AnalyticsTab";

interface Transaction {
    id: string;
    amount: number;
    description: string;
    category: string;
    type: "expense" | "income" | "debt_pay" | "debt_take";
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
    interestRate: number;
    timePeriod: string;
}

interface Loan {
    id: string;
    borrowerName: string;
    amount: number;
    collectedAmount: number;
    interestRate: number;
    timePeriod: string;
    startDate: string;
    dueDate: string | null;
    notes: string;
    status: "active" | "collected" | "defaulted";
}

interface ParsedEntry {
    type: "expense" | "income" | "debt_pay" | "debt_take" | "loan_collect";
    item: string;
    amount: number;
    category: string;
    debtId?: string;
    loanId?: string;
    isValid: boolean;
}

export default function FinanceModule() {
    const [activeTab, setActiveTab] = useState<"dashboard" | "log" | "debts" | "loans" | "history" | "analytics">("dashboard");
    const [logInput, setLogInput] = useState("");
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const ghostRef = React.useRef<HTMLDivElement>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [debts, setDebts] = useState<Debt[]>([]);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dateRange, setDateRange] = useState("This Month");
    const [filterOpen, setFilterOpen] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [visibleLines, setVisibleLines] = useState({
        income: true,
        expense: true,
        debt_pay: true
    });

    // Debt Modal States
    const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
    const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
    const [error, setError] = useState<string | null>(null);
    // Per-debt Statement Modal States
    const [statementDebt, setStatementDebt] = useState<Debt | null>(null);
    const [statementTx, setStatementTx] = useState<Transaction[]>([]);
    const [statementLoading, setStatementLoading] = useState(false);
    // Category Editing States
    const [editingTxId, setEditingTxId] = useState<string | null>(null);
    const [editingCategory, setEditingCategory] = useState("");
    const [historySearch, setHistorySearch] = useState("");
    const [showAllIncomes, setShowAllIncomes] = useState(false);
    const [showAllExpenses, setShowAllExpenses] = useState(false);

    const [debtForm, setDebtForm] = useState({
        name: "",
        initialAmount: "",
        remainingAmount: "",
        notes: "",
        repaymentType: "single" as "single" | "split",
        dueDate: "",
        interestRate: "",
        timePeriod: ""
    });

    const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
    const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
    const [loanForm, setLoanForm] = useState({
        borrowerName: "",
        amount: "",
        collectedAmount: "",
        interestRate: "",
        timePeriod: "",
        startDate: new Date().toISOString().split('T')[0],
        dueDate: "",
        notes: "",
        status: "active" as "active" | "collected" | "defaulted"
    });

    const sessionId = typeof window !== "undefined" ? localStorage.getItem("admin_sessionId") || "" : "";

    // Fetch initial data
    useEffect(() => {
        fetchData();
    }, [dateRange, selectedCategory, startDate, endDate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let summaryUrl = `/api/admin/finance/summary?range=${dateRange}`;
            let analyticsUrl = `/api/admin/finance/analytics?range=${dateRange}`;

            if (dateRange === "Custom" && startDate && endDate) {
                summaryUrl = `/api/admin/finance/summary?startDate=${startDate}&endDate=${endDate}`;
                analyticsUrl = `/api/admin/finance/analytics?startDate=${startDate}&endDate=${endDate}`;
            }

            const [debtsRes, loansRes, statsRes, transRes, analyticsRes] = await Promise.all([
                fetch("/api/admin/finance/debts", { cache: "no-store", headers: { "X-Session-Id": sessionId } }),
                fetch("/api/admin/finance/loans", { cache: "no-store", headers: { "X-Session-Id": sessionId } }),
                fetch(summaryUrl, { cache: "no-store", headers: { "X-Session-Id": sessionId } }),
                fetch(`/api/admin/finance/transactions?limit=100${selectedCategory !== 'All' ? `&category=${selectedCategory}` : ''}`, { cache: "no-store", headers: { "X-Session-Id": sessionId } }),
                fetch(analyticsUrl, { cache: "no-store", headers: { "X-Session-Id": sessionId } })
            ]);

            if (debtsRes.ok) setDebts(await debtsRes.json());
            if (loansRes.ok) setLoans(await loansRes.json());
            if (statsRes.ok) setStats(await statsRes.json());
            if (transRes.ok) setTransactions(await transRes.json());
            if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
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
        let currentType: "expense" | "income" | "debt_pay" | "debt_take" | "loan_collect" = "expense";

        // Get existing categories for fuzzy matching
        const existingCategories = (stats?.categories || []).map((c: any) => c.category);
        const debtNames = (debts || []).map((d: any) => d.name);

        const lines = logInput.split('\n');
        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;

            // Check for section headers (but don't skip if there's a number on the same line)
            const lowerTrimmed = trimmed.toLowerCase();
            const hasNumber = /\d/.test(trimmed);

            // Check "debt taken" / "new debt" / "borrowed" BEFORE the generic "debt" check
            // so a new-borrowing header isn't swallowed by the debt-payment branch.
            if (lowerTrimmed.includes("debt taken:") || lowerTrimmed.includes("new debt:") || lowerTrimmed.includes("borrowed:")
                || ((lowerTrimmed.includes("debt taken") || lowerTrimmed.includes("new debt") || lowerTrimmed.includes("borrow")) && !hasNumber)) {
                currentType = "debt_take";
                if (!hasNumber) return;
            } else if (lowerTrimmed.includes("debts paid:") || (lowerTrimmed.includes("debt") && !hasNumber)) {
                currentType = "debt_pay";
                if (!hasNumber) return;
            }
            if (lowerTrimmed.includes("expense:") || (lowerTrimmed.startsWith("expense") && !hasNumber)) {
                currentType = "expense";
                if (!hasNumber) return;
            }
            if (lowerTrimmed.includes("income:") || (lowerTrimmed.startsWith("income") && !hasNumber)) {
                currentType = "income";
                if (!hasNumber) return;
            }
            if (lowerTrimmed.includes("loan collect:") || (lowerTrimmed.includes("loan") && lowerTrimmed.includes("collect") && !hasNumber)) {
                currentType = "loan_collect";
                if (!hasNumber) return;
            }

            // Improved parsing: Handle multiple pairs on the same line
            const regex = /([a-zA-Z\s]+)(?:-?\s*)(\d+)/g;
            let match;
            let found = false;

            while ((match = regex.exec(trimmed)) !== null) {
                let item = match[1].trim();
                const amount = parseFloat(match[2]);

                // Strip common header words if they appear at the start of the category
                const headers = ["income:", "income", "expense:", "expense", "debt taken:", "debt taken", "new debt:", "new debt", "borrowed:", "borrowed", "debt:", "debt pay:", "debts paid:", "debts:", "debt", "loan collect:", "loan:"];
                for (const header of headers) {
                    if (item.toLowerCase().startsWith(header)) {
                        item = item.substring(header.length).trim();
                        // If it's empty after stripping, skip it (it was just the header)
                        if (!item) continue;
                    }
                }

                if (item && !isNaN(amount)) {
                    let normalizedCategory = item;
                    let matchedDebtId = undefined;
                    let matchedLoanId = undefined;

                    if (currentType === "debt_pay") {
                        const matchedDebt = debts.find(d =>
                            d.name.toLowerCase() === item.toLowerCase() ||
                            d.name.toLowerCase().includes(item.toLowerCase()) ||
                            item.toLowerCase().includes(d.name.toLowerCase())
                        );
                        normalizedCategory = matchedDebt?.name || "Transfer";
                        matchedDebtId = matchedDebt?.id;
                    } else if (currentType === "debt_take") {
                        // Match an existing debt to top it up; no match means a brand-new debt
                        // will be created (using the typed name) on save.
                        const matchedDebt = debts.find(d =>
                            d.name.toLowerCase() === item.toLowerCase() ||
                            d.name.toLowerCase().includes(item.toLowerCase()) ||
                            item.toLowerCase().includes(d.name.toLowerCase())
                        );
                        normalizedCategory = matchedDebt?.name || item;
                        matchedDebtId = matchedDebt?.id;
                    } else if (currentType === "loan_collect") {
                        const matchedLoan = loans.find(l =>
                            l.borrowerName.toLowerCase() === item.toLowerCase() ||
                            l.borrowerName.toLowerCase().includes(item.toLowerCase()) ||
                            item.toLowerCase().includes(l.borrowerName.toLowerCase())
                        );
                        normalizedCategory = matchedLoan?.borrowerName || "Loan Return";
                        matchedLoanId = matchedLoan?.id;
                    } else {
                        // Specific fuzzy match against existing categories for income/expense
                        const match = existingCategories.find((cat: string) => {
                            const c = cat.toLowerCase();
                            const i = item.toLowerCase();

                            // Skip common generic words from fuzzy matching to avoid false positives
                            if (["income", "expense", "revenue", "debt", "transfer"].includes(c)) {
                                return c === i; // Only exact match for these generic terms
                            }

                            if (c === i) return true;
                            // Only match if one is a significant substring of the other (e.g. "Food" matches "Food Delivery")
                            // And avoid matching very short strings to prevent broad matches
                            if (i.length >= 4 && c.includes(i)) return true;
                            if (c.length >= 4 && i.includes(c)) return true;
                            return false;
                        });
                        if (match) normalizedCategory = match;
                    }

                    entries.push({
                        type: currentType,
                        item,
                        amount,
                        category: normalizedCategory,
                        debtId: matchedDebtId,
                        loanId: matchedLoanId,
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
    }, [logInput, debts, stats]);

    // Autocomplete Logic
    useEffect(() => {
        if (!logInput) {
            setSuggestion(null);
            return;
        }

        const lines = logInput.split('\n');
        const currentLine = lines[lines.length - 1];
        if (!currentLine.trim() || currentLine.endsWith(' ')) {
            setSuggestion(null);
            return;
        }

        // Find the last "word" being typed
        const words = currentLine.trim().split(/\s+/);
        const lastWord = words[words.length - 1];

        if (lastWord.length < 2) {
            setSuggestion(null);
            return;
        }

        // Get all possible suggestion sources
        const sources = [
            ...(stats?.categories || []).map((c: any) => c.category),
            ...(debts || []).map((d: any) => d.name),
            ...(loans || []).map((l: any) => l.borrowerName),
            ...transactions.map(t => t.description)
        ];

        // Unique sources and filter out duplicates
        const uniqueSources = Array.from(new Set(sources));

        // Find match
        const match = uniqueSources.find(s =>
            s.toLowerCase().startsWith(lastWord.toLowerCase()) &&
            s.toLowerCase() !== lastWord.toLowerCase()
        );

        if (match) {
            setSuggestion(match);
        } else {
            setSuggestion(null);
        }
    }, [logInput, stats, debts, transactions]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Tab' && suggestion) {
            e.preventDefault();
            const lines = logInput.split('\n');
            const lastLine = lines[lines.length - 1];
            const lastWordMatch = lastLine.match(/(\S+)$/);
            if (lastWordMatch) {
                const lastWord = lastWordMatch[1];
                const prefix = lastLine.substring(0, lastLine.length - lastWord.length);
                lines[lines.length - 1] = prefix + suggestion;
                setLogInput(lines.join('\n') + ' ');
                setSuggestion(null);
            }
        }
    };

    const handleScroll = () => {
        if (textareaRef.current && ghostRef.current) {
            ghostRef.current.scrollTop = textareaRef.current.scrollTop;
            ghostRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    };

    const handleSaveLog = async () => {
        const validEntries = parsedEntries.filter(e => e.isValid);
        if (validEntries.length === 0) return;

        setSaving(true);
        try {
            for (const entry of validEntries) {
                const res = await fetch("/api/admin/finance/transactions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "X-Session-Id": sessionId },
                    body: JSON.stringify({
                        amount: entry.amount,
                        description: entry.item,
                        category: entry.category,
                        type: entry.type,
                        debtId: entry.debtId,
                        loanId: entry.loanId,
                        date: new Date().toISOString()
                    })
                });

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.details || "Server Error");
                }
            }

            // Keep only invalid entries in the text box
            const invalidLines = parsedEntries.filter(e => !e.isValid).map(e => e.item);
            setLogInput(invalidLines.join('\n'));

            fetchData();
            if (invalidLines.length > 0) {
                alert(`Saved ${validEntries.length} entries. Please check the remaining invalid lines.`);
            } else {
                setLogInput(""); // Clear if everything was valid
            }
        } catch (error: any) {
            console.error("Failed to save log", error);
            alert(`Error saving logs: ${error.message}`);
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
                    remainingAmount: parseFloat(debtForm.remainingAmount || debtForm.initialAmount),
                    interestRate: parseFloat(debtForm.interestRate || "0"),
                    timePeriod: debtForm.timePeriod
                }
                : {
                    ...debtForm,
                    initialAmount: parseFloat(debtForm.initialAmount),
                    remainingAmount: parseFloat(debtForm.initialAmount),
                    interestRate: parseFloat(debtForm.interestRate || "0"),
                    timePeriod: debtForm.timePeriod
                };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", "X-Session-Id": sessionId },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                closeDebtModal();
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

    const closeDebtModal = () => {
        setIsDebtModalOpen(false);
        setEditingDebt(null);
        setDebtForm({ name: "", initialAmount: "", remainingAmount: "", notes: "", repaymentType: "single", dueDate: "", interestRate: "", timePeriod: "" });
        setError(null);
    };

    const openAddDebt = () => {
        setEditingDebt(null);
        setDebtForm({ name: "", initialAmount: "", remainingAmount: "", notes: "", repaymentType: "single", dueDate: "", interestRate: "", timePeriod: "" });
        setError(null);
        setIsDebtModalOpen(true);
    };

    const openStatement = async (debt: Debt) => {
        setStatementDebt(debt);
        setStatementTx([]);
        setStatementLoading(true);
        try {
            const res = await fetch(`/api/admin/finance/transactions?debtId=${debt.id}`, {
                cache: "no-store",
                headers: { "X-Session-Id": sessionId },
            });
            if (res.ok) setStatementTx(await res.json());
        } catch (error) {
            console.error("Failed to fetch debt statement", error);
        } finally {
            setStatementLoading(false);
        }
    };

    const openEditDebt = (debt: Debt) => {
        setEditingDebt(debt);
        setDebtForm({
            name: debt.name,
            initialAmount: debt.initialAmount.toString(),
            remainingAmount: debt.remainingAmount.toString(),
            notes: debt.notes,
            repaymentType: (debt.repaymentType as any) || "single",
            dueDate: debt.dueDate ? new Date(debt.dueDate).toISOString().split('T')[0] : "",
            interestRate: (debt.interestRate || 0).toString(),
            timePeriod: debt.timePeriod || ""
        });
        setError(null);
        setIsDebtModalOpen(true);
    };

    const handleSaveLoan = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = "/api/admin/finance/loans";
            const method = editingLoan ? "PUT" : "POST";
            const body = editingLoan
                ? {
                    ...editingLoan,
                    ...loanForm,
                    amount: parseFloat(loanForm.amount),
                    collectedAmount: parseFloat(loanForm.collectedAmount || "0"),
                    interestRate: parseFloat(loanForm.interestRate || "0")
                }
                : {
                    ...loanForm,
                    amount: parseFloat(loanForm.amount),
                    collectedAmount: parseFloat(loanForm.collectedAmount || "0"),
                    interestRate: parseFloat(loanForm.interestRate || "0")
                };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", "X-Session-Id": sessionId },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                setIsLoanModalOpen(false);
                setEditingLoan(null);
                setLoanForm({ borrowerName: "", amount: "", collectedAmount: "", interestRate: "", timePeriod: "", startDate: new Date().toISOString().split('T')[0], dueDate: "", notes: "", status: "active" });
                setError(null);
                fetchData();
            } else {
                const errData = await res.json();
                setError(errData.error || "Failed to save loan");
            }
        } catch (error) {
            console.error("Failed to save loan", error);
            setError("A network error occurred. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const openAddLoan = () => {
        setEditingLoan(null);
        setLoanForm({ borrowerName: "", amount: "", collectedAmount: "", interestRate: "", timePeriod: "", startDate: new Date().toISOString().split('T')[0], dueDate: "", notes: "", status: "active" });
        setError(null);
        setIsLoanModalOpen(true);
    };

    const openEditLoan = (loan: Loan) => {
        setEditingLoan(loan);
        setLoanForm({
            borrowerName: loan.borrowerName,
            amount: loan.amount.toString(),
            collectedAmount: loan.collectedAmount.toString(),
            interestRate: loan.interestRate.toString(),
            timePeriod: loan.timePeriod || "",
            startDate: loan.startDate ? new Date(loan.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            dueDate: loan.dueDate ? new Date(loan.dueDate).toISOString().split('T')[0] : "",
            notes: loan.notes,
            status: loan.status
        });
        setError(null);
        setIsLoanModalOpen(true);
    };

    const handleDeleteLoan = async (id: string) => {
        if (!confirm("Delete this loan record?")) return;
        try {
            const res = await fetch(`/api/admin/finance/loans?id=${id}`, { method: 'DELETE', headers: { "X-Session-Id": sessionId } });
            if (res.ok) fetchData();
        } catch (error) {
            console.error("Failed to delete loan", error);
        }
    };

    if (loading && !stats) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

    // Period-filtered figures (income & expense cards change with the period selector)
    const summaryData = stats?.summary || [];
    const totalIncome = summaryData.find((s: any) => s.type === "income")?.total || 0;
    const totalExpense = summaryData.find((s: any) => s.type === "expense")?.total || 0;
    const debtPayments = summaryData.find((s: any) => s.type === "debt_pay")?.total || 0;
    const totalExpenseWithDebt = totalExpense + debtPayments;
    const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpenseWithDebt) / totalIncome) * 100).toFixed(1) : "0";

    // All-time balance (true running balance, never period-filtered)
    const allTimeData = stats?.allTimeSummary || [];
    const allTimeIncome = allTimeData.find((s: any) => s.type === "income")?.total || 0;
    const allTimeExpense = allTimeData.find((s: any) => s.type === "expense")?.total || 0;
    const allTimeDebtPay = allTimeData.find((s: any) => s.type === "debt_pay")?.total || 0;
    const totalBalance = allTimeIncome - allTimeExpense - allTimeDebtPay;
    const debtBalance = stats?.debtBalance || 0;
    const loanBalance = stats?.loanBalance || 0;

    return (
        <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        <Wallet className="text-primary" size={28} />
                        Finance Hub
                    </h2>
                </div>
                <div className="flex bg-white dark:bg-[#1e1e1e] p-1 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-x-auto custom-scrollbar no-scrollbar">
                    {["dashboard", "analytics", "log", "debts", "loans", "history"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {tab === "loans" ? "Loans Given" : tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Income" value={totalIncome} icon={TrendingUp} color="emerald" gradient="from-emerald-500/20 to-teal-500/20" />
                <StatCard title="Total Expenses" value={totalExpenseWithDebt} icon={TrendingDown} color="red" gradient="from-rose-500/20 to-orange-500/20" />
                <StatCard title="Total Balance" value={totalBalance} icon={Wallet} color="indigo" gradient="from-[#3b71ca]/20 to-blue-500/20" />
                <StatCard title="Debt Balance" value={debtBalance} icon={CreditCard} color="blue" gradient="from-blue-600/20 to-indigo-600/20" />
                <StatCard title="Total Receivables" value={loanBalance} icon={TrendingUp} color="emerald" gradient="from-teal-600/20 to-emerald-600/20" />
                <StatCard title="Savings Rate" value={`${savingsRate}%`} icon={Zap} color="indigo" gradient="from-indigo-600/20 to-purple-600/20" />
            </div>

            {/* Shared Date Filter */}
            <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-[#1e1e1e] p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-white/10 rounded-xl text-gray-500 dark:text-gray-400">
                        <Calendar size={18} />
                    </div>
                    {/* Custom dark-mode dropdown */}
                    <div className="relative" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setFilterOpen(false); }}>
                        <button
                            onClick={() => setFilterOpen((v) => !v)}
                            className="flex items-center gap-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-200 transition-colors"
                        >
                            {dateRange === "Custom" ? "📅 Custom Range" : dateRange}
                            <ChevronDown size={13} className={`transition-transform ${filterOpen ? "rotate-180" : ""}`} />
                        </button>
                        {filterOpen && (
                            <div className="absolute z-50 top-full left-0 mt-2 w-48 bg-white dark:bg-[#252525] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden">
                                {["Last 30 Days", "Last 6 Months", "This Year", "This Month", "Custom"].map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => { setDateRange(opt); setFilterOpen(false); }}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-xs font-black uppercase tracking-widest transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${dateRange === opt ? "text-primary" : "text-gray-700 dark:text-gray-300"}`}
                                    >
                                        {opt === "Custom" ? "📅 Custom Range" : opt}
                                        {dateRange === opt && <Check size={12} className="text-primary" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {dateRange === "Custom" && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">From</span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary/20 focus:outline-none dark:[color-scheme:dark]"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">To</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary/20 focus:outline-none dark:[color-scheme:dark]"
                            />
                        </div>
                    </motion.div>
                )}
            </div>

            <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {activeTab === "dashboard" && (
                    <>
                        {/* Charts Area */}
                        <div className="lg:col-span-8 space-y-8">
                            <div className="bg-white dark:bg-[#1e1e1e] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                                    <h3 className="font-black text-xl uppercase tracking-tight">Income vs Expense Trend</h3>
                                    <div className="flex items-center gap-4 flex-wrap">
                                        {[
                                            { id: 'income', label: 'Income', color: '#10b981' },
                                            { id: 'expense', label: 'Expenses', color: '#ef4444' },
                                            { id: 'debt_pay', label: 'Debt Payments', color: '#3b82f6' }
                                        ].map((line) => (
                                            <label key={line.id} className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={(visibleLines as any)[line.id]}
                                                    onChange={() => setVisibleLines(prev => ({ ...prev, [line.id]: !(prev as any)[line.id] }))}
                                                    className="w-4 h-4 rounded border-gray-100 text-primary focus:ring-primary/20 accent-primary"
                                                />
                                                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${(visibleLines as any)[line.id] ? 'text-gray-900' : 'text-gray-300'}`}>
                                                    {line.label}
                                                </span>
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: line.color, opacity: (visibleLines as any)[line.id] ? 1 : 0.2 }} />
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={
                                            // Group trend by period (month or day) to combine expense and debt_pay
                                            Array.from((stats?.trend || []).reduce((acc: any, curr: any) => {
                                                if (!acc.has(curr.period)) acc.set(curr.period, { period: curr.period, income: 0, expense: 0, debt_pay: 0 });
                                                const entry = acc.get(curr.period);
                                                if (curr.type === 'income') entry.income += curr.total;
                                                else if (curr.type === 'expense') entry.expense += curr.total;
                                                else if (curr.type === 'debt_pay') entry.debt_pay += curr.total;
                                                return acc;
                                            }, new Map()).values()).map((m: any) => ({
                                                ...m,
                                                totalExpense: m.expense + m.debt_pay
                                            }))
                                        }>
                                            <defs>
                                                <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorDebt" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#94a3b8' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#94a3b8' }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                                            {visibleLines.income && <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorInc)" />}
                                            {visibleLines.expense && <Area type="monotone" dataKey="expense" name="Expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />}
                                            {visibleLines.debt_pay && <Area type="monotone" dataKey="debt_pay" name="Debt Payments" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorDebt)" />}
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Daily Cash Flow Grid (Reference to image) */}
                            <div className="bg-white dark:bg-[#1e1e1e] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                                <h3 className="font-black text-xl uppercase tracking-tight mb-8">Daily Cash Flow</h3>
                                <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-3">
                                    {(analytics?.cashFlowPatterns?.dailyFlow || Array.from({ length: 31 }, (_, i) => ({ day: i + 1, net: 0 }))).map((day: any) => {
                                        const isPositive = day.net > 0;
                                        const isNegative = day.net < 0;
                                        const magnitude = Math.abs(day.net);

                                        return (
                                            <div
                                                key={day.day}
                                                className={`aspect-square rounded-2xl border flex flex-col items-center justify-center p-1 transition-all hover:scale-105 cursor-pointer ${isPositive ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' :
                                                    isNegative ? 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20' :
                                                        'bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/10'
                                                    }`}
                                            >
                                                <span className={`text-sm font-black ${isPositive ? 'text-emerald-700 dark:text-emerald-400' : isNegative ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-gray-400'}`}>{day.day}</span>
                                                {magnitude > 0 && (
                                                    <span className={`text-[8px] font-black uppercase opacity-70 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                                                        ₹{magnitude >= 1000 ? `${Math.round(magnitude / 1000)}k` : Math.round(magnitude)}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex items-center justify-center gap-8 mt-8">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-lg bg-emerald-300" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Positive Flow</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-lg bg-red-300" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Negative Flow</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white dark:bg-[#1e1e1e] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                                    <h3 className="font-black text-lg uppercase tracking-tight mb-8">Top Incomes</h3>
                                    <div className="space-y-8">
                                        {(() => {
                                            const cats = stats?.categories || [];
                                            const incomes = cats.filter((c: any) => c.type === 'income').sort((a: any, b: any) => b.value - a.value);

                                            const COLORS = ['#10b981', '#34d399', '#059669', '#6ee7b7', '#a7f3d0', '#14b8a6', '#0d9488'];

                                            if (incomes.length === 0) return null;

                                            return (
                                                <>
                                                    <div className="space-y-6 pr-2">
                                                        {(showAllIncomes ? incomes : incomes.slice(0, 5)).map((cat: any, i: number) => {
                                                            const total = incomes.reduce((acc: number, curr: any) => acc + curr.value, 0);
                                                            const percentage = (cat.value / total) * 100;
                                                            return (
                                                                <div key={i} className="group/income flex flex-col gap-2">
                                                                    <div className="flex justify-between items-end">
                                                                        <div className="flex flex-col gap-1.5">
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">{cat.category || 'Uncategorized'}</span>
                                                                                {cat.category.toLowerCase() === 'revenue' && (
                                                                                    <button
                                                                                        onClick={async (e) => {
                                                                                            e.stopPropagation();
                                                                                            if (confirm("Rename ALL 'Revenue' entries to 'Loan Commission'?")) {
                                                                                                setSaving(true);
                                                                                                try {
                                                                                                    const r = await fetch(`/api/admin/finance/transactions?category=Revenue`, { headers: { "X-Session-Id": sessionId } });
                                                                                                    const txs = await r.json();
                                                                                                    for (const tx of txs) {
                                                                                                        await fetch("/api/admin/finance/transactions", {
                                                                                                            method: "PUT",
                                                                                                            headers: { "Content-Type": "application/json", "X-Session-Id": sessionId },
                                                                                                            body: JSON.stringify({ id: tx.id, category: "Loan Commission" })
                                                                                                        });
                                                                                                    }
                                                                                                    fetchData();
                                                                                                } finally {
                                                                                                    setSaving(false);
                                                                                                }
                                                                                            }
                                                                                        }}
                                                                                        className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded text-[8px] hover:bg-primary hover:text-white transition-all ml-2"
                                                                                    >
                                                                                        Fix to Loan Commission
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                            <span className="text-sm font-black text-gray-900 dark:text-white">₹{cat.value.toLocaleString()}</span>
                                                                        </div>
                                                                        <span className="text-[10px] font-bold text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg">
                                                                            {percentage.toFixed(1)}%
                                                                        </span>
                                                                    </div>
                                                                    {/* Progress Bar */}
                                                                    <div className="w-full h-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-full overflow-hidden border border-gray-100 dark:border-gray-800">
                                                                        <motion.div
                                                                            initial={{ width: 0 }}
                                                                            animate={{ width: `${Math.max(percentage, 1)}%` }} // Minimum 1%
                                                                            transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                                                                            className="h-full rounded-full"
                                                                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                        {incomes.length > 5 && (
                                                            <button
                                                                onClick={() => setShowAllIncomes(!showAllIncomes)}
                                                                className="text-xs font-bold text-primary mt-4 w-full py-2 bg-primary/5 hover:bg-primary/10 rounded-xl transition"
                                                            >
                                                                {showAllIncomes ? "See Less" : `See ${incomes.length - 5} More`}
                                                            </button>
                                                        )}
                                                    </div>
                                                </>
                                            );
                                        })()}
                                        {(stats?.categories || []).filter((c: any) => c.type === 'income').length === 0 && (
                                            <div className="h-[200px] flex items-center justify-center text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50 rounded-2xl">
                                                No income data
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-[#1e1e1e] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                                    <h3 className="font-black text-lg uppercase tracking-tight mb-8">Top Expenses</h3>
                                    <div className="space-y-8">
                                        {(() => {
                                            const cats = stats?.categories || [];
                                            const expensesOnly = cats.filter((c: any) => c.type === 'expense');
                                            const debtTotal = cats.filter((c: any) => c.type === 'debt_pay').reduce((acc: number, curr: any) => acc + curr.value, 0);

                                            const displayCats = [...expensesOnly];
                                            if (debtTotal > 0) {
                                                displayCats.push({
                                                    category: "Debt Payments",
                                                    value: debtTotal,
                                                    type: "summary",
                                                    isSummary: true
                                                });
                                            }

                                            const sortedCats = displayCats.sort((a, b) => b.value - a.value);
                                            const COLORS = ['#ef4444', '#f87171', '#dc2626', '#fca5a5', '#d97706', '#fbbf24', '#f59e0b'];

                                            if (sortedCats.length === 0) return null;

                                            return (
                                                <>
                                                    <div className="space-y-6 pr-2">
                                                        {(showAllExpenses ? sortedCats : sortedCats.slice(0, 5)).map((cat: any, i: number) => {
                                                            const total = sortedCats.reduce((acc: number, curr: any) => acc + curr.value, 0);
                                                            const percentage = (cat.value / total) * 100;
                                                            return (
                                                                <div key={i} className="flex flex-col gap-2">
                                                                    <div className="flex justify-between items-end">
                                                                        <div className="flex flex-col gap-1.5">
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                                                                <span className={`text-[10px] font-black uppercase tracking-widest ${cat.isSummary ? 'text-primary' : 'text-gray-500'}`}>
                                                                                    {cat.category}
                                                                                </span>
                                                                            </div>
                                                                            <span className="text-sm font-black text-gray-900 dark:text-white">₹{cat.value.toLocaleString()}</span>
                                                                        </div>
                                                                        <span className="text-[10px] font-bold text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg">
                                                                            {percentage.toFixed(1)}%
                                                                        </span>
                                                                    </div>
                                                                    {/* Progress Bar */}
                                                                    <div className="w-full h-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-full overflow-hidden border border-gray-100 dark:border-gray-800">
                                                                        <motion.div
                                                                            initial={{ width: 0 }}
                                                                            animate={{ width: `${Math.max(percentage, 1)}%` }} // Minimum 1%
                                                                            transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                                                                            className="h-full rounded-full"
                                                                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                        {displayCats.length > 5 && (
                                                            <button
                                                                onClick={() => setShowAllExpenses(!showAllExpenses)}
                                                                className="text-xs font-bold text-primary mt-4 w-full py-2 bg-primary/5 hover:bg-primary/10 rounded-xl transition"
                                                            >
                                                                {showAllExpenses ? "See Less" : `See ${displayCats.length - 5} More`}
                                                            </button>
                                                        )}
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Mini Log */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-white dark:bg-[#1e1e1e] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                                <h3 className="font-black text-lg uppercase tracking-tight mb-6 flex items-center gap-2">
                                    <History size={18} className="text-primary" />
                                    Recent Log
                                </h3>
                                <div className="space-y-4">
                                    {transactions.slice(0, 8).map(tx => (
                                        <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-all group">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-xl ${tx.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : tx.type === 'debt_pay' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' : tx.type === 'debt_take' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' : 'bg-red-50 dark:bg-red-500/10 text-red-600'}`}>
                                                    {tx.type === 'income' ? <TrendingUp size={14} /> : tx.type === 'debt_pay' ? <CreditCard size={14} /> : tx.type === 'debt_take' ? <Plus size={14} /> : <TrendingDown size={14} />}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{tx.description}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">{tx.category}</p>
                                                </div>
                                            </div>
                                            <p className={`text-xs font-black ${tx.type === 'income' ? 'text-emerald-600' : tx.type === 'debt_take' ? 'text-amber-600' : 'text-gray-900 dark:text-white'}`}>
                                                {tx.type === 'income' ? '+' : tx.type === 'debt_take' ? '' : '-'} ₹{tx.amount.toLocaleString()}
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
                        <div className="bg-white dark:bg-[#1e1e1e] p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight dark:text-white">Debt Profiles</h3>
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
                                        <h4 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Debt Payoff Status</h4>
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
                                                        ? ((1 - (debts.reduce((acc, d) => acc + d.remainingAmount, 0) / debts.reduce((acc, d) => acc + d.initialAmount, 0))) * 100).toFixed(2)
                                                        : '0.00'}%
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                        {debts.map(debt => {
                                            const paid = debt.initialAmount - debt.remainingAmount;
                                            const progress = debt.initialAmount > 0 ? (paid / debt.initialAmount) * 100 : 0;
                                            return (
                                                <div
                                                    key={debt.id}
                                                    onClick={() => openStatement(debt)}
                                                    title="View statement"
                                                    className="space-y-3 cursor-pointer group/payoff -m-3 p-3 rounded-2xl hover:bg-white dark:hover:bg-white/5 transition-all"
                                                >
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white truncate pr-4 group-hover/payoff:text-primary transition-colors">{debt.name}</span>
                                                        <span className="text-xs font-black text-gray-900 dark:text-white">{progress.toFixed(2)}%</span>
                                                    </div>
                                                    <div className="h-3 bg-white rounded-full overflow-hidden border border-gray-100">
                                                        <div
                                                            className="h-full bg-primary rounded-full transition-all duration-1000"
                                                            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                                        <span className="text-gray-400">Paid: <span className="text-gray-900 dark:text-white">₹{paid.toLocaleString()}</span></span>
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
                                    <div key={debt.id} onClick={() => openStatement(debt)} title="View statement" className="bg-gray-50 dark:bg-white/5 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all group cursor-pointer">
                                        <div className="flex items-center gap-5 flex-1">
                                            <div className="p-3 bg-white dark:bg-[#2a2a2a] rounded-2xl shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                                                <CreditCard size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="text-base font-black text-gray-900 dark:text-white truncate">{debt.name}</h4>
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
                                                    onClick={(e) => { e.stopPropagation(); openEditDebt(debt); }}
                                                    className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-primary transition-all border border-transparent hover:border-gray-100"
                                                >
                                                    <ArrowRight size={16} />
                                                </button>
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        if (confirm(`Delete debt ${debt.name}?`)) {
                                                            await fetch(`/api/admin/finance/debts?id=${debt.id}`, { method: "DELETE", headers: { "X-Session-Id": sessionId } });
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
                            <div className="bg-white dark:bg-[#1e1e1e] p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight dark:text-white">AI Smart Log</h3>
                                    <p className="text-sm font-bold text-gray-400 mt-2">Type your daily entries. I'll automatically detect the amounts and categories. {suggestion && <span className="text-primary animate-pulse ml-2">Press Tab to use "{suggestion}"</span>}</p>
                                </div>

                                <div className="relative group/textarea">
                                    <textarea
                                        ref={textareaRef}
                                        value={logInput}
                                        onChange={(e) => setLogInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        onScroll={handleScroll}
                                        placeholder="Debts Paid: X - 5000&#10;Expense Food 500 Lunch 200&#10;Income Extra - 1000"
                                        className="w-full h-64 bg-gray-50 border-0 rounded-[2rem] p-8 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium leading-relaxed relative z-10 bg-transparent custom-scrollbar resize-none"
                                        spellCheck={false}
                                    />
                                    {suggestion && (
                                        <div
                                            ref={ghostRef}
                                            className="absolute top-0 left-0 w-full h-64 p-8 text-sm font-medium leading-relaxed pointer-events-none text-gray-300 whitespace-pre-wrap overflow-hidden custom-scrollbar"
                                        >
                                            <span className="invisible">{logInput}</span>
                                            <span className="opacity-50">{suggestion.substring(logInput.split(/[\s\n]+/).pop()?.trim().length || 0)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Smart Context Suggestions */}
                                {(() => {
                                    // Determine context based on the last header typed
                                    const lines = logInput.toLowerCase().split('\n');
                                    let currentContext: 'income' | 'expense' | 'debt_pay' | 'debt_take' = 'expense';
                                    for (let i = lines.length - 1; i >= 0; i--) {
                                        const l = lines[i].trim();
                                        if (l.includes('debt taken:') || l.includes('new debt:') || l.includes('borrowed:')) {
                                            currentContext = 'debt_take';
                                            break;
                                        }
                                        if (l.includes('debts paid:') || l.includes('debt:')) {
                                            currentContext = 'debt_pay';
                                            break;
                                        }
                                        if (l.includes('income:') || l.startsWith('income')) {
                                            currentContext = 'income';
                                            break;
                                        }
                                        if (l.includes('expense:') || l.startsWith('expense')) {
                                            currentContext = 'expense';
                                            break;
                                        }
                                    }

                                    const suggestions = (currentContext === 'debt_pay' || currentContext === 'debt_take')
                                        ? debts.map(d => ({
                                            name: d.name,
                                            progress: d.initialAmount > 0 ? ((d.initialAmount - d.remainingAmount) / d.initialAmount) * 100 : 0
                                        }))
                                        : (stats?.categories || [])
                                            .filter((c: any) => c.type === currentContext)
                                            .map((c: any) => ({ name: c.category, progress: 0 }));

                                    if (suggestions.length > 0) {
                                        return (
                                            <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 py-2">Quick Add:</span>
                                                {suggestions.map((s: any) => (
                                                    <button
                                                        key={s.name}
                                                        onClick={() => setLogInput(prev => `${prev}${prev.endsWith('\n') || prev === '' ? '' : '\n'}${s.name} - `)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${currentContext === 'income' ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-100' :
                                                            currentContext === 'debt_take' ? 'bg-amber-50 hover:bg-amber-100 text-amber-600 border-amber-100' :
                                                            currentContext === 'debt_pay' ? (
                                                                s.progress >= 100 ? 'bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-200/50' :
                                                                    s.progress >= 75 ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                                                        s.progress >= 50 ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                                            s.progress >= 25 ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                                                                'bg-red-50 text-red-600 border-red-100'
                                                            ) :
                                                                'bg-red-50 hover:bg-red-100 text-red-600 border-red-100'
                                                            }`}
                                                    >
                                                        {s.name}
                                                    </button>
                                                ))}
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}

                                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                                        <AlertCircle size={12} />
                                        Tips
                                    </h4>
                                    <ul className="text-[11px] font-bold text-gray-500 dark:text-gray-400 space-y-1">
                                        <li>• Use headers like "Debts Paid:", "Expense", "Income"</li>
                                        <li>• "Debt Taken:" adds to pending — matches an existing name or creates a new debt</li>
                                        <li>• Format: "Item Name - Amount" or "Item Name Amount"</li>
                                        <li>• Multiple entries per line are supported</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Live Preview */}
                            <div className="bg-white dark:bg-[#1e1e1e] p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col h-full">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-xl font-black uppercase tracking-tight dark:text-white">Live Intent Preview</h3>
                                    <div className="px-4 py-1.5 bg-gray-50 dark:bg-white/10 rounded-full text-[10px] font-black uppercase text-gray-400 dark:text-gray-300">
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
                                                className={`flex items-center justify-between p-4 rounded-2xl border ${entry.isValid ? 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10' : 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2.5 rounded-xl ${entry.type === 'income' ? 'bg-emerald-500 text-white' : entry.type === 'debt_pay' ? 'bg-blue-500 text-white' : entry.type === 'debt_take' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'}`}>
                                                        {entry.type === 'income' ? <TrendingUp size={16} /> : entry.type === 'debt_pay' ? <CreditCard size={16} /> : entry.type === 'debt_take' ? <Plus size={16} /> : <TrendingDown size={16} />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-black text-gray-900 dark:text-white">{entry.item}</span>
                                                            {entry.type === 'debt_take'
                                                                ? (entry.debtId
                                                                    ? <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-black uppercase rounded">Top-up: {entry.category}</span>
                                                                    : <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-black uppercase rounded">New Debt</span>)
                                                                : entry.debtId && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[8px] font-black uppercase rounded">Linked: Debt</span>}
                                                        </div>
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{entry.category}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-gray-900 dark:text-white">₹{entry.amount.toLocaleString()}</p>
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
                                    disabled={parsedEntries.filter(e => e.isValid).length === 0 || saving}
                                    onClick={handleSaveLog}
                                    className={`w-full mt-8 py-5 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs transition-all flex items-center justify-center gap-3 ${parsedEntries.filter(e => e.isValid).length > 0 ? 'bg-primary text-white shadow-xl shadow-primary/30 hover:scale-105 active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                >
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                    {parsedEntries.some(e => !e.isValid) ? `Save ${parsedEntries.filter(e => e.isValid).length} Valid Entries` : 'Confirm and Post Entries'}
                                </button>
                            </div>
                        </div>
                    )
                }

                {
                    activeTab === "history" && (
                        <div className="lg:col-span-12">
                            <div className="bg-white dark:bg-[#1e1e1e] p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tight dark:text-white">Audit Log</h3>
                                        <p className="text-sm font-bold text-gray-400 mt-2">Browse and filter all financial transactions.</p>
                                    </div>
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <div className="relative flex-1 md:w-64">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                type="text"
                                                value={historySearch}
                                                onChange={(e) => setHistorySearch(e.target.value)}
                                                placeholder="Search items..."
                                                className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-2xl text-xs font-bold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                                            />
                                        </div>
                                        {/* Custom category dropdown */}
                                        <div
                                            className="relative"
                                            onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setFilterOpen(false); }}
                                        >
                                            <button
                                                onClick={() => setFilterOpen((v) => !v)}
                                                className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 border border-gray-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300 transition-colors whitespace-nowrap"
                                            >
                                                {selectedCategory === "All" ? "All Categories" : selectedCategory}
                                                <ChevronDown size={12} className={`transition-transform ${filterOpen ? "rotate-180" : ""}`} />
                                            </button>
                                            {filterOpen && (
                                                <div className="absolute z-50 top-full right-0 mt-2 min-w-[180px] bg-white dark:bg-[#252525] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden">
                                                    {["All", ...(stats?.categories?.map((c: any) => c.category) || []), ...(stats?.activeDebts?.map((d: any) => d.name) || [])].map((opt: string) => (
                                                        <button
                                                            key={opt}
                                                            onClick={() => { setSelectedCategory(opt); setFilterOpen(false); }}
                                                            className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${selectedCategory === opt ? "text-primary" : "text-gray-700 dark:text-gray-300"}`}
                                                        >
                                                            {opt === "All" ? "All Categories" : opt}
                                                            {selectedCategory === opt && <Check size={11} className="text-primary" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
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
                                            {transactions.filter(tx => !historySearch || tx.description?.toLowerCase().includes(historySearch.toLowerCase()) || tx.category?.toLowerCase().includes(historySearch.toLowerCase())).map((tx) => (
                                                <tr key={tx.id} className="group hover:bg-gray-50 transition-all">
                                                    <td className="py-6 pl-4">
                                                        <span className="text-xs font-bold text-gray-900 dark:text-white">{new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                                                    </td>
                                                    <td className="py-6">
                                                        <span className="text-sm font-black text-gray-900 dark:text-white group-hover:text-primary transition-all">{tx.description}</span>
                                                    </td>
                                                    <td className="py-6">
                                                        {editingTxId === tx.id ? (
                                                            <input
                                                                autoFocus
                                                                type="text"
                                                                value={editingCategory}
                                                                onChange={(e) => setEditingCategory(e.target.value)}
                                                                onBlur={async () => {
                                                                    if (editingCategory.trim() && editingCategory !== tx.category) {
                                                                        await fetch("/api/admin/finance/transactions", {
                                                                            method: "PUT",
                                                                            headers: { "Content-Type": "application/json", "X-Session-Id": sessionId },
                                                                            body: JSON.stringify({ id: tx.id, category: editingCategory.trim() })
                                                                        });
                                                                        fetchData();
                                                                    }
                                                                    setEditingTxId(null);
                                                                }}
                                                                onKeyDown={async (e) => {
                                                                    if (e.key === 'Enter') {
                                                                        e.currentTarget.blur();
                                                                    } else if (e.key === 'Escape') {
                                                                        setEditingTxId(null);
                                                                    }
                                                                }}
                                                                className="px-3 py-1 bg-white border border-primary/20 rounded-lg text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-primary/20 w-32"
                                                            />
                                                        ) : (
                                                            <button
                                                                onClick={() => {
                                                                    setEditingTxId(tx.id);
                                                                    setEditingCategory(tx.category);
                                                                }}
                                                                className="px-3 py-1 bg-gray-100 group-hover:bg-primary/5 rounded-lg text-[10px] font-black text-gray-500 group-hover:text-primary uppercase tracking-widest transition-all hover:scale-105"
                                                            >
                                                                {tx.category}
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td className="py-6">
                                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${tx.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' :
                                                            tx.type === 'debt_pay' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' :
                                                                tx.type === 'debt_take' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' :
                                                                    'bg-red-50 dark:bg-red-500/10 text-red-600'
                                                            }`}>
                                                            {tx.type === 'debt_take' ? 'debt taken' : tx.type}
                                                        </span>
                                                    </td>
                                                    <td className="py-6 text-right pr-4">
                                                        <div className="flex items-center justify-end gap-3">
                                                            <span className={`text-sm font-black ${tx.type === 'income' ? 'text-emerald-600' : tx.type === 'debt_take' ? 'text-amber-600' : 'text-gray-900 dark:text-white'}`}>
                                                                {tx.type === 'income' ? '+' : tx.type === 'debt_take' ? '' : '-'} ₹{tx.amount.toLocaleString()}
                                                            </span>
                                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingTxId(tx.id);
                                                                        setEditingCategory(tx.category);
                                                                    }}
                                                                    className="p-2 text-gray-300 hover:text-primary transition-all"
                                                                    title="Edit Category"
                                                                >
                                                                    <ArrowRight size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        if (confirm("Delete this entry?")) {
                                                                            await fetch(`/api/admin/finance/transactions?id=${tx.id}`, { method: 'DELETE', headers: { "X-Session-Id": sessionId } });
                                                                            fetchData();
                                                                        }
                                                                    }}
                                                                    className="p-2 text-gray-300 hover:text-red-500 transition-all"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
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

                {activeTab === "loans" && (
                    <div className="lg:col-span-12 space-y-8">
                        <div className="flex justify-between items-center">
                            <h3 className="font-black text-xl uppercase tracking-tight">Loans Given (Receivables)</h3>
                            <button
                                onClick={openAddLoan}
                                className="px-6 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                            >
                                <Plus size={16} />
                                Add New Loan
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {loans.map((loan) => (
                                <div key={loan.id} className="bg-white dark:bg-[#1e1e1e] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-all">
                                    <div className={`absolute top-0 right-0 px-4 py-1 text-[8px] font-black uppercase tracking-widest rounded-bl-xl ${loan.status === 'active' ? 'bg-emerald-500 text-white' : loan.status === 'collected' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'}`}>
                                        {loan.status}
                                    </div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-3 bg-primary/5 text-primary rounded-2xl">
                                            <TrendingUp size={24} />
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => openEditLoan(loan)} className="p-2 text-gray-300 hover:text-primary transition-all"><ArrowRight size={16} /></button>
                                            <button onClick={() => handleDeleteLoan(loan.id)} className="p-2 text-gray-300 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                    <h4 className="font-black text-lg text-gray-900 dark:text-white">{loan.borrowerName}</h4>
                                    <div className="mt-4 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-gray-400 uppercase">Amount</span>
                                            <span className="text-sm font-black text-gray-900 dark:text-white">₹{loan.amount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-gray-400 uppercase">Collected</span>
                                            <span className="text-sm font-black text-emerald-600">₹{loan.collectedAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-2">
                                            <div
                                                className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                                                style={{ width: `${Math.min(100, (loan.collectedAmount / loan.amount) * 100)}%` }}
                                            />
                                        </div>
                                        {loan.interestRate > 0 && (
                                            <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                                                <span className="text-[10px] font-black text-gray-400 uppercase">Interest Rate</span>
                                                <span className="text-xs font-black text-primary">{loan.interestRate}%</span>
                                            </div>
                                        )}
                                        {loan.timePeriod && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black text-gray-400 uppercase">Period</span>
                                                <span className="text-xs font-bold text-gray-600">{loan.timePeriod}</span>
                                            </div>
                                        )}
                                    </div>
                                    {loan.notes && (
                                        <p className="mt-4 text-[10px] text-gray-400 line-clamp-2">{loan.notes}</p>
                                    )}
                                </div>
                            ))}
                            {loans.length === 0 && (
                                <div className="lg:col-span-3 h-[200px] flex items-center justify-center border-2 border-dashed border-gray-100 rounded-[2.5rem] text-xs font-black text-gray-300 uppercase tracking-widest">
                                    No loans recorded
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "analytics" && <AnalyticsTab analytics={analytics} />}
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
                                onClick={closeDebtModal}
                                className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white dark:bg-[#1e1e1e] w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-2xl font-black tracking-tight dark:text-white flex items-center gap-3">
                                        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                            <CreditCard size={24} />
                                        </div>
                                        {editingDebt ? "Edit Debt Profile" : "New Debt Profile"}
                                    </h3>
                                    <button
                                        onClick={closeDebtModal}
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
                                            className="w-full px-6 py-4 bg-gray-50 dark:bg-white/10 dark:text-white dark:placeholder-gray-500 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
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
                                                className="w-full px-6 py-4 bg-gray-50 dark:bg-white/10 dark:text-white dark:placeholder-gray-500 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Interest Rate (%)</label>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={debtForm.interestRate}
                                                onChange={(e) => setDebtForm({ ...debtForm, interestRate: e.target.value })}
                                                placeholder="0"
                                                className="w-full px-6 py-4 bg-gray-50 dark:bg-white/10 dark:text-white dark:placeholder-gray-500 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Repayment</label>
                                            <select
                                                value={debtForm.repaymentType}
                                                onChange={(e) => setDebtForm({ ...debtForm, repaymentType: e.target.value as any })}
                                                className="w-full px-6 py-4 bg-gray-50 dark:bg-[#2a2a2a] dark:text-white border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                                            >
                                                <option value="single">Single Payment</option>
                                                <option value="split">Split / EMI</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Time Period</label>
                                            <input
                                                type="text"
                                                value={debtForm.timePeriod}
                                                onChange={(e) => setDebtForm({ ...debtForm, timePeriod: e.target.value })}
                                                placeholder="e.g. 1 Year"
                                                className="w-full px-6 py-4 bg-gray-50 dark:bg-white/10 dark:text-white dark:placeholder-gray-500 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Target Date</label>
                                        <input
                                            type="date"
                                            value={debtForm.dueDate}
                                            onChange={(e) => setDebtForm({ ...debtForm, dueDate: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 dark:bg-white/10 dark:text-white border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
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
                                            className="w-full px-6 py-4 bg-gray-50 dark:bg-white/10 dark:text-white dark:placeholder-gray-500 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all h-24 resize-none"
                                        />
                                    </div>

                                    <div className="pt-4 flex gap-4">
                                        <button
                                            type="button"
                                            onClick={closeDebtModal}
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
                {
                    isLoanModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsLoanModalOpen(false)}
                                className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white dark:bg-[#1e1e1e] w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-2xl font-black tracking-tight dark:text-white flex items-center gap-3">
                                        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                            <TrendingUp size={24} />
                                        </div>
                                        {editingLoan ? "Edit Loan Profile" : "New Loan Given"}
                                    </h3>
                                    <button
                                        onClick={() => setIsLoanModalOpen(false)}
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

                                <form onSubmit={handleSaveLoan} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Borrower Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={loanForm.borrowerName}
                                            onChange={(e) => setLoanForm({ ...loanForm, borrowerName: e.target.value })}
                                            placeholder="e.g. Someone Name"
                                            className="w-full px-6 py-4 bg-gray-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Loan Amount (₹)</label>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                required
                                                value={loanForm.amount}
                                                onChange={(e) => setLoanForm({ ...loanForm, amount: e.target.value })}
                                                placeholder="0.00"
                                                className="w-full px-6 py-4 bg-gray-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Interest Rate (%)</label>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={loanForm.interestRate}
                                                onChange={(e) => setLoanForm({ ...loanForm, interestRate: e.target.value })}
                                                placeholder="0"
                                                className="w-full px-6 py-4 bg-gray-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Time Period</label>
                                            <input
                                                type="text"
                                                value={loanForm.timePeriod}
                                                onChange={(e) => setLoanForm({ ...loanForm, timePeriod: e.target.value })}
                                                placeholder="e.g. 6 Months"
                                                className="w-full px-6 py-4 bg-gray-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Status</label>
                                            <select
                                                value={loanForm.status}
                                                onChange={(e) => setLoanForm({ ...loanForm, status: e.target.value as any })}
                                                className="w-full px-6 py-4 bg-gray-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                                            >
                                                <option value="active">Active</option>
                                                <option value="collected">Collected</option>
                                                <option value="defaulted">Defaulted</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Start Date</label>
                                            <input
                                                type="date"
                                                value={loanForm.startDate}
                                                onChange={(e) => setLoanForm({ ...loanForm, startDate: e.target.value })}
                                                className="w-full px-6 py-4 bg-gray-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Due Date</label>
                                            <input
                                                type="date"
                                                value={loanForm.dueDate}
                                                onChange={(e) => setLoanForm({ ...loanForm, dueDate: e.target.value })}
                                                className="w-full px-6 py-4 bg-gray-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {editingLoan && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Current Collected Amount (₹)</label>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                required
                                                value={loanForm.collectedAmount}
                                                onChange={(e) => setLoanForm({ ...loanForm, collectedAmount: e.target.value })}
                                                className="w-full px-6 py-4 bg-primary/5 border-2 border-primary/10 rounded-2xl text-sm font-black text-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Terms / Notes</label>
                                        <textarea
                                            value={loanForm.notes}
                                            onChange={(e) => setLoanForm({ ...loanForm, notes: e.target.value })}
                                            placeholder="Specific terms or agreement details..."
                                            className="w-full px-6 py-4 bg-gray-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all h-24 resize-none"
                                        />
                                    </div>

                                    <div className="pt-4 flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsLoanModalOpen(false)}
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
                                            {editingLoan ? "Update Loan" : "Record Loan"}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div >
                    )
                }
                {
                    statementDebt && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setStatementDebt(null)}
                                className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white dark:bg-[#1e1e1e] w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-2xl font-black tracking-tight dark:text-white flex items-center gap-3">
                                        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                            <History size={24} />
                                        </div>
                                        {statementDebt.name}
                                    </h3>
                                    <button
                                        onClick={() => setStatementDebt(null)}
                                        className="p-3 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-2xl transition-all"
                                    >
                                        <Plus className="rotate-45" size={20} />
                                    </button>
                                </div>

                                {/* Summary strip */}
                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    <div className="bg-amber-50 dark:bg-amber-500/10 rounded-2xl p-5">
                                        <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Total Borrowed</p>
                                        <p className="text-lg font-black text-amber-600">₹{statementDebt.initialAmount.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl p-5">
                                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Paid</p>
                                        <p className="text-lg font-black text-emerald-600">₹{(statementDebt.initialAmount - statementDebt.remainingAmount).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-primary/5 rounded-2xl p-5">
                                        <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Remaining</p>
                                        <p className="text-lg font-black text-primary">₹{statementDebt.remainingAmount.toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Ledger */}
                                {statementLoading ? (
                                    <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" /></div>
                                ) : statementTx.length === 0 ? (
                                    <div className="h-[160px] flex items-center justify-center text-xs font-black text-gray-300 uppercase tracking-widest border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                                        No transactions for this debt yet
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {statementTx.map((tx) => {
                                            const isBorrow = tx.type === "debt_take";
                                            return (
                                                <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-2.5 rounded-xl ${isBorrow ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'}`}>
                                                            {isBorrow ? <Plus size={16} /> : <CreditCard size={16} />}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-gray-900 dark:text-white">{tx.description}</p>
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                                {isBorrow ? 'Borrowed' : 'Paid'} • {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className={`text-sm font-black ${isBorrow ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                        {isBorrow ? '+' : '−'} ₹{tx.amount.toLocaleString()}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        </div >
                    )
                }
            </AnimatePresence >
        </div >
    );
}

function StatCard({ title, value, icon: Icon, color, gradient }: any) {
    const colors: any = {
        emerald: "bg-emerald-500 shadow-emerald-500/20 text-emerald-500",
        red: "bg-rose-500 shadow-rose-500/20 text-rose-500",
        orange: "bg-amber-500 shadow-amber-500/20 text-amber-500",
        blue: "bg-blue-500 shadow-blue-500/20 text-blue-500",
        indigo: "bg-[#3b71ca] shadow-[#3b71ca]/20 text-[#3b71ca]"
    };

    const bgColors: any = {
        emerald: "bg-emerald-500",
        red: "bg-rose-500",
        orange: "bg-amber-500",
        blue: "bg-blue-500",
        indigo: "bg-[#3b71ca]"
    };

    return (
        <div className="relative group overflow-hidden bg-white dark:bg-[#1e1e1e] rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            {/* Background Gradient Mesh */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
            <div className={`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-[0.05] dark:opacity-[0.1] ${bgColors[color]}`} />

            <div className="relative flex items-center gap-6">
                <div className={`w-16 h-16 rounded-2xl ${bgColors[color]} flex items-center justify-center text-white shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    <Icon size={28} strokeWidth={2.5} />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{title}</p>
                    <h4 className="text-3xl font-black text-gray-900 dark:text-white mt-1 flex items-baseline gap-1 tracking-tight">
                        {!title.includes('%') && <span className="text-sm font-bold opacity-30">₹</span>}
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </h4>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-50 dark:border-gray-800/50 flex items-center justify-between relative">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${bgColors[color]} animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.2)] shadow-${color}-400`} />
                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Real-time Data</span>
                </div>
                <div className={`text-[10px] font-black ${colors[color]} opacity-40 group-hover:opacity-100 transition-all uppercase tracking-widest flex items-center gap-1`}>
                    Insight <ArrowRight size={10} />
                </div>
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
