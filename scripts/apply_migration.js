const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function apply() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    console.log('Applying migration...');
    await sql`
      ALTER TABLE finance_debts 
      ADD COLUMN IF NOT EXISTS repayment_type text DEFAULT 'single';
    `;
    await sql`
      ALTER TABLE typing_test_results 
      ADD COLUMN IF NOT EXISTS difficulty text DEFAULT 'basic';
    `;
    console.log('Migration applied successfully!');
  } catch (err) {
    console.error('Error applying migration:', err);
  }
}

apply();
