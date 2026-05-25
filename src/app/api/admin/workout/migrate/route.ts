import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { validateAdminSession } from "@/lib/adminAuth";

export async function POST(req: Request) {
  const authError = await validateAdminSession(req);
  if (authError) return authError;

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS exercises (
        id TEXT PRIMARY KEY,
        external_id TEXT UNIQUE,
        name TEXT NOT NULL,
        body_part TEXT,
        target TEXT,
        equipment TEXT,
        gif_url TEXT,
        secondary_muscles JSONB,
        instructions JSONB,
        is_custom BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS workout_plans (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        goal TEXT,
        difficulty TEXT DEFAULT 'intermediate',
        is_active BOOLEAN DEFAULT TRUE,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS workout_plan_exercises (
        id TEXT PRIMARY KEY,
        plan_id TEXT NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
        exercise_id TEXT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
        duration_seconds INTEGER NOT NULL DEFAULT 30,
        rest_seconds INTEGER NOT NULL DEFAULT 15,
        display_order INTEGER DEFAULT 0
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS workout_logs (
        id TEXT PRIMARY KEY,
        plan_id TEXT REFERENCES workout_plans(id) ON DELETE SET NULL,
        plan_name TEXT,
        date TEXT NOT NULL,
        duration_minutes INTEGER DEFAULT 0,
        total_seconds INTEGER DEFAULT 0,
        feeling TEXT DEFAULT 'good',
        exercises_completed INTEGER DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    return NextResponse.json({ success: true, message: "All 4 workout tables created" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
