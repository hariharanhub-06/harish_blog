import { db } from "@/db";
import { agileProjects, agileWorkflows } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const allProjects = await db.query.agileProjects.findMany({
            with: {
                workflows: true,
                epics: true,
            },
            orderBy: [desc(agileProjects.createdAt)],
        });
        return NextResponse.json(allProjects);
    } catch (error: any) {
        console.error("Error fetching agile projects:", error);
        return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, name, key, description, lead, avatarUrl } = body;

        const projectData = {
            name,
            key: key.toUpperCase(),
            description,
            lead,
            avatarUrl,
            updatedAt: new Date(),
        };

        if (id) {
            await db.update(agileProjects).set(projectData).where(eq(agileProjects.id, id));
            return NextResponse.json({ success: true, id });
        } else {
            const [newProject] = await db.insert(agileProjects).values({
                ...projectData,
                createdAt: new Date(),
            }).returning();

            // Auto-create a standard workflow for new projects
            await db.insert(agileWorkflows).values({
                projectId: newProject.id,
                name: "Standard Workflow",
                statusOrder: ["To Do", "In Progress", "Done"],
            });

            return NextResponse.json({ success: true, id: newProject.id });
        }
    } catch (error: any) {
        console.error("Error saving agile project:", error);
        return NextResponse.json({ error: error.message || "Failed to save project" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
        try {
            await db.delete(agileProjects).where(eq(agileProjects.id, id));
            return NextResponse.json({ success: true });
        } catch (error: any) {
            console.error("Error deleting project:", error);
            return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
        }
    }
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
}
