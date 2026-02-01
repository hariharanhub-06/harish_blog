import { NextResponse } from "next/server";
import { db } from "@/db";
import { sessionRegistrations } from "@/db/schema";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { sessionId, name, email, mobile, amountPaid } = body;

        // Note: Actual registration is created in /api/sessions/verify-payment
        // This endpoint might strictly not be needed if we only create on success, 
        // but let's keep it if we want to log "attempted" registrations later.
        // For now, I will make it a no-op or just log it cause verification handles the insert.

        return NextResponse.json({ message: "Proceed to payment" });
    } catch (error) {
        console.error("Registration init failed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
