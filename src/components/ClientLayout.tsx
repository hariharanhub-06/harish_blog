"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { BackgroundBlobs } from "@/components/BackgroundBlobs";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith("/admin");

    return (
        <>
            {!isAdmin && <AnalyticsTracker />}
            {!isAdmin && <BackgroundBlobs />}
            {!isAdmin && <Navbar />}
            <main className={`min-h-screen ${!isAdmin ? "pt-20" : ""}`}>
                {children}
            </main>
            {!isAdmin && <Footer />}
        </>
    );
}
