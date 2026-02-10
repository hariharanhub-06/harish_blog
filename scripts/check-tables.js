const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function check() {
    const sql = neon(process.env.DATABASE_URL);
    try {
        const hasFinance = await sql`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'finance_leads')`;
        const hasContact = await sql`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'contact_submissions')`;

        console.log("finance_leads exists:", hasFinance[0].exists);
        console.log("contact_submissions exists:", hasContact[0].exists);

        if (hasFinance[0].exists) {
            const rows = await sql`SELECT id, lead_id FROM finance_leads LIMIT 1`;
            console.log("finance_leads sample:", rows);
        }

        process.exit(0);
    } catch (err) {
        console.error("Check Error:", err);
        process.exit(1);
    }
}

check();
