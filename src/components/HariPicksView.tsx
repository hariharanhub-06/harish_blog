"use client";

import { useEffect, useState, useRef } from "react";
import {
    Search, ShoppingBag, Loader2, SlidersHorizontal, Grid3x3, List,
    ChevronDown, Sparkles, Award, Shield, Zap, TrendingUp, Star, Filter, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import AffiliateProductCard from "@/components/AffiliateProductCard";

const PLATFORMS = ["all", "amazon", "flipkart", "other"];
const CATEGORIES = ["all", "Electronics", "Fashion", "Home & Kitchen", "Books", "Beauty", "Sports", "Toys", "Grocery"];
const SORT_OPTIONS = [
    { value: "featured", label: "Featured" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "discount", label: "Highest Discount" },
    { value: "newest", label: "Newest First" },
];

export default function HariPicksView() {
    const searchParams = useSearchParams();
    const sharedId = searchParams.get("id");

    const [products, setProducts] = useState<any[]>([]);
    const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlatform, setSelectedPlatform] = useState("all");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("featured");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [showFilters, setShowFilters] = useState(true);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        fetchProducts();
        fetchFeatured();
    }, [selectedPlatform, selectedCategory, searchQuery]);

    useEffect(() => {
        if (sharedId && !loading && products.length > 0) {
            const element = document.getElementById(`product-${sharedId}`);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
                // Add a temporary highlight effect
                element.classList.add("ring-2", "ring-purple-500", "ring-offset-4", "ring-offset-slate-950");
                setTimeout(() => {
                    element.classList.remove("ring-2", "ring-purple-500", "ring-offset-4", "ring-offset-slate-950");
                }, 3000);
            }
        }
    }, [sharedId, loading, products]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedPlatform !== "all") params.append("platform", selectedPlatform);
            if (selectedCategory !== "all") params.append("category", selectedCategory);
            if (searchQuery) params.append("search", searchQuery);

            const res = await fetch(`/api/haripicks/products?${params.toString()}`);
            if (res.ok) {
                let data = await res.json();
                data = sortProducts(data, sortBy);
                setProducts(data);
            }
        } catch (error) {
            console.error("Failed to fetch products:", error);
        }
        setLoading(false);
    };

    const fetchFeatured = async () => {
        try {
            const res = await fetch("/api/haripicks/products?featured=true");
            if (res.ok) {
                const data = await res.json();
                setFeaturedProducts(data.slice(0, 6));
            }
        } catch (error) {
            console.error("Failed to fetch featured products:", error);
        }
    };

    const sortProducts = (prods: any[], sort: string) => {
        const sorted = [...prods];
        switch (sort) {
            case "price-low":
                return sorted.sort((a, b) => (a.discountedPrice || a.originalPrice || 0) - (b.discountedPrice || b.originalPrice || 0));
            case "price-high":
                return sorted.sort((a, b) => (b.discountedPrice || b.originalPrice || 0) - (a.discountedPrice || a.originalPrice || 0));
            case "discount":
                return sorted.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
            case "newest":
                return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            default: // featured
                return sorted.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        }
    };

    useEffect(() => {
        setProducts(prev => sortProducts(prev, sortBy));
    }, [sortBy]);

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-950 font-sans selection:bg-purple-500/30 selection:text-purple-200">
            {/* Animated Background Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse capitalize" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-orange-600/20 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-600/10 blur-[100px] rounded-full animate-bounce [animation-duration:10s]" />
                <div className="absolute bottom-[20%] left-[10%] w-[35%] h-[35%] bg-pink-600/10 blur-[110px] rounded-full animate-bounce [animation-duration:12s]" />
            </div>

            {/* Premium Header */}
            <header className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? "bg-slate-900/80 backdrop-blur-xl border-b border-white/10 py-2" : "bg-transparent py-4"}`}>
                <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <motion.div
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-fuchsia-500 to-orange-500 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)] group-hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] group-hover:rotate-6 transition-all duration-500">
                            <ShoppingBag className="text-white drop-shadow-md" size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60 tracking-tighter">
                                HariPicks<span className="text-orange-500">.</span>
                            </h1>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Sparkles size={10} className="text-orange-500 animate-pulse" />
                                Premium Deals
                            </p>
                        </div>
                    </motion.div>

                    {/* Enhanced Search */}
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative flex-1 max-w-xl"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-orange-500/20 rounded-xl blur-md opacity-40 transition-opacity group-focus-within:opacity-100" />
                        <div className="relative flex items-center">
                            <Search className="absolute left-4 text-gray-500 group-focus-within:text-white transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search premium deals..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-5 py-2.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl font-medium text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:bg-white/10 transition-all shadow-xl"
                            />
                        </div>
                    </motion.div>

                    {/* Trust Badges Floating List (Desktop only) */}
                    <div className="hidden xl:flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-green-400">
                                <Shield size={12} /> VERIFIED
                            </div>
                            <div className="flex items-center gap-1.5 text-[8px] text-gray-500 uppercase tracking-tighter">
                                HANDPICKED BY EXPERTS
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Featured Section - Dynamic Slider Feel */}
            <AnimatePresence>
                {featuredProducts.length > 0 && (
                    <section className="relative pt-10 pb-20 px-4">
                        <div className="max-w-7xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="flex items-center justify-between mb-6"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                                        <TrendingUp className="text-orange-500" size={16} />
                                    </div>
                                    <h2 className="text-lg font-black text-white tracking-tight">Trending Now</h2>
                                </div>
                                <div className="text-[9px] font-black text-orange-500 tracking-widest uppercase animate-pulse">
                                    Live Alerts
                                </div>
                            </motion.div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                                {featuredProducts.map((product, idx) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                        whileHover={{ y: -10 }}
                                        className="relative group bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-3 cursor-pointer hover:bg-white/10 transition-all"
                                    >
                                        <div className="absolute -inset-[1px] bg-gradient-to-br from-purple-500/50 to-orange-500/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
                                        <div className="relative">
                                            <div className="aspect-square rounded-2xl overflow-hidden mb-3 bg-slate-900">
                                                {product.imageUrl && (
                                                    <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700" />
                                                )}
                                                {product.discountPercent && (
                                                    <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg">
                                                        -{product.discountPercent}%
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-[11px] font-bold text-gray-300 line-clamp-1 mb-1">{product.title}</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-sm font-black text-white">₹{product.discountedPrice || product.originalPrice}</span>
                                                <span className="text-[10px] text-gray-500 line-through">₹{product.originalPrice}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </AnimatePresence>

            {/* Main Content Grid */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 pb-32">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Floating Sidebar Filter */}
                    <motion.aside
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className={`lg:w-56 flex-shrink-0 ${showFilters ? "block" : "hidden"}`}
                    >
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sticky top-24 shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                                    <Filter size={12} className="text-purple-500" /> Filters
                                </h3>
                                <button
                                    onClick={() => { setSelectedPlatform("all"); setSelectedCategory("all"); }}
                                    className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors"
                                >
                                    RESET
                                </button>
                            </div>

                            {/* Platform */}
                            <div className="mb-8">
                                <h4 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">Platform Selection</h4>
                                <div className="space-y-2">
                                    {PLATFORMS.map((platform) => (
                                        <button
                                            key={platform}
                                            onClick={() => setSelectedPlatform(platform)}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all border ${selectedPlatform === platform
                                                ? "bg-purple-600 border-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                                                : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10"
                                                }`}
                                        >
                                            <span className="capitalize">{platform}</span>
                                            {selectedPlatform === platform && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Categories */}
                            <div>
                                <h4 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">Category Flow</h4>
                                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {CATEGORIES.map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => setSelectedCategory(category)}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all border ${selectedCategory === category
                                                ? "bg-orange-600 border-orange-400 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                                                : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10"
                                                }`}
                                        >
                                            {category}
                                            {selectedCategory === category && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.aside>

                    {/* Product Arena */}
                    <div className="flex-1">
                        {/* Interactive Toolbar */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 mb-8 flex items-center justify-between gap-4 shadow-2xl"
                        >
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="lg:hidden p-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
                                >
                                    <SlidersHorizontal size={14} />
                                </button>
                                <div className="flex flex-col">
                                    <span className="text-lg font-black text-white tracking-tighter">Deal Arena</span>
                                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{products.length} Items Live</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Sort Dropdown */}
                                <div className="relative group">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="appearance-none bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-3 pr-12 rounded-2xl font-bold text-xs cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    >
                                        {SORT_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">{opt.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-white transition-colors" size={16} />
                                </div>

                                {/* View Switcher */}
                                <div className="hidden md:flex p-1 bg-white/5 border border-white/10 rounded-xl">
                                    <button
                                        onClick={() => setViewMode("grid")}
                                        className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-purple-600 text-white shadow-lg" : "text-gray-500 hover:text-white"}`}
                                    >
                                        <Grid3x3 size={16} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-purple-600 text-white shadow-lg" : "text-gray-500 hover:text-white"}`}
                                    >
                                        <List size={16} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Results */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32">
                                <div className="relative">
                                    <div className="w-10 h-10 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                                    <div className="absolute inset-0 w-10 h-10 border-2 border-orange-500/10 border-b-orange-500 rounded-full animate-spin [animation-duration:1.5s]" />
                                </div>
                                <p className="mt-4 text-[9px] font-black text-gray-500 uppercase tracking-widest animate-pulse">Scanning Prices...</p>
                            </div>
                        ) : products.length > 0 ? (
                            <motion.div
                                layout
                                className={viewMode === "grid"
                                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                    : "space-y-6"
                                }
                            >
                                <AnimatePresence mode="popLayout">
                                    {products.map((product, idx) => (
                                        <motion.div
                                            key={product.id}
                                            id={`product-${product.id}`}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            <AffiliateProductCard product={product} viewMode={viewMode} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-40 bg-white/5 backdrop-blur-xl border border-white/10 border-dashed rounded-[40px]"
                            >
                                <X size={64} className="text-gray-700 mx-auto mb-6" />
                                <h3 className="text-2xl font-black text-white mb-3">No Deals in this Sector</h3>
                                <p className="text-gray-500 font-bold mb-8">Try adjusting your spectral filters</p>
                                <button
                                    onClick={() => { setSelectedPlatform("all"); setSelectedCategory("all"); setSearchQuery(""); }}
                                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-orange-500 text-white font-black rounded-2xl hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all"
                                >
                                    RESET ALL FILTERS
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </main>


            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255,255,255,0.2);
                }
            `}</style>
        </div>
    );
}
