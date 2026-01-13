"use client";

import { useState, useEffect, useRef } from "react";
import {
    Plus,
    Trash2,
    Printer,
    Search,
    Package,
    User,
    Phone,
    MapPin,
    Mail,
    Loader2,
    Calendar,
    Download
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface Item {
    productId: string;
    name: string;
    quantity: number;
    price: number; // Final price including GST
    unit: string;
    gstPercent: number; // Added GST
}

export default function BillingModule() {
    const [products, setProducts] = useState<any[]>([]);
    const [customer, setCustomer] = useState({
        name: "",
        mobile: "",
        address: "",
        email: ""
    });
    const [items, setItems] = useState<Item[]>([{ productId: "", name: "", quantity: 1, price: 0, unit: "Kg", gstPercent: 5 }]);
    const [searchQuery, setSearchQuery] = useState<{ [key: number]: string }>({});
    const [showDropdown, setShowDropdown] = useState<{ [key: number]: boolean }>({});
    const [fetchingProducts, setFetchingProducts] = useState(false);
    const invoiceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setFetchingProducts(true);
        try {
            const res = await fetch("/api/snacks/products");
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (error) {
            console.error("Fetch products error:", error);
        } finally {
            setFetchingProducts(false);
        }
    };

    const addItem = () => {
        if (items.length < 15) {
            setItems([...items, { productId: "", name: "", quantity: 1, price: 0, unit: "Kg", gstPercent: 5 }]);
        }
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleProductSelect = (index: number, product: any) => {
        const newItems = [...items];
        newItems[index] = {
            productId: product.id,
            name: product.name,
            quantity: 1,
            price: product.offerPricePerKg || product.pricePerKg || product.offerPricePerPiece || product.pricePerPiece || 0,
            unit: product.pricePerKg ? "Kg" : "Pcs",
            gstPercent: product.gstPercent || 5 // Get GST from product
        };
        setItems(newItems);
        setShowDropdown({ ...showDropdown, [index]: false });
        setSearchQuery({ ...searchQuery, [index]: product.name });
    };

    const handleQuantityChange = (index: number, qty: number) => {
        const newItems = [...items];
        newItems[index].quantity = qty;
        setItems(newItems);
    };

    const handlePriceChange = (index: number, price: number) => {
        const newItems = [...items];
        newItems[index].price = price;
        setItems(newItems);
    };

    const calculateTotals = () => {
        let totalSubtotal = 0;
        let totalGst = 0;
        let totalBase = 0;

        items.forEach(item => {
            const itemTotal = item.price * item.quantity;
            // Formula: Price = Base * (1 + GST/100) => Base = Price / (1 + GST/100)
            const itemBase = itemTotal / (1 + (item.gstPercent / 100));
            const itemGst = itemTotal - itemBase;

            totalSubtotal += itemTotal;
            totalGst += itemGst;
            totalBase += itemBase;
        });

        return {
            subtotal: totalSubtotal.toFixed(2),
            gst: totalGst.toFixed(2),
            basePrice: totalBase.toFixed(2)
        };
    };

    const handlePrint = () => {
        window.print();
    };

    const totals = calculateTotals();

    return (
        <div className="space-y-8 print:p-0">
            {/* Control Panel - Hidden on Print */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm print:hidden">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Manual Billing</h2>
                        <p className="text-gray-400 font-medium">Generate professional invoices for local customers.</p>
                    </div>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
                    >
                        <Printer size={18} /> Print / Save PDF
                    </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Customer Name</label>
                        <input
                            type="text"
                            value={customer.name}
                            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                            className="w-full bg-gray-50 border-0 rounded-xl p-3 font-bold"
                            placeholder="Full Name"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Mobile Number</label>
                        <input
                            type="text"
                            value={customer.mobile}
                            onChange={(e) => setCustomer({ ...customer, mobile: e.target.value })}
                            className="w-full bg-gray-50 border-0 rounded-xl p-3 font-bold"
                            placeholder="+91 ..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Email (Optional)</label>
                        <input
                            type="email"
                            value={customer.email}
                            onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                            className="w-full bg-gray-50 border-0 rounded-xl p-3 font-bold"
                            placeholder="mail@example.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Address (Optional)</label>
                        <input
                            type="text"
                            value={customer.address}
                            onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                            className="w-full bg-gray-50 border-0 rounded-xl p-3 font-bold"
                            placeholder="City, State"
                        />
                    </div>
                </div>
            </div>

            {/* Billing Table - Control View */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden print:hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-50">
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Product Name</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Quantity</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Price / Unit</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">GST %</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Total</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {items.map((item, idx) => (
                            <tr key={idx} className="group">
                                <td className="px-8 py-4 relative">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                        <input
                                            type="text"
                                            value={searchQuery[idx] || item.name}
                                            onChange={(e) => {
                                                setSearchQuery({ ...searchQuery, [idx]: e.target.value });
                                                setShowDropdown({ ...showDropdown, [idx]: true });
                                            }}
                                            onFocus={() => setShowDropdown({ ...showDropdown, [idx]: true })}
                                            className="w-full bg-gray-50 border-0 rounded-xl py-3 pl-12 pr-4 font-bold text-sm"
                                            placeholder="Search product..."
                                        />
                                        <AnimatePresence>
                                            {showDropdown[idx] && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-2xl max-h-60 overflow-y-auto"
                                                >
                                                    {products
                                                        .filter(p => p.name.toLowerCase().includes((searchQuery[idx] || "").toLowerCase()))
                                                        .map(product => (
                                                            <button
                                                                key={product.id}
                                                                onClick={() => handleProductSelect(idx, product)}
                                                                className="w-full px-6 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                                                            >
                                                                <span className="font-bold text-gray-900">{product.name}</span>
                                                                <span className="text-[10px] font-black text-pink-500 uppercase">₹{product.offerPricePerKg || product.pricePerKg || product.offerPricePerPiece || product.pricePerPiece} / {product.pricePerKg ? 'Kg' : 'Unit'}</span>
                                                            </button>
                                                        ))
                                                    }
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </td>
                                <td className="px-8 py-4">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={item.quantity}
                                            onChange={(e) => handleQuantityChange(idx, parseFloat(e.target.value) || 0)}
                                            className="w-20 bg-gray-50 border-0 rounded-xl py-3 px-4 font-bold text-sm text-center"
                                        />
                                        <span className="text-[10px] font-black text-gray-400 uppercase">{item.unit}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-4">
                                    <input
                                        type="number"
                                        value={item.price}
                                        onChange={(e) => handlePriceChange(idx, parseFloat(e.target.value) || 0)}
                                        className="w-24 bg-gray-50 border-0 rounded-xl py-3 px-4 font-bold text-sm"
                                    />
                                </td>
                                <td className="px-8 py-4">
                                    <input
                                        type="number"
                                        value={item.gstPercent}
                                        onChange={(e) => {
                                            const newItems = [...items];
                                            newItems[idx].gstPercent = parseFloat(e.target.value) || 0;
                                            setItems(newItems);
                                        }}
                                        className="w-16 bg-gray-50 border-0 rounded-xl py-3 px-4 font-bold text-sm text-center"
                                    />
                                </td>
                                <td className="px-8 py-4 text-right">
                                    <span className="font-black text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                                </td>
                                <td className="px-8 py-4 text-right">
                                    {items.length > 1 && (
                                        <button onClick={() => removeItem(idx)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="p-6 border-t border-gray-50 bg-[#fafafa] flex justify-between items-center">
                    <button
                        onClick={addItem}
                        className="flex items-center gap-2 text-pink-500 font-black text-[10px] uppercase tracking-widest hover:text-pink-600 transition-all"
                    >
                        <Plus size={16} /> Add Product Line
                    </button>
                    <div className="text-right space-y-1">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Invoice Value</div>
                        <div className="text-4xl font-black text-gray-900 italic">₹{totals.subtotal}</div>
                    </div>
                </div>
            </div>

            {/* INVOICE PREVIEW - Designed for PDF Print */}
            <div className="hidden print:block w-full max-w-[800px] mx-auto bg-white p-8 font-serif text-gray-900" id="invoice-capture" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        @page { margin: 0.5cm; }
                        body { margin: 0; }
                    }
                ` }} />
                <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                        <Image src="/hm-snacks-logo.png" alt="HM Snacks" width={60} height={60} className="rounded-xl" />
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter italic">HM SNACKS</h1>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">PURE. TRADITIONAL. HOMEMADE.</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-4xl font-black text-gray-200 uppercase tracking-widest leading-none mb-1">INVOICE</h2>
                        <div className="text-[9px] font-black uppercase text-gray-400">Date: {new Date().toLocaleDateString()}</div>
                        <div className="text-[9px] font-black uppercase text-gray-400">ID: HMS-{Math.random().toString(36).substr(2, 6).toUpperCase()}</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-12 mb-8">
                    <div>
                        <h3 className="text-[9px] font-black uppercase tracking-widest text-pink-500 mb-2 border-b border-pink-100 pb-1">From</h3>
                        <div className="space-y-0.5 text-xs font-bold">
                            <p className="text-base font-black italic text-gray-900">HM Snacks & Business</p>
                            <p className="text-gray-600">641028, Coimbatore</p>
                            <p className="text-gray-600">Tamil Nadu, India</p>
                            <p className="text-gray-600">Mobile: +91 99441 23456</p>
                            <p className="text-gray-600">GSTIN: 33ABCDE1234F1Z5</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h3 className="text-[9px] font-black uppercase tracking-widest text-indigo-500 mb-2 border-b border-indigo-100 pb-1 text-right">Bill To</h3>
                        <div className="space-y-0.5 text-xs font-bold">
                            <p className="text-base font-black italic text-gray-900">{customer.name || "Customer Name"}</p>
                            <p className="text-gray-600">{customer.mobile || "Mobile Not Provided"}</p>
                            <p className="text-gray-600">{customer.address || "Address Not Provided"}</p>
                        </div>
                    </div>
                </div>

                <table className="w-full mb-8 text-sm">
                    <thead>
                        <tr className="border-b-2 border-gray-900">
                            <th className="py-2 text-left text-[9px] font-black uppercase">Product Description</th>
                            <th className="py-2 text-center text-[9px] font-black uppercase w-16">Qty</th>
                            <th className="py-2 text-right text-[9px] font-black uppercase w-20">Rate</th>
                            <th className="py-2 text-right text-[9px] font-black uppercase w-16">GST %</th>
                            <th className="py-2 text-right text-[9px] font-black uppercase w-20">Tax</th>
                            <th className="py-2 text-right text-[9px] font-black uppercase w-24">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {items.filter(i => i.name).map((item, idx) => {
                            const itemTotal = item.price * item.quantity;
                            const itemBase = itemTotal / (1 + (item.gstPercent / 100));
                            const itemGst = itemTotal - itemBase;
                            const unitRate = item.price / (1 + (item.gstPercent / 100)); // Base Rate per unit

                            return (
                                <tr key={idx} className="page-break-inside-avoid">
                                    <td className="py-3">
                                        <p className="font-black italic text-base leading-tight">{item.name}</p>
                                        <p className="text-[8px] text-gray-400 uppercase font-bold">SNACK PRODUCT CODE: {item.productId.substr(0, 8)}</p>
                                    </td>
                                    <td className="py-3 text-center font-bold">{item.quantity} {item.unit}</td>
                                    <td className="py-3 text-right font-bold">₹{unitRate.toFixed(2)}</td>
                                    <td className="py-3 text-right font-bold">{item.gstPercent}%</td>
                                    <td className="py-3 text-right font-bold">₹{itemGst.toFixed(2)}</td>
                                    <td className="py-3 text-right font-black italic">₹{itemTotal.toFixed(2)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <div className="flex justify-end pt-4">
                    <div className="w-72 space-y-2">
                        <div className="flex justify-between text-xs font-bold border-b border-gray-100 pb-1">
                            <span className="text-gray-400 uppercase text-[9px]">Taxable Amount</span>
                            <span>₹{totals.basePrice}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold border-b border-gray-100 pb-1">
                            <span className="text-gray-400 uppercase text-[9px]">Total GST</span>
                            <span>₹{totals.gst}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                            <span className="text-base font-black text-pink-500 uppercase italic">Grand Total</span>
                            <span className="text-2xl font-black italic">₹{totals.subtotal}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-4 border-t border-gray-100 text-center">
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.5em]">This is a computer generated invoice</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-1">Thank you for your business! Reach us at @hariharanhub.com</p>
                </div>
            </div>
        </div>
    );
}
