import * as dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function checkDatabase() {
    console.log("=== CHECKING DATABASE STATE ===\n");

    // Check Skills table structure
    try {
        const skillsCols = await sql`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'skills'
            ORDER BY ordinal_position
        `;
        console.log("Skills columns:", skillsCols.map(c => c.column_name).join(", "));

        const skillsData = await sql`SELECT * FROM skills LIMIT 5`;
        console.log(`Skills data: ${skillsData.length} rows`);
        if (skillsData.length > 0) {
            console.log("First skill:", JSON.stringify(skillsData[0], null, 2));
        }
    } catch (e: any) {
        console.error("Skills error:", e.message);
    }

    // Check Partnerships table structure
    try {
        const partCols = await sql`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'partnerships'
            ORDER BY ordinal_position
        `;
        console.log("\nPartnerships columns:", partCols.map(c => c.column_name).join(", "));

        const partData = await sql`SELECT * FROM partnerships LIMIT 5`;
        console.log(`Partnerships data: ${partData.length} rows`);
        if (partData.length > 0) {
            console.log("First partnership:", JSON.stringify(partData[0], null, 2));
        }
    } catch (e: any) {
        console.error("Partnerships error:", e.message);
    }

    process.exit(0);
}

checkDatabase();
