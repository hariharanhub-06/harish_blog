import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

async function updateTable() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        console.error("DATABASE_URL not found");
        return;
    }
    const sql = neon(url);
    try {
        console.log("Adding column cancel_reason to snack_orders...");
        await sql`ALTER TABLE snack_orders ADD COLUMN cancel_reason TEXT`;
        console.log("SUCCESS: Table updated.");
    } catch (error) {
        console.error("ERROR updating table:", error);
    }
}

updateTable();
