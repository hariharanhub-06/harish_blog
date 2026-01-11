import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function checkCols() {
    const sql = neon(process.env.DATABASE_URL);
    try {
        const tables = ['snack_products', 'affiliates', 'snack_orders'];
        for (const table of tables) {
            const result = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = ${table} AND table_schema = 'public'`;
            console.log(`COLUMNS_FOR_${table}:`);
            result.forEach(r => console.log(`  ${r.column_name}`));
        }
    } catch (e) {
        console.error("FAILED:" + e.message);
    }
}

checkCols();
