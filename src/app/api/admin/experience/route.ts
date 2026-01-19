import { db } from "@/db";
import { experience } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    const data = await db.select({
        id: experience.id,
        company: experience.company,
        role: experience.role,
        duration: experience.duration,
        displayOrder: experience.displayOrder,
        createdAt: experience.createdAt,
    }).from(experience).orderBy(desc(experience.displayOrder));
    return NextResponse.json(data);
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("Experience POST body:", body);
        const { id, createdAt, ...data } = body;

        if (id) {
            await db.update(experience).set(data).where(eq(experience.id, id));
        } else {
            await db.insert(experience).values(data);
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Experience POST error:", error);
        // Log detailed error for debugging
        if (error && typeof error === 'object') {
            try {
                console.error("Experience POST error details:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
            } catch (e) {
                // Ignore circular reference errors during JSON.stringify
            }
        }
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
