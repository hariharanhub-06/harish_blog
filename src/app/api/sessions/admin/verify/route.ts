import { NextResponse } from "next/server";
import { db } from "@/db";
import { liveSessions, sessionRegistrations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/mail";

export async function POST(req: Request) {
    try {
        const { registrationId, action } = await req.json(); // action: "approve" | "reject"

        if (!registrationId || !action) {
            return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
        }

        const registration = await db.query.sessionRegistrations.findFirst({
            where: eq(sessionRegistrations.id, registrationId)
        });

        if (!registration) {
            return NextResponse.json({ error: "Registration not found" }, { status: 404 });
        }

        if (action === "approve") {
            // 1. Update Status
            await db.update(sessionRegistrations)
                .set({ status: "confirmed" })
                .where(eq(sessionRegistrations.id, registrationId));

            // 2. Fetch Session Details for Email
            const session = await db.query.liveSessions.findFirst({
                where: eq(liveSessions.id, registration.sessionId)
            });

            if (session) {
                // 3. Send Confirmation Email
                await sendEmail({
                    to: registration.userEmail,
                    subject: `Confirmation: ${session.title} - Live Session Access`,
                    text: `Hello ${registration.userName},\n\nYour payment has been verified! You can join the session using this link:\n${session.meetingLink}\n\nTime: ${new Date(session.startTime).toLocaleString()}\n\nSee you there!`,
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #059669;">Payment Verified! ✅</h2>
                            <p>Hi <strong>${registration.userName}</strong>,</p>
                            <p>We have confirmed your registration for <strong>${session.title}</strong>.</p>
                            
                            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0; font-size: 14px; color: #666;"><strong>Date & Time:</strong></p>
                                <p style="margin-top: 5px; font-size: 16px;">${new Date(session.startTime).toLocaleString()}</p>
                                
                                <p style="margin-top: 15px; font-size: 14px; color: #666;"><strong>Meeting Link:</strong></p>
                                <a href="${session.meetingLink}" style="display: inline-block; background: #000; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 5px;">Join Session</a>
                            </div>

                            <p style="font-size: 12px; color: #999;">If the button doesn't work, copy this link: ${session.meetingLink}</p>
                        </div>
                    `
                });
            }
        } else if (action === "reject") {
            await db.update(sessionRegistrations)
                .set({ status: "rejected" })
                .where(eq(sessionRegistrations.id, registrationId));
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Verification failed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
