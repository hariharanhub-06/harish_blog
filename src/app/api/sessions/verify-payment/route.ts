import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db";
import { liveSessions, sessionRegistrations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/mail";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            sessionId,
            userData // { name, email, mobile }
        } = body;

        // 1. Verify Signature
        const bodyData = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(bodyData.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json({ error: "Invalid Signature" }, { status: 400 });
        }

        // 2. Signature Valid! Create Registration
        await db.insert(sessionRegistrations).values({
            sessionId,
            userName: userData.name,
            userEmail: userData.email,
            userMobile: userData.mobile,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            status: "confirmed", // Auto-confirmed!
            amountPaid: 0 // We can fetch amount if needed, but signature proves payment
        });

        // 3. Send Confirmation Email (Automated!)
        const session = await db.query.liveSessions.findFirst({
            where: eq(liveSessions.id, sessionId)
        });

        if (session) {
            await sendEmail({
                to: userData.email,
                subject: `Confirmed: ${session.title} - Live Session Access`,
                text: `Hello ${userData.name},\n\nPayment successful! Join here: ${session.meetingLink}`,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #059669;">You're In! ✅</h2>
                        <p>Hi <strong>${userData.name}</strong>,</p>
                        <p>Your spot for <strong>${session.title}</strong> is confirmed.</p>
                        
                        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0; font-size: 14px; color: #666;"><strong>Date & Time:</strong></p>
                            <p style="margin-top: 5px; font-size: 16px;">${new Date(session.startTime).toLocaleString()}</p>
                            
                            <p style="margin-top: 15px; font-size: 14px; color: #666;"><strong>Meeting Link:</strong></p>
                            <a href="${session.meetingLink}" style="display: inline-block; background: #000; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 5px;">Join Session</a>
                        </div>
                    </div>
                `
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Payment Verification Failed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
