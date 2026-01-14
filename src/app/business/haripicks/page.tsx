import { Suspense } from "react";
import HariPicksView from "@/components/HariPicksView";

export const metadata = {
    title: "HariPicks | Curated Deals from Amazon, Flipkart & More",
    description: "Discover handpicked deals on electronics, fashion, home products, and more. Curated by Hari Haran with exclusive discounts from top e-commerce platforms.",
    keywords: ["deals", "discounts", "amazon deals", "flipkart offers", "online shopping", "HariPicks", "curated products"],
};

export default function HariPicksPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
            </div>
        }>
            <HariPicksView />
        </Suspense>
    );
}
