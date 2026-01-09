/**
 * Custom WhatsApp Relay Helper
 * This helper sends signals to your private WhatsApp Relay service.
 */

export async function sendWhatsAppAlert(message: string) {
    const RELAY_URL = process.env.WHATSAPP_RELAY_URL;
    const RELAY_KEY = process.env.WHATSAPP_RELAY_KEY;
    const ADMIN_NUMBER = process.env.ADMIN_WHATSAPP_NUMBER; // e.g. "919042387152"

    if (!RELAY_URL || !RELAY_KEY || !ADMIN_NUMBER) {
        console.error("WhatsApp Relay configuration missing in .env.local");
        return { success: false, error: "Configuration missing" };
    }

    try {
        const response = await fetch(`${RELAY_URL}/send`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": RELAY_KEY
            },
            body: JSON.stringify({
                number: ADMIN_NUMBER,
                message: message
            })
        });

        const data = await response.json();
        if (response.ok) {
            console.log("WhatsApp Alert Sent Successfully");
            return { success: true };
        } else {
            console.error("WhatsApp Relay Error:", data.error);
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.error("Failed to connect to WhatsApp Relay:", error);
        return { success: false, error: "Connection failed" };
    }
}
