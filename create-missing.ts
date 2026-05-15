
import { neon } from "@neondatabase/serverless";

const url = "postgresql://neondb_owner:npg_UG86mxlgrkaL@ep-patient-scene-ahaulih6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(url);

async function createMissingTables() {
    console.log("=== CREATING MISSING TABLES MANUALLY ===\n");
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS "stories" (
                "id" text PRIMARY KEY,
                "title" text NOT NULL,
                "description" text,
                "thumbnail_url" text,
                "youtube_playlist_id" text,
                "display_order" integer DEFAULT 0,
                "is_active" boolean DEFAULT true,
                "created_at" timestamp DEFAULT now(),
                "updated_at" timestamp DEFAULT now()
            );
        `;
        console.log("[✓] Created table: stories");

        await sql`
            CREATE TABLE IF NOT EXISTS "story_episodes" (
                "id" text PRIMARY KEY,
                "story_id" text NOT NULL,
                "title" text NOT NULL,
                "description" text,
                "youtube_video_id" text NOT NULL,
                "thumbnail_url" text,
                "duration" text,
                "episode_number" integer DEFAULT 1,
                "is_active" boolean DEFAULT true,
                "created_at" timestamp DEFAULT now()
            );
        `;
        console.log("[✓] Created table: story_episodes");

    } catch (e: any) {
        console.error("Error:", e.message);
    }
    process.exit(0);
}

createMissingTables();
