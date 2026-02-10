const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function run() {
    console.log("DATABASE_URL present:", !!process.env.DATABASE_URL);
    const sql = neon(process.env.DATABASE_URL);

    try {
        console.log("Checking crypto...");
        console.log("randomUUID exists:", !!crypto.randomUUID);

        console.log("Checking tables...");
        const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
        console.log("Tables:", tables.map(t => t.table_name));

        console.log("Checking finance_leads columns...");
        const columns = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'finance_leads'`;
        console.log("Columns:", columns);

        console.log("Testing insert...");
        const id = crypto.randomUUID();
        // Just a dummy lead_id for test
        await sql`INSERT INTO finance_leads (id, lead_id, loan_type, status) VALUES (${id}, 'test-id', 'Test Loan', 'Document Collection')`;
        console.log("Insert successful!");

        const rows = await sql`SELECT * FROM finance_leads WHERE id = ${id}`;
        console.log("Fetched row:", rows[0]);

        console.log("Cleaning up test row...");
        await sql`DELETE FROM finance_leads WHERE id = ${id}`;

        process.exit(0);
    } catch (err) {
        console.error("Test Error:", err);
        process.exit(1);
    }
}

run();
