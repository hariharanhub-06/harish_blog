import { db } from "@/db";
import { meetingSchedules } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, and, gte, lte } from "drizzle-orm";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const dateStr = searchParams.get("date");
        if (!dateStr) return NextResponse.json([]);

        const date = new Date(dateStr);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));

        const booked = await db.query.meetingSchedules.findMany({
            where: (t, { and, gte, lte }) => and(
                gte(t.scheduledDate, startOfDay),
                lte(t.scheduledDate, endOfDay)
            )
        });

        return NextResponse.json(booked.map(m => {
            const d = new Date(m.scheduledDate);
            const hour = d.getHours();
            // Map hours back to slot strings
            if (hour === 10) return "10:00 - 12:00";
            if (hour === 13) return "13:00 - 15:00";
            if (hour === 16) return "16:00 - 18:00";
            return null;
        }).filter(Boolean));
    } catch (error) {
        console.error("Failed to fetch booked slots:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

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

        const requestedDate = new Date(scheduledDate);

        // Check for double-booking
        const existing = await db.query.meetingSchedules.findFirst({
            where: (t, { eq }) => eq(t.scheduledDate, requestedDate)
        });

        if (existing) {
            return NextResponse.json({ error: "This slot is already booked" }, { status: 409 });
        }

        const result = await db.insert(meetingSchedules).values({
            meetingType,
            clubName,
            numAttendees,
            notes,
            presidentName,
            mobileNumber,
            driveLink,
            scheduledDate: requestedDate,
            status: "requested"
        }).returning();

        return NextResponse.json({ success: true, meeting: result[0] });
    } catch (error) {
        console.error("Failed to schedule meeting:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
