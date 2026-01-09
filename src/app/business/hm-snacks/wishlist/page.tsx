"use client";

import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2, Package, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Tilt } from "@/components/Tilt";
import imageKitLoader from "@/lib/imagekitLoader";

export default function WishlistPage() {
    const { wishlist, toggleWishlist, addToCart } = useCart();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch all products and filter locally for simplicity in this MVP
        // In real app, we might have an API like /api/snacks/products?ids=...
        const fetchProducts = async () => {
            const res = await fetch("/api/snacks/products");
            if (res.ok) {
                const data = await res.json();
                setProducts(data.filter((p: any) => wishlist.includes(p.id)));
            }
            setLoading(false);
        };
        fetchProducts();
    }, [wishlist]);

    if (loading) {
        return (
            <div className="container mx-auto px-6 py-32 text-center h-[80vh] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="container mx-auto px-6 py-32 text-center h-[80vh] flex flex-col items-center justify-center">
                <Heart size={64} className="text-pink-100 mx-auto mb-6" />
                <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight italic">Your wishlist is lonely.</h1>
                <p className="text-gray-400 font-medium mb-10 max-w-md">Save your favorite traditional snacks here to order them later with a single click.</p>
                <Link href="/business/hm-snacks" className="bg-gray-900 text-white px-10 py-5 rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-pink-500 transition-all inline-flex items-center gap-3">
                    Discover Snacks <ArrowRight size={18} />
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                <div>
                    <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter italic">Gourmet <br /><span className="text-pink-500">Wishlist</span></h1>
                    <p className="text-gray-400 font-medium mt-4">Your handpicked selection of 100-year-old traditions.</p>
                </div>
                <div className="p-6 bg-pink-50 rounded-[2rem] border border-pink-100 flex items-center gap-6">
                    <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">Saved Items</span>
                        <p className="text-2xl font-black text-gray-900">{products.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-pink-500 shadow-sm"><Heart size={24} fill="currentColor" /></div>
                </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map((product) => (
                    <Tilt key={product.id} options={{ max: 10, speed: 400 }}>
                        <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-2xl transition-all group overflow-hidden h-full flex flex-col">
                            <div className="relative h-60 overflow-hidden">
                                <Image
                                    loader={imageKitLoader}
                                    src={product.imageUrl}
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                />
                                <button
                                    onClick={() => toggleWishlist(product.id)}
                                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md text-rose-500 rounded-xl flex items-center justify-center shadow-lg hover:bg-rose-500 hover:text-white transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <div className="p-8 flex-grow flex flex-col">
                                <h3 className="text-xl font-black text-gray-900 mb-2 truncate">{product.name}</h3>
                                <p className="text-xs font-black text-pink-500 uppercase tracking-widest mb-6">{product.category}</p>

                                <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-6">
                                    <div className="flex flex-col leading-tight">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Starts at</span>
                                        <span className="text-xl font-black text-gray-900 italic">₹{product.pricePerKg / 4}</span>
                                    </div>
                                    <button
                                        onClick={() => addToCart(product, 0.25)}
                                        className="bg-gray-900 text-white p-4 rounded-2xl hover:bg-pink-500 transition-all shadow-xl shadow-gray-100"
                                    >
                                        <ShoppingCart size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Tilt>
                ))}
            </div>
        </div>
    );
}
