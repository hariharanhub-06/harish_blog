"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Phone, RefreshCw, Loader2, MessageCircle, ExternalLink, Calendar, Package } from "lucide-react";

export default function AbandonedCartsModule() {
    const [carts, setCarts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCarts();
    }, []);

    const fetchCarts = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/snacks/cart/track");
            if (res.ok) {
                const data = await res.json();
                setCarts(data);
            }
        } catch (error) {
            console.error("Failed to fetch abandoned carts:", error);
        } finally {
            setLoading(false);
        }
    };

    const sendWhatsAppRecovery = (cart: any) => {
        const cartUrl = `https://hariharanhub.com/business/hm-snacks?cart=${cart.id}`;
        const message = `Hi ${cart.customerName || 'there'}! We noticed you left some snacks in your cart at HM Snacks. 🍪\n\nWould you like a special 5% OFF to complete your order? Just let us know! \n\nCheck your cart here: ${cartUrl}`;
        const url = `https://wa.me/${cart.customerMobile}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight italic">Abandoned <span className="text-pink-500">Carts</span></h2>
                    <p className="text-gray-400 text-[10px] font-medium uppercase tracking-widest">Follow up with customers who didn't finish their purchase.</p>
                </div>
                <button
                    onClick={fetchCarts}
                    className="p-2 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-all text-gray-400 hover:text-gray-900 shadow-sm"
                >
                    <RefreshCw size={16} />
                </button>
            </div>

            <div className="grid gap-4">
                {carts.map((cart) => (
                    <div
                        key={cart.id}
                        className="bg-white p-4 rounded-2xl border border-gray-100 hover:shadow-lg transition-all"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="space-y-3 flex-1">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center">
                                        <ShoppingCart size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-base text-gray-900 italic">
                                            {cart.customerName || "Anonymous Guest"}
                                        </h4>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                                            <Calendar size={10} />
                                            {new Date(cart.createdAt).toLocaleString()}
                                            <span className="text-pink-200">|</span>
                                            <span className="text-pink-500 font-black uppercase tracking-widest text-[9px]">{cart.lastStep}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                    {cart.items.map((item: any, idx: number) => (
                                        <div key={idx} className="bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 flex items-center gap-1.5">
                                            <Package size={8} className="text-gray-400" />
                                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                                                {item.name} ({item.quantity}{item.unit})
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2 w-full md:w-auto">
                                {cart.customerMobile && (
                                    <button
                                        onClick={() => sendWhatsAppRecovery(cart)}
                                        className="flex-1 md:flex-none border-2 border-emerald-500 text-emerald-500 px-4 py-2 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 hover:bg-emerald-500 hover:text-white transition-all shadow-md shadow-emerald-100"
                                    >
                                        <MessageCircle size={14} /> Recovery
                                    </button>
                                )}
                                <div className="flex-1 md:flex-none bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Items</p>
                                    <p className="text-base font-black text-gray-900">{cart.items.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {carts.length === 0 && (
                    <div className="py-20 text-center bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                        <ShoppingCart size={48} className="text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest">No abandoned carts found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
