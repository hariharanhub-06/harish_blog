import { NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/adminAuth";

const FREE_LIMITS = {
    storageBytes: 512 * 1024 * 1024,
    computeHours: 191.9,
    dataTransferBytes: 5 * 1024 * 1024 * 1024,
    branches: 10,
};

async function fetchNeonData(apiKey: string, projectLabel: string) {
    if (!apiKey) return { label: projectLabel, configured: false };
    const headers = { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };
    try {
        const now = new Date();
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const tomorrow = new Date(now.getTime() + 86400000).toISOString();

        const [accountRes, projectsRes] = await Promise.allSettled([
            fetch(
                `https://console.neon.tech/api/v2/consumption_history/account?from=${firstOfMonth}&to=${tomorrow}&granularity=monthly`,
                { headers }
            ),
            fetch("https://console.neon.tech/api/v2/projects?limit=20", { headers }),
        ]);

        let consumption: unknown = null;
        if (accountRes.status === "fulfilled" && accountRes.value.ok) {
            consumption = await accountRes.value.json();
        }
        let projects: unknown[] = [];
        if (projectsRes.status === "fulfilled" && projectsRes.value.ok) {
            projects = (await projectsRes.value.json()).projects ?? [];
        }

        return { label: projectLabel, configured: true, consumption, projects, limits: FREE_LIMITS };
    } catch {
        return { label: projectLabel, configured: true, error: "API call failed" };
    }
}

export async function GET(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;

        const results = await Promise.all([
            fetchNeonData(process.env.NEON_API_KEY_HARISHBLOG ?? "", "Harishblog"),
            fetchNeonData(process.env.NEON_API_KEY_STARTUP ?? "", "StartUP"),
            fetchNeonData(process.env.NEON_API_KEY_DDRIVER ?? "", "D-Driver"),
        ]);

        return NextResponse.json({ projects: results, timestamp: new Date().toISOString() });
    } catch (error) {
        console.error("Neon usage error:", error);
        return NextResponse.json({ error: "Failed to fetch Neon data" }, { status: 500 });
    }
}
