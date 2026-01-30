
import { db } from "@/db";
import { typingTestResults } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userName, wpm, accuracy, duration, difficulty } = body;

        if (!userName || wpm === undefined || accuracy === undefined || !duration) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await db.insert(typingTestResults).values({
            userName,
            wpm,
            accuracy,
            duration,
            difficulty: difficulty || "basic"
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to submit typing test result:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
