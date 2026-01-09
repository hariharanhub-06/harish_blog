import twilio from "twilio";

export async function sendWhatsAppAlert(message: string, customTo?: string) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;

    const targetTo = customTo || adminNumber;

    if (!accountSid || !authToken || !fromNumber || !targetTo) {
        console.error("Twilio configuration missing in .env.local");
        return { success: false, error: "Configuration missing" };
    }

    try {
        const client = twilio(accountSid, authToken);
        const response = await client.messages.create({
            body: message,
            from: fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`,
            to: targetTo.startsWith('whatsapp:') ? targetTo : `whatsapp:${targetTo}`
        });

        console.log(`Twilio WhatsApp Sent to ${targetTo} successfully:`, response.sid);
        return { success: true, sid: response.sid };
    } catch (error) {
        console.error("Twilio WhatsApp Error:", (error as any).message);
        return { success: false, error: (error as any).message };
    }
}
