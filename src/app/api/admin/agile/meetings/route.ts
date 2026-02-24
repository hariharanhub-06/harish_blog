import { db } from "@/db";
import { agileMeetings } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const sprintId = searchParams.get("sprintId");

    if (!projectId) {
        return NextResponse.json({ error: "Missing Project ID" }, { status: 400 });
    }

    try {
        let whereClause = eq(agileMeetings.projectId, projectId);
        if (sprintId) {
            whereClause = and(whereClause, eq(agileMeetings.sprintId, sprintId)) as any;
        }

        const meetings = await db.query.agileMeetings.findMany({
            where: whereClause,
            orderBy: [desc(agileMeetings.date)],
        });
        return NextResponse.json(meetings);
    } catch (error: any) {
        console.error("Error fetching agile meetings:", error);
        return NextResponse.json({ error: "Failed to fetch meetings" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, projectId, sprintId, type, date, content, mood } = body;

        const meetingData = {
            projectId,
            sprintId: sprintId || null,
            type,
            date: date ? new Date(date) : new Date(),
            content: content || {},
            mood: mood || 5,
            updatedAt: new Date(),
        };

        if (id) {
            await db.update(agileMeetings).set(meetingData).where(eq(agileMeetings.id, id));
            return NextResponse.json({ success: true, id });
        } else {
            const [newMeeting] = await db.insert(agileMeetings).values({
                ...meetingData,
                createdAt: new Date(),
            }).returning();
            return NextResponse.json({ success: true, id: newMeeting.id });
        }
    } catch (error: any) {
        console.error("Error saving agile meeting:", error);
        return NextResponse.json({ error: error.message || "Failed to save meeting" }, { status: 500 });
    }
}
