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
    const data = await req.json();
    if (data.id) {
        await db.update(projects).set(data).where(eq(projects.id, data.id));
    } else {
        await db.insert(projects).values(data);
    }
    return NextResponse.json({ success: true });
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
