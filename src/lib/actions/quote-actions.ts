"use server";

import { db } from "@/db";
import { projectQuotes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createQuote(data: any) {
    try {
        const [quote] = await db.insert(projectQuotes).values({
            projectName: data.projectName,
            clientName: data.clientName,
            configuration: data.configuration,
            finalPrice: data.finalPrice,
            internalCost: data.internalCost,
            expectedProfit: data.expectedProfit,
            profitMargin: data.profitMargin,
            deliverables: data.deliverables,
            timeline: data.timeline,
            status: "draft"
        }).returning();

        revalidatePath("/admin/dashboard");
        return { success: true, quote };
    } catch (error) {
        console.error("Create Quote Error:", error);
        return { success: false, error: "Failed to create quote" };
    }
}

export async function getQuotes() {
    try {
        const quotes = await db.select().from(projectQuotes).orderBy(desc(projectQuotes.createdAt));
        return { success: true, quotes };
    } catch (error) {
        console.error("Get Quotes Error:", error);
        return { success: false, error: "Failed to fetch quotes" };
    }
}

export async function deleteQuote(id: string) {
    try {
        await db.delete(projectQuotes).where(eq(projectQuotes.id, id));
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Delete Quote Error:", error);
        return { success: false, error: "Failed to delete quote" };
    }
}

export async function getQuoteByToken(token: string) {
    try {
        const [quote] = await db.select().from(projectQuotes).where(eq(projectQuotes.quoteToken, token)).limit(1);
        if (!quote) return { success: false, error: "Quote not found" };

        // Sanitize for public view
        const publicQuote = {
            projectName: quote.projectName,
            clientName: quote.clientName,
            finalPrice: quote.finalPrice,
            deliverables: quote.deliverables,
            timeline: quote.timeline,
            createdAt: quote.createdAt
        };

        return { success: true, quote: publicQuote };
    } catch (error) {
        console.error("Get Quote By Token Error:", error);
        return { success: false, error: "Failed to fetch quote" };
    }
}
