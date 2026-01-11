"use client";

import { VendorAuthProvider } from "@/lib/vendor-auth-context";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
    return (
        <VendorAuthProvider>
            {children}
        </VendorAuthProvider>
    );
}
