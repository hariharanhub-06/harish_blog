import { NextResponse } from "next/server";
import { db } from "@/db";
import { financeTransactions, financeDebts } from "@/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        let conditions = [];
        if (startDate) conditions.push(gte(financeTransactions.date, new Date(startDate)));
        if (endDate) conditions.push(lte(financeTransactions.date, new Date(endDate)));

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // 1. Basic Stats
        const stats = await db.select({
            type: financeTransactions.type,
            total: sql<number>`sum(${financeTransactions.amount})`,
        })
            .from(financeTransactions)
            .where(whereClause)
            .groupBy(financeTransactions.type);

        // 2. Debt Balance (Current)
        const debts = await db.select({
            total: sql<number>`sum(${financeDebts.remainingAmount})`,
        })
            .from(financeDebts)
            .where(eq(financeDebts.isActive, true));

        // 3. Category Breakdown (All types, grouped by category)
        const categories = await db.select({
            category: financeTransactions.category,
            value: sql<number>`sum(${financeTransactions.amount})`,
            type: financeTransactions.type,
        })
            .from(financeTransactions)
            .where(whereClause)
            .groupBy(financeTransactions.category, financeTransactions.type);

        // 5. Active Debts (for dynamic category filtering)
        const activeDebts = await db.select({
            id: financeDebts.id,
            name: financeDebts.name,
            remainingAmount: financeDebts.remainingAmount,
        })
            .from(financeDebts)
            .where(sql`${financeDebts.remainingAmount} > 0`);

        // 4. Monthly Trend (Last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const trend = await db.select({
            month: sql<string>`to_char(${financeTransactions.date}, 'Mon')`,
            type: financeTransactions.type,
            total: sql<number>`sum(${financeTransactions.amount})`,
            rawMonth: sql<string>`to_char(${financeTransactions.date}, 'YYYY-MM')`,
        })
            .from(financeTransactions)
            .where(gte(financeTransactions.date, sixMonthsAgo))
            .groupBy(sql`to_char(${financeTransactions.date}, 'Mon')`, financeTransactions.type, sql`to_char(${financeTransactions.date}, 'YYYY-MM')`)
            .orderBy(sql`to_char(${financeTransactions.date}, 'YYYY-MM')`);

        return NextResponse.json({
            summary: stats,
            debtBalance: debts[0]?.total || 0,
            categories,
            activeDebts,
            trend
        });
    } catch (error) {
        console.error("Failed to fetch summary", error);
        return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 });
    }
}
