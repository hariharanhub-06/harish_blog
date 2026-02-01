import { NextResponse } from "next/server";
import { db } from "@/db";
import { liveSessions, sessionRegistrations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { sendEmail } from "@/lib/mail";

export async function POST(req: Request) {
    try {
        const { sessionId, registrationId } = await req.json();

        if (!sessionId) {
            return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
        }

        // 1. Fetch Session Details
        const session = await db.query.liveSessions.findFirst({
            where: eq(liveSessions.id, sessionId)
        });

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        // 2. Fetch registrations
        const registrations = await db.query.sessionRegistrations.findMany({
            where: registrationId
                ? and(eq(sessionRegistrations.id, registrationId), eq(sessionRegistrations.sessionId, sessionId))
                : and(eq(sessionRegistrations.sessionId, sessionId), eq(sessionRegistrations.status, "confirmed"))
        });

        if (registrations.length === 0) {
            return NextResponse.json({ message: "No confirmed registrations found to resend." });
        }

        console.log(`Resending emails to ${registrations.length} registrants for session: ${session.title}`);

        // 3. Loop and send (sequentially for reliability, though parallel is faster)
        let successCount = 0;
        let failCount = 0;
        let lastError = "";

        for (const reg of registrations) {
            const emailResult = await sendEmail({
                // ... same options
                to: reg.userEmail,
                subject: `Registration Confirmed: ${session.title}`,
                text: `Hello ${reg.userName},\n\nYour registration for ${session.title} is confirmed.\n\nMeeting Link: ${session.meetingLink}\nDate: ${new Date(session.startTime).toLocaleString()}\n\nSee you there!`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #f9fafb; }
                            .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 24px; overflow: hidden; shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; }
                            .header { background: #000000; padding: 40px; text-align: center; }
                            .header h2 { color: #ffffff; margin: 0; font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em; font-size: 24px; }
                            .content { padding: 40px; }
                            .greeting { font-size: 18px; font-weight: 700; margin-bottom: 20px; }
                            .session-card { background: #f3f4f6; border-radius: 16px; padding: 24px; margin: 24px 0; border: 1px solid #e5e7eb; }
                            .label { font-size: 10px; font-weight: 900; color: #6b7280; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
                            .value { font-size: 16px; font-weight: 700; color: #000000; margin-bottom: 16px; }
                            .cta-button { display: inline-block; background: #ea580c; color: #ffffff !important; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 900; text-transform: uppercase; font-size: 14px; letter-spacing: 0.05em; transition: all 0.3s ease; text-align: center; width: 100%; box-sizing: border-box; }
                            .footer { padding: 32px 40px; border-top: 1px solid #e5e7eb; text-align: center; background: #f9fafb; }
                            .footer p { font-size: 12px; color: #9ca3af; margin: 0; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h2>Registration Confirmed</h2>
                            </div>
                            <div class="content">
                                <p class="greeting">Hi ${reg.userName},</p>
                                <p>You're all set! Your registration for the upcoming live session has been successfully processed.</p>
                                
                                <div class="session-card">
                                    <div class="label">Session Title</div>
                                    <div class="value">${session.title}</div>
                                    
                                    <div class="label">Scheduled For</div>
                                    <div class="value">${new Date(session.startTime).toLocaleString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZoneName: 'short'
                })}</div>
                                    
                                    <div class="label">Duration</div>
                                    <div class="value">${session.duration} Minutes</div>
                                </div>

                                <p style="margin-bottom: 32px;">Please use the button below to join the session at the scheduled time. We recommend joining 5 minutes early to test your audio/video.</p>
                                
                                <a href="${session.meetingLink}" class="cta-button">Join Live Session</a>
                            </div>
                            <div class="footer">
                                <p>&copy; ${new Date().getFullYear()} Hari Haran Jeyaramamoorthy. All rights reserved.</p>
                                <p style="margin-top: 8px;">If you have any questions, simply reply to this email.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            });

            if (emailResult.success) {
                successCount++;
            } else {
                failCount++;
                lastError = (emailResult.error as Error)?.message || "Unknown SMTP Error";
            }
        }

        return NextResponse.json({
            success: failCount === 0,
            message: failCount > 0
                ? `Batch Send: ${successCount} sent, ${failCount} FAILED. Error: ${lastError}`
                : `Successfully sent emails to ${successCount} registrants.`,
            counts: { success: successCount, failed: failCount }
        });

    } catch (error) {
        console.error("Resend Batch Failed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
