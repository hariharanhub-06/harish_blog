import { db } from "@/db";
import { liveSessions } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
    req: Request,
    { params }: { params: { sessionId: string } }
) {
    try {
        const { sessionId } = params;
        const session = await db.query.liveSessions.findFirst({
            where: eq(liveSessions.id, sessionId),
            columns: {
                moderatorSettings: true,
                status: true
            }
        });

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        return NextResponse.json(session);
    } catch (error) {
        console.error("Failed to fetch session settings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
