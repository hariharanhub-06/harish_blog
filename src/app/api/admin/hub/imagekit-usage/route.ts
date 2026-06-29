import { NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/adminAuth";

const FREE_LIMITS = {
    storageBytes:   3 * 1024 * 1024 * 1024,   // ImageKit free plan: 3 GB media (DAM) storage
    bandwidthBytes: 20 * 1024 * 1024 * 1024,  // 20 GB/month bandwidth (resets monthly)
};

function currentMonthRange() {
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, "0");
    const lastDay = new Date(y, now.getUTCMonth() + 1, 0).getUTCDate();
    return { startDate: `${y}-${m}-01`, endDate: `${y}-${m}-${String(lastDay).padStart(2, "0")}` };
}

// Fetch ImageKit usage for a single date range
async function fetchOnePeriod(
    privateKey: string,
    startDate: string,
    endDate: string,
    includeFiles = false,
): Promise<{ storageUsed: number; bandwidthUsed: number; fileCount: number } | null> {
    if (!privateKey) return null;
    const credentials = Buffer.from(`${privateKey.trim()}:`).toString("base64");
    const headers = { Authorization: `Basic ${credentials}` };
    try {
        const requests: Promise<Response>[] = [
            fetch(`https://api.imagekit.io/v1/accounts/usage?startDate=${startDate}&endDate=${endDate}`, { headers }),
        ];
        if (includeFiles) {
            requests.push(fetch("https://api.imagekit.io/v1/files?limit=1000&skip=0", { headers }));
        }
        const [usageRes, filesRes] = await Promise.all(requests);
        const usage: any    = usageRes.ok ? await usageRes.json() : {};
        const files: any[]  = filesRes?.ok ? await filesRes.json() : [];
        return {
            storageUsed:   usage.mediaLibraryStorageBytes ?? (includeFiles ? files.reduce((s: number, f: any) => s + (f.size ?? 0), 0) : 0),
            bandwidthUsed: usage.bandwidthBytes ?? 0,
            fileCount:     files.length,
        };
    } catch {
        return null;
    }
}

// Split date range into ~weekly intervals (max 6 chunks)
function buildWeeklyIntervals(startDate: string, endDate: string): { start: string; end: string; label: string }[] {
    const start = new Date(startDate + "T00:00:00Z");
    const end   = new Date(endDate   + "T00:00:00Z");
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;
    const chunkDays = Math.max(1, Math.ceil(totalDays / 6)); // at most 6 chunks

    const intervals: { start: string; end: string; label: string }[] = [];
    const cur = new Date(start);
    while (cur <= end) {
        const chunkEnd = new Date(Math.min(cur.getTime() + (chunkDays - 1) * 86400000, end.getTime()));
        const s = cur.toISOString().slice(0, 10);
        const e = chunkEnd.toISOString().slice(0, 10);
        intervals.push({
            start: s, end: e,
            // Label shows END date of the interval so the last point reads "30 May" not "26 May"
            label: new Date(e + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        });
        cur.setUTCDate(cur.getUTCDate() + chunkDays);
    }
    return intervals;
}

async function fetchImageKitProject(
    keys: { key: string; account: string }[],
    projectLabel: string,
    startDate?: string,
    endDate?: string,
    weekly?: boolean,
) {
    const range  = startDate && endDate ? { startDate, endDate } : currentMonthRange();
    const valid  = keys.filter(k => k.key);
    if (valid.length === 0) return { label: projectLabel, configured: false };

    if (weekly) {
        const intervals = buildWeeklyIntervals(range.startDate, range.endDate);

        // Fetch totals for the full period first (with file count)
        const totalsRaw = await Promise.allSettled(
            valid.map(k => fetchOnePeriod(k.key, range.startDate, range.endDate, true))
        );
        const totals = totalsRaw.reduce(
            (acc, r) => {
                if (r.status === "fulfilled" && r.value) {
                    acc.bandwidthUsed += r.value.bandwidthUsed;
                    acc.storageUsed   += r.value.storageUsed; // SUM across accounts
                    acc.fileCount     += r.value.fileCount;
                }
                return acc;
            },
            { bandwidthUsed: 0, storageUsed: 0, fileCount: 0 }
        );

        // Fetch each weekly interval per account (in parallel)
        const weeklyRaw = await Promise.allSettled(
            intervals.map(async (iv) => {
                const perAccount = await Promise.allSettled(
                    valid.map(k => fetchOnePeriod(k.key, iv.start, iv.end))
                );
                const agg = perAccount.reduce(
                    (acc, r) => {
                        if (r.status === "fulfilled" && r.value) {
                            acc.bandwidthUsed += r.value.bandwidthUsed;
                            acc.storageUsed   += r.value.storageUsed;
                        }
                        return acc;
                    },
                    { bandwidthUsed: 0, storageUsed: 0 }
                );
                return { date: iv.label, ...agg };
            })
        );

        const weeklyData = weeklyRaw.map((r, i) =>
            r.status === "fulfilled" ? r.value : { date: intervals[i].label, bandwidthUsed: 0, storageUsed: 0 }
        );

        return {
            label: projectLabel,
            configured: true,
            weekly: weeklyData,
            stats: totals,
            limits: FREE_LIMITS,
            period: range,
        };
    }

    // Non-weekly: aggregate totals for the full range only
    const results = await Promise.allSettled(
        valid.map(k => fetchOnePeriod(k.key, range.startDate, range.endDate, true))
    );
    const breakdown = results
        .map((r, i) => ({ account: valid[i].account, data: r.status === "fulfilled" ? r.value : null }))
        .filter(r => r.data !== null) as { account: string; data: { storageUsed: number; bandwidthUsed: number; fileCount: number } }[];

    if (breakdown.length === 0) return { label: projectLabel, configured: true, error: "API call failed" };

    return {
        label: projectLabel,
        configured: true,
        stats: {
            storageUsed:   breakdown.reduce((s, r) => s + r.data.storageUsed, 0),   // SUM
            bandwidthUsed: breakdown.reduce((s, r) => s + r.data.bandwidthUsed, 0), // SUM
            fileCount:     breakdown.reduce((s, r) => s + r.data.fileCount, 0),
        },
        breakdown: breakdown.length > 1 ? breakdown.map(r => ({ account: r.account, ...r.data })) : undefined,
        limits: FREE_LIMITS,
        period: range,
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
        const weekly       = searchParams.get("weekly") === "true";

        const projectMap: Record<string, { key: string; account: string }[]> = {
            "Harishblog": [{ key: process.env.IMAGEKIT_PRIVATE_KEY ?? "", account: "Harishblog" }],
            "StartUP": [
                { key: process.env.IMAGEKIT_PRIVATE_KEY_STARTUP    ?? "", account: "Primary" },
                { key: process.env.IMAGEKIT_PRIVATE_KEY_STARTUP_2  ?? "", account: "Secondary" },
            ],
            "D-Driver": [{ key: process.env.IMAGEKIT_PRIVATE_KEY_DDRIVER ?? "", account: "D-Driver" }],
            "Solar":    [{ key: process.env.IMAGEKIT_PRIVATE_KEY_SOLAR   ?? "", account: "Solar" }],
        };

        if (projectParam && projectMap[projectParam]) {
            return NextResponse.json(
                await fetchImageKitProject(projectMap[projectParam], projectParam, startDate, endDate, weekly)
            );
        }

        const results = await Promise.all(
            Object.entries(projectMap).map(([label, keys]) =>
                fetchImageKitProject(keys, label)
            )
        );

        return NextResponse.json({ projects: results, timestamp: new Date().toISOString() });
    } catch (error) {
        console.error("ImageKit usage error:", error);
        return NextResponse.json({ error: "Failed to fetch ImageKit data" }, { status: 500 });
    }
}
