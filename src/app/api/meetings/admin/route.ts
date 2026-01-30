import { db } from "@/db";
import { meetingSchedules } from "@/db/schema";
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

export async function GET() {
    try {
        const meetings = await db.query.meetingSchedules.findMany({
            orderBy: [desc(meetingSchedules.createdAt)]
        });
        return NextResponse.json(meetings);
    } catch (error) {
        console.error("Failed to fetch meetings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { id, status, checklistData, scoringData } = body;

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        const updateData: any = { updatedAt: new Date() };
        if (status) updateData.status = status;
        if (checklistData) updateData.checklistData = checklistData;
        if (scoringData) updateData.scoringData = scoringData;

        await db.update(meetingSchedules)
            .set(updateData)
            .where(eq(meetingSchedules.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to update meeting:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await db.delete(meetingSchedules).where(eq(meetingSchedules.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete meeting:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
