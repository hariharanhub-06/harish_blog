import { NextResponse } from "next/server";
import { db } from "@/db";
import { workoutPlans } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { validateAdminSession } from "@/lib/adminAuth";

export async function GET(req: Request) {
  const authError = await validateAdminSession(req);
  if (authError) return authError;

  const plans = await db.select().from(workoutPlans).orderBy(asc(workoutPlans.displayOrder), asc(workoutPlans.createdAt));
  return NextResponse.json(plans);
}

export async function POST(req: Request) {
  const authError = await validateAdminSession(req);
  if (authError) return authError;

  try {
    const { name, description, goal, difficulty } = await req.json();
    if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

    const [plan] = await db
      .insert(workoutPlans)
      .values({ name, description: description || null, goal: goal || null, difficulty: difficulty || "intermediate" })
      .returning();

    return NextResponse.json(plan);
  } catch (error: unknown) {
    console.error("[workout/plans] POST error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Failed to create plan" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const authError = await validateAdminSession(req);
  if (authError) return authError;

  try {
    const { id, ...fields } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const [plan] = await db
      .update(workoutPlans)
      .set({ ...fields, updatedAt: new Date() })
      .where(eq(workoutPlans.id, id))
      .returning();

    return NextResponse.json(plan);
  } catch (error: unknown) {
    console.error("[workout/plans] PUT error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const authError = await validateAdminSession(req);
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await db.delete(workoutPlans).where(eq(workoutPlans.id, id));
  return NextResponse.json({ success: true });
}

export async function PATCH(req: Request) {
  const authError = await validateAdminSession(req);
  if (authError) return authError;

  try {
    const items: { id: string; displayOrder: number }[] = await req.json();
    await Promise.all(
      items.map((item) =>
        db.update(workoutPlans).set({ displayOrder: item.displayOrder }).where(eq(workoutPlans.id, item.id))
      )
    );
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[workout/plans] PATCH reorder error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Failed to reorder plans" }, { status: 500 });
  }
}
