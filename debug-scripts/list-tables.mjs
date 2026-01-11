import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function listTables() {
    const sql = neon(process.env.DATABASE_URL);
    try {
        const result = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
        console.log("--- START TABLES ---");
        result.forEach(r => console.log(r.table_name));
        console.log("--- END TABLES ---");
    } catch (e) {
        console.error("FAILED:" + e.message);
    }
}

listTables();
