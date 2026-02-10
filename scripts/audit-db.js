const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function audit() {
    const sql = neon(process.env.DATABASE_URL);
    try {
        const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
        console.log("Existing Tables:", tables.map(t => t.table_name).join(", "));

        for (const t of tables) {
            if (t.table_name === 'finance_leads' || t.table_name === 'contact_submissions') {
                const count = await sql`SELECT count(*) FROM ${sql(t.table_name)}`;
                console.log(`Table ${t.table_name} has ${count[0].count} rows.`);
            }
        }
        process.exit(0);
    } catch (err) {
        console.error("Audit Error:", err);
        process.exit(1);
    }
}

audit();
