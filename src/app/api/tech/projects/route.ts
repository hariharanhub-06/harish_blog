import { db } from "@/db";
import { projects } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const allProjects = await db.query.projects.findMany({
            orderBy: [desc(projects.displayOrder), desc(projects.createdAt)],
        });
        return NextResponse.json(allProjects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
    }
}
