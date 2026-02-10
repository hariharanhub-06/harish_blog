const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function fixSchema() {
    const sql = neon(process.env.DATABASE_URL);
    try {
        console.log("Dropping leads table...");
        await sql`DROP TABLE IF EXISTS leads CASCADE`;
        console.log("Leads table dropped.");
        process.exit(0);
    } catch (err) {
        console.error("Error dropping table:", err);
        process.exit(1);
    }
}

fixSchema();
