import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function upgradeSql() {
    const sql = neon(process.env.DATABASE_URL!);
    try {
        console.log("Upgrading forms tables for Phase 3...");

        await sql`
            ALTER TABLE "forms"
            ADD COLUMN IF NOT EXISTS "custom_success_message" text;
        `;

        console.log("Tables upgraded successfully.");
        process.exit(0);
    } catch (error) {
        console.error("SQL Error:", error);
        process.exit(1);
    }
}

upgradeSql();
