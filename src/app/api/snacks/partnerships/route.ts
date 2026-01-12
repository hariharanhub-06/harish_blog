import { NextResponse } from "next/server";
import { db } from "@/db";
import { partnerships } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

// GET - Fetch active partnerships for public display
export async function GET() {
    try {
        const activePartnerships = await db
            .select({
                id: partnerships.id,
                name: partnerships.name,
                logo: partnerships.logo,
                partnerType: partnerships.partnerType,
            })
            .from(partnerships)
            .where(eq(partnerships.isActive, true))
            .orderBy(asc(partnerships.displayOrder));

        return NextResponse.json(activePartnerships);
    } catch (error) {
        console.error("Fetch public partnerships error:", error);
        return NextResponse.json({ error: "Failed to fetch partnerships" }, { status: 500 });
    }
}
