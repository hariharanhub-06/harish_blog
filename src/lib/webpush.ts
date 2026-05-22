import 'server-only';
import webpush from 'web-push';
import { db } from "@/db";
import { adminPushTokens } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function sendAdminPushNotification(title: string, message: string, url: string = '/admin/dashboard') {
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BBdu_WKn36wvuhOQ36YvzA6AvfUNi5evqdAHLfPeRbh_TcabjnzQjyPAqXxx21z_hY4x3dtp4I2ck_USjjGYqhk';
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    if (!vapidPrivateKey) {
        console.error('[webpush] VAPID_PRIVATE_KEY not set, skipping push notifications');
        return;
    }
    webpush.setVapidDetails('mailto:admin@hariharanhub.com', vapidPublicKey, vapidPrivateKey);

    try {
        const subscriptions = await db.select().from(adminPushTokens);

        const payload = JSON.stringify({
            title: title,
            body: message,
            url: url
        });

        const promises = subscriptions.map((sub: any) => {
            // Because token was just defined as `text("token")` instead of JSON, 
            // the new PushSubscription format is stored as stringified JSON in the token field.
            try {
                const pushSub = JSON.parse(sub.token);
                return webpush.sendNotification(pushSub, payload).catch(e => {
                    // If subscription is expired or invalid, we can remove it (HTTP 410 / 404)
                    if (e.statusCode === 410 || e.statusCode === 404) {
                        return db.delete(adminPushTokens).where(eq(adminPushTokens.id, sub.id));
                    }
                    console.error("Failed sending to single sub:", e);
                });
            } catch (err) {
                console.error("Invalid subscription parsed from DB", err);
                return Promise.resolve();
            }
        });

        await Promise.all(promises);
    } catch (error) {
        console.error("General Push Notification Error:", error);
    }
}
