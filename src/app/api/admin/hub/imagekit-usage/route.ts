import { NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/adminAuth";

const FREE_LIMITS = {
    storageBytes:   20 * 1024 * 1024 * 1024, // 20 GB
    bandwidthBytes: 20 * 1024 * 1024 * 1024, // 20 GB/month
};

async function fetchImageKitData(privateKey: string): Promise<{ storageUsed: number; fileCount: number } | null> {
    if (!privateKey) return null;
    const credentials = Buffer.from(`${privateKey.trim()}:`).toString("base64");
    const headers = { Authorization: `Basic ${credentials}` };
    try {
        const res = await fetch("https://api.imagekit.io/v1/files?limit=1000&skip=0", { headers });
        if (!res.ok) return null;
        const files: any[] = await res.json();
        return {
            storageUsed: files.reduce((sum, f) => sum + (f.size ?? 0), 0),
            fileCount:   files.length,
        };
    } catch {
        return null;
    }
}

async function fetchImageKitProject(keys: string[], projectLabel: string) {
    const validKeys = keys.filter(k => k);
    if (validKeys.length === 0) return { label: projectLabel, configured: false };
    const results = await Promise.all(validKeys.map(k => fetchImageKitData(k)));
    const successful = results.filter((r): r is NonNullable<typeof r> => r !== null);
    if (successful.length === 0) return { label: projectLabel, configured: true, error: "API call failed" };
    return {
        label: projectLabel,
        configured: true,
        stats: {
            storageUsed: successful.reduce((s, r) => s + r.storageUsed, 0),
            fileCount:   successful.reduce((s, r) => s + r.fileCount, 0),
        },
        limits: FREE_LIMITS,
    };
}

export async function GET(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;

        const results = await Promise.all([
            fetchImageKitProject([process.env.IMAGEKIT_PRIVATE_KEY         ?? ""], "Harishblog"),
            fetchImageKitProject([process.env.IMAGEKIT_PRIVATE_KEY_STARTUP  ?? "", process.env.IMAGEKIT_PRIVATE_KEY_STARTUP_2 ?? ""], "StartUP"),
            fetchImageKitProject([process.env.IMAGEKIT_PRIVATE_KEY_DDRIVER  ?? ""], "D-Driver"),
        ]);

        return NextResponse.json({ projects: results, timestamp: new Date().toISOString() });
    } catch (error) {
        console.error("ImageKit usage error:", error);
        return NextResponse.json({ error: "Failed to fetch ImageKit data" }, { status: 500 });
    }
}
