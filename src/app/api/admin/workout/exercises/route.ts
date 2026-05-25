import { NextResponse } from "next/server";
import { db } from "@/db";
import { exercises } from "@/db/schema";
import { eq, ilike, and, or, sql } from "drizzle-orm";
import { validateAdminSession } from "@/lib/adminAuth";

export async function GET(req: Request) {
  const authError = await validateAdminSession(req);
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const source = searchParams.get("source");
  const bodyPart = searchParams.get("bodyPart");
  const q = searchParams.get("q");

  if (source === "exercisedb") {
    if (!bodyPart) {
      return NextResponse.json({ error: "bodyPart required for exercisedb source" }, { status: 400 });
    }
    try {
      const apiUrl =
        bodyPart === "all"
          ? `https://exercisedb.io/api/v1/exercises?limit=50&offset=0`
          : `https://exercisedb.io/api/v1/exercises/bodyPart/${encodeURIComponent(bodyPart)}?limit=50&offset=0`;

      const res = await fetch(apiUrl, {
        headers: { "User-Agent": "HarishBlog/1.0" },
        next: { revalidate: 86400 },
      });

      if (!res.ok) {
        throw new Error(`ExerciseDB returned ${res.status}`);
      }

      const data: any[] = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        return NextResponse.json({ exercises: [], cached: false, count: 0 });
      }

      const mapped = data.map((item) => ({
        id: undefined as any,
        externalId: String(item.id),
        name: String(item.name || ""),
        bodyPart: String(item.bodyPart || ""),
        target: String(item.target || ""),
        equipment: String(item.equipment || ""),
        gifUrl: String(item.gifUrl || ""),
        secondaryMuscles: Array.isArray(item.secondaryMuscles) ? item.secondaryMuscles : [],
        instructions: Array.isArray(item.instructions) ? item.instructions : [],
        isCustom: false,
        isActive: true,
      }));

      // Upsert all fetched exercises
      for (const ex of mapped) {
        const { id: _id, ...values } = ex;
        await db
          .insert(exercises)
          .values({ ...values, id: sql`gen_random_uuid()` } as any)
          .onConflictDoUpdate({
            target: exercises.externalId,
            set: {
              gifUrl: sql`excluded.gif_url`,
              name: sql`excluded.name`,
              secondaryMuscles: sql`excluded.secondary_muscles`,
              instructions: sql`excluded.instructions`,
              updatedAt: new Date(),
            },
          });
      }

      // Return freshly cached results
      const conditions = [eq(exercises.isActive, true)];
      if (bodyPart !== "all") conditions.push(eq(exercises.bodyPart, bodyPart));
      const rows = await db.select().from(exercises).where(and(...conditions));
      return NextResponse.json({ exercises: rows, cached: true, count: rows.length });
    } catch (error: unknown) {
      console.error("[workout/exercises] ExerciseDB fetch error:", error instanceof Error ? error.message : String(error));
      return NextResponse.json({ error: "Failed to fetch from ExerciseDB" }, { status: 502 });
    }
  }

  // Default: query from DB
  const conditions: any[] = [eq(exercises.isActive, true)];
  if (bodyPart && bodyPart !== "all") conditions.push(eq(exercises.bodyPart, bodyPart));
  if (q) conditions.push(ilike(exercises.name, `%${q}%`));

  const rows = await db
    .select()
    .from(exercises)
    .where(and(...conditions))
    .orderBy(exercises.name);

  return NextResponse.json({ exercises: rows, count: rows.length });
}

export async function POST(req: Request) {
  const authError = await validateAdminSession(req);
  if (authError) return authError;

  try {
    const data = await req.json();
    const { name, bodyPart, target, equipment, gifUrl, secondaryMuscles, instructions } = data;
    if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

    const [row] = await db
      .insert(exercises)
      .values({
        name,
        bodyPart: bodyPart || null,
        target: target || null,
        equipment: equipment || null,
        gifUrl: gifUrl || null,
        secondaryMuscles: secondaryMuscles || [],
        instructions: instructions || [],
        isCustom: true,
      })
      .returning();

    return NextResponse.json(row);
  } catch (error: unknown) {
    console.error("[workout/exercises] POST error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Failed to create exercise" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const authError = await validateAdminSession(req);
  if (authError) return authError;

  try {
    const { id, ...fields } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const [row] = await db
      .update(exercises)
      .set({ ...fields, updatedAt: new Date() })
      .where(eq(exercises.id, id))
      .returning();

    return NextResponse.json(row);
  } catch (error: unknown) {
    console.error("[workout/exercises] PATCH error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Failed to update exercise" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const authError = await validateAdminSession(req);
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await db.update(exercises).set({ isActive: false, updatedAt: new Date() }).where(eq(exercises.id, id));
  return NextResponse.json({ success: true });
}
