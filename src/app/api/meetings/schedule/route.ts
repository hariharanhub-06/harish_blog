import { db } from "@/db";
import { meetingSchedules } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, and, gte, lte, lt, gt, or } from "drizzle-orm";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const dateStr = searchParams.get("date");
        if (!dateStr) return NextResponse.json([]);

        const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
        const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

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
            venue,
            venueDetails,
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
                    // Correct overlap logic for custom ranges
                    and(lte(t.scheduledDate, start), gt(t.endDate, start)),
                    and(lt(t.scheduledDate, end), gte(t.endDate, end)),
                    and(gte(t.scheduledDate, start), lte(t.endDate, end))
                )
            )
        });

        if (overlapping) {
            return NextResponse.json({ error: "This time slot is already booked. Please choose another time." }, { status: 409 });
        }

        const result = await db.insert(meetingSchedules).values({
            meetingType,
            clubName,
            numAttendees,
            notes,
            presidentName,
            mobileNumber,
            driveLink,
            venue,
            venueDetails,
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
