import twilio from "twilio";

export async function sendWhatsAppAlert(message: string) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER; // Twilio's number (usually starts with whatsapp:+1...)
    const toNumber = process.env.ADMIN_WHATSAPP_NUMBER;     // Your Personal number (whatsapp:+91...)

    if (!accountSid || !authToken || !fromNumber || !toNumber) {
        console.error("Twilio configuration missing in .env.local");
        return { success: false, error: "Configuration missing" };
    }

    try {
        console.log("Twilio Attempting Send:", { from: fromNumber, to: toNumber });
        const client = twilio(accountSid, authToken);
        const response = await client.messages.create({
            body: message,
            from: fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`,
            to: toNumber.startsWith('whatsapp:') ? toNumber : `whatsapp:${toNumber}`
        });

        console.log("Twilio WhatsApp Alert Sent Successfully:", response.sid);
        return { success: true, sid: response.sid };
    } catch (error) {
        console.error("Twilio WhatsApp Error Type:", (error as any).constructor.name);
        console.error("Twilio WhatsApp Error Details:", {
            message: (error as any).message,
            code: (error as any).code,
            status: (error as any).status
        });
        return { success: false, error: (error as any).message };
    }
}
