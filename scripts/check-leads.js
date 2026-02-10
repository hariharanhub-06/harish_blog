const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function checkLeads() {
    const sql = neon(process.env.DATABASE_URL);
    try {
        console.log("Checking leads table...");
        const columns = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'leads'`;
        console.log("Columns in leads:", columns.map(c => c.column_name));

        const rows = await sql`SELECT * FROM leads LIMIT 5`;
        console.log("Sample rows in leads:", rows);

        process.exit(0);
    } catch (err) {
        console.log("Leads table probably doesn't exist or error:", err.message);
        process.exit(0);
    }
}

checkLeads();
