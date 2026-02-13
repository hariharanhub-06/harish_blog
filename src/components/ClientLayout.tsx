"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { BackgroundBlobs } from "@/components/BackgroundBlobs";
import dynamic from "next/dynamic";
import Script from "next/script";

const AIChat = dynamic(() => import("@/components/AIChat"), { ssr: false });

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith("/admin");
    const isHomePage = pathname === "/";
    const isScheduler = pathname === "/scheduler";

    return (
        <>
            {!isAdmin && !isScheduler && <AnalyticsTracker />}
            {!isAdmin && (
                <>
                    <meta name="google-adsense-account" content="ca-pub-8379879880114790" />
                    <Script
                        async
                        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8379879880114790"
                        crossOrigin="anonymous"
                        strategy="afterInteractive"
                    />
                </>
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
