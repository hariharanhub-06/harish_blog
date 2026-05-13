import { db } from "@/db";
import { routines, routineLogs } from "@/db/schema";
import { eq, sql, and, gte, lte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/adminAuth";
import {
    subDays,
    format,
    eachDayOfInterval,
    parseISO,
    getDay,
    getDate,
    isBefore,
    isAfter,
    startOfDay
} from "date-fns";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;
        const { searchParams } = new URL(req.url);
        const startDateParam = searchParams.get("startDate");
        const endDateParam = searchParams.get("endDate");

        // Default to last 7 days if not provided
        const endDate = endDateParam ? parseISO(endDateParam) : new Date();
        const startDate = startDateParam ? parseISO(startDateParam) : subDays(endDate, 6);

        const allRoutines = await db.select().from(routines);

        const stats = await Promise.all(allRoutines.map(async (r) => {
            // Get logs in the range
            const logs = await db.select().from(routineLogs).where(and(
                eq(routineLogs.routineId, r.id),
                gte(routineLogs.date, format(startDate, "yyyy-MM-dd")),
                lte(routineLogs.date, format(endDate, "yyyy-MM-dd"))
            ));

            const completedLogs = logs.filter(l => l.isCompleted).length;

            // Calculate "Expected" days based on schedule
            const interval = eachDayOfInterval({ start: startDate, end: endDate });
            let expectedDays = 0;

            const schedule = (r.schedule as any) || { type: "daily" };

            interval.forEach(day => {
                // Don't expect things in the future relative to today
                if (isAfter(startOfDay(day), startOfDay(new Date()))) return;

                // Also don't expect things before routine was created (not strictly enforced here yet as we don't have created_at filter in logic, but good to note)

                if (schedule.type === "daily") {
                    expectedDays++;
                } else if (schedule.type === "weekly") {
                    if (schedule.days?.includes(getDay(day))) expectedDays++;
                } else if (schedule.type === "monthly") {
                    if (schedule.dates?.includes(getDate(day))) expectedDays++;
                }
            });

            const completionRate = expectedDays > 0 ? (completedLogs / expectedDays) * 100 : 0;

            return {
                id: r.id,
                title: r.title,
                category: r.category,
                schedule: r.schedule,
                totalExpected: expectedDays,
                completedDays: completedLogs,
                completionRate: Math.min(100, completionRate)
            };
        }));

        return NextResponse.json(stats);
    } catch (error) {
        console.error("GET routine analytics error:", error);
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }
}
