import { db } from "@/db";
import { agileEpics } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
        return NextResponse.json({ error: "Missing Project ID" }, { status: 400 });
    }

    try {
        const epics = await db.query.agileEpics.findMany({
            where: eq(agileEpics.projectId, projectId),
            orderBy: [desc(agileEpics.createdAt)],
        });
        return NextResponse.json(epics);
    } catch (error: any) {
        console.error("Error fetching agile epics:", error);
        return NextResponse.json({ error: "Failed to fetch epics" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, projectId, title, description, color, status } = body;

        const epicData = {
            projectId,
            title,
            description,
            color,
            status: status || "To Do",
            updatedAt: new Date(),
        };

        if (id) {
            await db.update(agileEpics).set(epicData).where(eq(agileEpics.id, id));
            return NextResponse.json({ success: true, id });
        } else {
            const [newEpic] = await db.insert(agileEpics).values({
                ...epicData,
                createdAt: new Date(),
            }).returning();
            return NextResponse.json({ success: true, id: newEpic.id });
        }
    } catch (error: any) {
        console.error("Error saving agile epic:", error);
        return NextResponse.json({ error: error.message || "Failed to save epic" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
        try {
            await db.delete(agileEpics).where(eq(agileEpics.id, id));
            return NextResponse.json({ success: true });
        } catch (error: any) {
            console.error("Error deleting epic:", error);
            return NextResponse.json({ error: "Failed to delete epic" }, { status: 500 });
        }
    }
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
}
