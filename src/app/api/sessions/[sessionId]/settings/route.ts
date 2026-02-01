import { db } from "@/db";
import { liveSessionModeratorPolicies } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
    req: Request,
    { params }: { params: { sessionId: string } }
) {
    try {
        const { sessionId } = params;
        const policy = await db.query.liveSessionModeratorPolicies.findFirst({
            where: eq(liveSessionModeratorPolicies.sessionId, sessionId),
        });

        if (!policy) {
            // Return default "all allowed" if no policy exists
            return NextResponse.json({
                disableAudio: false,
                disableVideo: false,
                disableScreenSharing: false,
                disableReactions: false,
                disableChat: false
            });
        }

        return NextResponse.json(policy);
    } catch (error) {
        console.error("Failed to fetch session settings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: { sessionId: string } }
) {
    try {
        const { sessionId } = params;
        const data = await req.json();

        // Check if policy exists
        const existing = await db.query.liveSessionModeratorPolicies.findFirst({
            where: eq(liveSessionModeratorPolicies.sessionId, sessionId),
        });

        if (existing) {
            await db.update(liveSessionModeratorPolicies)
                .set({ ...data, updatedAt: new Date() })
                .where(eq(liveSessionModeratorPolicies.sessionId, sessionId));
        } else {
            await db.insert(liveSessionModeratorPolicies)
                .values({ sessionId, ...data });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to update session settings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
