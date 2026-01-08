import { db } from "./src/db";
import { sql } from "drizzle-orm";

async function checkColumns() {
    try {
        const result = await db.execute(sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'snack_products'
        `);
        console.log("Columns in snack_products:");
        result.rows.forEach(row => {
            console.log(`- ${row.column_name}: ${row.data_type}`);
        });
    } catch (e) {
        console.error("Check failed:", e);
    }
}

checkColumns();
