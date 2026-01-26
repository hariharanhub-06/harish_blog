require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function main() {
    console.log("Connecting...");
    const sql = neon(process.env.DATABASE_URL);

    try {
        console.log("Ensuring ai_assistant_config table exists...");
        await sql`CREATE TABLE IF NOT EXISTS ai_assistant_config (
            id TEXT PRIMARY KEY,
            knowledge_base TEXT,
            updated_at TIMESTAMP DEFAULT NOW()
        )`;

        console.log("Ensuring knowledge_base column exists...");
        await sql`ALTER TABLE ai_assistant_config ADD COLUMN IF NOT EXISTS knowledge_base TEXT`;

        // Check if there are old columns to migrate from (optional but safe)
        // Check current data
        const rows = await sql`SELECT * FROM ai_assistant_config WHERE id = 'default'`;
        if (rows.length === 0) {
            console.log("Creating default record...");
            await sql`INSERT INTO ai_assistant_config (id, knowledge_base) VALUES ('default', '')`;
        }

        console.log("Schema fix successful!");
    } catch (err) {
        console.error("Schema fix failed!", err);
    }
}

main();
