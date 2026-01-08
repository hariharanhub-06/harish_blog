"use client";

import { useEffect, useState } from "react";
import {
    Plus,
    Trash2,
    Edit3,
    Save,
    X,
    Loader2,
    Ticket,
    Check,
    ToggleLeft,
    ToggleRight
} from "lucide-react";

export default function CouponsModule() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [editing, setEditing] = useState<any>(null);
    const [fetching, setFetching] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setFetching(true);
        try {
            const res = await fetch("/api/admin/coupons");
            if (res.ok) {
                const data = await res.json();
                setCoupons(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setFetching(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/admin/coupons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editing),
            });
            if (res.ok) {
                setEditing(null);
                fetchCoupons();
            } else {
                const error = await res.json();
                alert(error.error || "Failed to save coupon");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will permanently delete this coupon.")) return;
        try {
            const res = await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
            if (res.ok) fetchCoupons();
        } catch (error) {
            console.error(error);
        }
    };

    const toggleStatus = async (coupon: any) => {
        try {
            const res = await fetch("/api/admin/coupons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...coupon, isActive: !coupon.isActive }),
            });
            if (res.ok) fetchCoupons();
        } catch (error) {
            console.error(error);
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
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-gray-900">Manage Coupons</h2>
                {!editing && (
                    <button
                        onClick={() => setEditing({ code: "", discountValue: "", discountType: "percentage", isActive: true })}
                        className="flex items-center space-x-2 bg-primary text-white font-black px-6 py-3 rounded-2xl hover:shadow-xl transition-all"
                    >
                        <Plus size={20} />
                        <span>Create Coupon</span>
                    </button>
                )}
            </div>

            {editing ? (
                <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-8 md:p-12">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-black">{editing.id ? "Edit Coupon" : "New Coupon"}</h3>
                        <button onClick={() => setEditing(null)} className="text-secondary hover:text-red-500 transition-colors">
                            <X size={28} />
                        </button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">Coupon Code</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. SAVER10"
                                    value={editing.code}
                                    onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })}
                                    className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-primary transition-all font-bold placeholder:text-gray-300"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">Discount Type</label>
                                <select
                                    value={editing.discountType}
                                    onChange={(e) => setEditing({ ...editing, discountType: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-primary transition-all font-bold"
                                >
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount (₹)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">Discount Value</label>
                                <input
                                    required
                                    type="number"
                                    placeholder={editing.discountType === 'percentage' ? "e.g. 10" : "e.g. 100"}
                                    value={editing.discountValue}
                                    onChange={(e) => setEditing({ ...editing, discountValue: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-2xl p-5 focus:ring-2 focus:ring-primary transition-all font-bold"
                                />
                            </div>
                            <div className="flex items-center space-x-4 p-5 bg-gray-50 rounded-2xl">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={editing.isActive}
                                    onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })}
                                    className="w-6 h-6 text-primary rounded-lg focus:ring-primary"
                                />
                                <label htmlFor="isActive" className="font-bold cursor-pointer">Active</label>
                            </div>
                        </div>

                        <button
                            disabled={saving}
                            className="w-full bg-primary text-white py-6 rounded-[2rem] font-black text-xl flex items-center justify-center space-x-3 shadow-2xl transition-all disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                            <span>Save Coupon</span>
                        </button>
                    </form>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {coupons.map((coupon) => (
                        <div key={coupon.id} className={`bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden ${!coupon.isActive && 'opacity-60'}`}>
                            <div className={`absolute top-0 right-0 p-4 ${coupon.isActive ? 'text-green-500' : 'text-gray-300'}`}>
                                {coupon.isActive ? <Check size={20} /> : <X size={20} />}
                            </div>

                            <div className="flex items-center space-x-4 mb-6">
                                <div className="p-4 bg-primary/5 text-primary rounded-2xl">
                                    <Ticket size={24} />
                                </div>
                                <h3 className="text-xl font-black">{coupon.code}</h3>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400 font-bold uppercase tracking-wider">Discount</span>
                                    <span className="font-black text-gray-900">
                                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}% Off` : `₹${coupon.discountValue} Off`}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400 font-bold uppercase tracking-wider">Status</span>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${coupon.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                        {coupon.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setEditing(coupon)}
                                        className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                                    >
                                        <Edit3 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(coupon.id)}
                                        className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <button
                                    onClick={() => toggleStatus(coupon)}
                                    className={`p-3 rounded-xl transition-all ${coupon.isActive ? 'bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white' : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'}`}
                                >
                                    {coupon.isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                </button>
                            </div>
                        </div>
                    ))}
                    {coupons.length === 0 && (
                        <div className="col-span-full py-20 bg-gray-50 rounded-[3rem] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-400">
                            <Ticket size={48} className="mb-4 opacity-20" />
                            <p className="font-black text-xl opacity-30 uppercase tracking-widest">No Coupons Created Yet</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
