import { NextResponse } from "next/server";
import { db } from "@/db";
import { financeTransactions, financeDebts } from "@/db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const category = searchParams.get("category");

        let conditions = [];
        if (startDate) conditions.push(gte(financeTransactions.date, new Date(startDate)));
        if (endDate) conditions.push(lte(financeTransactions.date, new Date(endDate)));
        if (category && category !== "All") conditions.push(eq(financeTransactions.category, category));

        const transactions = await db.select()
            .from(financeTransactions)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(financeTransactions.date));

        return NextResponse.json(transactions);
    } catch (error) {
        console.error("Failed to fetch transactions", error);
        return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const res = await db.transaction(async (tx) => {
            const [transaction] = await tx.insert(financeTransactions).values({
                amount: parseFloat(data.amount),
                description: data.description,
                category: data.category,
                type: data.type,
                debtId: data.debtId,
                date: data.date ? new Date(data.date) : new Date(),
            }).returning();

            // If it's a debt payment, update the remaining amount in financeDebts
            if (data.type === "debt_pay" && data.debtId) {
                const [debt] = await tx.select().from(financeDebts).where(eq(financeDebts.id, data.debtId));
                if (debt) {
                    await tx.update(financeDebts)
                        .set({
                            remainingAmount: debt.remainingAmount - parseFloat(data.amount),
                            updatedAt: new Date(),
                        })
                        .where(eq(financeDebts.id, data.debtId));
                }
            }

            return transaction;
        });

        return NextResponse.json(res);
    } catch (error) {
        console.error("Failed to create transaction", error);
        return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await db.transaction(async (tx) => {
            const [transaction] = await tx.select().from(financeTransactions).where(eq(financeTransactions.id, id));
            if (!transaction) return;

            // Rollback debt payment if deleting a debt_pay transaction
            if (transaction.type === "debt_pay" && transaction.debtId) {
                const [debt] = await tx.select().from(financeDebts).where(eq(financeDebts.id, transaction.debtId));
                if (debt) {
                    await tx.update(financeDebts)
                        .set({
                            remainingAmount: debt.remainingAmount + transaction.amount,
                            updatedAt: new Date(),
                        })
                        .where(eq(financeDebts.id, transaction.debtId));
                }
            }

            await tx.delete(financeTransactions).where(eq(financeTransactions.id, id));
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete transaction", error);
        return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
    }
}
