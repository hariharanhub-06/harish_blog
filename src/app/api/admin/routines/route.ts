import { db } from "@/db";
import { routines } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const allRoutines = await db.select().from(routines).orderBy(asc(routines.displayOrder));
        return NextResponse.json(allRoutines);
    } catch (error) {
        console.error("GET routines error:", error);
        return NextResponse.json({ error: "Failed to fetch routines" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        if (data.id) {
            // Update existing
            const { id, ...updateData } = data;
            await db.update(routines).set({ ...updateData, updatedAt: new Date() }).where(eq(routines.id, id));
            return NextResponse.json({ success: true, id: id });
        } else {
            // Create new
            const [newRoutine] = await db.insert(routines).values({
                ...data,
                createdAt: new Date(),
                updatedAt: new Date(),
            }).returning();
            return NextResponse.json({ success: true, routine: newRoutine });
        }
    } catch (error) {
        console.error("POST routines error:", error);
        return NextResponse.json({ error: "Failed to save routine" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (id) {
            await db.delete(routines).where(eq(routines.id, id));
            return NextResponse.json({ success: true });
        }
        return NextResponse.json({ error: "Missing id" }, { status: 400 });
    } catch (error) {
        console.error("DELETE routines error:", error);
        return NextResponse.json({ error: "Failed to delete routine" }, { status: 500 });
    }
}
