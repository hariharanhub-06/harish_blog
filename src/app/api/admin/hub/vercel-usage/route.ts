import { NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/adminAuth";

const FREE_LIMITS = {
    bandwidth:         100 * 1024 * 1024 * 1024,
    buildMinutes:      6000,
    edgeInvocations:   1_000_000,
    monthlyDeployLimit: 6000,
};

async function fetchDeployments(token: string, from: number, to: number) {
    const headers = { Authorization: `Bearer ${token}` };
    const res = await fetch(
        `https://api.vercel.com/v6/deployments?limit=100&state=READY&from=${from}&until=${to}`,
        { headers }
    );
    if (!res.ok) return [];
    return (await res.json()).deployments ?? [];
}

async function fetchVercelData(token: string, projectLabel: string, from?: number, to?: number) {
    if (!token) return { label: projectLabel, configured: false };
    const headers = { Authorization: `Bearer ${token}` };

    const rangeFrom = from ?? (() => { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d.getTime(); })();
    const rangeTo   = to ?? Date.now();

    try {
        const [projectsRes, allDeps] = await Promise.all([
            fetch("https://api.vercel.com/v9/projects?limit=20", { headers }),
            fetchDeployments(token, rangeFrom, rangeTo),
        ]);

        const projects: any[] = projectsRes.ok ? (await projectsRes.json()).projects ?? [] : [];

        // Build daily breakdown
        const byDay: Record<string, number> = {};
        for (const d of allDeps) {
            if (!d.createdAt || d.createdAt < rangeFrom || d.createdAt > rangeTo) continue;
            const day = new Date(d.createdAt).toISOString().slice(0, 10);
            byDay[day] = (byDay[day] ?? 0) + 1;
        }

        // Fill all days in range with 0
        const daily: { date: string; builds: number }[] = [];
        const cur = new Date(rangeFrom);
        const end = new Date(rangeTo);
        while (cur <= end) {
            const key = cur.toISOString().slice(0, 10);
            daily.push({ date: key, builds: byDay[key] ?? 0 });
            cur.setDate(cur.getDate() + 1);
        }

        const monthlyBuilds = allDeps.length;
        const lastDeployAt  = allDeps[0]?.createdAt ?? null;

        return {
            label: projectLabel,
            configured: true,
            projects,
            usage: { monthlyBuilds, lastDeployAt, totalFetched: allDeps.length },
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

        // Single-project detailed request
        if (projectParam) {
            const tokenMap: Record<string, string> = {
                "Harishblog": process.env.VERCEL_API_TOKEN_HARISHBLOG ?? "",
                "StartUP":    process.env.VERCEL_API_TOKEN_STARTUP    ?? "",
                "D-Driver":   process.env.VERCEL_API_TOKEN_DDRIVER    ?? "",
            };
            const token = tokenMap[projectParam] ?? "";
            const data  = await fetchVercelData(token, projectParam, from, to);
            return NextResponse.json(data);
        }

        // All-projects summary (existing behaviour)
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
