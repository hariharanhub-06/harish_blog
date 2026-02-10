import { db } from "@/db";
import { financeLeads, contactSubmissions } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
    try {
        // 1. Fetch leads
        const leads = await db.select().from(financeLeads).orderBy(desc(financeLeads.createdAt));

        // 2. Fetch all contact submissions to hydrate
        const allContacts = await db.select().from(contactSubmissions);
        const contactMap = allContacts.reduce((acc: any, curr) => {
            acc[curr.id] = curr;
            return acc;
        }, {});

        const data = leads.map(l => ({
            ...l,
            lead: contactMap[l.leadId] || null
        }));

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("CRITICAL: Failed to fetch finance leads:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("POST /api/admin/finance-leads - Body:", body);

        if (!body.leadId || !body.loanType) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const values = {
            leadId: body.leadId,
            loanType: body.loanType,
            status: body.status || "Document Collection",
            adminNotes: (body.adminNotes || "")
        };
        console.log("Inserting values:", values);

        const result = await db.insert(financeLeads).values(values).returning();
        console.log("Insert result:", result);

        return NextResponse.json(result[0] || { success: true });
    } catch (error: any) {
        console.error("CRITICAL: Failed to create finance lead:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message || String(error),
            stack: error.stack
        }, { status: 500 });
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
