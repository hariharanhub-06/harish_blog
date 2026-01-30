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
        const { specificDate, isAvailable } = body;

        if (!specificDate) {
            return NextResponse.json({ error: "Date is required" }, { status: 400 });
        }

        const date = new Date(specificDate);
        date.setHours(0, 0, 0, 0);

        const existing = await db.query.meetingAvailability.findFirst({
            where: (t, { eq }) => eq(t.specificDate, date)
        });

        if (existing) {
            await db.update(meetingAvailability)
                .set({ isAvailable })
                .where(eq(meetingAvailability.id, existing.id));
        } else {
            await db.insert(meetingAvailability).values({
                specificDate: date,
                isAvailable
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to update availability:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
