import { db } from "@/db";
import { agileSprints } from "@/db/schema";
import { eq, desc, and, ne } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
        return NextResponse.json({ error: "Missing Project ID" }, { status: 400 });
    }

    try {
        const sprints = await db.query.agileSprints.findMany({
            where: eq(agileSprints.projectId, projectId),
            orderBy: [desc(agileSprints.createdAt)],
        });
        return NextResponse.json(sprints);
    } catch (error: any) {
        console.error("Error fetching agile sprints:", error);
        return NextResponse.json({ error: "Failed to fetch sprints" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, projectId, name, startDate, endDate, goal, status } = body;

        const sprintData = {
            projectId,
            name,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
            goal,
            status: status || "planned",
            updatedAt: new Date(),
        };

        if (status === "active") {
            // Ensure no other sprint is active for this project
            await db.update(agileSprints)
                .set({ status: "closed", updatedAt: new Date() })
                .where(and(eq(agileSprints.projectId, projectId), eq(agileSprints.status, "active")));
        }

        if (id) {
            await db.update(agileSprints).set(sprintData).where(eq(agileSprints.id, id));
            return NextResponse.json({ success: true, id });
        } else {
            const [newSprint] = await db.insert(agileSprints).values({
                ...sprintData,
                createdAt: new Date(),
            }).returning();
            return NextResponse.json({ success: true, id: newSprint.id });
        }
    } catch (error: any) {
        console.error("Error saving agile sprint:", error);
        return NextResponse.json({ error: error.message || "Failed to save sprint" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
        try {
            await db.delete(agileSprints).where(eq(agileSprints.id, id));
            return NextResponse.json({ success: true });
        } catch (error: any) {
            console.error("Error deleting sprint:", error);
            return NextResponse.json({ error: "Failed to delete sprint" }, { status: 500 });
        }
    }
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
}
