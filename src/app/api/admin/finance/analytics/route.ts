import { NextResponse } from "next/server";
import { db } from "@/db";
import { financeTransactions } from "@/db/schema";
import { gte, sql } from "drizzle-orm";

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
        // Get current month's transactions
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const transactions = await db.select()
            .from(financeTransactions)
            .where(gte(financeTransactions.date, startOfMonth));

        if (transactions.length === 0) {
            return NextResponse.json({
                cashFlowPatterns: {
                    dailyFlow: [],
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

        // 1. Group by day of month
        const dailyFlowMap = new Map<number, DailyFlow>();
        for (let day = 1; day <= endOfMonth.getDate(); day++) {
            dailyFlowMap.set(day, { day, income: 0, expense: 0, net: 0 });
        }

        transactions.forEach(tx => {
            if (!tx.date) return;
            const day = new Date(tx.date).getDate();
            const entry = dailyFlowMap.get(day);

            if (!entry) return;

            if (tx.type === 'income') {
                entry.income += tx.amount;
            } else {
                entry.expense += tx.amount;
            }
            entry.net = entry.income - entry.expense;
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

        const dailyBurnRate = totalExpense / endOfMonth.getDate();

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
        let depletionDay = endOfMonth.getDate();
        const depletionCurve = [];

        for (let day = 1; day <= endOfMonth.getDate(); day++) {
            const dayData = dailyFlowMap.get(day)!;
            balance += dayData.income - dayData.expense;

            depletionCurve.push({
                day,
                balance: Math.max(0, balance),
                percentage: totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0
            });

            if (balance <= 0 && depletionDay === endOfMonth.getDate()) {
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
