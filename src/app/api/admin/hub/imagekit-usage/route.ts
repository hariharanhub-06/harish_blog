import { NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/adminAuth";

const FREE_LIMITS = {
    storageBytes:   20 * 1024 * 1024 * 1024, // 20 GB
    bandwidthBytes: 20 * 1024 * 1024 * 1024, // 20 GB/month
};

async function fetchImageKitData(privateKey: string, projectLabel: string) {
    if (!privateKey) return { label: projectLabel, configured: false };
    const credentials = Buffer.from(`${privateKey.trim()}:`).toString("base64");
    const headers = { Authorization: `Basic ${credentials}` };
    try {
        // Fetch up to 1000 files and sum their sizes for storage usage
        const res = await fetch("https://api.imagekit.io/v1/files?limit=1000&skip=0", { headers });
        if (!res.ok) return { label: projectLabel, configured: true, error: `ImageKit API ${res.status}` };

        const files: any[] = await res.json();
        const storageUsed = files.reduce((sum, f) => sum + (f.size ?? 0), 0);
        const fileCount   = files.length;

        return {
            label: projectLabel,
            configured: true,
            stats: { storageUsed, fileCount },
            limits: FREE_LIMITS,
        };
    } catch {
        return { label: projectLabel, configured: true, error: "API call failed" };
    }
}

export async function GET(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;

        const results = await Promise.all([
            fetchImageKitData(process.env.IMAGEKIT_PRIVATE_KEY         ?? "", "Harishblog"),
            fetchImageKitData(process.env.IMAGEKIT_PRIVATE_KEY_STARTUP  ?? "", "StartUP"),
            fetchImageKitData(process.env.IMAGEKIT_PRIVATE_KEY_DDRIVER  ?? "", "D-Driver"),
        ]);

        return NextResponse.json({ projects: results, timestamp: new Date().toISOString() });
    } catch (error) {
        console.error("ImageKit usage error:", error);
        return NextResponse.json({ error: "Failed to fetch ImageKit data" }, { status: 500 });
    }
}
