import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    const allProjects = await db.select({
        id: projects.id,
        title: projects.title,
        thumbnail: projects.thumbnail,
        technologies: projects.technologies,
        liveUrl: projects.liveUrl,
        repoUrl: projects.repoUrl,
        category: projects.category,
        featured: projects.featured,
        displayOrder: projects.displayOrder,
        createdAt: projects.createdAt,
    }).from(projects).orderBy(desc(projects.displayOrder), desc(projects.createdAt));
    return NextResponse.json(allProjects);
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, title, description, thumbnail, technologies, liveUrl, repoUrl, category, featured, displayOrder } = body;

        const projectData = {
            title,
            description,
            thumbnail,
            technologies,
            liveUrl,
            repoUrl,
            category,
            featured: featured || false,
            displayOrder: displayOrder || 0,
        };

        if (id) {
            await db.update(projects).set(projectData).where(eq(projects.id, id));
        } else {
            await db.insert(projects).values(projectData);
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving project:", error);
        return NextResponse.json({ error: "Failed to save project" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
        await db.delete(projects).where(eq(projects.id, id));
        return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false }, { status: 400 });
}
