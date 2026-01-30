
const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const sql = neon(process.env.DATABASE_URL);

async function checkAndFix() {
    console.log("Checking columns for meeting_schedules...");
    const columns = await sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'meeting_schedules'
  `;

    const colNames = columns.map(c => c.column_name);
    console.log("Current columns:", colNames);

    if (!colNames.includes('end_date')) {
        console.log("Adding end_date column...");
        await sql`ALTER TABLE meeting_schedules ADD COLUMN end_date TIMESTAMP`;
    }

    if (!colNames.includes('is_visible')) {
        console.log("Adding is_visible column...");
        await sql`ALTER TABLE meeting_schedules ADD COLUMN is_visible BOOLEAN DEFAULT TRUE`;
    }

    console.log("Database schema check complete.");
}

checkAndFix().catch(err => {
    console.error("Migration failed:", err);
    process.exit(1);
});
