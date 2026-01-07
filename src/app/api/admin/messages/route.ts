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
