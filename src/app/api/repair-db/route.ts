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
