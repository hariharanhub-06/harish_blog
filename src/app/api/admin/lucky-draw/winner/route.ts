import { NextResponse } from "next/server";
import { db } from "@/db";
import { luckyDrawEntries } from "@/db/schema";
import { eq } from "drizzle-orm";
import { validateAdminSession } from "@/lib/adminAuth";

export async function POST(req: Request) {
  const authError = await validateAdminSession(req);
  if (authError) return authError;

  // Pick from step=2 entries that are not yet winners
  const eligible = await db
    .select()
    .from(luckyDrawEntries)
    .where(eq(luckyDrawEntries.step, 2));

  const nonWinners = eligible.filter((e) => !e.isWinner);
  if (nonWinners.length === 0) {
    return NextResponse.json(
      { error: "No eligible entries found. Participants must complete both steps." },
      { status: 404 }
    );
  }

  const winner = nonWinners[Math.floor(Math.random() * nonWinners.length)];

  await db
    .update(luckyDrawEntries)
    .set({ isWinner: true })
    .where(eq(luckyDrawEntries.id, winner.id));

  return NextResponse.json({ winner });
}

export async function DELETE(req: Request) {
  const authError = await validateAdminSession(req);
  if (authError) return authError;

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await db
    .update(luckyDrawEntries)
    .set({ isWinner: false })
    .where(eq(luckyDrawEntries.id, id));

  return NextResponse.json({ success: true });
}
