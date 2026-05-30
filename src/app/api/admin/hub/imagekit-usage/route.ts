import { NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/adminAuth";

const FREE_LIMITS = {
    storageBytes:   20 * 1024 * 1024 * 1024,
    bandwidthBytes: 20 * 1024 * 1024 * 1024,
};

function currentMonthRange() {
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, "0");
    const lastDay = new Date(y, now.getUTCMonth() + 1, 0).getUTCDate();
    return { startDate: `${y}-${m}-01`, endDate: `${y}-${m}-${String(lastDay).padStart(2, "0")}` };
}

// Fetch ImageKit usage for a single date range (one API call)
async function fetchOnePeriod(
    privateKey: string,
    startDate: string,
    endDate: string,
): Promise<{ storageUsed: number; bandwidthUsed: number; fileCount: number } | null> {
    if (!privateKey) return null;
    const credentials = Buffer.from(`${privateKey.trim()}:`).toString("base64");
    const headers = { Authorization: `Basic ${credentials}` };
    try {
        const [filesRes, usageRes] = await Promise.all([
            fetch("https://api.imagekit.io/v1/files?limit=1000&skip=0", { headers }),
            fetch(`https://api.imagekit.io/v1/accounts/usage?startDate=${startDate}&endDate=${endDate}`, { headers }),
        ]);
        const files: any[] = filesRes.ok ? await filesRes.json() : [];
        const usage: any    = usageRes.ok ? await usageRes.json() : {};
        return {
            storageUsed:   usage.mediaLibraryStorageBytes ?? files.reduce((s: number, f: any) => s + (f.size ?? 0), 0),
            bandwidthUsed: usage.bandwidthBytes ?? 0,
            fileCount:     files.length,
        };
    } catch {
        return null;
    }
}

// Build day-by-day array for a date range (max 60 days)
function buildDayList(startDate: string, endDate: string): string[] {
    const days: string[] = [];
    const cur = new Date(startDate + "T00:00:00Z");
    const end = new Date(endDate   + "T00:00:00Z");
    const max = new Date(cur.getTime() + 60 * 86400000);
    while (cur <= end && cur <= max) {
        days.push(cur.toISOString().slice(0, 10));
        cur.setUTCDate(cur.getUTCDate() + 1);
    }
    return days;
}

async function fetchImageKitProject(
    keys: { key: string; account: string }[],
    projectLabel: string,
    startDate?: string,
    endDate?: string,
    daily?: boolean,
) {
    const range  = startDate && endDate ? { startDate, endDate } : currentMonthRange();
    const valid  = keys.filter(k => k.key);
    if (valid.length === 0) return { label: projectLabel, configured: false };

    if (daily) {
        // Fetch each day separately in parallel for time-series chart
        const days = buildDayList(range.startDate, range.endDate);

        // Aggregate across accounts for each day
        const dailyResults = await Promise.allSettled(
            days.map(async (day) => {
                const dayResults = await Promise.allSettled(
                    valid.map(k => fetchOnePeriod(k.key, day, day))
                );
                const totals = dayResults.reduce(
                    (acc, r) => {
                        if (r.status === "fulfilled" && r.value) {
                            acc.bandwidthUsed += r.value.bandwidthUsed;
                            // storage is the same across a day; take max
                            acc.storageUsed = Math.max(acc.storageUsed, r.value.storageUsed);
                        }
                        return acc;
                    },
                    { bandwidthUsed: 0, storageUsed: 0 }
                );
                return { date: day, ...totals };
            })
        );

        const dailyData = dailyResults.map((r, i) =>
            r.status === "fulfilled" ? r.value : { date: days[i], bandwidthUsed: 0, storageUsed: 0 }
        );

        // Also fetch totals for the whole period for stat pills
        const totalsResults = await Promise.allSettled(valid.map(k => fetchOnePeriod(k.key, range.startDate, range.endDate)));
        const totals = totalsResults.reduce(
            (acc, r) => {
                if (r.status === "fulfilled" && r.value) {
                    acc.bandwidthUsed += r.value.bandwidthUsed;
                    acc.storageUsed    = Math.max(acc.storageUsed, r.value.storageUsed);
                    acc.fileCount     += r.value.fileCount;
                }
                return acc;
            },
            { bandwidthUsed: 0, storageUsed: 0, fileCount: 0 }
        );

        return {
            label: projectLabel,
            configured: true,
            daily: dailyData,
            stats: totals,
            limits: FREE_LIMITS,
            period: range,
        };
    }

    // Non-daily: aggregate totals for the full range
    const results = await Promise.allSettled(valid.map(k => fetchOnePeriod(k.key, range.startDate, range.endDate)));
    const successful = results
        .map((r, i) => ({ account: valid[i].account, data: r.status === "fulfilled" ? r.value : null }))
        .filter(r => r.data !== null) as { account: string; data: { storageUsed: number; bandwidthUsed: number; fileCount: number } }[];

    if (successful.length === 0) return { label: projectLabel, configured: true, error: "API call failed" };

    const breakdown = successful.map(r => ({ account: r.account, ...r.data }));
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
        const daily        = searchParams.get("daily") === "true";

        const projectMap: Record<string, { key: string; account: string }[]> = {
            "Harishblog": [{ key: process.env.IMAGEKIT_PRIVATE_KEY ?? "", account: "Harishblog" }],
            "StartUP": [
                { key: process.env.IMAGEKIT_PRIVATE_KEY_STARTUP    ?? "", account: "Primary" },
                { key: process.env.IMAGEKIT_PRIVATE_KEY_STARTUP_2  ?? "", account: "Secondary" },
            ],
            "D-Driver": [{ key: process.env.IMAGEKIT_PRIVATE_KEY_DDRIVER ?? "", account: "D-Driver" }],
        };

        if (projectParam && projectMap[projectParam]) {
            return NextResponse.json(
                await fetchImageKitProject(projectMap[projectParam], projectParam, startDate, endDate, daily)
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
