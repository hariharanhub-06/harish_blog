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
    Filter,
    Package,
    IndianRupee,
    Eye,
    EyeOff
} from "lucide-react";
import Image from "next/image";
import { uploadToImageKit } from "@/lib/imagekit-upload";
import imageKitLoader from "@/lib/imagekitLoader";

const CATEGORIES = ["Savories", "Sweets", "Spices", "Ready to Eat"];

export default function SnacksProductModule() {
    const [products, setProducts] = useState<any[]>([]);
    const [editing, setEditing] = useState<any>(null);
    const [fetching, setFetching] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [filterCategory, setFilterCategory] = useState("All");

    useEffect(() => {
        fetchProducts();
    }, [filterCategory]);

    const fetchProducts = async () => {
        setFetching(true);
        const res = await fetch(`/api/snacks/products${filterCategory !== "All" ? `?category=${filterCategory}` : ""}`);
        if (res.ok) {
            const data = await res.json();
            setProducts(data);
        }
        setFetching(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = editing.id ? `/api/snacks/products/${editing.id}` : "/api/snacks/products";
            const method = editing.id ? "PATCH" : "POST";

            // Map pricePoints back to individual fields
            const sanitizedData = {
                ...editing,
                pricePerKg: editing.pricePoints?.find((p: any) => p.unit === "Kg")?.value || null,
                offerPricePerKg: editing.pricePoints?.find((p: any) => p.unit === "Kg")?.offerValue || null,
                pricePerPiece: editing.pricePoints?.find((p: any) => p.unit === "Pcs")?.value || null,
                offerPricePerPiece: editing.pricePoints?.find((p: any) => p.unit === "Pcs")?.offerValue || null,
                stock: typeof editing.stock === "string" && editing.stock === "" ? 0 : parseFloat(editing.stock as any) || 0,
            };

            // Convert empty strings/nulls to proper values
            const normalizeField = (val: any, isFloat = false) => {
                if (val === "" || val === null || val === undefined) return null;
                return isFloat ? parseFloat(val) : parseInt(val);
            };

            sanitizedData.pricePerKg = normalizeField(sanitizedData.pricePerKg, true);
            sanitizedData.offerPricePerKg = normalizeField(sanitizedData.offerPricePerKg, true);
            sanitizedData.pricePerPiece = normalizeField(sanitizedData.pricePerPiece);
            sanitizedData.offerPricePerPiece = normalizeField(sanitizedData.offerPricePerPiece);
            sanitizedData.stock = parseFloat(sanitizedData.stock as any);

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(sanitizedData),
            });

            const data = await res.json();

            if (res.ok) {
                console.log("Product saved successfully:", data);
                setEditing(null);
                fetchProducts();
            } else {
                console.error("Save failed:", data);
                alert(`Failed to save product: ${data.error || "Unknown error"}${data.details ? `\n\nDetails: ${data.details}` : ""}`);
            }
        } catch (error) {
            console.error("Save error:", error);
            alert(`Failed to save product: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will permanently delete the product.")) return;
        const res = await fetch(`/api/snacks/products/${id}`, { method: "DELETE" });
        if (res.ok) fetchProducts();
    };

    const toggleStatus = async (product: any) => {
        const res = await fetch(`/api/snacks/products/${product.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: !product.isActive }),
        });
        if (res.ok) fetchProducts();
    };

    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = document.createElement("img");
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const MAX_WIDTH = 800; // Smaller for product images
                    const scaleSize = MAX_WIDTH / img.width;
                    const width = scaleSize < 1 ? MAX_WIDTH : img.width;
                    const height = scaleSize < 1 ? img.height * scaleSize : img.height;
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    if (ctx) ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL("image/jpeg", 0.7));
                };
            };
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setUploading(true);
        try {
            const file = e.target.files[0];
            // Upload to ImageKit CDN (snacks folder) with AVIF optimization
            const imagekitUrl = await uploadToImageKit(file, 'snacks');
            setEditing({ ...editing, imageUrl: imagekitUrl });
        } catch (error) {
            console.error(error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Product Management</h2>
                    <p className="text-gray-400 font-medium">Manage HM Snacks catalog and inventory.</p>
                </div>
                {!editing && (
                    <button
                        onClick={() => setEditing({
                            name: "",
                            description: "",
                            category: "Savories",
                            pricePoints: [{ value: "", unit: "Kg" }],
                            stock: "",
                            isActive: true
                        })}
                        className="flex items-center space-x-2 bg-pink-500 text-white font-black px-6 py-3 rounded-2xl hover:shadow-2xl transition-all"
                    >
                        <Plus size={20} />
                        <span>Add New Snack</span>
                    </button>
                )}
            </div>

            {!editing && (
                <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-2xl w-fit">
                    {["All", ...CATEGORIES].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterCategory === cat ? "bg-white text-pink-500 shadow-sm" : "text-gray-400 hover:text-gray-900"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {editing ? (
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 md:p-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black">{editing.id ? "Edit Product" : "Create New Product"}</h3>
                        <button onClick={() => setEditing(null)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                            <X size={24} className="text-gray-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid lg:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Product Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={editing.name}
                                        onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                                        className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-pink-500 transition-all font-bold text-lg"
                                        placeholder="e.g. Butter Murukku"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Description</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={editing.description}
                                        onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                                        className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-pink-500 transition-all font-bold"
                                        placeholder="Describe the taste and ingredients..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Category</label>
                                        <select
                                            value={editing.category}
                                            onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                                            className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-pink-500 transition-all font-bold"
                                        >
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Status</label>
                                        <button
                                            type="button"
                                            onClick={() => setEditing({ ...editing, isActive: !editing.isActive })}
                                            className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${editing.isActive ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"
                                                }`}
                                        >
                                            {editing.isActive ? "Enabled" : "Disabled"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Product Image</label>
                                    <div className="relative group aspect-square bg-gray-50 rounded-[3rem] overflow-hidden border-2 border-dashed border-gray-100 flex items-center justify-center transition-all hover:border-pink-200">
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
                                            <div className="opacity-0 group-hover:opacity-100 bg-white text-pink-500 p-4 rounded-2xl shadow-xl transition-all scale-90 group-hover:scale-100">
                                                {uploading ? <Loader2 className="animate-spin" /> : <Plus size={24} />}
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                        </label>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center px-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                            <IndianRupee size={12} /> Pricing Strategy
                                            {editing.pricePoints?.length < 2 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setEditing({
                                                        ...editing,
                                                        pricePoints: [...editing.pricePoints, { value: "", offerValue: "", unit: editing.pricePoints[0].unit === "Kg" ? "Pcs" : "Kg" }]
                                                    })}
                                                    className="ml-4 text-[9px] font-black uppercase text-pink-500 hover:text-pink-600 transition-colors"
                                                >
                                                    + Add Variation
                                                </button>
                                            )}
                                        </label>
                                    </div>

                                    <div className="space-y-3">
                                        {editing.pricePoints?.map((p: any, idx: number) => (
                                            <div key={idx} className="group animate-in fade-in slide-in-from-right duration-300">
                                                <div className="flex gap-3 items-center">
                                                    <div className="relative flex-grow">
                                                        <span className="absolute left-4 top-2 text-[8px] font-black text-gray-400 uppercase tracking-widest">Regular Price</span>
                                                        <input
                                                            type="number"
                                                            placeholder="0.00"
                                                            value={p.value}
                                                            onChange={(e) => {
                                                                const newPoints = [...editing.pricePoints];
                                                                newPoints[idx].value = e.target.value;
                                                                setEditing({ ...editing, pricePoints: newPoints });
                                                            }}
                                                            className="w-full bg-gray-50 border-0 rounded-2xl pt-6 pb-3 px-5 focus:ring-2 focus:ring-pink-500 transition-all font-bold text-lg"
                                                        />
                                                    </div>
                                                    <div className="relative flex-grow">
                                                        <span className="absolute left-4 top-2 text-[8px] font-black text-pink-500 uppercase tracking-widest">Offer Price (Optional)</span>
                                                        <input
                                                            type="number"
                                                            placeholder="0.00"
                                                            value={p.offerValue}
                                                            onChange={(e) => {
                                                                const newPoints = [...editing.pricePoints];
                                                                newPoints[idx].offerValue = e.target.value;
                                                                setEditing({ ...editing, pricePoints: newPoints });
                                                            }}
                                                            className="w-full bg-pink-50/30 border-0 rounded-2xl pt-6 pb-3 px-5 focus:ring-2 focus:ring-pink-500 transition-all font-bold text-lg text-pink-500 placeholder:text-pink-200"
                                                        />
                                                    </div>
                                                    <div className="relative">
                                                        <select
                                                            value={p.unit}
                                                            onChange={(e) => {
                                                                const newPoints = [...editing.pricePoints];
                                                                newPoints[idx].unit = e.target.value;
                                                                setEditing({ ...editing, pricePoints: newPoints });
                                                            }}
                                                            className="appearance-none bg-gray-900 text-white px-6 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-pink-500 border-0 cursor-pointer hover:bg-pink-500 transition-all"
                                                        >
                                                            <option value="Kg">Kg</option>
                                                            <option value="Pcs">Unit</option>
                                                        </select>
                                                    </div>
                                                    {editing.pricePoints.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditing({
                                                                ...editing,
                                                                pricePoints: editing.pricePoints.filter((_: any, i: number = 0) => i !== idx)
                                                            })}
                                                            className="p-3 text-gray-300 hover:text-rose-500 transition-colors"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-2 pt-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Available Stock <span className="text-gray-300 lowercase text-[9px]">(Kg or Units)</span></label>
                                        <input
                                            required
                                            type="number"
                                            value={editing.stock}
                                            onChange={(e) => setEditing({ ...editing, stock: e.target.value })}
                                            className="w-full bg-gray-50 border-0 rounded-xl p-4 focus:ring-2 focus:ring-pink-500 transition-all font-bold text-lg"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={saving || uploading}
                            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center space-x-3 shadow-xl transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                            <span>{editing.id ? "Update Product" : "Publish Product"}</span>
                        </button>
                    </form>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div key={product.id} className={`bg-white p-4 rounded-3xl border transition-all group relative ${product.isActive ? "border-gray-50 shadow-sm hover:shadow-xl" : "border-gray-100 opacity-60 grayscale"}`}>
                            <div className="relative h-40 bg-gray-50 rounded-2xl mb-4 overflow-hidden">
                                {product.imageUrl ? (
                                    <Image
                                        loader={imageKitLoader}
                                        src={product.imageUrl}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-pink-100 font-black text-5xl italic px-4 text-center">{product.name.charAt(0)}</div>
                                )}
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-gray-900 uppercase tracking-widest">
                                    {product.category}
                                </div>
                            </div>

                            <h3 className="text-lg font-black mb-1 line-clamp-1">{product.name}</h3>
                            <div className="flex flex-col gap-1 mb-4">
                                {product.pricePerKg && (
                                    <div className="flex items-center gap-2">
                                        {product.offerPricePerKg ? (
                                            <>
                                                <span className="text-xl font-black text-pink-500">₹{product.offerPricePerKg}</span>
                                                <span className="text-sm font-bold text-gray-300 line-through">₹{product.pricePerKg}</span>
                                            </>
                                        ) : (
                                            <span className="text-xl font-black text-gray-900">₹{product.pricePerKg}</span>
                                        )}
                                        <span className="text-[9px] font-bold text-gray-400 lowercase">per Kg</span>
                                    </div>
                                )}
                                {product.pricePerPiece && (
                                    <div className="flex items-center gap-2">
                                        {product.offerPricePerPiece ? (
                                            <>
                                                <span className="text-xl font-black text-pink-500">₹{product.offerPricePerPiece}</span>
                                                <span className="text-sm font-bold text-gray-300 line-through">₹{product.pricePerPiece}</span>
                                            </>
                                        ) : (
                                            <span className="text-xl font-black text-pink-500">₹{product.pricePerPiece}</span>
                                        )}
                                        <span className="text-[9px] font-bold text-gray-400 lowercase">per Piece</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mb-6">
                                <div className="flex items-center gap-2">
                                    <Package size={14} className="text-gray-400" />
                                    <span className={`text-xs font-black ${product.stock < 10 ? "text-rose-500" : "text-gray-900"}`}>{product.stock} {product.pricePerKg ? 'Kg' : 'Units'}</span>
                                </div>
                                <button
                                    onClick={() => toggleStatus(product)}
                                    className={`p-1.5 rounded-lg transition-colors ${product.isActive ? "text-emerald-500 hover:bg-emerald-50" : "text-gray-400 hover:bg-gray-100"}`}
                                >
                                    {product.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        const pts = [];
                                        if (product.pricePerKg) pts.push({ value: product.pricePerKg, offerValue: product.offerPricePerKg || "", unit: "Kg" });
                                        if (product.pricePerPiece) pts.push({ value: product.pricePerPiece, offerValue: product.offerPricePerPiece || "", unit: "Pcs" });
                                        if (pts.length === 0) pts.push({ value: "", offerValue: "", unit: "Kg" });
                                        setEditing({ ...product, pricePoints: pts });
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all"
                                >
                                    <Edit3 size={14} /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {products.length === 0 && !fetching && (
                        <div className="col-span-full py-20 text-center bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                            <Package size={48} className="text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-400 font-bold uppercase tracking-widest">No products found in this category.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
