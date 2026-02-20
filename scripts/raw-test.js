const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function run() {
    console.log("DATABASE_URL present:", !!process.env.DATABASE_URL);
    const sql = neon(process.env.DATABASE_URL);

    try {
        console.log("Listing all tables...");
        const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
        console.log("Tables:", tables.map(t => t.table_name));

        const hasAdminSessions = tables.some(t => t.table_name === 'admin_sessions');
        console.log("Table 'admin_sessions' exists:", hasAdminSessions);

        if (!hasAdminSessions) {
            console.log("Attempting to manually create 'admin_sessions' table...");
            await sql`CREATE TABLE IF NOT EXISTS "admin_sessions" (
                "id" text PRIMARY KEY NOT NULL,
                "user_email" text NOT NULL,
                "device_name" text,
                "browser" text,
                "os" text,
                "ip_address" text,
                "is_current" boolean DEFAULT false,
                "last_active" timestamp DEFAULT now(),
                "created_at" timestamp DEFAULT now()
            )`;
            console.log("Table created successfully!");
        }

        process.exit(0);
    } catch (err) {
        console.error("Test Error:", err);
        process.exit(1);
    }
}

run();
