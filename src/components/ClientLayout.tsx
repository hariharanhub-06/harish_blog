"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import SnacksNavbar from "@/components/SnacksNavbar";
import TechNavbar from "@/components/TechNavbar";
import Footer from "@/components/Footer";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { BackgroundBlobs } from "@/components/BackgroundBlobs";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith("/admin");
    const isSnacksPage = pathname?.startsWith("/business/hm-snacks");
    const isTechPage = pathname?.startsWith("/business/hm-tech");
    const isHariPicks = pathname?.startsWith("/business/haripicks");
    const isHMStories = pathname?.startsWith("/business/hm-stories");

    return (
        <>
            {!isAdmin && <AnalyticsTracker />}
            {!isAdmin && !isSnacksPage && !isHariPicks && !isHMStories && <BackgroundBlobs />}

            {!isAdmin && !isHariPicks && !isHMStories && (
                isSnacksPage ? <SnacksNavbar /> :
                    isTechPage ? <TechNavbar /> :
                        <Navbar />
            )}

            <main className={`min-h-screen ${(!isAdmin && !isHariPicks && !isHMStories) ? "pt-24 md:pt-28" : ""}`}>
                {children}
            </main>
            {!isAdmin && <Footer minimal={(isSnacksPage || isTechPage || isHariPicks)} />}
        </>
    );
}
