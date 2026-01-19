require('dotenv').config({ path: '.env.local' });
// Fallback if .env.local missing
if (!process.env.DATABASE_URL) {
    require('dotenv').config({ path: '.env' });
}

const { neon } = require('@neondatabase/serverless');

async function main() {
    if (!process.env.DATABASE_URL) {
        console.error("No DATABASE_URL found");
        process.exit(1);
    }
    console.log("Connecting...");
    const sql = neon(process.env.DATABASE_URL);

    try {
        console.log("Querying projects...");
        // Select one row to see columns, or just LIMIT 0 to see structure if driver supports it (or error)
        // Actually, just inserting a dummy row might be safer test for the error
        // But let's look at a SELECT first.
        const result = await sql`SELECT * FROM projects LIMIT 1`;
        console.log("Result:", JSON.stringify(result, null, 2));

        // Also try to describe table if passing
        // const columns = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'projects'`;
        // console.log("Columns:", JSON.stringify(columns, null, 2));

    } catch (err) {
        console.error("Query Error:", err);
    }
}

main();
