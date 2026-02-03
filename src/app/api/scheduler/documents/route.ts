import { db } from "@/db";
import { schedulerDocuments } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

export async function GET() {
    try {
        const docs = await db.query.schedulerDocuments.findMany({
            where: eq(schedulerDocuments.isActive, true),
            orderBy: (t, { asc }) => [asc(t.displayOrder), asc(t.createdAt)]
        });
        return NextResponse.json(docs);
    } catch (error) {
        console.error("Failed to fetch documents:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
