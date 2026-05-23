import { NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/adminAuth";

// Neon Hobby free tier limits (per account, monthly)
const FREE_LIMITS = {
    computeHours: 191.9,
    storageBytes: 512 * 1024 * 1024,        // 512 MB per branch
    dataTransferBytes: 5 * 1024 * 1024 * 1024, // 5 GB
};

async function fetchNeonData(apiKey: string, projectLabel: string, projectNameFilter?: string) {
    if (!apiKey) return { label: projectLabel, configured: false };
    const headers = { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };
    try {
        const res = await fetch("https://console.neon.tech/api/v2/projects?limit=20", { headers });
        if (!res.ok) return { label: projectLabel, configured: true, error: `Neon API ${res.status}` };

        const allProjects: any[] = (await res.json()).projects ?? [];

        // Pick the right project(s) for this label
        const projects = projectNameFilter
            ? allProjects.filter(p => p.name.toLowerCase().includes(projectNameFilter.toLowerCase()))
            : allProjects;

        // Aggregate across matched projects
        const cpuUsedSec      = projects.reduce((s, p) => s + (p.cpu_used_sec ?? 0), 0);
        const storageBytes     = projects.reduce((s, p) => s + (p.synthetic_storage_size ?? 0), 0);
        const storageLimitBytes = projects[0]?.branch_logical_size_limit_bytes ?? FREE_LIMITS.storageBytes;
        const quotaResetAt     = projects[0]?.quota_reset_at ?? null;

        return {
            label: projectLabel,
            configured: true,
            usage: { cpuUsedSec, storageBytes, storageLimitBytes, quotaResetAt },
            projects,
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
            // Harishblog + D-Driver share one Neon account; filter by project name
            fetchNeonData(process.env.NEON_API_KEY_HARISHBLOG ?? "", "Harishblog", "harishblog"),
            fetchNeonData(process.env.NEON_API_KEY_STARTUP    ?? "", "StartUP"),
            fetchNeonData(process.env.NEON_API_KEY_DDRIVER    ?? "", "D-Driver",   "prabhu"),
        ]);

        return NextResponse.json({ projects: results, timestamp: new Date().toISOString() });
    } catch (error) {
        console.error("Neon usage error:", error);
        return NextResponse.json({ error: "Failed to fetch Neon data" }, { status: 500 });
    }
}
