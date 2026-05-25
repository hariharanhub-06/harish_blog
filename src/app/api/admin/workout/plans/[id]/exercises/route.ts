import { NextResponse } from "next/server";
import { db } from "@/db";
import { workoutPlanExercises, exercises } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { validateAdminSession } from "@/lib/adminAuth";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const authError = await validateAdminSession(req);
  if (authError) return authError;

  const { id } = await params;

  const rows = await db
    .select({
      id: workoutPlanExercises.id,
      planId: workoutPlanExercises.planId,
      exerciseId: workoutPlanExercises.exerciseId,
      durationSeconds: workoutPlanExercises.durationSeconds,
      restSeconds: workoutPlanExercises.restSeconds,
      displayOrder: workoutPlanExercises.displayOrder,
      exercise: {
        name: exercises.name,
        bodyPart: exercises.bodyPart,
        target: exercises.target,
        equipment: exercises.equipment,
        gifUrl: exercises.gifUrl,
      },
    })
    .from(workoutPlanExercises)
    .innerJoin(exercises, eq(workoutPlanExercises.exerciseId, exercises.id))
    .where(eq(workoutPlanExercises.planId, id))
    .orderBy(asc(workoutPlanExercises.displayOrder));

  return NextResponse.json(rows);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const authError = await validateAdminSession(req);
  if (authError) return authError;

  try {
    const { id } = await params;
    const { exerciseId, durationSeconds, restSeconds } = await req.json();
    if (!exerciseId) return NextResponse.json({ error: "exerciseId required" }, { status: 400 });

    // Auto-assign displayOrder = max + 1
    const existing = await db
      .select({ displayOrder: workoutPlanExercises.displayOrder })
      .from(workoutPlanExercises)
      .where(eq(workoutPlanExercises.planId, id));

    const maxOrder = existing.reduce((max, r) => Math.max(max, r.displayOrder ?? 0), -1);

    const [row] = await db
      .insert(workoutPlanExercises)
      .values({
        planId: id,
        exerciseId,
        durationSeconds: durationSeconds ?? 30,
        restSeconds: restSeconds ?? 15,
        displayOrder: maxOrder + 1,
      })
      .returning();

    // Return with exercise data joined
    const [full] = await db
      .select({
        id: workoutPlanExercises.id,
        planId: workoutPlanExercises.planId,
        exerciseId: workoutPlanExercises.exerciseId,
        durationSeconds: workoutPlanExercises.durationSeconds,
        restSeconds: workoutPlanExercises.restSeconds,
        displayOrder: workoutPlanExercises.displayOrder,
        exercise: {
          name: exercises.name,
          bodyPart: exercises.bodyPart,
          target: exercises.target,
          equipment: exercises.equipment,
          gifUrl: exercises.gifUrl,
        },
      })
      .from(workoutPlanExercises)
      .innerJoin(exercises, eq(workoutPlanExercises.exerciseId, exercises.id))
      .where(eq(workoutPlanExercises.id, row.id));

    return NextResponse.json(full);
  } catch (error: unknown) {
    console.error("[workout/plan-exercises] POST error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Failed to add exercise" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const authError = await validateAdminSession(req);
  if (authError) return authError;

  try {
    const { id: peId, durationSeconds, restSeconds } = await req.json();
    if (!peId) return NextResponse.json({ error: "id required" }, { status: 400 });

    const [row] = await db
      .update(workoutPlanExercises)
      .set({ durationSeconds, restSeconds })
      .where(eq(workoutPlanExercises.id, peId))
      .returning();

    return NextResponse.json(row);
  } catch (error: unknown) {
    console.error("[workout/plan-exercises] PUT error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Failed to update exercise" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const authError = await validateAdminSession(req);
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const peId = searchParams.get("id");
  if (!peId) return NextResponse.json({ error: "id required" }, { status: 400 });

  await db.delete(workoutPlanExercises).where(eq(workoutPlanExercises.id, peId));
  return NextResponse.json({ success: true });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const authError = await validateAdminSession(req);
  if (authError) return authError;

  try {
    const items: { id: string; displayOrder: number }[] = await req.json();
    await Promise.all(
      items.map((item) =>
        db
          .update(workoutPlanExercises)
          .set({ displayOrder: item.displayOrder })
          .where(eq(workoutPlanExercises.id, item.id))
      )
    );
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[workout/plan-exercises] PATCH error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Failed to reorder" }, { status: 500 });
  }
}
