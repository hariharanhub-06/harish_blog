import { Suspense } from "react";
import HariPicksView from "@/components/HariPicksView";

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "HariPicks | Exclusive Deals & Curated Finds",
    description: "Shop smarter with HariPicks. Handpicked deals from Amazon, Flipkart, & Myntra using advanced price tracking. Save money on electronics, fashion, and home essentials.",
    keywords: ["HariPicks", "Deal Finder", "Amazon Deals", "Flipkart Offers", "Best Price India", "Shopping Guide", "Hari Haran Jeyaramamoorthy", "Tech Deals"],
    openGraph: {
        title: "HariPicks | Exclusive Deals & Curated Finds",
        description: "Handpicked deals from Amazon, Flipkart, & Myntra. Save money on electronics, fashion, and home essentials.",
        url: 'https://hariharanhub.com/business/haripicks',
        siteName: 'HariPicks',
        images: [
            {
                url: '/haripicks-og.png', // Ensure this image exists or use a generic one
                width: 1200,
                height: 630,
                alt: 'HariPicks Deals',
            },
        ],
        locale: 'en_IN',
        type: 'website',
    },
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
