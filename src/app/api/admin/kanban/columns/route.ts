import { NextResponse } from "next/server";
import { db } from "@/db";
import { kanbanColumns } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { validateAdminSession } from "@/lib/adminAuth";

export async function GET(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;
        const columns = await db.select().from(kanbanColumns).orderBy(asc(kanbanColumns.displayOrder));
        return NextResponse.json(columns);
    } catch (error) {
        console.error("GET /api/admin/kanban/columns error:", error);
        return NextResponse.json({ error: "Failed to fetch columns" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;
        const body = await req.json();
        const { name, color, displayOrder } = body;

        const newColumn = await db.insert(kanbanColumns).values({
            name,
            color: color || "#3b82f6",
            displayOrder: displayOrder || 0
        }).returning();

        return NextResponse.json(newColumn[0]);
    } catch (error) {
        console.error("POST /api/admin/kanban/columns error:", error);
        return NextResponse.json({ error: "Failed to create column" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;
        const body = await req.json();
        const { id, name, color, displayOrder } = body;

        const updated = await db.update(kanbanColumns)
            .set({
                name,
                color,
                displayOrder,
                updatedAt: new Date()
            })
            .where(eq(kanbanColumns.id, id))
            .returning();

        return NextResponse.json(updated[0]);
    } catch (error) {
        console.error("PUT /api/admin/kanban/columns error:", error);
        return NextResponse.json({ error: "Failed to update column" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;
        const columnsData = await req.json(); // Expected: [{ id: string, displayOrder: number }, ...]

        if (!Array.isArray(columnsData)) {
            return NextResponse.json({ error: "Array of columns expected" }, { status: 400 });
        }

        const updates = columnsData.map(col =>
            db.update(kanbanColumns)
                .set({ displayOrder: col.displayOrder, updatedAt: new Date() })
                .where(eq(kanbanColumns.id, col.id))
        );

        await Promise.all(updates);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("PATCH /api/admin/kanban/columns error:", error);
        return NextResponse.json({ error: "Failed to reorder columns" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const authError = await validateAdminSession(req);
    if (authError) return authError;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    try {
        await db.delete(kanbanColumns).where(eq(kanbanColumns.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/admin/kanban/columns error:", error);
        return NextResponse.json({ error: "Failed to delete column" }, { status: 500 });
    }
}
