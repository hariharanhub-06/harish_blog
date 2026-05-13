import { db } from './src/db';
import { sql } from 'drizzle-orm';

async function migrate() {
    try {
        console.log("Attempting to add featured_video_url column...");
        await db.execute(sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS featured_video_url TEXT`);
        console.log("Column added successfully (or already existed).");
    } catch (e) {
        console.error("Migration failed:", e);
    }
}

migrate();
