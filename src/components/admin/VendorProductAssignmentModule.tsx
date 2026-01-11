"use client";

import { useState, useEffect } from "react";
import { Package, Search, Save, Loader2, Building } from "lucide-react";

export default function VendorProductAssignmentModule() {
    const [products, setProducts] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [prodRes, vendRes] = await Promise.all([
                fetch("/api/admin/products"),
                fetch("/api/admin/vendors")
            ]);

            if (prodRes.ok && vendRes.ok) {
                const pData = await prodRes.json();
                const vData = await vendRes.json();
                setProducts(pData);
                setVendors(vData);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignVendor = async (productId: string, vendorId: string) => {
        setUpdating(productId);
        try {
            const res = await fetch("/api/admin/products", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: productId, vendorId }),
            });

            if (res.ok) {
                setProducts(prev => prev.map(p => p.id === productId ? { ...p, vendorId } : p));
            } else {
                alert("Failed to update vendor");
            }
        } catch (error) {
            alert("Error updating vendor");
        } finally {
            setUpdating(null);
        }
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Product Assignment</h1>
                    <p className="text-gray-500 mt-1 font-medium">Assign products to manufacturing partners.</p>
                </div>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-100 focus:border-black focus:ring-0 transition-all font-medium text-gray-900 shadow-sm"
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
            ) : (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Product</th>
                                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Category</th>
                                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Assigned Vendor</th>
                                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-6">
                                        <div className="font-bold text-gray-900">{product.name}</div>
                                        <div className="text-sm text-gray-400">ID: {product.id.slice(0, 8)}...</div>
                                    </td>
                                    <td className="p-6 text-sm font-medium text-gray-600">
                                        {product.category}
                                    </td>
                                    <td className="p-6">
                                        <div className="relative">
                                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <select
                                                value={product.vendorId || ""}
                                                onChange={(e) => handleAssignVendor(product.id, e.target.value)}
                                                disabled={updating === product.id}
                                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl font-medium text-sm focus:border-black focus:ring-0 transition-all shadow-sm"
                                            >
                                                <option value="">Select Vendor...</option>
                                                {vendors.map(v => (
                                                    <option key={v.id} value={v.id}>{v.name}</option>
                                                ))}
                                            </select>
                                            {updating === product.id && (
                                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-black" size={16} />
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        {product.isActive ? (
                                            <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-bold">Active</span>
                                        ) : (
                                            <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full font-bold">Inactive</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
