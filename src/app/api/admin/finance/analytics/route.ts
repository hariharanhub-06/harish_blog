import { NextResponse } from "next/server";
import { db } from "@/db";
import { financeTransactions } from "@/db/schema";
import { and, gte, lte, sql } from "drizzle-orm";

interface DailyFlow {
    day: number;
    income: number;
    expense: number;
    net: number;
}

interface Insight {
    type: string;
    message: string;
    severity: "info" | "warning" | "success";
    icon?: string;
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        let startDateParam = searchParams.get("startDate");
        let endDateParam = searchParams.get("endDate");
        const range = searchParams.get("range");

        // Calculate dates from range if not explicitly provided
        if (!startDateParam && !endDateParam && range) {
            const now = new Date();
            if (range === "Last 30 Days") {
                const start = new Date();
                start.setDate(now.getDate() - 30);
                startDateParam = start.toISOString();
                endDateParam = now.toISOString();
            } else if (range === "Last 6 Months") {
                const start = new Date();
                start.setMonth(now.getMonth() - 6);
                startDateParam = start.toISOString();
                endDateParam = now.toISOString();
            } else if (range === "This Month") {
                const start = new Date(now.getFullYear(), now.getMonth(), 1);
                startDateParam = start.toISOString();
                endDateParam = now.toISOString();
            } else if (range === "This Year") {
                const start = new Date(now.getFullYear(), 0, 1);
                startDateParam = start.toISOString();
                endDateParam = now.toISOString();
            }
        }

        // Default to current month if still no range provided
        const now = new Date();
        const startDate = startDateParam ? new Date(startDateParam) : new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = endDateParam ? new Date(endDateParam) : new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const transactions = await db.select()
            .from(financeTransactions)
            .where(and(
                gte(financeTransactions.date, startDate),
                lte(financeTransactions.date, endDate)
            ));

        if (transactions.length === 0) {
            return NextResponse.json({
                cashFlowPatterns: {
                    dailyFlow: Array.from({ length: 31 }, (_, i) => ({ day: i + 1, income: 0, expense: 0, net: 0 })),
                    weeklyPattern: { week1: 0, week2: 0, week3: 0, week4: 0 },
                    insights: []
                },
                velocity: {
                    moneyLifespan: 0,
                    dailyBurnRate: 0,
                    cashRunway: 0,
                    turnoverRate: 0,
                    depletionCurve: []
                }
            });
        }

        // === CASH FLOW PATTERNS ===

        // Use Asia/Kolkata for grouping to match user perspective
        const dailyFlowMap = new Map<number, DailyFlow>();
        const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
        const displayMonth = nowIST.getMonth();
        const displayYear = nowIST.getFullYear();
        const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            dailyFlowMap.set(day, { day, income: 0, expense: 0, net: 0 });
        }

        transactions.forEach(tx => {
            if (!tx.date) return;

            const txDate = new Date(tx.date);
            const istDate = new Date(txDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

            if (istDate.getMonth() === displayMonth && istDate.getFullYear() === displayYear) {
                const day = istDate.getDate();
                const entry = dailyFlowMap.get(day);
                if (entry) {
                    if (tx.type === 'income') {
                        entry.income += tx.amount;
                    } else {
                        entry.expense += tx.amount;
                    }
                    entry.net = entry.income - entry.expense;
                }
            }
        });

        const dailyFlow = Array.from(dailyFlowMap.values());

        // 2. Weekly patterns
        const weeklyPattern = {
            week1: 0,
            week2: 0,
            week3: 0,
            week4: 0
        };

        dailyFlow.forEach(d => {
            if (d.day <= 7) weeklyPattern.week1 += d.expense;
            else if (d.day <= 14) weeklyPattern.week2 += d.expense;
            else if (d.day <= 21) weeklyPattern.week3 += d.expense;
            else weeklyPattern.week4 += d.expense;
        });

        // 3. Calculate totals
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpense = transactions
            .filter(t => t.type === 'expense' || t.type === 'debt_pay')
            .reduce((sum, t) => sum + t.amount, 0);

        const dailyBurnRate = totalExpense / endDate.getDate();

        // 4. Detect spending spikes (>2x daily average)
        const spikes = dailyFlow.filter(d => d.expense > dailyBurnRate * 2);

        // 5. Generate insights
        const insights: Insight[] = [];

        // End-of-month burn insight
        const totalWeeklyExpense = weeklyPattern.week1 + weeklyPattern.week2 + weeklyPattern.week3 + weeklyPattern.week4;
        if (totalWeeklyExpense > 0) {
            const week4Percentage = Math.round((weeklyPattern.week4 / totalWeeklyExpense) * 100);
            if (week4Percentage > 35) {
                insights.push({
                    type: "end_of_month_burn",
                    message: `You spend ${week4Percentage}% of your budget in the last week`,
                    severity: "warning",
                    icon: "⚠️"
                });
            }
        }

        // Best cash flow days
        const topIncomeDays = dailyFlow
            .filter(d => d.income > 0)
            .sort((a, b) => b.income - a.income)
            .slice(0, 2);

        if (topIncomeDays.length > 0) {
            const days = topIncomeDays.map(d => `${d.day}${getDaySuffix(d.day)}`).join(', ');
            insights.push({
                type: "best_cash_days",
                message: `Your best income days: ${days}`,
                severity: "success",
                icon: "💰"
            });
        }

        // Spending spikes
        if (spikes.length > 0) {
            const spikeDay = spikes[0].day;
            const spikeAmount = Math.round(spikes[0].expense);
            insights.push({
                type: "spending_spike",
                message: `Spending spike on ${spikeDay}${getDaySuffix(spikeDay)}: ₹${spikeAmount.toLocaleString()}`,
                severity: "info",
                icon: "📊"
            });
        }

        // Weekly comparison
        const lowestWeek = Math.min(weeklyPattern.week1, weeklyPattern.week2, weeklyPattern.week3, weeklyPattern.week4);
        const highestWeek = Math.max(weeklyPattern.week1, weeklyPattern.week2, weeklyPattern.week3, weeklyPattern.week4);

        if (lowestWeek > 0 && highestWeek > 0) {
            const difference = Math.round(((highestWeek - lowestWeek) / lowestWeek) * 100);
            if (difference > 50) {
                insights.push({
                    type: "weekly_variance",
                    message: `Spending varies ${difference}% week-to-week - aim for consistency`,
                    severity: "info",
                    icon: "📈"
                });
            }
        }

        // === FINANCIAL VELOCITY ===

        // 1. Money lifespan (simulate day-by-day depletion)
        let balance = totalIncome;
        let depletionDay = endDate.getDate();
        const depletionCurve = [];

        for (let day = 1; day <= endDate.getDate(); day++) {
            const dayData = dailyFlowMap.get(day)!;
            balance += dayData.income - dayData.expense;

            depletionCurve.push({
                day,
                balance: Math.max(0, balance),
                percentage: totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0
            });

            if (balance <= 0 && depletionDay === endDate.getDate()) {
                depletionDay = day;
            }
        }

        const moneyLifespan = depletionDay;

        // 2. Cash runway (assuming current balance based on latest data)
        const currentBalance = balance > 0 ? balance : 0;
        const cashRunway = dailyBurnRate > 0 ? Math.round(currentBalance / dailyBurnRate) : 0;

        // 3. Turnover rate (how many times money cycles through)
        const avgBalance = depletionCurve.reduce((sum, d) => sum + d.balance, 0) / depletionCurve.length;
        const turnoverRate = avgBalance > 0 ? parseFloat((totalExpense / avgBalance).toFixed(2)) : 0;

        return NextResponse.json({
            cashFlowPatterns: {
                dailyFlow,
                weeklyPattern,
                insights,
                spikeDays: spikes.map(s => s.day)
            },
            velocity: {
                moneyLifespan,
                dailyBurnRate: Math.round(dailyBurnRate),
                cashRunway,
                turnoverRate,
                depletionCurve,
                totalIncome: Math.round(totalIncome),
                totalExpense: Math.round(totalExpense)
            }
        });
    } catch (error) {
        console.error("Failed to calculate analytics", error);
        return NextResponse.json({ error: "Failed to calculate analytics" }, { status: 500 });
    }
}

function getDaySuffix(day: number): string {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}
