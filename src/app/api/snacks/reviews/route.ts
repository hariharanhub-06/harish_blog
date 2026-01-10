import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { snackReviews, snackProducts } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("productId");

        let reviews;
        if (productId) {
            reviews = await db
                .select()
                .from(snackReviews)
                .where(
                    and(
                        eq(snackReviews.productId, productId),
                        eq(snackReviews.status, "Approved")
                    )
                )
                .orderBy(desc(snackReviews.createdAt));
        } else {
            reviews = await db
                .select()
                .from(snackReviews)
                .where(eq(snackReviews.status, "Approved"))
                .orderBy(desc(snackReviews.createdAt));
        }

        return NextResponse.json(reviews);
    } catch (error) {
        console.error("Fetch reviews error:", error);
        return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { productId, customerName, rating, comment } = body;

        if (!productId || !customerName || !rating) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const [review] = await db.insert(snackReviews).values({
            productId,
            customerName,
            rating: parseInt(rating),
            comment,
            status: "Pending", // Default status for moderation
        }).returning();

        return NextResponse.json(review);
    } catch (error) {
        console.error("Submit review error:", error);
        return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
    }
}
