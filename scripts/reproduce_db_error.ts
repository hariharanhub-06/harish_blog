import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" }); // Fallback

import { db } from "../src/db/index";
import { projects } from "../src/db/schema";
// @ts-ignore
import { eq } from "drizzle-orm";

async function main() {
    console.log("Starting script...");
    if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL is missing!");
        process.exit(1);
    }
    console.log("DATABASE_URL found (length: " + process.env.DATABASE_URL.length + ")");

    console.log("Attempting to insert project...");
    try {
        const res = await db.insert(projects).values({
            title: "Test Project Debug",
            description: "Test Description",
            technologies: [],
            featured: false,
            displayOrder: 999,
        }).returning();
        console.log("Success:", JSON.stringify(res, null, 2));
    } catch (error: any) {
        console.error("Error inserting project:", error);
        if (error.message) console.error("Error message:", error.message);
        if (error.stack) console.error("Stack:", error.stack);
    }
    process.exit(0);
}

main().catch(err => {
    console.error("Main error:", err);
    process.exit(1);
});
