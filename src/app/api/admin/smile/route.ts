import { db } from "@/db";
import { smileTasks, smileAnalytics } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;

        const tasks = await db.select().from(smileTasks).orderBy(smileTasks.createdAt);

        // Aggregate analytics counts per task
        const analytics = await db
            .select({
                taskId: smileAnalytics.taskId,
                event: smileAnalytics.event,
                count: sql<number>`cast(count(*) as int)`,
            })
            .from(smileAnalytics)
            .groupBy(smileAnalytics.taskId, smileAnalytics.event);

        // Attach counts to each task
        const tasksWithStats = tasks.map(task => {
            const taskEvents = analytics.filter(a => a.taskId === task.id);
            const countOf = (e: string) => taskEvents.find(a => a.event === e)?.count || 0;
            return {
                ...task,
                stats: {
                    opens: countOf("open"),
                    reveals: countOf("reveal"),
                    retries: countOf("retry"),
                    sharesDownload: countOf("share_download"),
                    sharesWeb: countOf("share_web"),
                    rareUnlocks: countOf("rare"),
                },
            };
        });

        return NextResponse.json(tasksWithStats);
    } catch (err) {
        console.error("[admin/smile] GET failed:", err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;

        const data = await req.json();
        const { title, status, link, lines, rareLines, rareChance, posterBgGradient, shareText } = data;

        if (!title || !Array.isArray(lines) || lines.length === 0) {
            return NextResponse.json({ error: "title and lines are required" }, { status: 400 });
        }

        // Ensure only one task can be "live" at a time
        if (status === "live") {
            await db.update(smileTasks).set({ status: "pause" }).where(eq(smileTasks.status, "live"));
        }

        const [task] = await db.insert(smileTasks).values({
            title,
            status: status || "pause",
            link: link || "/smile",
            lines,
            rareLines: rareLines || [],
            rareChance: rareChance ?? 10,
            posterBgGradient: posterBgGradient || "#1a1a2e,#16213e",
            shareText: shareText || "This made me smile 😄 Try yours →",
        }).returning();

        return NextResponse.json(task);
    } catch (err) {
        console.error("[admin/smile] POST failed:", err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;

        const data = await req.json();
        const { id, ...updates } = data;
        if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

        // Ensure only one "live" task
        if (updates.status === "live") {
            await db.update(smileTasks).set({ status: "pause" }).where(eq(smileTasks.status, "live"));
        }

        const [task] = await db.update(smileTasks)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(smileTasks.id, id))
            .returning();

        return NextResponse.json(task);
    } catch (err) {
        console.error("[admin/smile] PATCH failed:", err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;

        const { id } = await req.json();
        if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

        await db.delete(smileAnalytics).where(eq(smileAnalytics.taskId, id));
        await db.delete(smileTasks).where(eq(smileTasks.id, id));

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[admin/smile] DELETE failed:", err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
