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
    try {
        const data = await req.json();
        console.log("Experience POST data:", data);
        if (data.id) {
            await db.update(experience).set(data).where(eq(experience.id, data.id));
        } else {
            await db.insert(experience).values(data);
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Experience POST error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
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
