"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink, Star, TrendingUp, Tag, ShoppingCart, Zap, ArrowUpRight, Share2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import imageKitLoader from "@/lib/imagekitLoader";

interface AffiliateProductCardProps {
    product: any;
    featured?: boolean;
    viewMode?: "grid" | "list";
}

export default function AffiliateProductCard({ product, featured = false, viewMode = "grid" }: AffiliateProductCardProps) {
    const [imageError, setImageError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [copied, setCopied] = useState(false);

    const trackClick = async () => {
        try {
            await fetch("/api/haripicks/track-click", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: product.id }),
            });
        } catch (error) {
            console.error("Failed to track click:", error);
        }
    };

    const handleCardClick = () => {
        trackClick();
        window.open(product.affiliateUrl, "_blank", "noopener,noreferrer");
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const shareUrl = `${window.location.origin}/business/haripicks?id=${product.id}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Check out this deal: ${product.title}`,
                    text: product.description || `Great deal on HariPicks: ${product.title}`,
                    url: shareUrl,
                });
            } catch (err) {
                console.error("Error sharing:", err);
            }
        } else {
            // Fallback to clipboard
            try {
                await navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error("Failed to copy:", err);
            }
        }
    };

    const getPlatformStyles = (platform: string) => {
        switch (platform?.toLowerCase()) {
            case "amazon":
                return {
                    bg: "bg-amber-500",
                    glow: "shadow-[0_0_20px_rgba(245,158,11,0.3)]",
                    text: "text-amber-500",
                    border: "border-amber-500/20"
                };
            case "flipkart":
                return {
                    bg: "bg-blue-500",
                    glow: "shadow-[0_0_20px_rgba(59,130,246,0.3)]",
                    text: "text-blue-500",
                    border: "border-blue-500/20"
                };
            default:
                return {
                    bg: "bg-purple-500",
                    glow: "shadow-[0_0_20px_rgba(168,85,247,0.3)]",
                    text: "text-purple-500",
                    border: "border-purple-500/20"
                };
        }
    };

    const styles = getPlatformStyles(product.platform);

    // List View Layout
    if (viewMode === "list") {
        return (
            <motion.div
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden group hover:bg-white/10 transition-all duration-500 shadow-2xl"
            >
                <div className="flex gap-4 p-3">
                    {/* Image Area */}
                    <div className="relative w-40 h-40 flex-shrink-0 bg-slate-900 rounded-xl overflow-hidden">
                        {product.imageUrl && !imageError ? (
                            <Image
                                loader={imageKitLoader}
                                src={product.imageUrl}
                                alt={product.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                sizes="160px"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-orange-500/20">
                                <span className="text-5xl font-black text-white/10">{product.title.charAt(0)}</span>
                            </div>
                        )}

                        {/* Animated Glow Border on Image */}
                        <div className="absolute inset-0 border-2 border-white/0 group-hover:border-purple-500/30 rounded-xl transition-all duration-500 pointer-events-none" />

                        {product.discountPercent && product.discountPercent > 0 && (
                            <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-lg text-[9px] font-black shadow-2xl animate-pulse">
                                {product.discountPercent}% OFF
                            </div>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`${styles.bg} text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${styles.glow}`}>
                                    {product.platform}
                                </span>
                                {product.category && (
                                    <span className="bg-white/5 text-gray-500 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase border border-white/5">
                                        {product.category}
                                    </span>
                                )}
                            </div>

                            <h3 className="text-lg font-black text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-orange-400 transition-all duration-500 line-clamp-2 leading-tight">
                                {product.title}
                            </h3>

                            <p className="text-xs text-gray-600 mb-2 line-clamp-3 font-medium">{product.description}</p>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                            <div className="flex items-baseline gap-3">
                                {product.discountedPrice ? (
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-black text-white">₹{product.discountedPrice.toLocaleString()}</span>
                                        {product.originalPrice && (
                                            <span className="text-[10px] font-bold text-gray-700 line-through">₹{product.originalPrice.toLocaleString()}</span>
                                        )}
                                    </div>
                                ) : product.originalPrice ? (
                                    <span className="text-2xl font-black text-white">₹{product.originalPrice.toLocaleString()}</span>
                                ) : null}
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleShare}
                                    className={`p-2.5 rounded-xl border border-white/10 transition-all ${copied ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"}`}
                                    title="Share product"
                                >
                                    <AnimatePresence mode="wait">
                                        {copied ? (
                                            <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                                <Check size={16} />
                                            </motion.div>
                                        ) : (
                                            <motion.div key="share" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                                <Share2 size={16} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </button>
                                <a
                                    href={product.affiliateUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        trackClick();
                                    }}
                                    className="group/btn relative overflow-hidden bg-white text-slate-950 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2"
                                >
                                    <span className="relative z-10 flex items-center gap-1.5">
                                        VIEW <ArrowUpRight size={14} />
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-orange-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                                    <div className="absolute inset-0 bg-white group-hover/btn:opacity-0 transition-opacity duration-500" />
                                    <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 flex items-center justify-center text-white">
                                        <span className="relative z-20 flex items-center gap-1.5">VIEW <ArrowUpRight size={14} /></span>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    // Grid View Layout
    return (
        <motion.div
            whileHover={{ y: -15, scale: 1.02 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="relative h-full flex flex-col group"
        >
            {/* Main Card */}
            <div
                className="relative flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] overflow-hidden flex flex-col shadow-2xl transition-all duration-500 hover:border-white/20 cursor-pointer"
                onClick={handleCardClick}
            >
                {/* Background Glow */}
                <div className={`absolute -inset-2 opacity-0 group-hover:opacity-20 transition-opacity duration-700 blur-2xl rounded-[32px] bg-gradient-to-br from-purple-600 to-orange-500`} />

                {/* Image Section */}
                <div className="relative aspect-[4/5] bg-slate-900 overflow-hidden m-2 rounded-[20px]">
                    {product.imageUrl && !imageError ? (
                        <Image
                            loader={imageKitLoader}
                            src={product.imageUrl}
                            alt={product.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                            sizes="(max-width: 768px) 100vw, 25vw"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-orange-500/20">
                            <span className="text-6xl font-black text-white/5">{product.title.charAt(0)}</span>
                        </div>
                    )}

                    {/* Floating Info */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-center pointer-events-none">
                        <span className={`${styles.bg} text-white px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-2xl ${styles.glow}`}>
                            {product.platform}
                        </span>
                        <button
                            onClick={handleShare}
                            className={`p-2.5 rounded-xl backdrop-blur-md border transition-all pointer-events-auto shadow-lg ${copied ? "bg-emerald-500 text-white border-emerald-400" : "bg-black/30 text-white border-white/20 hover:bg-black/50"}`}
                        >
                            <AnimatePresence mode="wait">
                                {copied ? (
                                    <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                        <Check size={12} />
                                    </motion.div>
                                ) : (
                                    <motion.div key="share" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                        <Share2 size={16} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    </div>

                    {/* Discount Pill */}
                    {product.discountPercent && product.discountPercent > 0 && (
                        <div className="absolute bottom-3 left-3 right-3 bg-white/10 backdrop-blur-md border border-white/10 p-2 rounded-xl flex items-center justify-between">
                            <span className="text-[8px] font-black text-white uppercase tracking-widest">DEAL</span>
                            <span className="bg-red-600 text-white px-2 py-0.5 rounded-md text-[10px] font-black shadow-lg">
                                {product.discountPercent}% OFF
                            </span>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="px-4 pb-4 pt-1 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                        {product.category && (
                            <div className="flex items-center gap-1.5">
                                <Tag size={10} className="text-purple-500" />
                                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{product.category}</span>
                            </div>
                        )}
                    </div>

                    <h3 className="text-sm font-black text-white line-clamp-2 leading-tight group-hover:text-purple-400 transition-colors mb-2">
                        {product.title}
                    </h3>

                    {product.description && (
                        <p className="text-[10px] text-gray-400 font-medium line-clamp-2 mb-3 leading-relaxed">
                            {product.description}
                        </p>
                    )}

                    <div className="flex items-end justify-between gap-3 mt-auto">
                        <div className="flex flex-col">
                            {product.discountedPrice ? (
                                <>
                                    <span className="text-xl font-black text-white">₹{product.discountedPrice.toLocaleString()}</span>
                                    <span className="text-[8px] font-bold text-gray-700 line-through">₹{product.originalPrice.toLocaleString()}</span>
                                </>
                            ) : (
                                <span className="text-xl font-black text-white">₹{product.originalPrice?.toLocaleString()}</span>
                            )}
                        </div>

                        <a
                            href={product.affiliateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                                e.stopPropagation();
                                trackClick();
                            }}
                            className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-xl transition-all duration-300 hover:rotate-6 hover:scale-110 shadow-lg shadow-purple-600/30 flex items-center justify-center"
                        >
                            <ShoppingCart size={16} />
                        </a>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
