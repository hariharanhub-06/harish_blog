import { NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/adminAuth";

const FREE_LIMITS = {
    bandwidthBytes: 20 * 1024 * 1024 * 1024,
    storageBytes: 20 * 1024 * 1024 * 1024,
};

async function fetchImageKitData(privateKey: string, projectLabel: string) {
    if (!privateKey) return { label: projectLabel, configured: false };
    const credentials = Buffer.from(`${privateKey}:`).toString("base64");
    const headers = { Authorization: `Basic ${credentials}` };
    try {
        const statsRes = await fetch("https://api.imagekit.io/v1/stats", { headers });
        let stats: unknown = null;
        if (statsRes.ok) stats = await statsRes.json();
        return { label: projectLabel, configured: true, stats, limits: FREE_LIMITS };
    } catch {
        return { label: projectLabel, configured: true, error: "API call failed" };
    }
}

export async function GET(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;

        const results = await Promise.all([
            fetchImageKitData(process.env.IMAGEKIT_PRIVATE_KEY ?? "", "Harishblog"),
            fetchImageKitData(process.env.IMAGEKIT_PRIVATE_KEY_STARTUP ?? "", "StartUP"),
            fetchImageKitData(process.env.IMAGEKIT_PRIVATE_KEY_DDRIVER ?? "", "D-Driver"),
        ]);

        return NextResponse.json({ projects: results, timestamp: new Date().toISOString() });
    } catch (error) {
        console.error("ImageKit usage error:", error);
        return NextResponse.json({ error: "Failed to fetch ImageKit data" }, { status: 500 });
    }
}
