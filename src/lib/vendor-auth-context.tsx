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
    login: (vendorData: Vendor) => void;
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
        if (stored) {
            try {
                setVendor(JSON.parse(stored));
            } catch (e) {
                console.error("Invalid vendor session");
                localStorage.removeItem("vendor_session");
            }
        }
        setLoading(false);
    }, []);

    const login = (vendorData: Vendor) => {
        setVendor(vendorData);
        localStorage.setItem("vendor_session", JSON.stringify(vendorData));
        router.push("/business/hm-snacks/vendor/dashboard");
    };

    const logout = () => {
        setVendor(null);
        localStorage.removeItem("vendor_session");
        router.push("/business/hm-snacks/vendor/login");
    };

    return (
        <VendorAuthContext.Provider value={{ vendor, loading, login, logout }}>
            {children}
        </VendorAuthContext.Provider>
    );
};

export const useVendorAuth = () => useContext(VendorAuthContext);
