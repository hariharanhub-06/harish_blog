import { db } from "@/db";
import { sql, eq } from "drizzle-orm";
import { adminSessions } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const sid = req.headers.get("X-Session-Id");
    if (!sid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const [session] = await db.select().from(adminSessions).where(eq(adminSessions.id, sid));
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const queries = [
        // ── CREATE missing tables first (safe: IF NOT EXISTS) ──────────────────

        `CREATE TABLE IF NOT EXISTS website_polls (
            id TEXT PRIMARY KEY,
            question TEXT NOT NULL,
            options JSONB,
            is_active BOOLEAN DEFAULT true,
            background_url TEXT,
            background_type TEXT DEFAULT 'image',
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )`,

        `CREATE TABLE IF NOT EXISTS poll_responses (
            id TEXT PRIMARY KEY,
            poll_id TEXT,
            option_index INTEGER,
            ip_hash TEXT,
            platform TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        )`,

        `CREATE TABLE IF NOT EXISTS website_questions (
            id TEXT PRIMARY KEY,
            prompt TEXT NOT NULL,
            is_active BOOLEAN DEFAULT true,
            background_url TEXT,
            background_type TEXT DEFAULT 'image',
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )`,

        `CREATE TABLE IF NOT EXISTS website_question_responses (
            id TEXT PRIMARY KEY,
            question_id TEXT,
            user_name TEXT,
            answer_text TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        )`,

        `CREATE TABLE IF NOT EXISTS social_game_sessions (
            id TEXT PRIMARY KEY,
            game_id TEXT NOT NULL,
            title TEXT NOT NULL,
            is_active BOOLEAN DEFAULT true,
            play_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW()
        )`,

        // ── profiles: original columns ──────────────────────────────────────────
        `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS featured_video_url TEXT`,
        `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS about_image_url TEXT`,
        `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS headline TEXT`,
        `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT`,
        `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS audio_url TEXT`,
        `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT`,

        // ── profiles: business solution video ───────────────────────────────────
        `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_solution_video_url TEXT`,
        `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_solution_video_config JSONB DEFAULT '{"scale":1,"x":0,"y":0,"mixBlendMode":"screen"}'`,

        // ── profiles: jsonb fields ───────────────────────────────────────────────
        `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'`,
        `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '[]'`,
        `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS training_stats JSONB DEFAULT '[]'`,

        // ── profiles: social interaction section ────────────────────────────────
        `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_social_section BOOLEAN DEFAULT false`,
        `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_section_media_url TEXT`,
        `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_section_media_type TEXT DEFAULT 'image'`,
        `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_section_title TEXT DEFAULT 'Social Space'`,
        `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_section_subtitle TEXT DEFAULT 'Join the conversation!'`,

        // ── profiles: section visibility toggles ────────────────────────────────
        `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_hero_section BOOLEAN DEFAULT true`,
        `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_stats_section BOOLEAN DEFAULT true`,
        `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_training_section BOOLEAN DEFAULT true`,
        `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_experience_section BOOLEAN DEFAULT true`,
        `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_education_section BOOLEAN DEFAULT true`,
        `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_volunteering_section BOOLEAN DEFAULT true`,
        `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_about_section BOOLEAN DEFAULT true`,
        `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_projects_section BOOLEAN DEFAULT true`,
        `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_quizzes_section BOOLEAN DEFAULT true`,
        `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_typing_test_section BOOLEAN DEFAULT true`,
        `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_feedback_section BOOLEAN DEFAULT true`,
        `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_games_section BOOLEAN DEFAULT true`,
        `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_live_sessions_section BOOLEAN DEFAULT true`,

        // ── website_polls: ensure new columns exist ──────────────────────────────
        `ALTER TABLE website_polls ADD COLUMN IF NOT EXISTS background_url TEXT`,
        `ALTER TABLE website_polls ADD COLUMN IF NOT EXISTS background_type TEXT DEFAULT 'image'`,
        `ALTER TABLE website_polls ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`,

        // ── website_questions: ensure new columns exist ──────────────────────────
        `ALTER TABLE website_questions ADD COLUMN IF NOT EXISTS background_url TEXT`,
        `ALTER TABLE website_questions ADD COLUMN IF NOT EXISTS background_type TEXT DEFAULT 'image'`,
        `ALTER TABLE website_questions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`,

        // ── social_game_sessions: ensure play_count exists ───────────────────────
        `ALTER TABLE social_game_sessions ADD COLUMN IF NOT EXISTS play_count INTEGER DEFAULT 0`,
    ];

    const results: { query: string; status: string }[] = [];

    for (const q of queries) {
        try {
            await db.execute(sql.raw(q));
            results.push({ query: q.slice(0, 80).trim(), status: "ok" });
        } catch (err: any) {
            results.push({ query: q.slice(0, 80).trim(), status: `error: ${err.message}` });
        }
    }

    const failed = results.filter(r => r.status !== "ok");
    return NextResponse.json({
        success: failed.length === 0,
        message: `Repair complete. ${results.length - failed.length}/${results.length} migrations applied.`,
        failed: failed.length > 0 ? failed : undefined,
    });
}
