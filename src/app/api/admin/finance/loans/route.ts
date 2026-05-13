import { NextResponse } from "next/server";
import { db } from "@/db";
import { financeLoans } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { validateAdminSession } from "@/lib/adminAuth";

export async function GET(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;
        const loans = await db.select().from(financeLoans).orderBy(desc(financeLoans.createdAt));
        return NextResponse.json(loans);
    } catch (error) {
        console.error("Failed to fetch loans", error);
        return NextResponse.json({ error: "Failed to fetch loans" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;
        const data = await req.json();
        const newLoan = await db.insert(financeLoans).values({
            borrowerName: data.borrowerName,
            amount: parseFloat(data.amount),
            collectedAmount: parseFloat(data.collectedAmount || 0),
            interestRate: parseFloat(data.interestRate || 0),
            timePeriod: data.timePeriod,
            startDate: data.startDate ? new Date(data.startDate) : new Date(),
            dueDate: data.dueDate ? new Date(data.dueDate) : null,
            notes: data.notes,
            status: data.status || "active",
        }).returning();
        return NextResponse.json(newLoan[0]);
    } catch (error) {
        console.error("Failed to create loan", error);
        return NextResponse.json({ error: "Failed to create loan" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;
        const data = await req.json();
        const updated = await db.update(financeLoans)
            .set({
                borrowerName: data.borrowerName,
                amount: parseFloat(data.amount),
                collectedAmount: parseFloat(data.collectedAmount),
                interestRate: parseFloat(data.interestRate),
                timePeriod: data.timePeriod,
                startDate: data.startDate ? new Date(data.startDate) : null,
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
                notes: data.notes,
                status: data.status,
                updatedAt: new Date(),
            })
            .where(eq(financeLoans.id, data.id))
            .returning();
        return NextResponse.json(updated[0]);
    } catch (error) {
        console.error("Failed to update loan", error);
        return NextResponse.json({ error: "Failed to update loan" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await db.delete(financeLoans).where(eq(financeLoans.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete loan", error);
        return NextResponse.json({ error: "Failed to delete loan" }, { status: 500 });
    }
}
