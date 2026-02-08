import { db } from "@/db";
import {
    pricingBaseCosts,
    pricingPageRates,
    pricingFeatureRates,
    pricingMultipliers,
    pricingDiscounts
} from "@/db/schema";
import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";

export async function GET() {
    try {
        const baseCosts = await db.query.pricingBaseCosts.findMany({
            orderBy: [asc(pricingBaseCosts.displayOrder)]
        });

        // If no data, seed with defaults
        if (baseCosts.length === 0) {
            await seedDefaults();
            return GET(); // Recursive call to fetch new data
        }

        const pageRates = await db.query.pricingPageRates.findMany({
            orderBy: [asc(pricingPageRates.displayOrder)]
        });

        const featureRates = await db.query.pricingFeatureRates.findMany({
            orderBy: [asc(pricingFeatureRates.displayOrder)]
        });

        const multipliers = await db.query.pricingMultipliers.findMany({
            orderBy: [asc(pricingMultipliers.displayOrder)]
        });

        const discounts = await db.query.pricingDiscounts.findMany({
            orderBy: [asc(pricingDiscounts.displayOrder)]
        });

        return NextResponse.json({
            baseCosts,
            pageRates,
            featureRates,
            multipliers,
            discounts
        });
    } catch (error) {
        console.error("Pricing Fetch Error:", error);
        return NextResponse.json({ error: "Failed to fetch pricing data" }, { status: 500 });
    }
}

async function seedDefaults() {
    // 1. Base Costs
    await db.insert(pricingBaseCosts).values([
        { component: "Planning & Requirement Analysis", internalCost: 2000, type: "Fixed", notes: "Initial consultation", displayOrder: 1 },
        { component: "UI/UX Design Effort", internalCost: 4000, type: "Variable", notes: "Depends on scope", displayOrder: 2 },
        { component: "Core Development Effort", internalCost: 6000, type: "Variable", notes: "Implementation", displayOrder: 3 },
        { component: "Testing & Optimization", internalCost: 2000, type: "Fixed", notes: "QA process", displayOrder: 4 },
        { component: "Deployment & Setup", internalCost: 1500, type: "Fixed", notes: "Hosting setup", displayOrder: 5 },
        { component: "Communication & Buffer", internalCost: 2000, type: "Risk", notes: "Meetings & revisions", displayOrder: 6 },
    ]);

    // 2. Page Rates
    await db.insert(pricingPageRates).values([
        { pageType: "Simple Content Page", internalCost: 600, sellingPrice: 2000, displayOrder: 1 },
        { pageType: "Business Information Page", internalCost: 900, sellingPrice: 2500, displayOrder: 2 },
        { pageType: "Interactive Page", internalCost: 1500, sellingPrice: 4000, displayOrder: 3 },
        { pageType: "Dynamic Data Page", internalCost: 2000, sellingPrice: 5000, displayOrder: 4 },
    ]);

    // 3. Feature Rates
    await db.insert(pricingFeatureRates).values([
        // Features
        { feature: "Contact Form", category: "Feature", internalCost: 500, sellingPrice: 1500, displayOrder: 1 },
        { feature: "Lead Capture System", category: "Feature", internalCost: 1200, sellingPrice: 3500, displayOrder: 2 },
        { feature: "Admin Content Management", category: "Feature", internalCost: 2000, sellingPrice: 5000, displayOrder: 3 },
        { feature: "Dashboard Interface", category: "Feature", internalCost: 3500, sellingPrice: 8000, displayOrder: 4 },
        { feature: "Third-party Integration", category: "Feature", internalCost: 1500, sellingPrice: 4000, displayOrder: 5 },
        { feature: "Authentication System", category: "Feature", internalCost: 2500, sellingPrice: 6000, displayOrder: 6 },
        // CRM
        { feature: "Lead Management System", category: "CRM", internalCost: 4000, sellingPrice: 12000, displayOrder: 7 },
        { feature: "Client Database", category: "CRM", internalCost: 3000, sellingPrice: 9000, displayOrder: 8 },
        { feature: "Sales Pipeline Tracking", category: "CRM", internalCost: 3500, sellingPrice: 10000, displayOrder: 9 },
        { feature: "Admin Control Dashboard", category: "CRM", internalCost: 4500, sellingPrice: 13000, displayOrder: 10 },
        { feature: "Workflow Automation", category: "CRM", internalCost: 5000, sellingPrice: 15000, displayOrder: 11 },
        { feature: "Reporting & Analytics", category: "CRM", internalCost: 4000, sellingPrice: 12000, displayOrder: 12 },
    ]);

    // 4. Multipliers
    await db.insert(pricingMultipliers).values([
        // Complexity
        { category: "Complexity", label: "Simple", value: 1.0, displayOrder: 1 },
        { category: "Complexity", label: "Standard", value: 1.2, displayOrder: 2 },
        { category: "Complexity", label: "Advanced", value: 1.4, displayOrder: 3 },
        { category: "Complexity", label: "High Risk", value: 1.6, displayOrder: 4 },
        // Client Value
        { category: "Client Value", label: "Individual", value: 1.0, displayOrder: 5 },
        { category: "Client Value", label: "Small Business", value: 1.2, displayOrder: 6 },
        { category: "Client Value", label: "Revenue-focused Business", value: 1.3, displayOrder: 7 },
        { category: "Client Value", label: "Enterprise", value: 1.5, displayOrder: 8 },
        // Timeline
        { category: "Timeline", label: "Standard", value: 0, isPercentage: false, displayOrder: 9 },
        { category: "Timeline", label: "Fast Track", value: 5000, isPercentage: false, displayOrder: 10 },
        { category: "Timeline", label: "Urgent Delivery", value: 10000, isPercentage: false, displayOrder: 11 },
        // Scope
        { category: "Scope Risk", label: "Fixed Scope", value: 0, isPercentage: true, displayOrder: 12 },
        { category: "Scope Risk", label: "Flexible Scope", value: 10, isPercentage: true, displayOrder: 13 },
        { category: "Scope Risk", label: "Undefined Scope", value: 20, isPercentage: true, displayOrder: 14 },
    ]);

    // 5. Discounts
    await db.insert(pricingDiscounts).values([
        { condition: "Referral Client", maxDiscount: 10, displayOrder: 1 },
        { condition: "Long-term Contract", maxDiscount: 15, displayOrder: 2 },
        { condition: "Portfolio Project", maxDiscount: 15, displayOrder: 3 },
        { condition: "Bulk Features", maxDiscount: 12, displayOrder: 4 },
    ]);
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type, action, data } = body;

        // Specialized handler for different tables
        switch (type) {
            case "base":
                if (action === "update") {
                    await db.update(pricingBaseCosts).set(data).where(eq(pricingBaseCosts.id, data.id));
                }
                break;
            case "page":
                if (action === "update") {
                    await db.update(pricingPageRates).set(data).where(eq(pricingPageRates.id, data.id));
                }
                break;
            case "feature":
                if (action === "update") {
                    await db.update(pricingFeatureRates).set(data).where(eq(pricingFeatureRates.id, data.id));
                }
                break;
            case "multiplier":
                if (action === "update") {
                    await db.update(pricingMultipliers).set(data).where(eq(pricingMultipliers.id, data.id));
                }
                break;
            case "discount":
                if (action === "update") {
                    await db.update(pricingDiscounts).set(data).where(eq(pricingDiscounts.id, data.id));
                }
                break;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Pricing Update Error:", error);
        return NextResponse.json({ error: "Failed to update pricing" }, { status: 500 });
    }
}
