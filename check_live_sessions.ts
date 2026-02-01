
import { db } from "./src/db";
import { liveSessions } from "./src/db/schema";

async function check() {
    try {
        const sessions = await db.query.liveSessions.findMany();
        console.log("Total Sessions in DB:", sessions.length);
        sessions.forEach(s => {
            console.log(`- ID: ${s.id}, Title: ${s.title}, Published: ${s.isPublished}`);
        });
    } catch (e) {
        console.error("Failed to check sessions:", e);
    }
}

check();
