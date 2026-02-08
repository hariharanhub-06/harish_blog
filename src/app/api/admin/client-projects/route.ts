import { db } from "@/db";
import { clientProjects } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const projects = await db.query.clientProjects.findMany({
            orderBy: [desc(clientProjects.createdAt)],
            with: {
                lead: true
            }
        });
        return NextResponse.json(projects);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch client projects" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();

        // Check if project for this lead already exists
        if (data.leadId) {
            const existing = await db.query.clientProjects.findFirst({
                where: eq(clientProjects.leadId, data.leadId)
            });
            if (existing) {
                return NextResponse.json({ error: "A project already exists for this lead" }, { status: 400 });
            }
        }

        const newProject = await db.insert(clientProjects).values({
            leadId: data.leadId,
            title: data.title,
            clientName: data.clientName,
            businessName: data.businessName,
            description: data.description,
            scopeSummary: data.scopeSummary,
            timeline: data.timeline,
            price: data.price,
            status: "onboarding",
            onboardingChecklist: [
                { id: 1, task: "Requirements Confirmed", completed: true },
                { id: 2, task: "Agreement Signed", completed: false },
                { id: 3, task: "Advance Payment Received", completed: false },
                { id: 4, task: "Access & Assets Collected", completed: false }
            ]
        }).returning();

        return NextResponse.json(newProject[0]);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const data = await req.json();
        const { id, ...updateData } = data;

        if (!id) return NextResponse.json({ error: "Project ID required" }, { status: 400 });

        const updated = await db.update(clientProjects)
            .set({
                ...updateData,
                updatedAt: new Date()
            })
            .where(eq(clientProjects.id, id))
            .returning();

        return NextResponse.json(updated[0]);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await db.delete(clientProjects).where(eq(clientProjects.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
    }
}
