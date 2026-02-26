import { db } from "@/db";
import { kanbanTasks } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const tasks = await db.select().from(kanbanTasks).orderBy(asc(kanbanTasks.displayOrder));
        return NextResponse.json(tasks);
    } catch (error: any) {
        console.error("GET /api/admin/kanban error:", error);
        return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();

        // Get the current max display order for the status to append the new task
        const existingTasks = await db.select().from(kanbanTasks).where(eq(kanbanTasks.status, data.status || "To Do"));
        const maxOrder = existingTasks.length > 0
            ? Math.max(...existingTasks.map(t => t.displayOrder || 0))
            : -1;

        const newTask = await db.insert(kanbanTasks).values({
            title: data.title,
            description: data.description,
            priority: data.priority || "Medium",
            status: data.status || "To Do",
            displayOrder: maxOrder + 1,
        }).returning();

        return NextResponse.json(newTask[0]);
    } catch (error) {
        console.error("POST /api/admin/kanban error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const data = await req.json();
        const { id, ...updateData } = data;

        if (!id) return NextResponse.json({ error: "Task ID required" }, { status: 400 });

        const updated = await db.update(kanbanTasks)
            .set({
                ...updateData,
                updatedAt: new Date()
            })
            .where(eq(kanbanTasks.id, id))
            .returning();

        if (!updated.length) return NextResponse.json({ error: "Task not found" }, { status: 404 });

        return NextResponse.json(updated[0]);
    } catch (error) {
        console.error("PUT /api/admin/kanban error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await db.delete(kanbanTasks).where(eq(kanbanTasks.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
    }
}
