import { db } from "@/db";
import { experience } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    const data = await db.query.experience.findMany({
        orderBy: [desc(experience.order)],
    });
    return NextResponse.json(data);
}

export async function POST(req: Request) {
    const data = await req.json();
    if (data.id) {
        await db.update(experience).set(data).where(eq(experience.id, data.id));
    } else {
        await db.insert(experience).values(data);
    }
    return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
        await db.delete(experience).where(eq(experience.id, id));
        return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false }, { status: 400 });
}
