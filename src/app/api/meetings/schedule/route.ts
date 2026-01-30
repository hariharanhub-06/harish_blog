import { db } from "@/db";
import { meetingSchedules } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, and, gte, lte, lt, gt, or } from "drizzle-orm";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const dateStr = searchParams.get("date");
        if (!dateStr) return NextResponse.json([]);

        const date = new Date(dateStr);
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const booked = await db.query.meetingSchedules.findMany({
            where: (t, { and, gte, lte, eq }) => and(
                gte(t.scheduledDate, startOfDay),
                lte(t.scheduledDate, endOfDay),
                eq(t.isVisible, true)
            )
        });

        return NextResponse.json(booked);
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
            scheduledDate, // Start time (ISO string)
            endDate        // End time (ISO string)
        } = body;

        if (!meetingType || !clubName || !scheduledDate || !endDate) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const start = new Date(scheduledDate);
        const end = new Date(endDate);

        // Check for double-booking/overlaps with CONFIRMED meetings
        const overlapping = await db.query.meetingSchedules.findFirst({
            where: (t, { and, or, gte, lte, lt, gt, eq }) => and(
                eq(t.status, "confirmed"),
                eq(t.isVisible, true),
                or(
                    // New meeting starts during an existing meeting: start >= t.start AND start < t.end
                    and(gte(t.scheduledDate, start), lt(t.scheduledDate, end)), // This is wrong logic, I need to compare column with value
                    // Correct logic:
                    // (t.scheduledDate <= start AND t.endDate > start) OR
                    // (t.scheduledDate < end AND t.endDate >= end) OR
                    // (t.scheduledDate >= start AND t.endDate <= end)
                    and(lte(t.scheduledDate, start), gt(t.endDate, start)),
                    and(lt(t.scheduledDate, end), gte(t.endDate, end)),
                    and(gte(t.scheduledDate, start), lte(t.endDate, end))
                )
            )
        });

        if (overlapping) {
            return NextResponse.json({ error: "This time range overlaps with an existing confirmed booking" }, { status: 409 });
        }

        const result = await db.insert(meetingSchedules).values({
            meetingType,
            clubName,
            numAttendees,
            notes,
            presidentName,
            mobileNumber,
            driveLink,
            scheduledDate: start,
            endDate: end,
            status: "requested",
            isVisible: true
        }).returning();

        return NextResponse.json({ success: true, meeting: result[0] });
    } catch (error) {
        console.error("Failed to schedule meeting:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
