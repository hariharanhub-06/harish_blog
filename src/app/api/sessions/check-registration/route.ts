import { NextResponse } from "next/server";
import { db } from "@/db";
import { sessionRegistrations } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const { sessionId, email } = await req.json();

        if (!sessionId || !email) {
            return NextResponse.json({ error: "Session ID and Email are required" }, { status: 400 });
        }

        const registration = await db.query.sessionRegistrations.findFirst({
            where: and(
                eq(sessionRegistrations.sessionId, sessionId),
                eq(sessionRegistrations.userEmail, email),
                eq(sessionRegistrations.status, "confirmed")
            )
        });

        if (!registration) {
            return NextResponse.json({ registered: false, error: "This email is not registered for this session." });
        }

        return NextResponse.json({
            registered: true,
            token: registration.joinToken
        });
    } catch (error) {
        console.error("Check registration failed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
