"use client";

import { useEffect, useState } from "react";
import {
    Plus,
    Trash2,
    Edit3,
    Save,
    X,
    Loader2,
    Image as ImageIcon,
    ExternalLink,
    Eye,
    EyeOff,
    Star,
    TrendingUp,
    ShoppingBag,
    Tag,
    Zap,
    Download
} from "lucide-react";
import Image from "next/image";
import { uploadToImageKit, uploadFromUrl } from "@/lib/imagekit-upload";
import imageKitLoader from "@/lib/imagekitLoader";

const PLATFORMS = ["amazon", "flipkart", "other"];
const CATEGORIES = ["Electronics", "Fashion", "Home & Kitchen", "Books", "Beauty", "Sports", "Toys", "Grocery"];

export default function HariPicksModule() {
    const [products, setProducts] = useState<any[]>([]);
    const [editing, setEditing] = useState<any>(null);
    const [fetching, setFetching] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [filterPlatform, setFilterPlatform] = useState("all");
    const [filterCategory, setFilterCategory] = useState("all");

    useEffect(() => {
        fetchProducts();
    }, [filterPlatform, filterCategory]);

    const fetchProducts = async () => {
        setFetching(true);
        try {
            const params = new URLSearchParams();
            if (filterPlatform !== "all") params.append("platform", filterPlatform);
            if (filterCategory !== "all") params.append("category", filterCategory);

            const res = await fetch(`/api/haripicks/products?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (error) {
            console.error("Failed to fetch products:", error);
        }
        setFetching(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = editing.id ? `/api/haripicks/products/${editing.id}` : "/api/haripicks/products";
            const method = editing.id ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editing),
            });

            const data = await res.json();

            if (res.ok) {
                console.log("Product saved successfully:", data);
                setEditing(null);
                fetchProducts();
            } else {
                console.error("Save failed:", data);
                alert(`Failed to save product: ${data.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Save error:", error);
            alert(`Failed to save product: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will permanently delete this affiliate product.")) return;
        const res = await fetch(`/api/haripicks/products/${id}`, { method: "DELETE" });
        if (res.ok) fetchProducts();
    };

    const toggleStatus = async (product: any) => {
        const res = await fetch(`/api/haripicks/products/${product.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: !product.isActive }),
        });
        if (res.ok) fetchProducts();
    };

    const toggleFeatured = async (product: any) => {
        const res = await fetch(`/api/haripicks/products/${product.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isFeatured: !product.isFeatured }),
        });
        if (res.ok) fetchProducts();
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setUploading(true);
        try {
            const file = e.target.files[0];
            const imagekitUrl = await uploadToImageKit(file, 'haripicks');
            setEditing({ ...editing, imageUrl: imagekitUrl });
        } catch (error) {
            console.error(error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleAutoFetch = async () => {
        if (!editing.affiliateUrl) {
            alert("Please enter an Affiliate URL first.");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/api/haripicks/scrape", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: editing.affiliateUrl }),
            });

            if (res.ok) {
                const data = await res.json();

                // If we got an image URL, try to upload it to ImageKit instead of using external hotlink
                let finalImageUrl = editing.imageUrl;
                if (data.image) {
                    try {
                        setUploading(true);
                        // Using our imagekit helper to upload from external URL
                        const uploadedUrl = await uploadFromUrl(data.image, 'haripicks');
                        finalImageUrl = uploadedUrl;
                    } catch (imgErr) {
                        console.error("Failed to upload external image:", imgErr);
                        // Fallback to the original URL if upload fails (though ImageKit is preferred)
                        finalImageUrl = data.image;
                    } finally {
                        setUploading(false);
                    }
                }

                setEditing({
                    ...editing,
                    title: data.title || editing.title,
                    description: data.description || editing.description,
                    platform: data.platform || editing.platform,
                    discountedPrice: data.discountedPrice || data.price || editing.discountedPrice,
                    originalPrice: data.originalPrice || editing.originalPrice,
                    rating: data.rating || editing.rating,
                    imageUrl: finalImageUrl
                });
            } else {
                alert("Could not fetch details. You may need to enter them manually.");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            alert("Failed to auto-fetch details.");
        } finally {
            setSaving(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">HariPicks Manager</h2>
                    <p className="text-gray-400 text-xs font-medium mt-0.5">Manage affiliate products from Amazon, Flipkart, and more.</p>
                </div>
                {!editing && (
                    <button
                        onClick={() => setEditing({
                            title: "",
                            description: "",
                            originalPrice: "",
                            discountedPrice: "",
                            affiliateUrl: "",
                            platform: "amazon",
                            category: "Electronics",
                            rating: "",
                            isFeatured: false,
                            isActive: true,
                        })}
                        className="flex items-center space-x-2 bg-purple-500 text-white font-black px-4 py-2.5 rounded-xl hover:shadow-2xl transition-all text-xs"
                    >
                        <Plus size={16} />
                        <span>Add New Product</span>
                    </button>
                )}
            </div>

            {!editing && (
                <div className="flex flex-wrap gap-3">
                    <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-gray-50 rounded-xl w-fit">
                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 px-3 py-1.5">Platform:</span>
                        {["all", ...PLATFORMS].map(platform => (
                            <button
                                key={platform}
                                onClick={() => setFilterPlatform(platform)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterPlatform === platform ? "bg-white text-purple-500 shadow-sm" : "text-gray-400 hover:text-gray-900"
                                    }`}
                            >
                                {platform}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-gray-50 rounded-xl w-fit">
                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 px-3 py-1.5">Category:</span>
                        {["all", ...CATEGORIES].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterCategory === cat ? "bg-white text-purple-500 shadow-sm" : "text-gray-400 hover:text-gray-900"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {editing ? (
                <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-6 md:p-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-black">{editing.id ? "Edit Product" : "Create New Product"}</h3>
                        <button onClick={() => setEditing(null)} className="p-1.5 hover:bg-gray-100 rounded-full transition-all">
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Left Column */}
                            <div className="space-y-6">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[8px] font-black uppercase tracking-widest text-purple-500 ml-2">Affiliate URL (Fetch First)</label>
                                        <button
                                            type="button"
                                            onClick={handleAutoFetch}
                                            disabled={saving || uploading}
                                            className="text-[8px] font-black uppercase tracking-widest text-purple-500 hover:text-purple-700 transition-all flex items-center gap-1 bg-purple-50 px-3 py-1.5 rounded-lg"
                                        >
                                            {saving ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />}
                                            Auto-Fetch Details
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <input
                                            required
                                            type="url"
                                            value={editing.affiliateUrl}
                                            onChange={(e) => setEditing({ ...editing, affiliateUrl: e.target.value })}
                                            className="w-full bg-purple-50/30 border-2 border-purple-100/50 rounded-xl p-3.5 focus:ring-2 focus:ring-purple-500 transition-all font-bold text-[10px] pr-12 focus:bg-white"
                                            placeholder="Paste Amazon/Flipkart URL here..."
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-300">
                                            <ShoppingBag size={14} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-2">Product Title</label>
                                    <input
                                        required
                                        type="text"
                                        value={editing.title}
                                        onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                                        className="w-full bg-gray-50 border-0 rounded-xl p-3.5 focus:ring-2 focus:ring-purple-500 transition-all font-bold text-base"
                                        placeholder="e.g. Samsung Galaxy S24 Ultra"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-2">Description</label>
                                    <textarea
                                        value={editing.description || ""}
                                        onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                                        className="w-full bg-gray-50 border-0 rounded-xl p-3.5 focus:ring-2 focus:ring-purple-500 transition-all font-bold text-xs min-h-[80px]"
                                        placeholder="Brief description of the product..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-2">Platform</label>
                                        <select
                                            value={editing.platform}
                                            onChange={(e) => setEditing({ ...editing, platform: e.target.value })}
                                            className="w-full bg-gray-50 border-0 rounded-xl p-3.5 focus:ring-2 focus:ring-purple-500 transition-all font-bold text-xs"
                                        >
                                            {PLATFORMS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-2">Category</label>
                                        <select
                                            value={editing.category}
                                            onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                                            className="w-full bg-gray-50 border-0 rounded-xl p-3.5 focus:ring-2 focus:ring-purple-500 transition-all font-bold text-xs"
                                        >
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-2">Original Price</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={editing.originalPrice || ""}
                                            onChange={(e) => setEditing({ ...editing, originalPrice: e.target.value })}
                                            className="w-full bg-gray-50 border-0 rounded-xl p-3.5 focus:ring-2 focus:ring-purple-500 transition-all font-bold text-xs"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] font-black uppercase tracking-widest text-purple-500 ml-2">Deal Price</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={editing.discountedPrice || ""}
                                            onChange={(e) => setEditing({ ...editing, discountedPrice: e.target.value })}
                                            className="w-full bg-purple-50/30 border-0 rounded-xl p-3.5 focus:ring-2 focus:ring-purple-500 transition-all font-bold text-purple-600 text-xs"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-2">Rating (0-5)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="5"
                                            value={editing.rating || ""}
                                            onChange={(e) => setEditing({ ...editing, rating: e.target.value })}
                                            className="w-full bg-gray-50 border-0 rounded-xl p-3.5 focus:ring-2 focus:ring-purple-500 transition-all font-bold text-xs"
                                            placeholder="4.5"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setEditing({ ...editing, isFeatured: !editing.isFeatured })}
                                        className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${editing.isFeatured ? "bg-amber-50 text-amber-600" : "bg-gray-50 text-gray-400"
                                            }`}
                                    >
                                        <TrendingUp size={14} className="inline mr-1.5" />
                                        {editing.isFeatured ? "Featured" : "Not Featured"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditing({ ...editing, isActive: !editing.isActive })}
                                        className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${editing.isActive ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"
                                            }`}
                                    >
                                        {editing.isActive ? "Active" : "Inactive"}
                                    </button>
                                </div>
                            </div>

                            {/* Right Column - Image Upload */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Product Image</label>
                                <div className="relative group aspect-square bg-gray-50 rounded-[3rem] overflow-hidden border-2 border-dashed border-gray-100 flex items-center justify-center transition-all hover:border-purple-200">
                                    {editing.imageUrl ? (
                                        <Image
                                            loader={imageKitLoader}
                                            src={editing.imageUrl}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                        />
                                    ) : (
                                        <div className="text-center p-8">
                                            <ImageIcon size={48} className="text-gray-200 mx-auto mb-4" />
                                            <p className="text-xs font-black text-gray-400">SELECT IMAGE</p>
                                        </div>
                                    )}
                                    <label className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center cursor-pointer">
                                        <div className="opacity-0 group-hover:opacity-100 bg-white text-purple-500 p-4 rounded-2xl shadow-xl transition-all scale-90 group-hover:scale-100">
                                            {uploading ? <Loader2 className="animate-spin" /> : <Plus size={24} />}
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={saving || uploading}
                            className="w-full bg-purple-600 text-white py-3.5 rounded-xl font-black text-base flex items-center justify-center space-x-2.5 shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 hover:bg-purple-700 mt-4"
                        >
                            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            <span>{editing.id ? "Update Product" : "Publish Product"}</span>
                        </button>
                    </form>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div key={product.id} className={`bg-white p-4 rounded-3xl border transition-all group relative ${product.isActive ? "border-gray-50 shadow-sm hover:shadow-xl" : "border-gray-100 opacity-60 grayscale"}`}>
                            <div className="relative h-48 bg-gray-50 rounded-2xl mb-4 overflow-hidden">
                                {product.imageUrl ? (
                                    <Image
                                        loader={imageKitLoader}
                                        src={product.imageUrl}
                                        alt={product.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-purple-100 font-black text-5xl">{product.title.charAt(0)}</div>
                                )}
                                {product.isFeatured && (
                                    <div className="absolute top-3 right-3 bg-amber-500 text-white px-3 py-1 rounded-full text-[9px] font-black flex items-center gap-1">
                                        <TrendingUp size={12} />
                                        FEATURED
                                    </div>
                                )}
                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-gray-900 uppercase tracking-widest">
                                    {product.platform}
                                </div>
                            </div>

                            <h3 className="text-sm font-black mb-1.5 line-clamp-2 leading-tight">{product.title}</h3>

                            <div className="flex items-baseline gap-1.5 mb-1.5">
                                {product.discountedPrice && (
                                    <>
                                        <span className="text-lg font-black text-purple-600">₹{product.discountedPrice}</span>
                                        {product.originalPrice && (
                                            <>
                                                <span className="text-[10px] font-bold text-gray-300 line-through">₹{product.originalPrice}</span>
                                                {product.discountPercent && (
                                                    <span className="text-[9px] font-black text-emerald-500">{product.discountPercent}% OFF</span>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                                {!product.discountedPrice && product.originalPrice && (
                                    <span className="text-lg font-black text-gray-900">₹{product.originalPrice}</span>
                                )}
                            </div>

                            <div className="flex items-center gap-3 mb-3">
                                {product.rating && (
                                    <div className="flex items-center gap-1">
                                        <Star size={10} className="text-amber-400 fill-amber-400" />
                                        <span className="text-[11px] font-black text-gray-900">{product.rating}</span>
                                    </div>
                                )}
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{product.category}</span>
                            </div>

                            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl mb-3">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                        <Eye size={12} className="text-gray-400" />
                                        <span className="text-[10px] font-black text-gray-900">{product.viewsCount || 0} views</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <ExternalLink size={12} className="text-purple-400" />
                                        <span className="text-[10px] font-black text-purple-600">{product.clicksCount || 0} clicks</span>
                                    </div>
                                </div>
                                <div className="flex gap-1.5">
                                    <button
                                        onClick={() => toggleFeatured(product)}
                                        className={`p-1 rounded-lg transition-colors ${product.isFeatured ? "text-amber-500 hover:bg-amber-50" : "text-gray-400 hover:bg-gray-100"}`}
                                        title="Toggle Featured"
                                    >
                                        <TrendingUp size={14} />
                                    </button>
                                    <button
                                        onClick={() => toggleStatus(product)}
                                        className={`p-1 rounded-lg transition-colors ${product.isActive ? "text-emerald-500 hover:bg-emerald-50" : "text-gray-400 hover:bg-gray-100"}`}
                                        title="Toggle Active/Inactive"
                                    >
                                        {product.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setEditing(product)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-purple-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 transition-all"
                                >
                                    <Edit3 size={12} /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {products.length === 0 && !fetching && (
                        <div className="col-span-full py-20 text-center bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                            <ShoppingBag size={48} className="text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-400 font-bold uppercase tracking-widest">No products found.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
