import { NextResponse } from "next/server";
import { db } from "@/db";
import { affiliateConfig } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        await db.update(affiliateConfig)
            .set({
                directSplit: 30, // Fallback/Base
                level1Split: 10,
                level2Split: 5,
                level3Split: 5
            })
            .where(eq(affiliateConfig.id, 1));

        return NextResponse.json({
            success: true,
            message: "MLM Config Updated to 10-5-5-5",
            config: { level1: 10, level2: 5, level3: 5 }
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
