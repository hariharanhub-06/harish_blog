import { NextResponse } from "next/server";
import { db } from "@/db";
import { profiles, projects, experience, education, volunteering, skills } from "@/db/schema";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const data = {
            profiles: await db.select().from(profiles),
            projects: await db.select().from(projects),
            experience: await db.select().from(experience),
            education: await db.select().from(education),
            volunteering: await db.select().from(volunteering),
            skills: await db.select().from(skills),
        };

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
