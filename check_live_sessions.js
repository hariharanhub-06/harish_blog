
const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const url = process.env.DATABASE_URL;
if (!url) {
    console.error("DATABASE_URL not found in .env");
    process.exit(1);
}

const sql = neon(url);
const db = drizzle(sql);

async function check() {
    try {
        // Query the table using raw SQL or drizzle if schema is available
        // Since I don't want to deal with TS imports in a quick JS script, I'll use raw SQL
        const result = await sql`SELECT * FROM live_sessions`;
        console.log("Total Sessions in DB:", result.length);
        result.forEach(s => {
            console.log(`- ID: ${s.id}, Title: ${s.title}, Published: ${s.is_published}, Status: ${s.status}`);
        });
    } catch (e) {
        console.error("Failed to check sessions:", e);
    }
}

check();
