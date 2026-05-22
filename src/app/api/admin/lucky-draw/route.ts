import { NextResponse } from "next/server";
import { db } from "@/db";
import { luckyDrawEntries, luckyDrawClicks } from "@/db/schema";
import { eq, count, desc } from "drizzle-orm";
import { validateAdminSession } from "@/lib/adminAuth";

export async function GET(req: Request) {
  const authError = await validateAdminSession(req);
  if (authError) return authError;

  const entries = await db
    .select()
    .from(luckyDrawEntries)
    .orderBy(desc(luckyDrawEntries.createdAt));

  const enriched = (
    await Promise.allSettled(
      entries.map(async (entry) => {
        const [{ referredCount }] = await db
          .select({ referredCount: count() })
          .from(luckyDrawEntries)
          .where(eq(luckyDrawEntries.referredBy, entry.referralCode));

        const [{ clickCount }] = await db
          .select({ clickCount: count() })
          .from(luckyDrawClicks)
          .where(eq(luckyDrawClicks.referralCode, entry.referralCode));

        return { ...entry, referredCount: referredCount ?? 0, clickCount: clickCount ?? 0 };
      })
    )
  )
    .filter((r): r is PromiseFulfilledResult<typeof entries[number] & { referredCount: number; clickCount: number }> => r.status === "fulfilled")
    .map((r) => r.value);

  return NextResponse.json({ entries: enriched });
}
