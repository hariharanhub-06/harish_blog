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
        `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_know_about_you_section BOOLEAN DEFAULT true`,
        `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS click_effect TEXT DEFAULT 'none'`,

        // ── profiles: deduplicate rows (keep only the most-recently-updated) ─────
        `DELETE FROM profiles WHERE id NOT IN (SELECT id FROM profiles ORDER BY updated_at ASC NULLS LAST LIMIT 1)`,

        // ── smile task system ────────────────────────────────────────────────────
        `CREATE TABLE IF NOT EXISTS smile_tasks (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            status TEXT DEFAULT 'pause',
            link TEXT DEFAULT '/smile',
            lines JSONB NOT NULL DEFAULT '[]',
            rare_lines JSONB DEFAULT '[]',
            rare_chance INTEGER DEFAULT 10,
            poster_bg_gradient TEXT DEFAULT '#1a1a2e,#16213e',
            share_text TEXT DEFAULT 'This made me smile 😄 Try yours →',
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )`,

        `CREATE TABLE IF NOT EXISTS smile_analytics (
            id TEXT PRIMARY KEY,
            task_id TEXT NOT NULL,
            event TEXT NOT NULL,
            ip_hash TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        )`,

        // ── lucky draw campaign ──────────────────────────────────────────────────
        `CREATE TABLE IF NOT EXISTS lucky_draw_entries (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            mobile TEXT NOT NULL,
            selfie_url TEXT NOT NULL,
            favorite_number INTEGER,
            unique_lucky_number TEXT,
            referral_code TEXT NOT NULL,
            referred_by TEXT,
            language TEXT DEFAULT 'en',
            step INTEGER DEFAULT 1,
            is_winner BOOLEAN DEFAULT false,
            privacy_consent BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(mobile),
            UNIQUE(unique_lucky_number),
            UNIQUE(referral_code)
        )`,

        `CREATE TABLE IF NOT EXISTS lucky_draw_clicks (
            id TEXT PRIMARY KEY,
            referral_code TEXT NOT NULL,
            ip_address TEXT,
            user_agent TEXT,
            clicked_at TIMESTAMP DEFAULT NOW()
        )`,
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
