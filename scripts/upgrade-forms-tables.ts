import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function upgradeSql() {
    const sql = neon(process.env.DATABASE_URL!);
    try {
        console.log("Upgrading forms tables...");

        await sql`
            ALTER TABLE "forms"
            ADD COLUMN IF NOT EXISTS "banner_url" text,
            ADD COLUMN IF NOT EXISTS "theme_color" text,
            ADD COLUMN IF NOT EXISTS "post_submission_action" text DEFAULT 'message',
            ADD COLUMN IF NOT EXISTS "post_submission_data" text,
            ADD COLUMN IF NOT EXISTS "automation_enabled" boolean DEFAULT false,
            ADD COLUMN IF NOT EXISTS "automation_channels" jsonb,
            ADD COLUMN IF NOT EXISTS "automation_template" text;
        `;

        await sql`
            ALTER TABLE "form_questions"
            ADD COLUMN IF NOT EXISTS "image_url" text,
            ADD COLUMN IF NOT EXISTS "section_id" text,
            ADD COLUMN IF NOT EXISTS "logic_conditions" jsonb;
        `;

        console.log("Tables upgraded successfully.");
        process.exit(0);
    } catch (error) {
        console.error("SQL Error:", error);
        process.exit(1);
    }
}

upgradeSql();
