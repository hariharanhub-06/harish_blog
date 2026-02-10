import { db } from "@/db";
import { financeLeads } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
    try {
        const data = await db.query.financeLeads.findMany({
            with: {
                lead: true
            },
            orderBy: [desc(financeLeads.createdAt)]
        });
        return NextResponse.json(data);
    } catch (error) {
        console.error("Failed to fetch finance leads:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        if (!body.leadId || !body.loanType) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const [newLead] = await db.insert(financeLeads).values({
            leadId: body.leadId,
            loanType: body.loanType,
            status: body.status || "Document Collection",
            adminNotes: body.adminNotes || ""
        }).returning();

        return NextResponse.json(newLead);
    } catch (error) {
        console.error("Failed to create finance lead:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        if (!body.id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        const { id, ...updateData } = body;

        // Ensure numeric fields are numbers
        if (updateData.approvedAmount) updateData.approvedAmount = parseFloat(updateData.approvedAmount);
        if (updateData.commissionAmount) updateData.commissionAmount = parseFloat(updateData.commissionAmount);

        // Handle dates
        if (updateData.disbursementDate) updateData.disbursementDate = new Date(updateData.disbursementDate);
        if (updateData.commissionCollectedDate) updateData.commissionCollectedDate = new Date(updateData.commissionCollectedDate);

        const [updated] = await db.update(financeLeads)
            .set({
                ...updateData,
                updatedAt: new Date()
            })
            .where(eq(financeLeads.id, id))
            .returning();

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Failed to update finance lead:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

        await db.delete(financeLeads).where(eq(financeLeads.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete finance lead:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
