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
    Layout
} from "lucide-react";
import Image from "next/image";
import { uploadToImageKit } from "@/lib/imagekit-upload";
import imageKitLoader from "@/lib/imagekitLoader";

const PARTNER_TYPES = ["Supplier", "Distributor", "Sponsor", "Production Partner", "Logistics Partner"];

export default function PartnershipsModule() {
    const [partnerships, setPartnerships] = useState<any[]>([]);
    const [editing, setEditing] = useState<any>(null);
    const [fetching, setFetching] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchPartnerships();
    }, []);

    const fetchPartnerships = async () => {
        setFetching(true);
        try {
            const res = await fetch(`/api/admin/partnerships?t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                console.log("[Partnerships] Fetched data:", data);
                setPartnerships(data);
            } else {
                const err = await res.json();
                console.error("Fetch error:", err);
                // If it's the first time, maybe table is missing
                if (res.status === 500) {
                    alert("Failed to load partnerships. Have you run the SQL script in create_partnerships_table.sql?");
                }
            }
        } catch (error) {
            console.error("Failed to fetch partnerships", error);
        } finally {
            setFetching(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("[Partnerships] handleSave triggered", editing);
        setSaving(true);
        try {
            const url = editing.id ? `/api/admin/partnerships/${editing.id}` : "/api/admin/partnerships";
            const method = editing.id ? "PATCH" : "POST";

            console.log(`[Partnerships] Sending ${method} request to ${url}`);
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editing),
            });
            console.log("[Partnerships] Response received:", res.status);

            if (res.ok) {
                console.log("[Partnerships] Save successful");
                fetchPartnerships();
                setEditing(null);
            } else {
                const err = await res.json();
                console.error("[Partnerships] Save failed:", err);
                alert("Error saving partner: " + (err.error || "Unknown error"));
            }
        } catch (error) {
            console.error("[Partnerships] Network error:", error);
            alert("Network error while saving. Check server logs.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this partner?")) return;
        try {
            const res = await fetch(`/api/admin/partnerships/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchPartnerships();
            } else {
                alert("Failed to delete partner.");
            }
        } catch (error) {
            console.error("Failed to delete partnership", error);
            alert("Network error while deleting.");
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await uploadToImageKit(file);
            setEditing({ ...editing, logo: url });
        } catch (error) {
            alert("Image upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Partnership <span className="text-primary italic">Center</span></h2>
                    <p className="text-secondary font-medium mt-1">Manage brand partners and sponsors displayed on product pages.</p>
                </div>
                <button
                    onClick={() => setEditing({ name: "", logo: "", partnerType: "Supplier", displayOrder: 0, isActive: true })}
                    className="flex items-center space-x-2 bg-primary text-white px-6 py-4 rounded-2xl font-black text-sm hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95"
                >
                    <Plus size={20} />
                    <span>Add New Partner</span>
                </button>
            </div>

            {fetching ? (
                <div className="flex items-center justify-center p-20">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {partnerships.map((partner) => (
                        <div key={partner.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                            <div className="relative aspect-video bg-gray-50 rounded-2xl mb-6 overflow-hidden flex items-center justify-center border border-gray-50 p-4">
                                {partner.logo ? (
                                    <Image
                                        loader={imageKitLoader}
                                        src={partner.logo}
                                        alt={partner.name}
                                        fill
                                        className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <ImageIcon className="text-gray-200" size={48} />
                                )}
                            </div>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 group-hover:text-primary transition-colors">{partner.name}</h3>
                                    <p className="text-xs font-black uppercase tracking-widest text-primary mt-1 opacity-70">{partner.partnerType}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${partner.isActive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                                    {partner.isActive ? "Active" : "Inactive"}
                                </div>
                            </div>
                            <div className="flex gap-2 pt-4 border-t border-gray-50 mt-auto">
                                <button
                                    onClick={() => setEditing(partner)}
                                    className="flex-1 flex items-center justify-center space-x-2 bg-gray-50 text-secondary px-4 py-3 rounded-xl font-black text-xs hover:bg-primary hover:text-white transition-all"
                                >
                                    <Edit3 size={16} />
                                    <span>Edit</span>
                                </button>
                                <button
                                    onClick={() => handleDelete(partner.id)}
                                    className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {editing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditing(null)} />
                    <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
                        <button onClick={() => setEditing(null)} className="absolute top-8 right-8 text-secondary hover:text-gray-900 p-2">
                            <X size={24} />
                        </button>

                        <div className="flex items-center space-x-4 mb-10">
                            <div className="p-4 bg-primary/10 text-primary rounded-2xl">
                                <Layout size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900">{editing.id ? "Edit Partner" : "New Partner"}</h3>
                                <p className="text-secondary font-medium">Configure partner details and branding.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-2">Logo</label>
                                <div className="relative aspect-video bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden flex flex-col items-center justify-center group hover:border-primary transition-colors cursor-pointer" onClick={() => document.getElementById('logo-upload')?.click()}>
                                    {editing.logo ? (
                                        <Image
                                            loader={imageKitLoader}
                                            src={editing.logo}
                                            alt="Logo Preview"
                                            fill
                                            className="object-contain p-4"
                                        />
                                    ) : (
                                        <div className="text-center p-6">
                                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-3 text-secondary group-hover:text-primary group-hover:scale-110 transition-all">
                                                <ImageIcon size={24} />
                                            </div>
                                            <p className="text-xs font-black text-secondary group-hover:text-primary">Click to Upload Logo</p>
                                        </div>
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-2">Partner Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={editing.name}
                                        onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-black text-sm focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all placeholder:text-gray-300"
                                        placeholder="Enter name..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-2">Partner Type</label>
                                    <select
                                        value={editing.partnerType}
                                        onChange={(e) => setEditing({ ...editing, partnerType: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-black text-sm focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                                    >
                                        {PARTNER_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-2">Display Order</label>
                                    <input
                                        type="number"
                                        value={editing.displayOrder}
                                        onChange={(e) => setEditing({ ...editing, displayOrder: parseInt(e.target.value) })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-black text-sm focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-2">Visibility</label>
                                    <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-2xl h-[52px]">
                                        <button
                                            type="button"
                                            onClick={() => setEditing({ ...editing, isActive: true })}
                                            className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${editing.isActive ? "bg-white text-emerald-500 shadow-sm" : "text-gray-400"}`}
                                        >
                                            Active
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditing({ ...editing, isActive: false })}
                                            className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!editing.isActive ? "bg-white text-rose-500 shadow-sm" : "text-gray-400"}`}
                                        >
                                            Inactive
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:shadow-2xl hover:shadow-primary/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                <span>{editing.id ? "Update Partner" : "Create Partner"}</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
