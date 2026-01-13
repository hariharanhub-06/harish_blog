import { db } from "./index";
import { sql } from "drizzle-orm";

async function main() {
    try {
        console.log("Applying GST migration...");
        await db.execute(sql`ALTER TABLE "snack_products" ADD COLUMN IF NOT EXISTS "gst_percent" double precision DEFAULT 5;`);
        console.log("Migration successful!");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

main();
