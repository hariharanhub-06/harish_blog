
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
    console.log('Creating ai_assistant_config table...');
    try {
        await sql(`
            CREATE TABLE IF NOT EXISTS ai_assistant_config (
                id TEXT PRIMARY KEY,
                persona TEXT,
                pricing TEXT,
                faq TEXT,
                convincing_tactics TEXT,
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('Table created successfully.');

        // Insert initial empty config if none exists
        const existing = await sql(`SELECT id FROM ai_assistant_config LIMIT 1`);
        if (existing.length === 0) {
            await sql(`
                INSERT INTO ai_assistant_config (id, persona, pricing, faq, convincing_tactics)
                VALUES ('default', '', '', '', '');
            `);
            console.log('Initial config record inserted.');
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

main();
