import { NextResponse } from "next/server";
import { db } from "@/db";
import { financeTransactions, financeDebts, financeLoans } from "@/db/schema";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { validateAdminSession } from "@/lib/adminAuth";

export async function GET(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const category = searchParams.get("category");

        const conditions = [];
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
        const authError = await validateAdminSession(req);
        if (authError) return authError;
        const data = await req.json();
        // neon-http driver does not support transactions, so executing sequentially
        const [transaction] = await db.insert(financeTransactions).values({
            amount: parseFloat(data.amount),
            description: data.description,
            category: data.category,
            type: data.type,
            debtId: data.debtId || null,
            loanId: data.loanId || null,
            date: data.date ? new Date(data.date) : new Date(),
        }).returning();

        if (!transaction) return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });

        // If it's a debt payment, update the remaining amount in financeDebts
        if (data.type === "debt_pay" && data.debtId) {
            const [debt] = await db.select().from(financeDebts).where(eq(financeDebts.id, data.debtId));
            if (debt) {
                await db.update(financeDebts)
                    .set({
                        remainingAmount: debt.remainingAmount - parseFloat(data.amount),
                        updatedAt: new Date(),
                    })
                    .where(eq(financeDebts.id, data.debtId));
            }
        }

        // If it's a loan collection, update the collected amount and status in financeLoans
        if (data.type === "loan_collect" && data.loanId) {
            const [loan] = await db.select().from(financeLoans).where(eq(financeLoans.id, data.loanId));
            if (loan) {
                const newCollectedAmount = loan.collectedAmount + parseFloat(data.amount);
                const newStatus = newCollectedAmount >= loan.amount ? "collected" : "active";
                await db.update(financeLoans)
                    .set({
                        collectedAmount: newCollectedAmount,
                        status: newStatus,
                        updatedAt: new Date(),
                    })
                    .where(eq(financeLoans.id, data.loanId));
            }
        }

        return NextResponse.json(transaction);
    } catch (error: any) {
        console.error("Failed to create transaction", error);
        return NextResponse.json({
            error: "Failed to create transaction",
            details: error.message || "Unknown error"
        }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;
        const data = await req.json();
        const { id, ...updates } = data;

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        // Handle date conversion if provided
        if (updates.date) updates.date = new Date(updates.date);

        // Handle amount parsing if provided
        if (updates.amount !== undefined) updates.amount = parseFloat(updates.amount);

        const [transaction] = await db.update(financeTransactions)
            .set({
                ...updates,
                updatedAt: new Date()
            })
            .where(eq(financeTransactions.id, id))
            .returning();

        if (!transaction) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

        return NextResponse.json(transaction);
    } catch (error: any) {
        console.error("Failed to update transaction", error);
        return NextResponse.json({
            error: "Failed to update transaction",
            details: error.message || "Unknown error"
        }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        // neon-http driver does not support transactions, so executing sequentially
        const [transaction] = await db.select().from(financeTransactions).where(eq(financeTransactions.id, id));
        if (!transaction) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

        // Rollback debt payment if deleting a debt_pay transaction
        if (transaction.type === "debt_pay" && transaction.debtId) {
            const [debt] = await db.select().from(financeDebts).where(eq(financeDebts.id, transaction.debtId));
            if (debt) {
                await db.update(financeDebts)
                    .set({
                        remainingAmount: debt.remainingAmount + transaction.amount,
                        updatedAt: new Date(),
                    })
                    .where(eq(financeDebts.id, transaction.debtId));
            }
        }

        // Rollback loan collection if deleting a loan_collect transaction
        if (transaction.type === "loan_collect" && transaction.loanId) {
            const [loan] = await db.select().from(financeLoans).where(eq(financeLoans.id, transaction.loanId));
            if (loan) {
                const newCollectedAmount = loan.collectedAmount - transaction.amount;
                const newStatus = newCollectedAmount >= loan.amount ? "collected" : "active";
                await db.update(financeLoans)
                    .set({
                        collectedAmount: newCollectedAmount,
                        status: newStatus,
                        updatedAt: new Date(),
                    })
                    .where(eq(financeLoans.id, transaction.loanId));
            }
        }

        await db.delete(financeTransactions).where(eq(financeTransactions.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete transaction", error);
        return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
    }
}
