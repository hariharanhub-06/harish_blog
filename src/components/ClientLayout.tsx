"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { BackgroundBlobs } from "@/components/BackgroundBlobs";
import AIChat from "@/components/AIChat";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith("/admin");
    const isHomePage = pathname === "/";
    const isScheduler = pathname === "/scheduler";

    return (
        <>
            {!isAdmin && !isScheduler && <AnalyticsTracker />}
            {!isAdmin && !isScheduler && <Navbar />}

            <main className={`min-h-[100dvh] ${(!isAdmin && !isHomePage && !isScheduler) ? "pt-24 md:pt-28" : ""}`}>
                {children}
            </main>
            {!isAdmin && !isScheduler && <Footer />}
            {!isAdmin && !isScheduler && <AIChat />}
        </>
    );
}
