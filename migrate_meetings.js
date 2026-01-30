const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function apply() {
    const sql = neon(process.env.DATABASE_URL);
    try {
        console.log('Creating meeting_availability table...');
        await sql`
      CREATE TABLE IF NOT EXISTS meeting_availability (
        id TEXT PRIMARY KEY,
        day_of_week INTEGER,
        start_time TEXT,
        end_time TEXT,
        is_available BOOLEAN DEFAULT TRUE,
        specific_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
        console.log('Creating meeting_schedules table...');
        await sql`
      CREATE TABLE IF NOT EXISTS meeting_schedules (
        id TEXT PRIMARY KEY,
        meeting_type TEXT NOT NULL,
        club_name TEXT NOT NULL,
        num_attendees INTEGER,
        notes TEXT,
        president_name TEXT,
        mobile_number TEXT,
        drive_link TEXT,
        scheduled_date TIMESTAMP NOT NULL,
        status TEXT DEFAULT 'requested',
        checklist_data JSONB,
        scoring_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
        console.log('Migration applied successfully!');
    } catch (err) {
        console.error('Error applying migration:', err);
    }
}

apply();
