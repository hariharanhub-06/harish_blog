import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkData() {
    const sql = neon(process.env.DATABASE_URL!);
    try {
        const leads = await sql`SELECT * FROM finance_leads`;
        console.log("Finance Leads Raw Data:", leads);

        const submissions = await sql`SELECT id, name FROM contact_submissions LIMIT 5`;
        console.log("Contact Submissions Sample:", submissions);

        process.exit(0);
    } catch (error) {
        console.error("SQL Check Error:", error);
        process.exit(1);
    }
}

checkData();
