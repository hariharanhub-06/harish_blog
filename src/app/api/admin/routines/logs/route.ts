import { db } from "@/db";
import { routineLogs } from "@/db/schema";
import { eq, and, between } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const routineId = searchParams.get("routineId");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        let conditions = [];

        if (routineId) {
            conditions.push(eq(routineLogs.routineId, routineId));
        }
        if (startDate && endDate) {
            conditions.push(between(routineLogs.date, startDate, endDate));
        }

        if (conditions.length === 0) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        const logs = await db.select().from(routineLogs).where(and(...conditions));
        return NextResponse.json(logs);
    } catch (error) {
        console.error("GET routine logs error:", error);
        return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json(); // { routineId, date, isCompleted, notes }
        const { routineId, date, isCompleted, notes } = data;

        if (!routineId || !date) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Upsert logic
        const existing = await db.select().from(routineLogs).where(and(
            eq(routineLogs.routineId, routineId),
            eq(routineLogs.date, date)
        )).limit(1);

        if (existing.length > 0) {
            await db.update(routineLogs)
                .set({
                    isCompleted: isCompleted ?? existing[0].isCompleted,
                    notes: notes ?? existing[0].notes,
                    updatedAt: new Date()
                })
                .where(eq(routineLogs.id, existing[0].id));
            return NextResponse.json({ success: true, updated: true });
        } else {
            const [newLog] = await db.insert(routineLogs).values({
                routineId,
                date,
                isCompleted: isCompleted ?? false,
                notes: notes ?? "",
                createdAt: new Date(),
                updatedAt: new Date()
            }).returning();
            return NextResponse.json({ success: true, created: true, log: newLog });
        }
    } catch (error) {
        console.error("POST routine log error:", error);
        return NextResponse.json({ error: "Failed to save log" }, { status: 500 });
    }
}
