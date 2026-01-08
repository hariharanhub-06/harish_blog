"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Heart, Share2, Clock, X, Minus, Plus, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Tilt } from "@/components/Tilt";

// Category Tabs
const CATEGORIES = ["All", "Savories", "Sweets", "Spices", "Ready to Eat"];

export default function HMSnacksPage() {
    const { addToCart, toggleWishlist, isInWishlist } = useCart();
    const [products, setProducts] = useState<any[]>([]);
    const [activeCategory, setActiveCategory] = useState("All");

    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [modalQuantity, setModalQuantity] = useState(1);
    const [modalUnit, setModalUnit] = useState<"kg" | "pc">("kg");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/snacks/products?activeOnly=true');
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data);
                }
            } catch (error) {
                console.error('Failed to fetch products:', error);
            }
        };

        fetchProducts();

    }, []);

    const filteredProducts = activeCategory === "All"
        ? products
        : products.filter(p => p.category === activeCategory);

    const openModal = (product: any) => {
        setSelectedProduct(product);
        const hasKg = !!product.pricePerKg;
        setModalUnit(hasKg ? "kg" : "pc");
        setModalQuantity(hasKg ? 1 : 10);
    };

    return (
        <div className="min-h-screen bg-[#fafafa]">
            {/* Hero Section */}
            <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
                <Image
                    src="https://images.unsplash.com/photo-1505253304499-671c55fb57fe?q=80&w=2000"
                    fill
                    className="object-cover brightness-50"
                    alt="Snacks Hero"
                    priority
                />
                <div className="relative z-10 text-center px-6">
                    <div className="flex flex-col items-center">
                        {/* Brand Logo Block Removed */}

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-block px-4 py-1.5 bg-pink-500/20 backdrop-blur-md rounded-full text-pink-400 text-[10px] font-black uppercase tracking-[0.3em] border border-pink-500/30"
                        >
                            Established Since 1920
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="mt-3 text-[9px] font-black uppercase tracking-[0.4em] text-gray-400/80"
                        >
                            Small Scale ➜ Big Scale
                        </motion.div>
                    </div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tighter"
                    >
                        Taste the <br /> <span className="text-pink-500 italic">Tradition.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-medium"
                    >
                        We are the 5th generation taking our ancestral gourmet recipes to the worldwide stage. Authentic, pure, and filled with love.
                    </motion.p>
                </div>
            </section>

            {/* About Section */}
            <section className="container mx-auto px-6 py-24">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="relative group">
                        <div className="absolute -inset-4 bg-pink-100/50 rounded-[3rem] -z-10 group-hover:scale-105 transition-transform duration-700" />
                        <div className="relative aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl">
                            <Image
                                src="/images/business/hm-snacks/heritage-shelf.jpg"
                                fill
                                className="object-cover"
                                alt="Heritage"
                            />
                        </div>
                        <div className="absolute -bottom-8 -right-8 bg-white p-8 rounded-3xl shadow-xl hidden md:block max-w-[240px]">
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="p-2 bg-pink-50 text-pink-500 rounded-lg"><Clock size={18} /></div>
                                <span className="text-xs font-black uppercase tracking-widest text-gray-400">Since 1920</span>
                            </div>
                            <p className="text-sm font-bold text-gray-900">5 Generations of Master Craftsmanship.</p>
                        </div>
                    </div>
                    <div className="space-y-8">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-1 bg-pink-500 rounded-full" />
                            <span className="text-pink-500 font-black uppercase tracking-[0.3em] text-xs">Our Heritage</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight leading-none">
                            Taking Forward a <br /> <span className="text-pink-500 italic">Century</span> of Flavor.
                        </h2>
                        <div className="space-y-6 text-gray-500 font-medium text-lg leading-relaxed">
                            <p>
                                What started as a small kitchen experiment in 1920 has now blossomed into a global mission. We take pride in being the 5th generation to carry forward the legacy of HM Snacks.
                            </p>
                            <p>
                                Our recipes haven&apos;t changed because perfection doesn&apos;t need to. Every murukku, ہر sweets, and special spice blend is crafted using the same techniques our great-grandparents mastered, now enhanced with modern hygiene standards and global shipping through our partners.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-6 pt-4">
                            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                                <div className="text-3xl font-black text-pink-500 mb-1">100%</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Pure Ghee & Oil</div>
                            </div>
                            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                                <div className="text-3xl font-black text-pink-500 mb-1">Global</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Worldwide Delivery</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Products Section */}
            <section id="products" className="container mx-auto px-6 py-24 border-t border-gray-100">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div className="space-y-4">
                        <h2 className="text-2xl md:text-6xl font-black text-gray-900 tracking-tight">Our <span className="text-pink-500 italic">Collection</span></h2>
                        <p className="text-gray-400 font-medium max-w-lg">Order the freshest snacks, delivered globally. Minimum order starts from 250g (1/4 Kg).</p>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeCategory === cat
                                    ? "bg-pink-500 text-white shadow-lg shadow-pink-200"
                                    : "bg-white text-gray-400 hover:text-pink-500 border border-gray-100"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {filteredProducts.map((product) => (
                        <Tilt key={product.id} options={{ max: 10, speed: 400, glare: true, "max-glare": 0.2 }}>
                            <div
                                onClick={() => openModal(product)}
                                className="group bg-white rounded-xl md:rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full flex flex-col cursor-pointer"
                            >
                                {/* Image Holder */}
                                <div className="relative h-40 md:h-72 overflow-hidden">
                                    <Image
                                        src={`${product.imageUrl}${product.imageUrl.includes('?') ? '&' : '?'}tr=f-auto,q-80`}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    {/* Badges */}
                                    <div className="absolute top-1 left-1 md:top-6 md:left-6 flex flex-col gap-1">
                                        <span className="bg-white/90 backdrop-blur-md text-gray-900 text-[6px] md:text-[10px] font-black px-1.5 py-0.5 md:px-3 md:py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                                            {product.category}
                                        </span>
                                    </div>
                                    {/* Action Float Buttons */}
                                    <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xl transition-all ${isInWishlist(product.id) ? "bg-pink-500 text-white" : "bg-white text-gray-900 hover:bg-pink-500 hover:text-white"
                                                }`}
                                        >
                                            <Heart size={18} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
                                        </button>
                                        <button
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-10 h-10 bg-white text-gray-900 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white shadow-xl transition-all"
                                        >
                                            <Share2 size={18} />
                                        </button>
                                    </div>
                                    {/* Quick View Overlay Text */}
                                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center pb-6">
                                        <span className="text-white text-[10px] md:text-xs font-black uppercase tracking-widest border border-white/50 px-3 py-1.5 md:px-4 md:py-2 rounded-full backdrop-blur-sm">Big View</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-2 md:p-8 flex flex-col flex-grow">
                                    <h3 className="text-xs md:text-2xl font-black text-gray-900 mb-0.5 md:mb-2 group-hover:text-pink-500 transition-colors line-clamp-1 leading-tight uppercase tracking-tight">
                                        {product.name}
                                    </h3>
                                    <p className="hidden md:block text-gray-400 text-sm font-medium line-clamp-2 mb-6">
                                        {product.description}
                                    </p>

                                    <div className="mt-auto space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[6px] md:text-[10px] font-black uppercase tracking-[0.05em] md:tracking-widest text-gray-400">
                                                    {product.pricePerKg ? "Per Kg" : "Per Pc"}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    {product.pricePerKg ? (
                                                        product.offerPricePerKg ? (
                                                            <>
                                                                <span className="text-xs md:text-2xl font-black text-pink-500 italic">₹{product.offerPricePerKg}</span>
                                                                <span className="text-[8px] md:text-sm font-bold text-gray-300 line-through">₹{product.pricePerKg}</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs md:text-2xl font-black text-gray-900 italic">₹{product.pricePerKg}</span>
                                                        )
                                                    ) : (
                                                        product.offerPricePerPiece ? (
                                                            <>
                                                                <span className="text-xs md:text-2xl font-black text-pink-500 italic">₹{product.offerPricePerPiece}</span>
                                                                <span className="text-[8px] md:text-sm font-bold text-gray-300 line-through">₹{product.pricePerPiece}</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs md:text-2xl font-black text-gray-900 italic">₹{product.pricePerPiece}</span>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                            <div className={`p-1.5 md:p-2 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-1 md:gap-2 ${product.stock > 0 ? "text-emerald-500 bg-emerald-50" : "text-rose-500 bg-rose-50"}`}>
                                                <div className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full animate-pulse ${product.stock > 0 ? "bg-emerald-500" : "bg-rose-500"}`} />
                                                {product.stock > 0 ? "In" : "Out"}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-1 md:gap-3">
                                            {product.pricePerKg ? (
                                                <>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const price = product.offerPricePerKg || product.pricePerKg;
                                                            addToCart({ ...product, price, unit: "Kg" }, 0.25);
                                                        }}
                                                        className="bg-white border md:border-2 border-gray-100 text-gray-900 py-1.5 md:py-4 rounded-lg md:rounded-2xl font-black text-[7px] md:text-xs uppercase tracking-tight md:tracking-widest hover:border-pink-500/50 hover:bg-pink-50/30 transition-all flex flex-col items-center justify-center leading-none"
                                                    >
                                                        <span>Buy ¼ Kg</span>
                                                        <span className="text-[6px] md:text-[10px] mt-0.5 md:mt-1 text-gray-400 font-bold">₹{((product.offerPricePerKg || product.pricePerKg) / 4).toFixed(0)}</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const price = product.offerPricePerKg || product.pricePerKg;
                                                            addToCart({ ...product, price, unit: "Kg" }, 1);
                                                        }}
                                                        className="bg-primary text-white py-1.5 md:py-4 rounded-lg md:rounded-2xl font-black text-[8px] md:text-xs uppercase tracking-tight md:tracking-widest hover:bg-blue-800 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-1 md:gap-2 px-1"
                                                    >
                                                        <ShoppingCart size={8} className="md:w-3.5 md:h-3.5 hidden md:block" />
                                                        Add 1 Kg
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const price = product.offerPricePerPiece || product.pricePerPiece;
                                                            addToCart({ ...product, price, unit: "Pcs" }, 10);
                                                        }}
                                                        className="bg-white border md:border-2 border-gray-100 text-gray-900 py-1.5 md:py-4 rounded-lg md:rounded-2xl font-black text-[7px] md:text-xs uppercase tracking-tight md:tracking-widest hover:border-pink-500/50 hover:bg-pink-50/30 transition-all flex flex-col items-center justify-center leading-none"
                                                    >
                                                        <span>Buy 10 Pcs</span>
                                                        <span className="text-[6px] md:text-[10px] mt-0.5 md:mt-1 text-gray-400 font-bold">₹{((product.offerPricePerPiece || product.pricePerPiece) * 10).toFixed(0)}</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const price = product.offerPricePerPiece || product.pricePerPiece;
                                                            addToCart({ ...product, price, unit: "Pcs" }, 25);
                                                        }}
                                                        className="bg-primary text-white py-1.5 md:py-4 rounded-lg md:rounded-2xl font-black text-[8px] md:text-xs uppercase tracking-tight md:tracking-widest hover:bg-blue-800 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-1 md:gap-2 px-1"
                                                    >
                                                        <ShoppingCart size={8} className="md:w-3.5 md:h-3.5 hidden md:block shrink-0" />
                                                        <span className="whitespace-nowrap">Add 25 Pcs</span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Tilt>
                    ))}
                </div>
            </section>

            {/* Brand Values / Taglines */}
            <section className="bg-gray-950 py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 to-transparent pointer-events-none" />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid md:grid-cols-3 gap-16 md:gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center group"
                        >
                            <div className="text-white text-3xl md:text-4xl font-black italic mb-3 tracking-tight group-hover:text-pink-500 transition-colors duration-500">
                                Crunch with Purpose
                            </div>
                            <div className="h-1 w-12 bg-pink-500/30 mx-auto rounded-full group-hover:w-24 transition-all duration-500" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-center group"
                        >
                            <div className="text-white text-3xl md:text-4xl font-black italic mb-3 tracking-tight group-hover:text-pink-500 transition-colors duration-500">
                                Hygienic Bites
                            </div>
                            <div className="h-1 w-12 bg-pink-500/30 mx-auto rounded-full group-hover:w-24 transition-all duration-500" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-center group"
                        >
                            <div className="text-white text-3xl md:text-4xl font-black italic mb-3 tracking-tight group-hover:text-pink-500 transition-colors duration-500">
                                Taste Tradition
                            </div>
                            <div className="h-1 w-12 bg-pink-500/30 mx-auto rounded-full group-hover:w-24 transition-all duration-500" />
                        </motion.div>
                    </div>


                </div>
            </section>

            {/* Contact Support Section */}
            <section id="contact" className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto bg-gray-50 rounded-[3rem] p-8 md:p-16 shadow-lg border border-gray-100">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Get in <span className="text-pink-500 italic">Touch</span></h2>
                            <p className="text-gray-400 font-medium">Have a question or bulk order query? Reach out to us.</p>
                        </div>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const formData = new FormData(form);
                            const data = {
                                name: formData.get("name"),
                                mobile: formData.get("mobile"),
                                email: formData.get("email"),
                                message: formData.get("message"),
                                category: "HM Snack"
                            };

                            const btn = form.querySelector("button");
                            if (btn) {
                                btn.disabled = true;
                                btn.innerText = "Sending...";
                            }

                            try {
                                const res = await fetch("/api/contact", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(data)
                                });

                                if (res.ok) {
                                    alert("Message sent successfully!");
                                    form.reset();
                                } else {
                                    alert("Failed to send message. Please try again.");
                                }
                            } catch (err) {
                                alert("Something went wrong.");
                            } finally {
                                if (btn) {
                                    btn.disabled = false;
                                    btn.innerText = "Send Message";
                                }
                            }
                        }} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Name</label>
                                    <input required name="name" type="text" placeholder="John Doe" className="w-full bg-white border border-gray-200 rounded-2xl p-4 font-bold text-gray-900 focus:ring-2 focus:ring-pink-500 transition-all shadow-sm outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Mobile Number</label>
                                    <input required name="mobile" type="tel" placeholder="+91 90423 87152" className="w-full bg-white border border-gray-200 rounded-2xl p-4 font-bold text-gray-900 focus:ring-2 focus:ring-pink-500 transition-all shadow-sm outline-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Mail Id</label>
                                <input required name="email" type="email" placeholder="john@example.com" className="w-full bg-white border border-gray-200 rounded-2xl p-4 font-bold text-gray-900 focus:ring-2 focus:ring-pink-500 transition-all shadow-sm outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Comments</label>
                                <textarea required name="message" rows={4} placeholder="Your message here..." className="w-full bg-white border border-gray-200 rounded-2xl p-4 font-bold text-gray-900 focus:ring-2 focus:ring-pink-500 transition-all shadow-sm resize-none outline-none" />
                            </div>
                            <button type="submit" className="w-full bg-pink-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-pink-600 transition-all shadow-xl shadow-pink-200">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Product Modal */}
            <AnimatePresence>
                {selectedProduct && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedProduct(null)}
                            className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 50 }}
                            className="relative bg-white w-full max-w-5xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="absolute top-6 right-6 z-20 p-3 bg-white/50 backdrop-blur-md hover:bg-white rounded-full transition-all text-gray-900"
                            >
                                <X size={24} />
                            </button>

                            {/* Image Side */}
                            <div className="relative w-full md:w-1/2 h-64 md:h-auto bg-gray-100">
                                <Image
                                    src={`${selectedProduct.imageUrl}${selectedProduct.imageUrl.includes('?') ? '&' : '?'}tr=f-avif,q-80`}
                                    alt={selectedProduct.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Details Side */}
                            <div className="flex flex-col w-full md:w-1/2 p-8 md:p-12 overflow-y-auto">
                                <div className="mb-8">
                                    <span className="inline-block px-3 py-1 bg-pink-50 text-pink-500 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                                        {selectedProduct.category}
                                    </span>
                                    <h2 className="text-4xl font-black text-gray-900 mb-4 leading-tight">{selectedProduct.name}</h2>
                                    <p className="text-gray-500 font-medium leading-relaxed">
                                        {selectedProduct.description}
                                    </p>
                                </div>

                                <div className="mt-auto space-y-8">
                                    {/* Unit Toggle if both prices exist */}
                                    {selectedProduct.pricePerKg && selectedProduct.pricePerPiece && (
                                        <div className="flex p-1 bg-gray-100 rounded-2xl w-fit">
                                            <button
                                                onClick={() => {
                                                    setModalUnit("kg");
                                                    setModalQuantity(1);
                                                }}
                                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${modalUnit === "kg" ? "bg-white text-pink-500 shadow-sm" : "text-gray-400"}`}
                                            >
                                                By Weight (Kg)
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setModalUnit("pc");
                                                    setModalQuantity(10);
                                                }}
                                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${modalUnit === "pc" ? "bg-white text-pink-500 shadow-sm" : "text-gray-400"}`}
                                            >
                                                By Pieces
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex items-end justify-between border-b border-gray-100 pb-8">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Total Price</p>
                                            <div className="flex items-center gap-3">
                                                <p className="text-4xl font-black text-gray-900 italic tracking-tighter">
                                                    ₹{Math.ceil((modalUnit === "kg"
                                                        ? (selectedProduct.offerPricePerKg || selectedProduct.pricePerKg)
                                                        : (selectedProduct.offerPricePerPiece || selectedProduct.pricePerPiece)) * modalQuantity)}
                                                </p>
                                                {((modalUnit === "kg" && selectedProduct.offerPricePerKg) || (modalUnit === "pc" && selectedProduct.offerPricePerPiece)) && (
                                                    <p className="text-lg font-bold text-gray-300 line-through mt-1">
                                                        ₹{Math.ceil((modalUnit === "kg" ? selectedProduct.pricePerKg : selectedProduct.pricePerPiece) * modalQuantity)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-2xl">
                                            <button
                                                onClick={() => {
                                                    if (modalUnit === "kg") {
                                                        setModalQuantity(prev => Math.max(0.25, prev - 0.25));
                                                    } else {
                                                        setModalQuantity(prev => Math.max(10, prev - 5));
                                                    }
                                                }}
                                                className="p-2 hover:text-pink-500 transition-colors"
                                            >
                                                <Minus size={20} />
                                            </button>
                                            <span className="w-16 text-center font-black text-lg">
                                                {modalQuantity}{modalUnit === "kg" ? "Kg" : " Pcs"}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    if (modalUnit === "kg") {
                                                        setModalQuantity(prev => prev + 0.25);
                                                    } else {
                                                        setModalQuantity(prev => prev + 5);
                                                    }
                                                }}
                                                className="p-2 hover:text-pink-500 transition-colors"
                                            >
                                                <Plus size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => {
                                                const basePrice = modalUnit === "kg" ? selectedProduct.pricePerKg : selectedProduct.pricePerPiece;
                                                const offerPrice = modalUnit === "kg" ? selectedProduct.offerPricePerKg : selectedProduct.offerPricePerPiece;
                                                const finalProduct = {
                                                    ...selectedProduct,
                                                    price: offerPrice || basePrice,
                                                    unit: modalUnit === "kg" ? "Kg" : "Pcs"
                                                };
                                                addToCart(finalProduct, modalQuantity);
                                                setSelectedProduct(null);
                                            }}
                                            className="flex-1 bg-gray-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-pink-500 transition-all shadow-xl flex items-center justify-center gap-3"
                                        >
                                            <ShoppingCart size={18} /> Add to Cart
                                        </button>
                                        <button
                                            onClick={() => toggleWishlist(selectedProduct.id)}
                                            className={`p-5 rounded-2xl border-2 transition-all ${isInWishlist(selectedProduct.id)
                                                ? "bg-pink-50 border-pink-50 text-pink-500"
                                                : "border-gray-100 hover:border-pink-500 text-gray-400 hover:text-pink-500"}`}
                                        >
                                            <Heart size={24} fill={isInWishlist(selectedProduct.id) ? "currentColor" : "none"} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
