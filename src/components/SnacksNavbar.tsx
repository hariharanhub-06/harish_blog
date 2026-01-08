"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Heart, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";

export default function SnacksNavbar() {
    const { cart, wishlist } = useCart();
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const cartCount = cart.reduce((acc, item) => acc + (item.quantity > 0 ? 1 : 0), 0);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4`}>
            <div className={`container mx-auto max-w-7xl h-20 rounded-3xl flex justify-between items-center transition-all duration-500 ${scrolled ? "bg-white/95 backdrop-blur-xl shadow-2xl border border-white/50 px-10" : "bg-white/40 backdrop-blur-md px-6 border border-white/20"}`}>



                {/* Logo */}
                <Link href="/business/hm-snacks" className="flex flex-col items-center">
                    <span className="text-3xl font-black tracking-tighter text-gray-900 leading-none">
                        HM<span className="text-pink-500 italic">Snacks</span>
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-[0.4em] text-pink-500/60 mt-1">Tradition Taste</span>
                </Link>

                {/* Right Actions */}
                <div className="flex items-center space-x-2 md:space-x-6">
                    {/* Wishlist */}
                    <Link href="/business/hm-snacks/wishlist" className="relative p-3 text-gray-500 hover:text-pink-500 transition-colors group">
                        <Heart size={22} className={wishlist.length > 0 ? "fill-pink-500 text-pink-500" : "group-hover:scale-110 transition-transform"} />
                        {wishlist.length > 0 && (
                            <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[9px] font-bold text-white">
                                {wishlist.length}
                            </span>
                        )}
                    </Link>

                    {/* Cart */}
                    <Link href="/business/hm-snacks/cart" className="relative p-3 text-gray-500 hover:text-primary transition-colors group">
                        <ShoppingCart size={22} className="group-hover:scale-110 transition-transform" />
                        {cartCount > 0 && (
                            <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {/* Order Status (Optional but good) */}
                    <Link href="/business/hm-snacks/track" className="hidden md:block text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors">
                        Track Order
                    </Link>

                    {/* Mobile Toggle */}
                    <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-3 text-gray-900">
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-28 left-6 right-6 bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-8 md:hidden overflow-hidden z-50 transition-colors"
                    >
                        <div className="flex flex-col space-y-6 bg-white">
                            <Link href="/business/hm-snacks" onClick={() => setIsOpen(false)} className="text-2xl font-black text-gray-900">Home</Link>
                            <Link href="/business/hm-snacks/cart" onClick={() => setIsOpen(false)} className="text-2xl font-black text-gray-900 flex justify-between">
                                Cart
                                <span className="bg-primary text-white px-3 py-1 rounded-full text-xs">{cartCount}</span>
                            </Link>
                            <Link href="/business/hm-snacks/wishlist" onClick={() => setIsOpen(false)} className="text-2xl font-black text-gray-900 flex justify-between">
                                Wishlist
                                <span className="bg-pink-500 text-white px-3 py-1 rounded-full text-xs">{wishlist.length}</span>
                            </Link>
                            <Link href="/business/hm-snacks/track" onClick={() => setIsOpen(false)} className="text-2xl font-black text-gray-900">Track Order</Link>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
