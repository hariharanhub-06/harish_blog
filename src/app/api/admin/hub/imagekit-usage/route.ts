import { NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/adminAuth";

const FREE_LIMITS = {
    storageBytes:   20 * 1024 * 1024 * 1024, // 20 GB
    bandwidthBytes: 20 * 1024 * 1024 * 1024, // 20 GB/month
};

function currentMonthRange() {
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, "0");
    const lastDay = new Date(y, now.getUTCMonth() + 1, 0).getUTCDate();
    return { startDate: `${y}-${m}-01`, endDate: `${y}-${m}-${lastDay}` };
}

async function fetchImageKitData(privateKey: string): Promise<{ storageUsed: number; bandwidthUsed: number; fileCount: number } | null> {
    if (!privateKey) return null;
    const credentials = Buffer.from(`${privateKey.trim()}:`).toString("base64");
    const headers = { Authorization: `Basic ${credentials}` };
    const { startDate, endDate } = currentMonthRange();

    try {
        const [filesRes, usageRes] = await Promise.all([
            fetch("https://api.imagekit.io/v1/files?limit=1000&skip=0", { headers }),
            fetch(`https://api.imagekit.io/v1/accounts/usage?startDate=${startDate}&endDate=${endDate}`, { headers }),
        ]);

        const files: any[] = filesRes.ok ? await filesRes.json() : [];
        const usage: any    = usageRes.ok ? await usageRes.json() : {};

        return {
            storageUsed:   usage.mediaLibraryStorageBytes ?? files.reduce((sum, f) => sum + (f.size ?? 0), 0),
            bandwidthUsed: usage.bandwidthBytes ?? 0,
            fileCount:     files.length,
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
    const successful = results.filter(r => r.data !== null) as { account: string; data: NonNullable<Awaited<ReturnType<typeof fetchImageKitData>>> }[];

    if (successful.length === 0) return { label: projectLabel, configured: true, error: "API call failed" };

    const breakdown = successful.map(r => ({
        account:       r.account,
        storageUsed:   r.data.storageUsed,
        bandwidthUsed: r.data.bandwidthUsed,
        fileCount:     r.data.fileCount,
    }));

    return {
        label: projectLabel,
        configured: true,
        stats: {
            storageUsed:   breakdown.reduce((s, r) => s + r.storageUsed, 0),
            bandwidthUsed: breakdown.reduce((s, r) => s + r.bandwidthUsed, 0),
            fileCount:     breakdown.reduce((s, r) => s + r.fileCount, 0),
        },
        breakdown: breakdown.length > 1 ? breakdown : undefined,
        limits: FREE_LIMITS,
    };
}

export async function GET(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;

        const { searchParams } = new URL(req.url);
        const projectParam = searchParams.get("project");
        const startDate    = searchParams.get("startDate") ?? undefined;
        const endDate      = searchParams.get("endDate")   ?? undefined;

        // Override date range helper if params provided
        if (startDate && endDate) {
            // Temporarily override currentMonthRange by passing overrides into fetchImageKitData
        }

        const projectMap: Record<string, Parameters<typeof fetchImageKitProject>[0]> = {
            "Harishblog": [{ key: process.env.IMAGEKIT_PRIVATE_KEY ?? "", account: "Harishblog" }],
            "StartUP": [
                { key: process.env.IMAGEKIT_PRIVATE_KEY_STARTUP   ?? "", account: "Primary (lzmpwlx08)" },
                { key: process.env.IMAGEKIT_PRIVATE_KEY_STARTUP_2 ?? "", account: "Secondary (6k5vfwl1j)" },
            ],
            "D-Driver": [{ key: process.env.IMAGEKIT_PRIVATE_KEY_DDRIVER ?? "", account: "D-Driver" }],
        };

        if (projectParam && projectMap[projectParam]) {
            const data = await fetchImageKitProjectWithRange(projectMap[projectParam], projectParam, startDate, endDate);
            return NextResponse.json(data);
        }

        const results = await Promise.all([
            fetchImageKitProject(projectMap["Harishblog"], "Harishblog"),
            fetchImageKitProject(projectMap["StartUP"],    "StartUP"),
            fetchImageKitProject(projectMap["D-Driver"],   "D-Driver"),
        ]);

        return NextResponse.json({ projects: results, timestamp: new Date().toISOString() });
    } catch (error) {
        console.error("ImageKit usage error:", error);
        return NextResponse.json({ error: "Failed to fetch ImageKit data" }, { status: 500 });
    }
}

async function fetchImageKitProjectWithRange(
    keys: { key: string; account: string }[],
    projectLabel: string,
    startDate?: string,
    endDate?: string,
) {
    const range = startDate && endDate
        ? { startDate, endDate }
        : currentMonthRange();

    const valid = keys.filter(k => k.key);
    if (valid.length === 0) return { label: projectLabel, configured: false };

    const results = await Promise.all(valid.map(async k => {
        if (!k.key) return { account: k.account, data: null };
        const credentials = Buffer.from(`${k.key.trim()}:`).toString("base64");
        const headers = { Authorization: `Basic ${credentials}` };
        try {
            const [filesRes, usageRes] = await Promise.all([
                fetch("https://api.imagekit.io/v1/files?limit=1000&skip=0", { headers }),
                fetch(`https://api.imagekit.io/v1/accounts/usage?startDate=${range.startDate}&endDate=${range.endDate}`, { headers }),
            ]);
            const files: any[] = filesRes.ok ? await filesRes.json() : [];
            const usage: any    = usageRes.ok ? await usageRes.json() : {};
            return {
                account: k.account,
                data: {
                    storageUsed:   usage.mediaLibraryStorageBytes ?? files.reduce((s, f) => s + (f.size ?? 0), 0),
                    bandwidthUsed: usage.bandwidthBytes ?? 0,
                    fileCount:     files.length,
                },
            };
        } catch {
            return { account: k.account, data: null };
        }
    }));

    const successful = results.filter(r => r.data !== null) as { account: string; data: { storageUsed: number; bandwidthUsed: number; fileCount: number } }[];
    if (successful.length === 0) return { label: projectLabel, configured: true, error: "API call failed" };

    return {
        label: projectLabel,
        configured: true,
        stats: {
            storageUsed:   successful.reduce((s, r) => s + r.data.storageUsed, 0),
            bandwidthUsed: successful.reduce((s, r) => s + r.data.bandwidthUsed, 0),
            fileCount:     successful.reduce((s, r) => s + r.data.fileCount, 0),
        },
        breakdown: successful.length > 1 ? successful.map(r => ({ account: r.account, ...r.data })) : undefined,
        limits: FREE_LIMITS,
        period: { startDate: range.startDate, endDate: range.endDate },
    };
}
