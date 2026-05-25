import { NextResponse } from "next/server";
import { db } from "@/db";
import { exercises } from "@/db/schema";
import { eq, ilike, and, sql } from "drizzle-orm";
import { validateAdminSession } from "@/lib/adminAuth";
import { randomUUID } from "crypto";

// free-exercise-db: 870+ exercises, completely free, no API key
const FREE_EXERCISE_DB_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";

// GitHub base for exercise images (two per exercise: 0.jpg = start, 1.jpg = end)
const IMG_BASE =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

const CATEGORY_TO_BODY_PART: Record<string, string> = {
  chest: "chest",
  back: "back",
  shoulders: "shoulders",
  arms: "upper arms",
  legs: "upper legs",
  calves: "lower legs",
  abs: "waist",
  cardio: "cardio",
  olympic_weightlifting: "back",
  powerlifting: "upper legs",
  stretching: "waist",
  plyometrics: "cardio",
  strongman: "back",
};

export async function GET(req: Request) {
  const authError = await validateAdminSession(req);
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const source = searchParams.get("source");
  const bodyPart = searchParams.get("bodyPart");
  const q = searchParams.get("q");

  if (source === "exercisedb") {
    try {
      const res = await fetch(FREE_EXERCISE_DB_URL, {
        headers: { "User-Agent": "HarishBlog/1.0" },
      });

      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

      const data: any[] = await res.json();

      if (!Array.isArray(data)) throw new Error("Invalid data format");

      // Filter by bodyPart if specified
      const filtered =
        bodyPart && bodyPart !== "all"
          ? data.filter((item) => {
              const cat = (item.category || "").toLowerCase();
              const mapped = CATEGORY_TO_BODY_PART[cat] || cat;
              return (
                mapped === bodyPart ||
                cat === bodyPart ||
                (item.primaryMuscles || []).some((m: string) =>
                  m.toLowerCase().includes(bodyPart)
                )
              );
            })
          : data;

      const toInsert = filtered.map((item) => ({
        id: randomUUID(),
        externalId: String(item.id || item.name).replace(/\s+/g, "_"),
        name: String(item.name || ""),
        bodyPart:
          CATEGORY_TO_BODY_PART[(item.category || "").toLowerCase()] ||
          (item.category || "").toLowerCase() ||
          null,
        target: (item.primaryMuscles || [])[0] || null,
        equipment: item.equipment || null,
        // gif_url: start frame image. secondaryMuscles stores end frame for flipbook
        gifUrl:
          item.images && item.images.length > 0
            ? `${IMG_BASE}/${item.images[0]}`
            : null,
        secondaryMuscles: item.images && item.images.length > 1
          ? [`${IMG_BASE}/${item.images[1]}`, ...(item.secondaryMuscles || [])]
          : item.secondaryMuscles || [],
        instructions: Array.isArray(item.instructions)
          ? item.instructions
          : [],
        isCustom: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      // Bulk upsert
      if (toInsert.length > 0) {
        await db
          .insert(exercises)
          .values(toInsert)
          .onConflictDoUpdate({
            target: exercises.externalId,
            set: {
              gifUrl: sql`excluded.gif_url`,
              secondaryMuscles: sql`excluded.secondary_muscles`,
              instructions: sql`excluded.instructions`,
              updatedAt: new Date(),
            },
          });
      }

      // Return from DB
      const conditions: any[] = [eq(exercises.isActive, true)];
      if (bodyPart && bodyPart !== "all")
        conditions.push(eq(exercises.bodyPart, bodyPart));
      const rows = await db
        .select()
        .from(exercises)
        .where(and(...conditions))
        .orderBy(exercises.name);

      return NextResponse.json({
        exercises: rows,
        cached: true,
        count: rows.length,
      });
    } catch (error: unknown) {
      console.error(
        "[workout/exercises] fetch error:",
        error instanceof Error ? error.message : String(error)
      );
      return NextResponse.json(
        { error: "Failed to fetch exercises: " + (error instanceof Error ? error.message : String(error)) },
        { status: 502 }
      );
    }
  }

  // Default: query from DB
  try {
    const conditions: any[] = [eq(exercises.isActive, true)];
    if (bodyPart && bodyPart !== "all")
      conditions.push(eq(exercises.bodyPart, bodyPart));
    if (q) conditions.push(ilike(exercises.name, `%${q}%`));

    const rows = await db
      .select()
      .from(exercises)
      .where(and(...conditions))
      .orderBy(exercises.name);

    return NextResponse.json({ exercises: rows, count: rows.length });
  } catch (error: unknown) {
    console.error("[workout/exercises] DB error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
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

  await db
    .update(exercises)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(exercises.id, id));
  return NextResponse.json({ success: true });
}
