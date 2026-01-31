import { db } from "@/db";
import { meetingAvailability } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";

export async function GET() {
    try {
        const availability = await db.query.meetingAvailability.findMany();
        return NextResponse.json(availability);
    } catch (error) {
        console.error("Failed to fetch availability:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { availableDates } = body; // Array of YYYY-MM-DD strings

        if (!Array.isArray(availableDates)) {
            return NextResponse.json({ error: "availableDates array is required" }, { status: 400 });
        }

        // 1. Disable all current availabilities (or we could be more surgical, but this is simple and robust)
        await db.update(meetingAvailability).set({ isAvailable: false });

        // 2. Upsert the provided dates
        for (const dateKey of availableDates) {
            const normalizedDate = new Date(dateKey);
            const existing = await db.query.meetingAvailability.findFirst({
                where: (t, { eq }) => eq(t.specificDate, normalizedDate)
            });

            if (existing) {
                await db.update(meetingAvailability)
                    .set({ isAvailable: true })
                    .where(eq(meetingAvailability.id, existing.id));
            } else {
                await db.insert(meetingAvailability).values({
                    specificDate: normalizedDate,
                    isAvailable: true
                });
            }
        }

        return NextResponse.json({ success: true, message: `Synced ${availableDates.length} dates` });
    } catch (error) {
        console.error("Failed to sync availability:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
