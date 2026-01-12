import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { partnerships } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET - Fetch all partnerships (admin)
export async function GET() {
    try {
        const allPartnerships = await db
            .select()
            .from(partnerships)
            .orderBy(desc(partnerships.displayOrder), desc(partnerships.createdAt));

        return NextResponse.json(allPartnerships);
    } catch (error) {
        console.error("Fetch partnerships error:", error);
        return NextResponse.json({ error: "Failed to fetch partnerships" }, { status: 500 });
    }
}

// POST - Create new partnership
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log("[API Partnerships] Received POST body:", body);
        const { name, logo, partnerType, displayOrder = 0 } = body;

        if (!name || !logo || !partnerType) {
            console.warn("[API Partnerships] Missing required fields");
            return NextResponse.json(
                { error: "Name, logo, and partner type are required" },
                { status: 400 }
            );
        }

        console.log("[API Partnerships] Inserting into database...");
        const [newPartnership] = await db
            .insert(partnerships)
            .values({
                name,
                logo,
                partnerType,
                displayOrder,
                isActive: true,
            })
            .returning();
        console.log("[API Partnerships] Success:", newPartnership.id);

        return NextResponse.json(newPartnership);
    } catch (error) {
        console.error("[API Partnerships] Create partnership error:", error);
        return NextResponse.json({ error: "Failed to create partnership: " + (error as Error).message }, { status: 500 });
    }
}
