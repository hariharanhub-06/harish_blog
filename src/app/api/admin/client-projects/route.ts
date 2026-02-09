import { db } from "@/db";
import { clientProjects, contactSubmissions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const projects = await db.select({
            id: clientProjects.id,
            leadId: clientProjects.leadId,
            title: clientProjects.title,
            clientName: clientProjects.clientName,
            businessName: clientProjects.businessName,
            description: clientProjects.description,
            price: clientProjects.price,
            status: clientProjects.status,
            paymentStatus: clientProjects.paymentStatus,
            onboardingChecklist: clientProjects.onboardingChecklist,
            createdAt: clientProjects.createdAt,
            lead: {
                id: contactSubmissions.id,
                name: contactSubmissions.name,
                email: contactSubmissions.email,
                mobile: contactSubmissions.mobile
            }
        })
            .from(clientProjects)
            .leftJoin(contactSubmissions, eq(clientProjects.leadId, contactSubmissions.id))
            .orderBy(desc(clientProjects.createdAt));

        return NextResponse.json(projects);
    } catch (error: any) {
        console.error("GET /api/admin/client-projects error:", error);
        return NextResponse.json({
            error: "Database Fetch Failed",
            message: error.message,
            code: error.code
        }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();

        // Check if project for this lead already exists
        if (data.leadId) {
            const existing = await db.select().from(clientProjects).where(eq(clientProjects.leadId, data.leadId)).limit(1);
            if (existing.length > 0) {
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
        console.error("POST /api/admin/client-projects error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
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
        console.error("PUT /api/admin/client-projects error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
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
