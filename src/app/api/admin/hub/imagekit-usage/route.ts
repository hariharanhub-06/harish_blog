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

async function fetchImageKitProject(
    keys: { key: string; account: string }[],
    projectLabel: string,
) {
    const valid = keys.filter(k => k.key);
    if (valid.length === 0) return { label: projectLabel, configured: false };

    const results = await Promise.all(valid.map(k => fetchImageKitData(k.key).then(r => ({ account: k.account, data: r }))));
    const successful = results.filter(r => r.data !== null) as { account: string; data: NonNullable<ReturnType<typeof fetchImageKitData> extends Promise<infer T> ? T : never> }[];

    if (successful.length === 0) return { label: projectLabel, configured: true, error: "API call failed" };

    const breakdown = successful.map(r => ({
        account:     r.account,
        storageUsed: r.data!.storageUsed,
        fileCount:   r.data!.fileCount,
    }));

    return {
        label: projectLabel,
        configured: true,
        stats: {
            storageUsed: breakdown.reduce((s, r) => s + r.storageUsed, 0),
            fileCount:   breakdown.reduce((s, r) => s + r.fileCount, 0),
        },
        breakdown: breakdown.length > 1 ? breakdown : undefined,
        limits: FREE_LIMITS,
    };
}

export async function GET(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;

        const results = await Promise.all([
            fetchImageKitProject([{ key: process.env.IMAGEKIT_PRIVATE_KEY ?? "", account: "Harishblog" }], "Harishblog"),
            fetchImageKitProject([
                { key: process.env.IMAGEKIT_PRIVATE_KEY_STARTUP  ?? "", account: "Primary (lzmpwlx08)" },
                { key: process.env.IMAGEKIT_PRIVATE_KEY_STARTUP_2 ?? "", account: "Secondary (6k5vfwl1j)" },
            ], "StartUP"),
            fetchImageKitProject([{ key: process.env.IMAGEKIT_PRIVATE_KEY_DDRIVER ?? "", account: "D-Driver" }], "D-Driver"),
        ]);

        return NextResponse.json({ projects: results, timestamp: new Date().toISOString() });
    } catch (error) {
        console.error("ImageKit usage error:", error);
        return NextResponse.json({ error: "Failed to fetch ImageKit data" }, { status: 500 });
    }
}
