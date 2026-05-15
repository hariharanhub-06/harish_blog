import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function fullAudit() {
    try {
        const { db } = await import('./src/db');
        const { sql } = await import('drizzle-orm');

        console.log("--- Full Data Audit ---");

        const result = await db.execute(sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);

        const tables = result.rows.map((row: any) => row.table_name);
        const counts: Record<string, number> = {};

        for (const table of tables) {
            try {
                // Fixed template string nesting
                const countResult = await db.execute(sql.raw(`SELECT COUNT(*) FROM "${table}"`));
                counts[table] = parseInt(countResult.rows[0].count);
            } catch (e) {
                counts[table] = -1;
            }
        }

        console.log("Table Counts:", JSON.stringify(counts, null, 2));
        process.exit(0);
    } catch (error: any) {
        console.error("Audit failed:", error.message);
        process.exit(1);
    }
}

fullAudit();
