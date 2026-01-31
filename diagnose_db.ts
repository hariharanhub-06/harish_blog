import { db } from './src/db';
import { sql } from 'drizzle-orm';

async function diagnose() {
    try {
        console.log("Checking database connection...");
        const result = await db.execute(sql`SELECT 1`);
        console.log("Connection OK.");

        console.log("Checking profiles table columns...");
        const columns = await db.execute(sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'profiles'
        `);
        console.log("COLUMNS FOUND:");
        console.log(JSON.stringify(columns.rows, null, 2));

        console.log("Checking data in profiles table...");
        const data = await db.execute(sql`SELECT * FROM profiles LIMIT 1`);
        console.log("DATA FOUND:");
        console.log(JSON.stringify(data.rows, null, 2));

    } catch (e: any) {
        console.error("DIAGNOSTICS FAILED:");
        console.error(e.message);
        if (e.stack) console.error(e.stack);
    }
}

diagnose();
