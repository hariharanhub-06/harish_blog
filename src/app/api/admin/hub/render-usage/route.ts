import { NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/adminAuth";

async function fetchRenderData(apiKey: string, projectLabel: string) {
    if (!apiKey) return { label: projectLabel, configured: false };
    const headers = { Authorization: `Bearer ${apiKey}`, Accept: "application/json" };
    try {
        const servicesRes = await fetch("https://api.render.com/v1/services?limit=20", { headers });
        let services: unknown[] = [];
        if (servicesRes.ok) {
            const data = await servicesRes.json();
            services = Array.isArray(data) ? data : (data.services ?? []);
        }
        return { label: projectLabel, configured: true, services };
    } catch {
        return { label: projectLabel, configured: true, error: "API call failed" };
    }
}

export async function GET(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;

        const results = await Promise.all([
            fetchRenderData(process.env.RENDER_API_KEY_HARISHBLOG ?? "", "Harishblog"),
            fetchRenderData(process.env.RENDER_API_KEY_STARTUP ?? "", "StartUP"),
            fetchRenderData(process.env.RENDER_API_KEY_DDRIVER ?? "", "D-Driver"),
        ]);

        return NextResponse.json({ projects: results, timestamp: new Date().toISOString() });
    } catch (error) {
        console.error("Render usage error:", error);
        return NextResponse.json({ error: "Failed to fetch Render data" }, { status: 500 });
    }
}
