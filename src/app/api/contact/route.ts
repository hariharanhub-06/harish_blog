import { db } from "@/db";
import { contactSubmissions } from "@/db/schema";
import { NextResponse } from "next/server";
import { sendPushNotification } from "@/lib/push-admin";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (!body.name || !body.email || !body.mobile || !body.message) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await db.insert(contactSubmissions).values({
            name: body.name,
            company: body.company,
            email: body.email,
            mobile: body.mobile,
            website: body.website,
            socialMedia: body.socialMedia,
            subject: body.subject || "No Subject",
            message: body.message,
            category: body.category || "Not Determined",
            status: "Fresh"
        });

        // Trigger Push Notification to Admin
        const pushTitle = `New Inquiry: ${body.category || 'General'}`;
        const pushBody = `From ${body.name}: ${body.message.substring(0, 100)}...`;
        await sendPushNotification(pushTitle, pushBody, "/admin/dashboard#messages");

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error submitting contact form:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
