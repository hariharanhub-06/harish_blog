require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function main() {
    console.log("Connecting...");
    const sql = neon(process.env.DATABASE_URL);

    try {
        console.log("Creating ai_assistant_config table...");
        await sql`CREATE TABLE IF NOT EXISTS ai_assistant_config (
            id TEXT PRIMARY KEY,
            persona TEXT,
            pricing TEXT,
            faq TEXT,
            convincing_tactics TEXT,
            updated_at TIMESTAMP DEFAULT NOW()
        )`;

        console.log("Setting up default record...");
        await sql`INSERT INTO ai_assistant_config (id, persona, pricing, faq, convincing_tactics)
                  VALUES ('default', '', '', '', '')
                  ON CONFLICT (id) DO NOTHING`;

        console.log("Setup Successful!");
    } catch (err) {
        console.error("Setup Failed!", err);
    }
}

main();
