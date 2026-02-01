import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { db } from "@/db";
import { liveSessions } from "@/db/schema";
import { eq } from "drizzle-orm";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
    try {
        const { sessionId } = await req.json();

        const session = await db.query.liveSessions.findFirst({
            where: eq(liveSessions.id, sessionId)
        });

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        const amount = session.price * 100; // Razorpay expects amount in paise
        const currency = "INR";
        const options = {
            amount: amount.toString(),
            currency,
            receipt: `receipt_${sessionId}_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        // We don't create the registration record yet. 
        // We only create it after successful payment verification.

        return NextResponse.json({
            id: order.id,
            currency: order.currency,
            amount: order.amount,
        });

    } catch (error) {
        console.error("Razorpay Order Creation Failed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
