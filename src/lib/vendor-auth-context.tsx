"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Vendor {
    id: string;
    name: string;
    email: string;
    pickupLocationId: string;
}

interface VendorAuthContextType {
    vendor: Vendor | null;
    loading: boolean;
    login: (vendorData: Vendor, token: string) => void;
    logout: () => void;
}

const VendorAuthContext = createContext<VendorAuthContextType>({
    vendor: null,
    loading: true,
    login: () => { },
    logout: () => { },
});

export const VendorAuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check localStorage on load
        const stored = localStorage.getItem("vendor_session");
        const token = localStorage.getItem("vendor_token");

        if (stored && token) {
            try {
                setVendor(JSON.parse(stored));
            } catch (e) {
                console.error("Invalid vendor session");
                localStorage.removeItem("vendor_session");
                localStorage.removeItem("vendor_token");
            }
        } else if (stored && !token) {
            // Force clear if session exists but token is missing
            localStorage.removeItem("vendor_session");
        }
        setLoading(false);
    }, []);

    const login = (vendorData: Vendor, token: string) => {
        setVendor(vendorData);
        localStorage.setItem("vendor_session", JSON.stringify(vendorData));
        localStorage.setItem("vendor_token", token);
        router.push("/business/hm-snacks/vendor/dashboard");
    };

    const logout = () => {
        setVendor(null);
        localStorage.removeItem("vendor_session");
        localStorage.removeItem("vendor_token");
        router.push("/business/hm-snacks/vendor/login");
    };

    return (
        <VendorAuthContext.Provider value={{ vendor, loading, login, logout }}>
            {children}
        </VendorAuthContext.Provider>
    );
};

export const useVendorAuth = () => useContext(VendorAuthContext);
