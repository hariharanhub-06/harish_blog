import { db } from "@/db";
import { smileAnalytics } from "@/db/schema";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const { taskId, event } = await req.json();
        if (!taskId || !event) {
            return NextResponse.json({ error: "Missing taskId or event" }, { status: 400 });
        }

        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            req.headers.get("x-real-ip") || "unknown";
        const ipHash = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);

        await db.insert(smileAnalytics).values({ taskId, event, ipHash });
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[smile/track] POST failed:", err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
