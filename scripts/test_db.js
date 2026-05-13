const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function check() {
    const sql = neon(process.env.DATABASE_URL);
    try {
        const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'finance_debts';
    `;
        console.log('--- COLUMNS ---');
        result.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));
        console.log('--- END ---');
    } catch (err) {
        console.error('Error checking DB:', err);
    }
}

check();
