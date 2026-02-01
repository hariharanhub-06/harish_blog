import { db } from "@/db";
import { liveSessions, sessionRegistrations } from "@/db/schema";
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const sessions = await db.query.liveSessions.findMany({
            orderBy: [desc(liveSessions.startTime)],
            with: {
                registrations: true
            }
        });
        console.log(`[API/SESSIONS/ADMIN] Fetched ${sessions.length} sessions`);
        return NextResponse.json(sessions);
    } catch (error) {
        console.error("Failed to fetch sessions:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, description, price, startTime, duration, meetingLink, posterUrl } = body;

        if (!title || !startTime) {
            return NextResponse.json({ error: "Title and Start Time are required" }, { status: 400 });
        }

        await db.insert(liveSessions).values({
            title,
            description,
            price: Number(price) || 0,
            startTime: new Date(startTime),
            duration: Number(duration) || 60,
            meetingLink,
            posterUrl,
            status: "scheduled",
            isPublished: false
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to create session:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { id, status, isPublished, title, description, price, startTime, duration, meetingLink, posterUrl } = body;

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        const updateData: any = { updatedAt: new Date() };

        if (status) updateData.status = status;
        if (isPublished !== undefined) updateData.isPublished = isPublished;
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (price !== undefined) updateData.price = Number(price);
        if (startTime) updateData.startTime = new Date(startTime);
        if (duration) updateData.duration = Number(duration);
        if (meetingLink) updateData.meetingLink = meetingLink;
        if (posterUrl) updateData.posterUrl = posterUrl;

        await db.update(liveSessions)
            .set(updateData)
            .where(eq(liveSessions.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to update session:", error);
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

        await db.delete(liveSessions).where(eq(liveSessions.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete session:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
