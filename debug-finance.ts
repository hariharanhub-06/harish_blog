
import { db } from "./src/db";
import { financeTransactions } from "./src/db/schema";
import { and, gte, lte } from "drizzle-orm";

async function debugGroups() {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30, 0, 0, 0, 0);
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    console.log("Range:", startDate.toISOString(), "to", endDate.toISOString());

    const transactions = await db.select()
        .from(financeTransactions)
        .where(and(
            gte(financeTransactions.date, startDate),
            lte(financeTransactions.date, endDate)
        ));

    console.log("Found transactions:", transactions.length);

    const istFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    });

    const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const displayMonth = nowIST.getMonth();
    const displayYear = nowIST.getFullYear();

    console.log("Current IST Month:", displayMonth + 1, "Year:", displayYear);

    const grouping = {};

    transactions.forEach(tx => {
        const txDate = new Date(tx.date);
        const parts = istFormatter.formatToParts(txDate);
        const istDay = parseInt(parts.find(p => p.type === 'day')!.value);
        const istMonth = parseInt(parts.find(p => p.type === 'month')!.value) - 1;
        const istYear = parseInt(parts.find(p => p.type === 'year')!.value);

        if (istMonth === displayMonth && istYear === displayYear) {
            grouping[istDay] = (grouping[istDay] || 0) + (tx.type === 'income' ? tx.amount : -tx.amount);
            console.log(`Matched: Day ${istDay}, Amnt ${tx.amount}, Type ${tx.type}, Date ${tx.date.toISOString()}`);
        } else {
            console.log(`Skipped (Month mismatch): IST Month ${istMonth + 1}, IST Year ${istYear}, Date ${tx.date.toISOString()}`);
        }
    });

    console.log("Final Grouping:", grouping);
}

debugGroups().catch(console.error);
