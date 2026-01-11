import { NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
    try {
        await db
            .update(affiliates)
            .set({ parentId: null })
            .where(sql`${affiliates.parentId} = ${affiliates.id}`);

        return NextResponse.json({
            success: true,
            message: "Self-referencing parentIds set to NULL"
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
