import { NextResponse } from "next/server";
import { db } from "@/db";
import { workoutLogs } from "@/db/schema";
import { eq, gte, lte, and, desc } from "drizzle-orm";
import { validateAdminSession } from "@/lib/adminAuth";

function computeStreak(logs: { date: string }[]): number {
  if (logs.length === 0) return 0;
  const dates = [...new Set(logs.map((l) => l.date))].sort().reverse();
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  let streak = 0;
  let current = new Date(dates[0]);
  for (const d of dates) {
    const diff = Math.round((current.getTime() - new Date(d).getTime()) / 86400000);
    if (diff <= 1) {
      streak++;
      current = new Date(d);
    } else {
      break;
    }
  }
  return streak;
}

export async function GET(req: Request) {
  const authError = await validateAdminSession(req);
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const conditions: any[] = [];
  if (start) conditions.push(gte(workoutLogs.date, start));
  if (end) conditions.push(lte(workoutLogs.date, end));

  const logs = await db
    .select()
    .from(workoutLogs)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(workoutLogs.date));

  const totalWorkouts = logs.length;
  const totalSeconds = logs.reduce((s, l) => s + (l.totalSeconds ?? 0), 0);
  const avgDurationMinutes = totalWorkouts > 0 ? Math.round(logs.reduce((s, l) => s + (l.durationMinutes ?? 0), 0) / totalWorkouts) : 0;
  const streak = computeStreak(logs);

  return NextResponse.json({
    logs,
    stats: { totalWorkouts, totalSeconds, avgDurationMinutes, streak },
  });
}

export async function POST(req: Request) {
  const authError = await validateAdminSession(req);
  if (authError) return authError;

  try {
    const { planId, planName, date, durationMinutes, totalSeconds, feeling, exercisesCompleted, notes } =
      await req.json();

    if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

    const [log] = await db
      .insert(workoutLogs)
      .values({
        planId: planId || null,
        planName: planName || null,
        date,
        durationMinutes: durationMinutes ?? 0,
        totalSeconds: totalSeconds ?? 0,
        feeling: feeling || "good",
        exercisesCompleted: exercisesCompleted ?? 0,
        notes: notes || null,
      })
      .returning();

    return NextResponse.json(log);
  } catch (error: unknown) {
    console.error("[workout/logs] POST error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Failed to save log" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const authError = await validateAdminSession(req);
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await db.delete(workoutLogs).where(eq(workoutLogs.id, id));
  return NextResponse.json({ success: true });
}
