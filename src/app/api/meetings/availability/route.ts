import { db } from "@/db";
import { meetingAvailability } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        const availability = await db.query.meetingAvailability.findMany();

        // If no availability is set, return a default skeleton or empty
        return NextResponse.json(availability);
    } catch (error) {
        console.error("Failed to fetch availability:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { dayOfWeek, startTime, endTime, isAvailable } = body;

        // Simple upsert logic for admin
        const existing = await db.query.meetingAvailability.findFirst({
            where: (t, { eq }) => eq(t.dayOfWeek, dayOfWeek)
        });

        if (existing) {
            await db.update(meetingAvailability)
                .set({ startTime, endTime, isAvailable })
                .where(eq(meetingAvailability.dayOfWeek, dayOfWeek));
        } else {
            await db.insert(meetingAvailability).values({
                dayOfWeek,
                startTime,
                endTime,
                isAvailable
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to update availability:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
