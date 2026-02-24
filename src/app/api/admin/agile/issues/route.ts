import { db } from "@/db";
import { agileIssues } from "@/db/schema";
import { eq, desc, and, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const sprintId = searchParams.get("sprintId");
    const epicId = searchParams.get("epicId");

    if (!projectId) {
        return NextResponse.json({ error: "Missing Project ID" }, { status: 400 });
    }

    try {
        let whereClause: any = eq(agileIssues.projectId, projectId);

        if (sprintId === "backlog") {
            whereClause = and(whereClause, isNull(agileIssues.sprintId));
        } else if (sprintId) {
            whereClause = and(whereClause, eq(agileIssues.sprintId, sprintId));
        }

        if (epicId) {
            whereClause = and(whereClause, eq(agileIssues.epicId, epicId));
        }

        const issues = await db.query.agileIssues.findMany({
            where: whereClause,
            with: {
                subtasks: true,
                epic: true,
            },
            orderBy: [desc(agileIssues.position), desc(agileIssues.createdAt)],
        });
        return NextResponse.json(issues);
    } catch (error: any) {
        console.error("Error fetching agile issues:", error);
        return NextResponse.json({ error: "Failed to fetch issues" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, projectId, epicId, sprintId, parentId, title, description, type, priority, status, storyPoints, assignee, position } = body;

        const issueData = {
            projectId,
            epicId: epicId || null,
            sprintId: sprintId === "backlog" ? null : (sprintId || null),
            parentId: parentId || null,
            title,
            description,
            type: type || "story",
            priority: priority || "Medium",
            status: status || "To Do",
            storyPoints: storyPoints || 0,
            assignee,
            position: position || 0,
            updatedAt: new Date(),
        };

        if (id) {
            await db.update(agileIssues).set(issueData).where(eq(agileIssues.id, id));
            return NextResponse.json({ success: true, id });
        } else {
            const [newIssue] = await db.insert(agileIssues).values({
                ...issueData,
                createdAt: new Date(),
            }).returning();
            return NextResponse.json({ success: true, id: newIssue.id });
        }
    } catch (error: any) {
        console.error("Error saving agile issue:", error);
        return NextResponse.json({ error: error.message || "Failed to save issue" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
        try {
            await db.delete(agileIssues).where(eq(agileIssues.id, id));
            return NextResponse.json({ success: true });
        } catch (error: any) {
            console.error("Error deleting issue:", error);
            return NextResponse.json({ error: "Failed to delete issue" }, { status: 500 });
        }
    }
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
}
