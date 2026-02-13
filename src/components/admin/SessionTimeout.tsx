"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const INACTIVITY_LIMIT = 60 * 60 * 1000; // 1 Hour

export default function SessionTimeout() {
    const { user } = useAuth();
    const router = useRouter();

    const logout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem("adminLastActive");
            router.push("/admin/login?reason=timeout");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    useEffect(() => {
        if (!user) return;

        // Check immediately on mount
        const storedLastActive = localStorage.getItem("adminLastActive");
        if (storedLastActive) {
            const lastActive = parseInt(storedLastActive, 10);
            if (Date.now() - lastActive > INACTIVITY_LIMIT) {
                logout();
                return;
            }
        }

        // Initialize/Update last active
        const updateActivity = () => {
            localStorage.setItem("adminLastActive", Date.now().toString());
        };

        updateActivity(); // Set initial time

        // Listeners
        const events = ["mousemove", "mousedown", "click", "scroll", "keypress", "touchstart"];

        // Throttle updates to avoid excessive writes
        let throttleTimer: NodeJS.Timeout | null = null;
        const handleActivity = () => {
            if (!throttleTimer) {
                updateActivity();
                throttleTimer = setTimeout(() => {
                    throttleTimer = null;
                }, 10000); // Update max once every 10s
            }
        };

        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        // Periodic check interval (check every minute)
        const checkInterval = setInterval(() => {
            const stored = localStorage.getItem("adminLastActive");
            if (stored) {
                const last = parseInt(stored, 10);
                if (Date.now() - last > INACTIVITY_LIMIT) {
                    logout();
                }
            } else {
                updateActivity();
            }
        }, 60000);

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
            clearInterval(checkInterval);
            if (throttleTimer) clearTimeout(throttleTimer);
        };
    }, [user]);

    return null;
}
