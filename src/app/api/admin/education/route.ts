import { db } from "@/db";
import { education } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    const data = await db.query.education.findMany({
        orderBy: [desc(education.order)],
    });
    return NextResponse.json(data);
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, ...data } = body;
        console.log("Education POST data:", data);
        if (id) {
            await db.update(education).set(data).where(eq(education.id, id));
        } else {
            await db.insert(education).values(data);
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Education POST error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
        await db.delete(education).where(eq(education.id, id));
        return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false }, { status: 400 });
}
