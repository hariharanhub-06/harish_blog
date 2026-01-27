import { NextResponse } from "next/server";
import { db } from "@/db";
import { financeDebts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
    try {
        const debts = await db.select().from(financeDebts).orderBy(desc(financeDebts.createdAt));
        return NextResponse.json(debts);
    } catch (error) {
        console.error("Failed to fetch debts", error);
        return NextResponse.json({ error: "Failed to fetch debts" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const newDebt = await db.insert(financeDebts).values({
            name: data.name,
            initialAmount: parseFloat(data.initialAmount),
            remainingAmount: parseFloat(data.initialAmount),
            notes: data.notes,
            repaymentType: data.repaymentType || "single",
            dueDate: data.dueDate ? new Date(data.dueDate) : null,
        }).returning();
        return NextResponse.json(newDebt[0]);
    } catch (error) {
        console.error("Failed to create debt", error);
        return NextResponse.json({ error: "Failed to create debt" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const data = await req.json();
        const updated = await db.update(financeDebts)
            .set({
                name: data.name,
                initialAmount: parseFloat(data.initialAmount),
                remainingAmount: parseFloat(data.remainingAmount),
                notes: data.notes,
                repaymentType: data.repaymentType,
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
                isActive: data.isActive,
                updatedAt: new Date(),
            })
            .where(eq(financeDebts.id, data.id))
            .returning();
        return NextResponse.json(updated[0]);
    } catch (error) {
        console.error("Failed to update debt", error);
        return NextResponse.json({ error: "Failed to update debt" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await db.delete(financeDebts).where(eq(financeDebts.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete debt", error);
        return NextResponse.json({ error: "Failed to delete debt" }, { status: 500 });
    }
}
