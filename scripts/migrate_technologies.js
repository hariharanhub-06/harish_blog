require('dotenv').config({ path: '.env.local' });
if (!process.env.DATABASE_URL) require('dotenv').config({ path: '.env' });

const { neon } = require('@neondatabase/serverless');

async function main() {
    console.log("Connecting...");
    const sql = neon(process.env.DATABASE_URL);

    try {
        console.log("Migrating 'technologies' from text[] to jsonb...");
        // CAST text[] -> jsonb
        await sql`ALTER TABLE projects ALTER COLUMN technologies TYPE jsonb USING array_to_json(technologies)::jsonb`;
        console.log("Migration Successful!");
    } catch (err) {
        console.error("Migration Failed!", err);
    }
}

main();
