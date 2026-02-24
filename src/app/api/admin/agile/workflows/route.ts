import { db } from "@/db";
import { agileWorkflows } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
        return NextResponse.json({ error: "Missing Project ID" }, { status: 400 });
    }

    try {
        const workflow = await db.query.agileWorkflows.findFirst({
            where: eq(agileWorkflows.projectId, projectId),
        });
        return NextResponse.json(workflow);
    } catch (error: any) {
        console.error("Error fetching agile workflow:", error);
        return NextResponse.json({ error: "Failed to fetch workflow" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, projectId, name, statusOrder } = body;

        if (!projectId) {
            return NextResponse.json({ error: "Missing Project ID" }, { status: 400 });
        }

        const workflowData = {
            projectId,
            name: name || "Standard Workflow",
            statusOrder: statusOrder || ["To Do", "In Progress", "Done"],
            updatedAt: new Date(),
        };

        if (id) {
            await db.update(agileWorkflows).set(workflowData).where(eq(agileWorkflows.id, id));
            return NextResponse.json({ success: true, id });
        } else {
            // Check if workflow exists for this project
            const existing = await db.query.agileWorkflows.findFirst({
                where: eq(agileWorkflows.projectId, projectId),
            });

            if (existing) {
                await db.update(agileWorkflows).set(workflowData).where(eq(agileWorkflows.id, existing.id));
                return NextResponse.json({ success: true, id: existing.id });
            }

            const [newWorkflow] = await db.insert(agileWorkflows).values({
                ...workflowData,
                createdAt: new Date(),
            }).returning();
            return NextResponse.json({ success: true, id: newWorkflow.id });
        }
    } catch (error: any) {
        console.error("Error saving agile workflow:", error);
        return NextResponse.json({ error: error.message || "Failed to save workflow" }, { status: 500 });
    }
}
