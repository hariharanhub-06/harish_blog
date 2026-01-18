import { db } from "@/db";
import { affiliateConfig } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const [config] = await db.select().from(affiliateConfig).where(eq(affiliateConfig.id, 1)).limit(1);

        // Return default if not found
        if (!config) {
            return NextResponse.json({
                directSplit: 50,
                level1Split: 20,
                level2Split: 18,
                level3Split: 12
            });
        }

        return NextResponse.json(config);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { directSplit, level1Split, level2Split, level3Split } = body;

        // Ensure single row with ID 1
        const [existing] = await db.select().from(affiliateConfig).where(eq(affiliateConfig.id, 1)).limit(1);

        if (existing) {
            await db.update(affiliateConfig)
                .set({
                    directSplit: parseFloat(directSplit),
                    level1Split: parseFloat(level1Split),
                    level2Split: parseFloat(level2Split),
                    level3Split: parseFloat(level3Split),
                    updatedAt: new Date()
                })
                .where(eq(affiliateConfig.id, 1));
        } else {
            await db.insert(affiliateConfig).values({
                id: 1,
                directSplit: parseFloat(directSplit),
                level1Split: parseFloat(level1Split),
                level2Split: parseFloat(level2Split),
                level3Split: parseFloat(level3Split)
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
    }
}
