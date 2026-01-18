import { db } from "@/db";
import { skills } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    const allSkills = await db.select({
        id: skills.id,
        name: skills.name,
        category: skills.category,
        proficiency: skills.proficiency,
        icon: skills.icon,
        displayOrder: skills.displayOrder,
    }).from(skills).orderBy(desc(skills.proficiency));
    return NextResponse.json(allSkills);
}

export async function POST(req: Request) {
    const data = await req.json();
    if (data.id) {
        await db.update(skills).set(data).where(eq(skills.id, data.id));
    } else {
        await db.insert(skills).values(data);
    }
    return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
        await db.delete(skills).where(eq(skills.id, id));
        return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false }, { status: 400 });
}
