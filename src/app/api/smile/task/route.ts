import { db } from "@/db";
import { smileTasks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const task = await db.query.smileTasks.findFirst({
            where: eq(smileTasks.status, "live"),
        });
        if (!task) return NextResponse.json(null);
        return NextResponse.json(task);
    } catch (err) {
        console.error("[smile/task] GET failed:", err);
        return NextResponse.json(null);
    }
}
