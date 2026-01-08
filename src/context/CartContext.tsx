"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
    id: string;
    name: string;
    price: number; // Price per unit (Kg or Piece)
    unit: "Kg" | "Pcs";
    imageUrl: string;
    quantity: number;
    category: string;
}

interface CartContextType {
    cart: CartItem[];
    wishlist: string[]; // array of product IDs
    addToCart: (product: any, quantity: number, unit?: "Kg" | "Pcs") => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number, unit?: "Kg" | "Pcs") => void;
    clearCart: () => void;
    toggleWishlist: (productId: string) => void;
    isInWishlist: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [wishlist, setWishlist] = useState<string[]>([]);

    // Persistence
    useEffect(() => {
        const savedCart = localStorage.getItem("hm_snacks_cart");
        const savedWishlist = localStorage.getItem("hm_snacks_wishlist");
        if (savedCart) setCart(JSON.parse(savedCart));
        if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    }, []);

    useEffect(() => {
        localStorage.setItem("hm_snacks_cart", JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        localStorage.setItem("hm_snacks_wishlist", JSON.stringify(wishlist));
    }, [wishlist]);

    const addToCart = (product: any, quantity: number, unit?: "Kg" | "Pcs") => {
        const finalUnit = unit || product.unit || (product.pricePerKg ? "Kg" : "Pcs");
        const finalPrice = product.price || (finalUnit === "Kg" ? product.pricePerKg : product.pricePerPiece);

        setCart(prev => {
            const existing = prev.find(item => item.id === product.id && item.unit === finalUnit);
            if (existing) {
                return prev.map(item =>
                    (item.id === product.id && item.unit === finalUnit)
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, {
                id: product.id,
                name: product.name,
                price: finalPrice,
                unit: finalUnit,
                imageUrl: product.imageUrl,
                quantity: quantity,
                category: product.category
            }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number, unit?: "Kg" | "Pcs") => {
        setCart(prev => prev.map(item => {
            if (item.id === productId && (unit ? item.unit === unit : true)) {
                if (item.unit === "Kg") {
                    if (quantity < 0.25) return item;
                } else {
                    if (quantity < 10) return item;
                }
                return { ...item, quantity };
            }
            return item;
        }));
    };

    const clearCart = () => setCart([]);

    const toggleWishlist = (productId: string) => {
        setWishlist(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const isInWishlist = (productId: string) => wishlist.includes(productId);

    return (
        <CartContext.Provider value={{
            cart,
            wishlist,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            toggleWishlist,
            isInWishlist
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
}
