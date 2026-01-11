import { NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates } from "@/db/schema";

export async function GET() {
    try {
        const all = await db.select().from(affiliates);
        const bad = all.filter(a => a.parentId === a.id);

        return NextResponse.json({
            all,
            bad,
            hasSelfReference: bad.length > 0
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
