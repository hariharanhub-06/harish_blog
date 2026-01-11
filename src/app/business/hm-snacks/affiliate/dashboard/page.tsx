"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ShoppingBag,
    DollarSign,
    TrendingUp,
    LogOut,
    RefreshCw,
    Copy,
    ShieldCheck,
    Star,
    Award,
    ChevronRight,
    User,
    MessageCircle,
    Users,
    Link as LinkIcon,
    PieChart,
    GitBranch,
    ArrowRight,
    ExternalLink,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DownlineNode {
    id: string;
    fullName: string;
    position: 'left' | 'right';
    totalSalesAmount: number;
    totalEarnings: number;
    status: string;
    children: { left: DownlineNode | null, right: DownlineNode | null } | null;
}

interface Stats {
    fullName: string;
    couponCode: string;
    status: string;
    totalOrders: number;
    totalSalesAmount: number;
    totalEarnings: number;
    directEarnings: number;
    level1Earnings: number;
    level2Earnings: number;
    level3Earnings: number;
    pendingBalance: number;
    paidBalance: number;
    currentTier: string;
    commissionRate: number;
    upiId: string;
    downline: { left: DownlineNode | null, right: DownlineNode | null } | null;
}

interface Product {
    id: string;
    name: string;
    pricePerKg: number;
    category: string;
}

export default function AffiliateDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'tree' | 'links' | 'earnings'>('overview');
    const router = useRouter();

    const fetchStats = async () => {
        const id = localStorage.getItem("affiliate_id");
        if (!id) {
            router.push("/business/hm-snacks/affiliate/login");
            return;
        }

        setRefreshing(true);
        try {
            const res = await fetch(`/api/affiliate/stats?id=${id}`);
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            } else {
                localStorage.clear();
                router.push("/business/hm-snacks/affiliate/login");
            }
        } catch (err) {
            console.error("Failed to fetch stats", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/snack-products');
            if (res.ok) {
                const data = await res.json();
                setProducts(data.filter((p: any) => p.isActive));
            }
        } catch (err) {
            console.error("Failed to fetch products", err);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchProducts();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        router.push("/business/hm-snacks/affiliate/login");
    };

    const handleWithdraw = async () => {
        const id = localStorage.getItem("affiliate_id");
        if (!stats || !id) return;

        if (stats.pendingBalance < 500) {
            alert("Minimum payout threshold is ₹500");
            return;
        }

        if (!confirm(`Are you sure you want to withdraw ₹${stats.pendingBalance.toFixed(0)}?`)) return;

        try {
            const res = await fetch("/api/affiliate/payout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    affiliateId: id,
                    amount: stats.pendingBalance,
                    upiId: stats.upiId
                }),
            });

            const data = await res.json();
            if (res.ok) {
                alert("Payout request submitted! It will be processed within 7 days.");
                fetchStats();
            } else {
                alert(data.error || "Failed to submit request");
            }
        } catch (err) {
            alert("Something went wrong");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <RefreshCw className="w-12 h-12 text-orange-500 animate-spin" />
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="min-h-screen bg-[#FDFCFB] text-gray-900 pb-20">
            {/* Top Navbar */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                            <Star size={20} fill="currentColor" />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-black tracking-tight leading-tight">HM Partner Central</h1>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Binary Business Dashboard</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            Live Payout System
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-500 hover:text-red-500 rounded-xl font-bold text-sm transition-all"
                        >
                            <LogOut size={18} />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 mt-10 space-y-8">
                {/* Welcome & Navigation */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600">Merchant Panel</span>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900">
                            Hello, {stats.fullName.split(' ')[0]} ⚡
                        </h2>
                    </div>

                    <div className="flex p-1.5 bg-gray-100 rounded-[2rem] w-fit overflow-x-auto no-scrollbar">
                        {[
                            { id: 'overview', label: 'Overview', icon: PieChart },
                            { id: 'tree', label: 'Binary Tree', icon: GitBranch },
                            { id: 'links', label: 'Marketing', icon: LinkIcon },
                            { id: 'earnings', label: 'Earnings', icon: DollarSign },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-white text-orange-600 shadow-sm" : "text-gray-400 hover:text-gray-900"}`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-8"
                        >
                            {/* Main Banner */}
                            <div className="bg-gradient-to-r from-orange-600 to-pink-600 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-orange-200">
                                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mt-40 blur-3xl underline" />
                                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <span className="px-5 py-2 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                                                Approved ID: {stats.couponCode}
                                            </span>
                                            <span className="px-5 py-2 bg-emerald-500/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-400/30">
                                                {stats.status}
                                            </span>
                                        </div>
                                        <h2 className="text-4xl md:text-6xl font-black leading-[0.9] tracking-tighter">
                                            EARN UP TO <br /><span className="text-orange-200">₹25,000/mo</span>
                                        </h2>
                                        <p className="text-orange-100 font-bold max-w-sm">
                                            Your binary team is growing! Recruit more partners to unlock level 3 commissions.
                                        </p>
                                    </div>

                                    <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/20 min-w-[300px]">
                                        <p className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-80">Total Wallet Balance</p>
                                        <div className="flex items-end gap-2 mb-6">
                                            <span className="text-6xl font-black tracking-tighter italic">₹{stats.pendingBalance.toFixed(0)}</span>
                                            <span className="text-orange-200 font-bold mb-2">Pending</span>
                                        </div>
                                        <button
                                            onClick={handleWithdraw}
                                            disabled={stats.pendingBalance < 500}
                                            className="w-full bg-white text-orange-600 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:scale-[1.05] transition-all disabled:opacity-50 disabled:scale-100"
                                        >
                                            {stats.pendingBalance < 500 ? 'Min. ₹500 required' : 'Withdraw Funds'}
                                        </button>
                                    </div>

                                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                                        <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-80">Your Referral Code</p>
                                        <div className="flex items-center gap-4">
                                            <span className="text-4xl font-black italic tracking-tighter">{stats.couponCode}</span>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(stats.couponCode);
                                                    alert("Code copied!");
                                                }}
                                                className="p-3 bg-white text-orange-600 rounded-xl hover:scale-110 transition-transform shadow-lg"
                                            >
                                                <Copy size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard
                                    icon={<ShoppingBag className="text-blue-500" />}
                                    label="Total Sales"
                                    value={`₹${stats.totalSalesAmount.toFixed(0)}`}
                                    sub={`${stats.totalOrders} total orders`}
                                    color="bg-blue-50"
                                    delay={0.1}
                                />
                                <StatCard
                                    icon={<TrendingUp className="text-orange-500" />}
                                    label="Direct Income"
                                    value={`₹${stats.directEarnings.toFixed(0)}`}
                                    sub="From your personal code"
                                    color="bg-orange-50"
                                    delay={0.2}
                                />
                                <StatCard
                                    icon={<Users className="text-purple-500" />}
                                    label="MLM Income"
                                    value={`₹${(stats.level1Earnings + stats.level2Earnings + stats.level3Earnings).toFixed(0)}`}
                                    sub="Team referral earnings"
                                    color="bg-purple-50"
                                    delay={0.3}
                                />
                                <StatCard
                                    icon={<ShieldCheck className="text-emerald-500" />}
                                    label="Payouts Done"
                                    value={`₹${stats.paidBalance.toFixed(0)}`}
                                    sub="Sent to your UPI"
                                    color="bg-emerald-50"
                                    delay={0.4}
                                />
                            </div>

                            {/* Two Column Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Income Breakdown Component */}
                                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm">
                                    <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                                        <TrendingUp size={24} className="text-orange-500" />
                                        Income Breakdown
                                    </h3>
                                    <div className="space-y-4">
                                        <IncomeBar label="Direct Income" amount={stats.directEarnings} color="bg-orange-500" total={stats.totalEarnings} />
                                        <IncomeBar label="Level 1 Rewards" amount={stats.level1Earnings} color="bg-blue-500" total={stats.totalEarnings} />
                                        <IncomeBar label="Level 2 Rewards" amount={stats.level2Earnings} color="bg-purple-500" total={stats.totalEarnings} />
                                        <IncomeBar label="Level 3 Rewards" amount={stats.level3Earnings} color="bg-pink-500" total={stats.totalEarnings} />
                                    </div>
                                </div>

                                {/* Quick Info */}
                                <div className="bg-gradient-to-br from-gray-900 to-black rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden">
                                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-orange-500/20 rounded-full -mb-24 -mr-24 blur-3xl" />
                                    <div className="relative z-10 flex flex-col justify-between h-full">
                                        <div>
                                            <h3 className="text-2xl font-black mb-6">Partner Policy</h3>
                                            <ul className="space-y-4 text-gray-400 text-sm font-bold">
                                                <li className="flex items-center gap-3"><ChevronRight size={16} className="text-orange-500" /> Weekly Payouts every Monday</li>
                                                <li className="flex items-center gap-3"><ChevronRight size={16} className="text-orange-500" /> Minimum Withdrawal: ₹500</li>
                                                <li className="flex items-center gap-3"><ChevronRight size={16} className="text-orange-500" /> Max commission cap: 20%</li>
                                            </ul>
                                        </div>

                                        <div className="mt-8 flex items-center gap-4 p-5 bg-white/5 rounded-3xl border border-white/10">
                                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-orange-500">
                                                <User size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-gray-500">Self Account ID</p>
                                                <p className="font-black text-lg">HMS-A-{stats.couponCode.replace('HMS', '')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'tree' && (
                        <motion.div
                            key="tree"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[3rem] p-8 md:p-16 border border-gray-100 shadow-sm overflow-x-auto min-h-[600px]"
                        >
                            <div className="text-center mb-16 space-y-4">
                                <h3 className="text-3xl font-black text-gray-900 leading-tight">Your Binary Downline</h3>
                                <p className="text-gray-400 font-bold max-w-lg mx-auto uppercase text-[10px] tracking-widest">Growth Visualization of your referral branches</p>
                            </div>

                            <div className="flex justify-center min-w-[800px]">
                                <div className="relative pt-12">
                                    {/* Root Node */}
                                    <TreeNode name={stats.fullName} isSelf />

                                    {/* Connection Lines (Root to L1) */}
                                    <div className="flex justify-between w-[500px] mx-auto">
                                        <div className="w-1/2 border-t-2 border-l-2 border-gray-200 h-10 rounded-tl-[1.5rem]" />
                                        <div className="w-1/2 border-t-2 border-r-2 border-gray-200 h-10 rounded-tr-[1.5rem]" />
                                    </div>

                                    {/* Level 1 Container */}
                                    <div className="flex justify-between w-[600px] mx-auto">
                                        <div className="flex-1 flex flex-col items-center">
                                            {stats.downline?.left ? (
                                                <>
                                                    <TreeNode name={stats.downline.left.fullName} amount={stats.downline.left.totalSalesAmount} />
                                                    {/* Recursive Connector Placeholder */}
                                                    <div className="flex justify-between w-[200px] mt-4 opacity-50">
                                                        <div className="w-1/2 border-t-2 border-l-2 border-gray-200 h-6" />
                                                        <div className="w-1/2 border-t-2 border-r-2 border-gray-200 h-6" />
                                                    </div>
                                                    <div className="flex justify-between w-[250px]">
                                                        {stats.downline.left.children?.left ? <TreeNode name={stats.downline.left.children.left.fullName} mini /> : <EmptyNode />}
                                                        {stats.downline.left.children?.right ? <TreeNode name={stats.downline.left.children.right.fullName} mini /> : <EmptyNode />}
                                                    </div>
                                                </>
                                            ) : <EmptyNode big />}
                                        </div>

                                        <div className="flex-1 flex flex-col items-center">
                                            {stats.downline?.right ? (
                                                <>
                                                    <TreeNode name={stats.downline.right.fullName} amount={stats.downline.right.totalSalesAmount} />
                                                    <div className="flex justify-between w-[200px] mt-4 opacity-50">
                                                        <div className="w-1/2 border-t-2 border-l-2 border-gray-200 h-6" />
                                                        <div className="w-1/2 border-t-2 border-r-2 border-gray-200 h-6" />
                                                    </div>
                                                    <div className="flex justify-between w-[250px]">
                                                        {stats.downline.right.children?.left ? <TreeNode name={stats.downline.right.children.left.fullName} mini /> : <EmptyNode />}
                                                        {stats.downline.right.children?.right ? <TreeNode name={stats.downline.right.children.right.fullName} mini /> : <EmptyNode />}
                                                    </div>
                                                </>
                                            ) : <EmptyNode big />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'links' && (
                        <motion.div
                            key="links"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-sm overflow-hidden relative">
                                <div className="absolute right-0 top-0 p-12 opacity-5 scale-150 rotate-12">
                                    <LinkIcon size={200} />
                                </div>
                                <div className="relative z-10 max-w-2xl">
                                    <h3 className="text-3xl font-black mb-4">Referral Center</h3>
                                    <p className="text-gray-400 font-bold mb-10">Generate high-converting links for joining new partners or promoting individual snacks.</p>

                                    <div className="space-y-12">
                                        {/* Affiliate Join Link */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 text-sm font-black uppercase text-gray-400 tracking-widest">
                                                <Users size={16} /> Partner Registration Link
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="flex-1 bg-gray-50 border border-gray-100 p-5 rounded-2xl font-bold flex items-center overflow-hidden">
                                                    <code className="text-orange-600 truncate">https://hmsnacks.in/affiliate?ref={stats.couponCode}</code>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(`https://hmsnacks.in/affiliate?ref=${stats.couponCode}`);
                                                        alert("Copied!");
                                                    }}
                                                    className="p-5 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all"
                                                >
                                                    <Copy size={24} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Product Selection Link */}
                                        <div className="space-y-6 pt-10 border-t border-gray-100">
                                            <div className="flex items-center gap-3 text-sm font-black uppercase text-gray-400 tracking-widest">
                                                <ShoppingBag size={16} /> Product Promotion Tool
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {products.slice(0, 6).map(product => (
                                                    <div key={product.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group">
                                                        <div>
                                                            <p className="font-black text-gray-900">{product.name}</p>
                                                            <p className="text-[10px] uppercase font-black text-gray-400">{product.category}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(`https://hmsnacks.in/product/${product.id}?ref=${stats.couponCode}`);
                                                                alert(`Link for ${product.name} copied!`);
                                                            }}
                                                            className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-orange-500 hover:bg-orange-500 hover:text-white transition-all"
                                                        >
                                                            <Copy size={18} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'earnings' && (
                        <motion.div
                            key="earnings"
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="space-y-8"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm flex flex-col justify-between overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                                    <div>
                                        <h3 className="text-3xl font-black mb-8">Payout Status</h3>
                                        <div className="space-y-6 py-6 border-y border-gray-50">
                                            <div className="flex justify-between items-center bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-gray-400 shadow-sm"><ArchiveIcon /></div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-gray-400">Total Cleared Earnings</p>
                                                        <p className="text-2xl font-black">₹{stats.paidBalance.toFixed(0)}</p>
                                                    </div>
                                                </div>
                                                <span className="bg-emerald-50 text-emerald-600 px-6 py-2 rounded-full font-black text-[10px] uppercase border border-emerald-100">Settled</span>
                                            </div>

                                            <div className="flex justify-between items-center bg-orange-50 p-6 rounded-3xl border border-orange-100">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm"><PendingIcon /></div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-orange-400">Next Payout Estimate</p>
                                                        <p className="text-2xl font-black text-orange-600">₹{stats.pendingBalance.toFixed(0)}</p>
                                                    </div>
                                                </div>
                                                <span className="bg-white text-orange-600 px-6 py-2 rounded-full font-black text-[10px] uppercase shadow-sm">Process Batch #102</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <p className="text-gray-400 text-xs font-bold leading-relaxed mb-6">Note: Your payouts are automatically processed every 7 days. If your balance is below ₹500, it rolls over to the next week.</p>
                                        <button className="flex items-center gap-3 text-orange-600 font-black uppercase text-xs hover:gap-4 transition-all">Support & Discrepancies <ArrowRight size={16} /></button>
                                    </div>
                                </div>

                                <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm">
                                    <h3 className="text-2xl font-black mb-8">Registered UPI</h3>
                                    <div className="space-y-8">
                                        <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 text-center space-y-4">
                                            <div className="w-16 h-16 bg-white rounded-3xl mx-auto flex items-center justify-center shadow-sm">
                                                <Users className="text-gray-300" size={32} />
                                            </div>
                                            <p className="font-black text-lg break-all">{stats.upiId}</p>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Primary Withdrawal Method</p>
                                        </div>

                                        <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-start gap-4">
                                            <ShieldCheck className="text-blue-500 shrink-0" size={20} />
                                            <p className="text-xs font-bold text-blue-900 leading-relaxed">Your withdrawal method is secured and KYC verified. Changes require support approval.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

function StatCard({ icon, label, value, sub, color, delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            whileHover={{ y: -8 }}
            className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4 group transition-all hover:shadow-2xl"
        >
            <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
                <h4 className="text-3xl font-black text-gray-900 mb-1">{value}</h4>
                <p className="text-xs font-bold text-gray-300 group-hover:text-gray-400 transition-colors uppercase tracking-widest">{sub}</p>
            </div>
        </motion.div>
    );
}

function IncomeBar({ label, amount, color, total }: any) {
    const percentage = total > 0 ? (amount / total) * 100 : 0;
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <span className="text-xs font-black uppercase tracking-widest text-gray-500">{label}</span>
                <span className="text-sm font-black text-gray-900">₹{amount.toFixed(0)}</span>
            </div>
            <div className="h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    className={`h-full ${color} rounded-full`}
                />
            </div>
        </div>
    );
}

function TreeNode({ name, isSelf, mini, amount }: any) {
    return (
        <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            title={name}
            className={`${mini ? 'w-24 p-3' : isSelf ? 'w-48 p-6' : 'w-40 p-4'} bg-white border border-gray-100 shadow-lg rounded-[1.5rem] flex flex-col items-center gap-2 group hover:border-orange-500 transition-all z-10 mx-auto`}
        >
            <div className={`${mini ? 'w-8 h-8 text-[8px]' : isSelf ? 'w-16 h-16 text-xl' : 'w-12 h-12 text-sm'} ${isSelf ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'} rounded-full flex items-center justify-center font-black group-hover:scale-110 transition-transform`}>
                {name.charAt(0)}
            </div>
            <p className={`${mini ? 'text-[8px]' : 'text-xs'} font-black text-gray-900 truncate w-full text-center leading-tight`}>{name}</p>
            {!mini && amount !== undefined && (
                <p className="text-[10px] font-black text-emerald-500">₹{amount.toFixed(0)}</p>
            )}
        </motion.div>
    );
}

function EmptyNode({ big }: any) {
    return (
        <div className={`${big ? 'w-40 h-32' : 'w-24 h-12'} border-2 border-dashed border-gray-100 rounded-[1.5rem] flex items-center justify-center text-gray-200 uppercase font-black text-[8px] tracking-widest bg-gray-50/30`}>
            Empty Slot
        </div>
    );
}

function ArchiveIcon() { return <ShoppingBag size={24} />; }
function PendingIcon() { return <Clock size={24} />; }
function Clock({ size, className }: any) { return <RefreshCw size={size} className={className} />; }
