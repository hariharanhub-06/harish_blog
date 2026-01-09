import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "./firebase";

export const requestNotificationPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return null;

    try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            const messaging = getMessaging(app);
            const token = await getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY // You'll need to generate this in Firebase Console
            });
            return token;
        }
    } catch (error) {
        console.error("Error getting notification permission:", error);
    }
    return null;
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        const messaging = getMessaging(app);
        onMessage(messaging, (payload) => {
            resolve(payload);
        });
    });
