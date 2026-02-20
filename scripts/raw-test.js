const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function run() {
    console.log("DATABASE_URL present:", !!process.env.DATABASE_URL);
    const sql = neon(process.env.DATABASE_URL);

    try {
        console.log("Checking finance_transactions columns...");
        let columns = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'finance_transactions'`;
        let hasLoanId = columns.some(c => c.column_name === 'loan_id');
        console.log("Column 'loan_id' exists:", hasLoanId);

        if (!hasLoanId) {
            console.log("Attempting to manually add 'loan_id' column...");
            await sql`ALTER TABLE finance_transactions ADD COLUMN loan_id text`;
            console.log("Column added successfully!");

            columns = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'finance_transactions'`;
            console.log("Verified columns:", columns.map(c => c.column_name));
        }

        process.exit(0);
    } catch (err) {
        console.error("Test Error:", err);
        process.exit(1);
    }
}

run();
