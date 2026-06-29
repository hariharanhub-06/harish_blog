import { NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/adminAuth";
import { db } from "@/db";
import { adminSessions } from "@/db/schema";
import { desc } from "drizzle-orm";

const SITES = [
    { name: "Harishblog", url: "https://hariharanhub.com" },
    { name: "StartUP Men's Wear", url: "https://www.startupmenswear.in" },
    { name: "D-Driver", url: "https://d-driver.vercel.app" },
    { name: "Sastha Solar", url: "https://www.sasthasolar.com" },
];

const SECURITY_HEADERS = [
    "strict-transport-security",
    "x-content-type-options",
    "x-frame-options",
    "content-security-policy",
];

async function checkSite(site: { name: string; url: string }) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const start = Date.now();

    try {
        const res = await fetch(site.url, {
            method: "HEAD",
            signal: controller.signal,
            redirect: "follow",
        });
        const responseTime = Date.now() - start;

        const headers: Record<string, boolean> = {};
        for (const h of SECURITY_HEADERS) {
            headers[h] = res.headers.has(h);
        }

        return {
            name: site.name,
            url: site.url,
            status: res.status,
            ok: res.ok,
            responseTime,
            https: site.url.startsWith("https://"),
            headers,
        };
    } catch {
        return {
            name: site.name,
            url: site.url,
            status: 0,
            ok: false,
            responseTime: Date.now() - start,
            https: site.url.startsWith("https://"),
            headers: Object.fromEntries(SECURITY_HEADERS.map((h) => [h, false])),
        };
    } finally {
        clearTimeout(timeout);
    }
}

export async function GET(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;

        const [siteResults, sessions] = await Promise.all([
            Promise.all(SITES.map(checkSite)),
            db.select().from(adminSessions).orderBy(desc(adminSessions.lastActive)).limit(10),
        ]);

        const activeSessions = sessions.filter(
            (s) => new Date(s.lastActive).getTime() > Date.now() - 30 * 60 * 1000
        );

        return NextResponse.json({
            sites: siteResults,
            sessions: {
                total: sessions.length,
                active: activeSessions.length,
                recent: sessions.slice(0, 5).map((s) => ({
                    id: s.id,
                    deviceName: s.deviceName,
                    browser: s.browser,
                    lastActive: s.lastActive,
                    ipAddress: s.ipAddress,
                })),
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Security overview error:", error);
        return NextResponse.json({ error: "Failed to fetch security data" }, { status: 500 });
    }
}
