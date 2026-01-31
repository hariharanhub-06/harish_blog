import { NextResponse } from "next/server";
import { db } from "@/db";
import { financeTransactions, financeDebts } from "@/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        let startDate = searchParams.get("startDate");
        let endDate = searchParams.get("endDate");
        const range = searchParams.get("range");

        // Calculate dates from range if not explicitly provided
        if (!startDate && !endDate && range) {
            const now = new Date();
            // Standardize now to end of day for range calculations
            const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

            if (range === "Last 30 Days") {
                const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30, 0, 0, 0, 0);
                startDate = start.toISOString();
                endDate = endOfToday.toISOString();
            } else if (range === "Last 6 Months") {
                const start = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate(), 0, 0, 0, 0);
                startDate = start.toISOString();
                endDate = endOfToday.toISOString();
            } else if (range === "This Month") {
                const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
                startDate = start.toISOString();
                endDate = endOfToday.toISOString();
            } else if (range === "This Year") {
                const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
                startDate = start.toISOString();
                endDate = endOfToday.toISOString();
            }
        }

        let conditions = [];
        if (startDate) conditions.push(gte(financeTransactions.date, new Date(startDate)));
        if (endDate) {
            const end = new Date(endDate);
            // If it's just a date string, set to end of day
            if (!endDate.includes('T')) {
                end.setHours(23, 59, 59, 999);
            }
            conditions.push(lte(financeTransactions.date, end));
        }

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

        // 4. Trend Analysis (Dynamic Grouping)
        let trend;
        let isDaily = false;

        // Determine if we should show Daily or Monthly breakdown
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            isDaily = diffDays <= 32;
        } else {
            // Default to monthly if no specific range (or "All Time")
            isDaily = false;
        }


        if (isDaily) {
            // DAILY GROUPING
            trend = await db.select({
                period: sql<string>`to_char(${financeTransactions.date}, 'DD Mon')`,
                type: financeTransactions.type,
                total: sql<number>`sum(${financeTransactions.amount})`,
                sortKey: sql<string>`to_char(${financeTransactions.date}, 'YYYY-MM-DD')`,
            })
                .from(financeTransactions)
                .where(whereClause) // Use the same date filter
                .groupBy(sql`to_char(${financeTransactions.date}, 'DD Mon')`, financeTransactions.type, sql`to_char(${financeTransactions.date}, 'YYYY-MM-DD')`)
                .orderBy(sql`to_char(${financeTransactions.date}, 'YYYY-MM-DD')`);
        } else {
            // MONTHLY GROUPING (Default)
            // If no date range provided, default to last 6 months for trend context
            const trendWhereCondition = whereClause || gte(financeTransactions.date, new Date(new Date().setMonth(new Date().getMonth() - 6)));

            trend = await db.select({
                period: sql<string>`to_char(${financeTransactions.date}, 'Mon')`,
                type: financeTransactions.type,
                total: sql<number>`sum(${financeTransactions.amount})`,
                sortKey: sql<string>`to_char(${financeTransactions.date}, 'YYYY-MM')`,
            })
                .from(financeTransactions)
                .where(trendWhereCondition)
                .groupBy(sql`to_char(${financeTransactions.date}, 'Mon')`, financeTransactions.type, sql`to_char(${financeTransactions.date}, 'YYYY-MM')`)
                .orderBy(sql`to_char(${financeTransactions.date}, 'YYYY-MM')`);
        }

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
