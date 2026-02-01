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

        const amount = (session.price || 0) * 100;

        if (amount === 0) {
            return NextResponse.json({
                error: "Zero amount session should not initiate payment flow.",
                isFree: true
            }, { status: 400 });
        }

        const currency = "INR";
        const options = {
            amount: Math.round(amount), // Ensure it's an integer
            currency,
            receipt: `rcpt_${sessionId.substring(0, 8)}_${Date.now().toString().slice(-10)}`,
        };

        console.log("Initiating Razorpay Order with options:", options);
        const order = await razorpay.orders.create(options);

        return NextResponse.json({
            id: order.id,
            currency: order.currency,
            amount: order.amount,
        });

    } catch (error: any) {
        console.error("Razorpay Order Creation Failed:", error);
        const errorMessage = error?.error?.description || error?.message || "Internal Server Error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
