import * as dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function checkBackups() {
    console.log("=== SCANNING FOR BACKUP TABLES ===\n");

    try {
        // List all tables in the public schema
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `;

        console.log("Found tables:", tables.map(t => t.table_name).join(", "));

        // Check for anything that looks like a backup of skills or partnerships
        const backups = tables.filter(t =>
            t.table_name.includes('skill') ||
            t.table_name.includes('partner')
        );

        console.log("\nPotential related tables:", backups.map(t => t.table_name).join(", "));

        // Also quickly check row counts for any found candidates
        for (const t of backups) {
            const count = await sql(`SELECT count(*) as c FROM "${t.table_name}"`);
            console.log(`- ${t.table_name}: ${count[0].c} rows`);
        }

    } catch (e: any) {
        console.error("Error:", e.message);
    }

    process.exit(0);
}

checkBackups();
