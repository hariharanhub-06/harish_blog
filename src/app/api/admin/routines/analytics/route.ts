import { db } from "@/db";
import { routines, routineLogs } from "@/db/schema";
import { eq, sql, and, gte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { subDays, format } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const routineId = searchParams.get("routineId");

        if (routineId) {
            // Detailed stats for a single routine
            const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");

            const logs = await db.select().from(routineLogs).where(and(
                eq(routineLogs.routineId, routineId),
                gte(routineLogs.date, thirtyDaysAgo)
            ));

            const totalCompleted = logs.filter(l => l.isCompleted).length;
            const completionRate = logs.length > 0 ? (totalCompleted / logs.length) * 100 : 0;

            return NextResponse.json({
                routineId,
                totalLogs: logs.length,
                totalCompleted,
                completionRate,
                last30Days: logs
            });
        } else {
            // Summary for all routines
            const allRoutines = await db.select().from(routines);
            const stats = await Promise.all(allRoutines.map(async (r) => {
                const logs = await db.select({
                    count: sql<number>`count(*)`,
                    completed: sql<number>`count(*) filter (where is_completed = true)`
                }).from(routineLogs).where(eq(routineLogs.routineId, r.id));

                const result = logs[0] || { count: 0, completed: 0 };
                return {
                    id: r.id,
                    title: r.title,
                    totalDays: Number(result.count),
                    completedDays: Number(result.completed),
                    completionRate: Number(result.count) > 0 ? (Number(result.completed) / Number(result.count)) * 100 : 0
                };
            }));

            return NextResponse.json(stats);
        }
    } catch (error) {
        console.error("GET routine analytics error:", error);
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }
}
