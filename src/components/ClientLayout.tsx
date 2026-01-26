"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { BackgroundBlobs } from "@/components/BackgroundBlobs";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith("/admin");
    const isHomePage = pathname === "/";

    return (
        <>
            {!isAdmin && <AnalyticsTracker />}
            {!isAdmin && <Navbar />}

            <main className={`min-h-screen ${(!isAdmin && !isHomePage) ? "pt-24 md:pt-28" : ""}`}>
                {children}
            </main>
            {!isAdmin && <Footer />}
        </>
    );
}
