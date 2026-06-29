import { NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/adminAuth";

const FREE_LIMITS = {
    bandwidth:          100 * 1024 * 1024 * 1024,
    buildMinutes:       6000,
    edgeInvocations:    1_000_000,
    monthlyDeployLimit: 6000,
};

// Paginate through ALL deployments in the date range, filtered by projectId if provided
async function fetchDeploymentsInRange(token: string, sinceMs: number, untilMs: number, projectId?: string | null) {
    const headers = { Authorization: `Bearer ${token}` };
    const all: any[] = [];
    let currentUntil = untilMs;
    const MAX_PAGES = 15;
    const projFilter = projectId ? `&projectId=${encodeURIComponent(projectId)}` : "";

    for (let page = 0; page < MAX_PAGES; page++) {
        const url = `https://api.vercel.com/v6/deployments?limit=100&state=READY&since=${sinceMs}&until=${currentUntil}${projFilter}`;
        let data: any;
        try {
            const res = await fetch(url, { headers });
            if (!res.ok) break;
            data = await res.json();
        } catch {
            break;
        }

        const deps: any[] = data.deployments ?? [];

        // Keep only deployments within our exact range
        const inRange = deps.filter(d => d.createdAt >= sinceMs && d.createdAt <= untilMs);
        all.push(...inRange);

        // Vercel's pagination.next is the oldest createdAt on the current page
        const nextCursor: number | null = data.pagination?.next ?? null;

        // Stop if no more pages, or the next cursor is before our range start
        if (!nextCursor || nextCursor < sinceMs || inRange.length === 0) break;

        // Advance the until cursor to fetch older deployments
        currentUntil = nextCursor;
    }

    return all;
}

async function fetchVercelData(
    token: string, projectLabel: string,
    from?: number, to?: number,
    startDate?: string, endDate?: string,
) {
    if (!token) return { label: projectLabel, configured: false };
    const headers = { Authorization: `Bearer ${token}` };

    const now   = new Date();
    const rangeFrom = from ?? new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const rangeTo   = to   ?? now.getTime();

    // Use the local date strings if provided, otherwise derive from timestamps (UTC, for summary tiles)
    const dayStart = startDate ?? new Date(rangeFrom).toISOString().slice(0, 10);
    const dayEnd   = endDate   ?? new Date(rangeTo).toISOString().slice(0, 10);

    try {
        // Fetch projects for the count tile / metadata only.
        const projectsRes = await fetch("https://api.vercel.com/v9/projects?limit=20", { headers });
        const projects: any[] = projectsRes.ok ? (await projectsRes.json()).projects ?? [] : [];

        // Count deployments across ALL projects in this token's scope, not just
        // projects[0]. Filtering by the first project's id undercounted any
        // account that has more than one Vercel project. The token is already
        // scoped to a single account/team, so an unfiltered query is correct.
        const deps = await fetchDeploymentsInRange(token, rangeFrom, rangeTo, null);

        // Group deployments by LOCAL date string provided from client
        // Use UTC-adjusted date for each deployment (close enough; within-day accuracy)
        const byDay: Record<string, number> = {};
        for (const d of deps) {
            // Format as YYYY-MM-DD in UTC; frontend label mapping handles display
            const day = new Date(d.createdAt).toISOString().slice(0, 10);
            byDay[day] = (byDay[day] ?? 0) + 1;
        }

        // Fill every day from dayStart to dayEnd (inclusive) using the client-supplied local strings
        const daily: { date: string; builds: number }[] = [];
        const cur = new Date(dayStart + "T12:00:00Z"); // noon UTC avoids DST edge cases
        const end = new Date(dayEnd   + "T12:00:00Z");
        while (cur <= end) {
            const key = cur.toISOString().slice(0, 10);
            daily.push({ date: key, builds: byDay[key] ?? 0 });
            cur.setUTCDate(cur.getUTCDate() + 1);
        }

        return {
            label: projectLabel,
            configured: true,
            projects,
            usage: { monthlyBuilds: deps.length, lastDeployAt: deps[0]?.createdAt ?? null },
            daily,
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

        const { searchParams } = new URL(req.url);
        const projectParam = searchParams.get("project");
        const from      = searchParams.get("from")      ? parseInt(searchParams.get("from")!) : undefined;
        const to        = searchParams.get("to")        ? parseInt(searchParams.get("to")!)   : undefined;
        const startDate = searchParams.get("startDate") ?? undefined;
        const endDate   = searchParams.get("endDate")   ?? undefined;

        if (projectParam) {
            const tokenMap: Record<string, string> = {
                "Harishblog": process.env.VERCEL_API_TOKEN_HARISHBLOG ?? "",
                "StartUP":    process.env.VERCEL_API_TOKEN_STARTUP    ?? "",
                "D-Driver":   process.env.VERCEL_API_TOKEN_DDRIVER    ?? "",
                "Solar":      process.env.VERCEL_API_TOKEN_SOLAR      ?? "",
            };
            return NextResponse.json(
                await fetchVercelData(tokenMap[projectParam] ?? "", projectParam, from, to, startDate, endDate)
            );
        }

        const results = await Promise.all([
            fetchVercelData(process.env.VERCEL_API_TOKEN_HARISHBLOG ?? "", "Harishblog"),
            fetchVercelData(process.env.VERCEL_API_TOKEN_STARTUP    ?? "", "StartUP"),
            fetchVercelData(process.env.VERCEL_API_TOKEN_DDRIVER    ?? "", "D-Driver"),
            fetchVercelData(process.env.VERCEL_API_TOKEN_SOLAR      ?? "", "Solar"),
        ]);

        return NextResponse.json({ projects: results, timestamp: new Date().toISOString() });
    } catch (error) {
        console.error("Vercel usage error:", error);
        return NextResponse.json({ error: "Failed to fetch Vercel data" }, { status: 500 });
    }
}
