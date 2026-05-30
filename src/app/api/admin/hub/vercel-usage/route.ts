import { NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/adminAuth";

const FREE_LIMITS = {
    bandwidth:          100 * 1024 * 1024 * 1024,
    buildMinutes:       6000,
    edgeInvocations:    1_000_000,
    monthlyDeployLimit: 6000,
};

async function fetchDeploymentsInRange(token: string, sinceMs: number, untilMs: number) {
    const headers = { Authorization: `Bearer ${token}` };
    // Vercel uses `since` (created after) and `until` (created before) — NOT `from`
    const res = await fetch(
        `https://api.vercel.com/v6/deployments?limit=100&state=READY&since=${sinceMs}&until=${untilMs}`,
        { headers }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.deployments ?? []).filter(
        (d: any) => d.createdAt >= sinceMs && d.createdAt <= untilMs
    );
}

async function fetchVercelData(token: string, projectLabel: string, from?: number, to?: number) {
    if (!token) return { label: projectLabel, configured: false };
    const headers = { Authorization: `Bearer ${token}` };

    const now   = new Date();
    const rangeFrom = from ?? new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const rangeTo   = to   ?? now.getTime();

    try {
        const [projectsRes, deps] = await Promise.all([
            fetch("https://api.vercel.com/v9/projects?limit=20", { headers }),
            fetchDeploymentsInRange(token, rangeFrom, rangeTo),
        ]);

        const projects: any[] = projectsRes.ok ? (await projectsRes.json()).projects ?? [] : [];

        // Daily breakdown — group by date within range
        const byDay: Record<string, number> = {};
        for (const d of deps) {
            const day = new Date(d.createdAt).toISOString().slice(0, 10);
            byDay[day] = (byDay[day] ?? 0) + 1;
        }

        // Fill every day in range (including 0-build days)
        const daily: { date: string; builds: number }[] = [];
        const cur = new Date(rangeFrom);
        const end = new Date(rangeTo);
        while (cur <= end) {
            const key = cur.toISOString().slice(0, 10);
            daily.push({ date: key, builds: byDay[key] ?? 0 });
            cur.setDate(cur.getDate() + 1);
        }

        const monthlyBuilds = deps.length;
        const lastDeployAt  = deps[0]?.createdAt ?? null;

        return {
            label: projectLabel,
            configured: true,
            projects,
            usage: { monthlyBuilds, lastDeployAt },
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
        const from = searchParams.get("from") ? parseInt(searchParams.get("from")!) : undefined;
        const to   = searchParams.get("to")   ? parseInt(searchParams.get("to")!)   : undefined;

        if (projectParam) {
            const tokenMap: Record<string, string> = {
                "Harishblog": process.env.VERCEL_API_TOKEN_HARISHBLOG ?? "",
                "StartUP":    process.env.VERCEL_API_TOKEN_STARTUP    ?? "",
                "D-Driver":   process.env.VERCEL_API_TOKEN_DDRIVER    ?? "",
            };
            const data = await fetchVercelData(tokenMap[projectParam] ?? "", projectParam, from, to);
            return NextResponse.json(data);
        }

        const results = await Promise.all([
            fetchVercelData(process.env.VERCEL_API_TOKEN_HARISHBLOG ?? "", "Harishblog"),
            fetchVercelData(process.env.VERCEL_API_TOKEN_STARTUP    ?? "", "StartUP"),
            fetchVercelData(process.env.VERCEL_API_TOKEN_DDRIVER    ?? "", "D-Driver"),
        ]);

        return NextResponse.json({ projects: results, timestamp: new Date().toISOString() });
    } catch (error) {
        console.error("Vercel usage error:", error);
        return NextResponse.json({ error: "Failed to fetch Vercel data" }, { status: 500 });
    }
}
