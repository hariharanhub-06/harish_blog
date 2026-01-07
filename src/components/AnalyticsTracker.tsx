"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AnalyticsTracker() {
    const pathname = usePathname();

    useEffect(() => {
        // Simple visitor ID using localStorage
        let visitorId = localStorage.getItem("v_id");
        if (!visitorId) {
            visitorId = Math.random().toString(36).substring(2) + Date.now().toString(36);
            localStorage.setItem("v_id", visitorId);
        }

        const trackView = async () => {
            try {
                await fetch("/api/analytics", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        page: pathname,
                        visitorId: visitorId,
                        referrer: document.referrer || "direct"
                    })
                });
            } catch (err) {
                console.error("Tracking failed", err);
            }
        };

        trackView();
    }, [pathname]);

    return null;
}
