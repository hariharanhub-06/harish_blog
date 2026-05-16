"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import dynamic from "next/dynamic";
import Script from "next/script";
import { Toaster } from "react-hot-toast";

const AIChat = dynamic(() => import("@/components/AIChat"), { ssr: false });

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith("/admin");
    const isHomePage = pathname === "/";
    const isScheduler = pathname === "/scheduler";

    return (
        <>
            <Toaster
                position="top-center"
                toastOptions={{
                    style: { borderRadius: "14px", fontWeight: 700, fontSize: "13px" },
                    success: { duration: 3000 },
                    error: { duration: 5000 },
                }}
            />
            {!isAdmin && !isScheduler && <AnalyticsTracker />}
            {!isAdmin && (
                <Script
                    async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8379879880114790"
                    crossOrigin="anonymous"
                    strategy="afterInteractive"
                />
            )}
            {!isAdmin && !isScheduler && <Navbar />}

            <main className={`min-h-[100dvh] ${(!isAdmin && !isHomePage && !isScheduler) ? "pt-24 md:pt-28" : ""}`}>
                {children}
            </main>
            {!isAdmin && !isScheduler && <Footer />}
            {!isAdmin && !isScheduler && <AIChat />}
        </>
    );
}
