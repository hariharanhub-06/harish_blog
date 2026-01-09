import { NextResponse } from "next/server";
import { sendWhatsAppAlert } from "@/lib/whatsapp-twilio";

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

        // Trigger WhatsApp Alert to Admin
        const alertMessage = `🚀 *New Inquiry Received!*\n\n*Page:* ${body.category || 'Portfolio'}\n*From:* ${body.name}\n*Mobile:* ${body.mobile}\n*Subject:* ${body.subject || 'No Subject'}\n\n*Message:* ${body.message}`;
        await sendWhatsAppAlert(alertMessage);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error submitting contact form:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
