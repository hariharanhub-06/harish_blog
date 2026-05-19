import { NextResponse } from "next/server";
import { db } from "@/db";
import { luckyDrawEntries, luckyDrawClicks } from "@/db/schema";
import { eq, count, sql } from "drizzle-orm";
import { validateAdminSession } from "@/lib/adminAuth";

export async function GET(req: Request) {
  const authError = await validateAdminSession(req);
  if (authError) return authError;

  const [{ total }] = await db.select({ total: count() }).from(luckyDrawEntries);
  const [{ step2 }] = await db
    .select({ step2: count() })
    .from(luckyDrawEntries)
    .where(eq(luckyDrawEntries.step, 2));
  const [{ winners }] = await db
    .select({ winners: count() })
    .from(luckyDrawEntries)
    .where(eq(luckyDrawEntries.isWinner, true));
  const [{ totalClicks }] = await db.select({ totalClicks: count() }).from(luckyDrawClicks);

  const langBreakdown = await db
    .select({ language: luckyDrawEntries.language, cnt: count() })
    .from(luckyDrawEntries)
    .groupBy(luckyDrawEntries.language);

  return NextResponse.json({
    totalRegistrations: total ?? 0,
    completedBothSteps: step2 ?? 0,
    step1Only: (total ?? 0) - (step2 ?? 0),
    totalLinkClicks: totalClicks ?? 0,
    winners: winners ?? 0,
    langBreakdown,
  });
}
