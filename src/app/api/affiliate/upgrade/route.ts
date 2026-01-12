import { NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates } from "@/db/schema";
import { eq } from "drizzle-orm";
import Razorpay from "razorpay";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { affiliateId } = body;

        if (!affiliateId) {
            return NextResponse.json({ error: "Affiliate ID required" }, { status: 400 });
        }

        const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.id, affiliateId)).limit(1);

        if (!affiliate) {
            return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
        }

        if (affiliate.isPaid) {
            return NextResponse.json({ error: "Already a paid member" }, { status: 400 });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });

        const options = {
            amount: 100 * 100, // ₹100
            currency: "INR",
            receipt: `aff_upg_${affiliateId.slice(0, 8)}`,
            payment_capture: 1,
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({
            success: true,
            razorpayOrderId: order.id,
            amount: 100,
            key: process.env.RAZORPAY_KEY_ID,
            message: "Upgrade initiated. Please complete payment."
        });

    } catch (error: any) {
        console.error("Upgrade API Error:", error);
        return NextResponse.json(
            { error: `Failed to initiate upgrade: ${error.message}` },
            { status: 500 }
        );
    }
}
