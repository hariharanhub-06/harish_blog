import { db } from "@/db";
import { contactSubmissions } from "@/db/schema";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mail";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (!body.name || !body.email || !body.mobile || !body.message) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await db.insert(contactSubmissions).values({
            name: body.name,
            company: body.company,
            businessType: body.businessType,
            requestedService: body.requestedService,
            email: body.email,
            mobile: body.mobile,
            website: body.website,
            socialMedia: body.socialMedia,
            subject: body.subject || "No Subject",
            message: body.message,
            category: body.category || "Business Digital Solution",
            status: "New"
        });

        // Send automatic acknowledgement email (non-blocking)
        try {
            await sendEmail({
                to: body.email,
                subject: "We received your consultation request",
                text: `Hello ${body.name},\n\nThank you for reaching out. Your requirement has been received successfully.\n\nOur team will review your request and contact you within 24–48 hours to discuss the best solution for your business.\n\nIf you have additional details to share, you may reply to this email.\n\nBest regards,\nHariharan\nhariharanhub.com`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #333;">
                        <h2 style="color: #f97316;">Hello ${body.name},</h2>
                        <p>Thank you for reaching out. Your requirement has been received successfully.</p>
                        <p>Our team will review your request and contact you within <strong>24–48 hours</strong> to discuss the best solution for your business.</p>
                        <p>If you have additional details to share, you may reply to this email.</p>
                        <br />
                        <p>Best regards,<br /><strong>Hariharan</strong><br />hariharanhub.com</p>
                    </div>
                `
            });
        } catch (emailError) {
            console.error("Failed to send acknowledgement email:", emailError);
            // We don't block the response even if email fails
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error submitting contact form:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
