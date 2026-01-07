import { db } from "@/db";
import { contactSubmissions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    const data = await db.query.contactSubmissions.findMany({
        orderBy: [desc(contactSubmissions.createdAt)],
    });
    return NextResponse.json(data);
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
        await db.delete(contactSubmissions).where(eq(contactSubmissions.id, id));
        return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false }, { status: 400 });
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        }

        await db.update(contactSubmissions)
            .set(updates)
            .where(eq(contactSubmissions.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}
