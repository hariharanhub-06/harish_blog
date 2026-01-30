
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { neon } from '@neondatabase/serverless';

async function checkSkillsColumns() {
    if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL is missing!");
        process.exit(1);
    }
    const sql = neon(process.env.DATABASE_URL);

    console.log("Checking columns in 'skills' table...");
    try {
        const columns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'skills'
        `;
        console.table(columns);

        // Also try a raw select *
        console.log("Attempting raw SELECT * FROM skills LIMIT 1...");
        const rows = await sql`SELECT * FROM skills LIMIT 1`;
        console.log("Success! Row keys:", rows.length > 0 ? Object.keys(rows[0]) : "No rows");

    } catch (e: any) {
        console.error("Error:", e.message);
    }
}

checkSkillsColumns();
