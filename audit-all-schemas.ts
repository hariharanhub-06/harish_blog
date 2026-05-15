import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function auditAllSchemas() {
    try {
        const { db } = await import('./src/db');
        const { sql } = await import('drizzle-orm');

        console.log("--- Global Schema Audit ---");

        const result = await db.execute(sql`
            SELECT table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
            ORDER BY table_schema, table_name;
        `);

        console.log("All Tables with Schemas:", JSON.stringify(result.rows, null, 2));
        process.exit(0);
    } catch (error: any) {
        console.error("Audit failed:", error.message);
        process.exit(1);
    }
}

auditAllSchemas();
