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

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            meetingType, clubName, numAttendees, notes, presidentName,
            mobileNumber, driveLink, venue, venueDetails, scheduledDate
        } = body;

        if (!meetingType || !clubName || !scheduledDate) {
            return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
        }

        await db.insert(meetingSchedules).values({
            meetingType,
            clubName,
            numAttendees: numAttendees ? parseInt(numAttendees) : 0,
            notes,
            presidentName,
            mobileNumber,
            driveLink,
            venue,
            venueDetails,
            scheduledDate: new Date(scheduledDate),
            status: "requested"
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to create meeting:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const {
            id, status, checklistData, scoringData,
            meetingType, clubName, numAttendees, notes,
            presidentName, mobileNumber, driveLink,
            venue, venueDetails, scheduledDate
        } = body;

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        const updateData: any = { updatedAt: new Date() };

        // Generic updates
        if (status) updateData.status = status;
        if (checklistData) updateData.checklistData = checklistData;
        if (scoringData) updateData.scoringData = scoringData;

        // Form updates
        if (meetingType) updateData.meetingType = meetingType;
        if (clubName) updateData.clubName = clubName;
        if (numAttendees !== undefined) updateData.numAttendees = parseInt(numAttendees);
        if (notes !== undefined) updateData.notes = notes;
        if (presidentName !== undefined) updateData.presidentName = presidentName;
        if (mobileNumber !== undefined) updateData.mobileNumber = mobileNumber;
        if (driveLink !== undefined) updateData.driveLink = driveLink;
        if (venue !== undefined) updateData.venue = venue;
        if (venueDetails !== undefined) updateData.venueDetails = venueDetails;
        if (scheduledDate) updateData.scheduledDate = new Date(scheduledDate);

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
