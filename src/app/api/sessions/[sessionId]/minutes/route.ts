import { db } from "@/db";
import { liveSessionMinutes } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;
        const minutes = await db.query.liveSessionMinutes.findMany({
            where: eq(liveSessionMinutes.sessionId, sessionId),
            orderBy: [desc(liveSessionMinutes.createdAt)]
        });

        return NextResponse.json(minutes);
    } catch (error) {
        console.error("Failed to fetch session minutes:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;
        const { content, type, speakerName } = await req.json();

        if (!content) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        const newMinute = await db.insert(liveSessionMinutes).values({
            sessionId,
            content,
            type: type || "transcript",
            speakerName: speakerName || "Host", // Default if not provided
        }).returning();

        return NextResponse.json(newMinute[0]);
    } catch (error) {
        console.error("Failed to save session minute:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;

        await db.delete(liveSessionMinutes)
            .where(eq(liveSessionMinutes.sessionId, sessionId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to clear session minutes:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
