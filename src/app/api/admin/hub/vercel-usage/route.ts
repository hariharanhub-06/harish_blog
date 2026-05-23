import { NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/adminAuth";

const FREE_LIMITS = {
    bandwidth:         100 * 1024 * 1024 * 1024, // 100 GB/month
    buildMinutes:      6000,
    edgeInvocations:   1_000_000,
    monthlyDeployLimit: 6000,
};

async function fetchVercelData(token: string, projectLabel: string) {
    if (!token) return { label: projectLabel, configured: false };
    const headers = { Authorization: `Bearer ${token}` };
    try {
        const [projectsRes, deploymentsRes] = await Promise.allSettled([
            fetch("https://api.vercel.com/v9/projects?limit=20", { headers }),
            fetch("https://api.vercel.com/v6/deployments?limit=100&state=READY", { headers }),
        ]);

        const projects: any[] = projectsRes.status === "fulfilled" && projectsRes.value.ok
            ? (await projectsRes.value.json()).projects ?? [] : [];

        const allDeployments: any[] = deploymentsRes.status === "fulfilled" && deploymentsRes.value.ok
            ? (await deploymentsRes.value.json()).deployments ?? [] : [];

        // Count deployments created this calendar month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const monthlyBuilds = allDeployments.filter(d => (d.createdAt ?? 0) >= startOfMonth.getTime()).length;

        // Last deployment timestamp
        const lastDeployAt = allDeployments[0]?.createdAt ?? null;

        return {
            label: projectLabel,
            configured: true,
            projects,
            usage: { monthlyBuilds, lastDeployAt, totalFetched: allDeployments.length },
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
