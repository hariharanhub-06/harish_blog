import { db } from "@/db";
import { schedulerConfig } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        const config = await db.query.schedulerConfig.findFirst({
            where: eq(schedulerConfig.id, 1),
        });

        if (!config) {
            // Default config
            return NextResponse.json({
                enableMinDaysConstraint: true,
                minDaysBeforeBooking: 3,
            });
        }

        return NextResponse.json(config);
    } catch (error) {
        console.error("Failed to fetch scheduler config:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { enableMinDaysConstraint, minDaysBeforeBooking } = body;

        // Validation
        if (typeof enableMinDaysConstraint !== "boolean") {
            return NextResponse.json(
                { error: "Invalid enableMinDaysConstraint" },
                { status: 400 }
            );
        }

        if (
            typeof minDaysBeforeBooking !== "number" ||
            minDaysBeforeBooking < 1 ||
            minDaysBeforeBooking > 5
        ) {
            return NextResponse.json(
                { error: "minDaysBeforeBooking must be between 1 and 5" },
                { status: 400 }
            );
        }

        const existing = await db.query.schedulerConfig.findFirst({
            where: eq(schedulerConfig.id, 1),
        });

        if (existing) {
            await db
                .update(schedulerConfig)
                .set({
                    enableMinDaysConstraint,
                    minDaysBeforeBooking,
                    updatedAt: new Date(),
                })
                .where(eq(schedulerConfig.id, 1));
        } else {
            await db.insert(schedulerConfig).values({
                id: 1,
                enableMinDaysConstraint,
                minDaysBeforeBooking,
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to update scheduler config:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
