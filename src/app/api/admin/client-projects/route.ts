import { db } from "@/db";
import { clientProjects, contactSubmissions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // 1. Try to fetch projects alone first
        const projects = await db.select().from(clientProjects).orderBy(desc(clientProjects.createdAt));

        // 2. Try to hydrate with leads separately (safer than complex join for debugging)
        const hydrated = await Promise.all(projects.map(async (p) => {
            try {
                if (p.leadId) {
                    const leadData = await db.select().from(contactSubmissions).where(eq(contactSubmissions.id, p.leadId)).limit(1);
                    return { ...p, lead: leadData[0] || null };
                }
            } catch (e) {
                console.error(`Failed to fetch lead for project ${p.id}:`, e);
            }
            return { ...p, lead: null };
        }));

        return NextResponse.json(hydrated);
    } catch (error: any) {
        console.error("GET /api/admin/client-projects error:", error);
        return NextResponse.json({
            error: "Database Fetch Failed",
            message: error?.message || String(error),
            code: error?.code || "UNKNOWN"
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
        const { id, lead, ...updateData } = data; // Filter out lead relation

        if (!id) return NextResponse.json({ error: "Project ID required" }, { status: 400 });

        // Filter for valid database fields only
        const validFields = [
            "title", "clientName", "businessName", "description",
            "scopeSummary", "timeline", "price", "advancePaid",
            "balanceAmount", "paymentStatus", "status",
            "agreementContent", "invoiceUrl", "onboardingChecklist",
            "progressMilestones", "internalCost", "expectedProfit"
        ];

        const filteredUpdates = Object.keys(updateData)
            .filter(key => validFields.includes(key))
            .reduce((obj, key) => {
                obj[key] = updateData[key];
                return obj;
            }, {} as any);

        const updated = await db.update(clientProjects)
            .set({
                ...filteredUpdates,
                updatedAt: new Date()
            })
            .where(eq(clientProjects.id, id))
            .returning();

        if (!updated.length) return NextResponse.json({ error: "Project not found" }, { status: 404 });

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
