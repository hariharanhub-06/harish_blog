import { db } from "@/db";
import { meetingSchedules } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            meetingType,
            clubName,
            numAttendees,
            notes,
            presidentName,
            mobileNumber,
            driveLink,
            scheduledDate
        } = body;

        if (!meetingType || !clubName || !scheduledDate) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const result = await db.insert(meetingSchedules).values({
            meetingType,
            clubName,
            numAttendees,
            notes,
            presidentName,
            mobileNumber,
            driveLink,
            scheduledDate: new Date(scheduledDate),
            status: "requested"
        }).returning();

        return NextResponse.json({ success: true, meeting: result[0] });
    } catch (error) {
        console.error("Failed to schedule meeting:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
