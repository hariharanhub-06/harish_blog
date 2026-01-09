import * as admin from "firebase-admin";
import { db } from "@/db";
import { adminPushTokens } from "@/db/schema";

// Initialize Firebase Admin
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
    } catch (error) {
        console.error("Firebase Admin initialization error:", error);
    }
}

export async function sendPushNotification(title: string, body: string, url?: string) {
    try {
        const tokensRecord = await db.select({ token: adminPushTokens.token }).from(adminPushTokens);
        const tokens = tokensRecord.map(r => r.token);

        if (tokens.length === 0) {
            console.log("No push tokens found in database.");
            return;
        }

        const message = {
            notification: {
                title,
                body,
            },
            data: {
                url: url || "/admin/dashboard",
            },
            tokens: tokens,
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`Successfully sent ${response.successCount} push notifications.`);

        // Cleanup invalid tokens
        if (response.failureCount > 0) {
            const failedTokens: string[] = [];
            response.responses.forEach((resp: any, idx: number) => {
                if (!resp.success) {
                    failedTokens.push(tokens[idx]);
                }
            });
            // We could delete failedTokens from DB here
        }
    } catch (error) {
        console.error("Error sending push notifications:", error);
    }
}
