import { NextResponse } from "next/server";
import { db } from "@/db";
import { profiles, experience, education, skills, projects } from "@/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export async function GET() {
    const diagnostics: any = {
        env: {
            TURSO_CONNECTION_URL: process.env.TURSO_CONNECTION_URL ? "SET" : "NOT SET",
            isUsingDummy: !process.env.TURSO_CONNECTION_URL,
        },
        steps: {}
    };

    try {
        console.log("Remote Seeding (Refined One-by-One) started...");

        // 1. Cleanup
        try {
            await db.delete(profiles);
            await db.delete(experience);
            await db.delete(education);
            await db.delete(skills);
            await db.delete(projects);
            diagnostics.steps.cleanup = "OK";
        } catch (e: any) {
            diagnostics.steps.cleanup = "FAILED: " + e.message;
            return NextResponse.json({ error: "Cleanup failed", diagnostics }, { status: 500 });
        }

        const now = new Date();

        // 2. Insert Profile
        try {
            await db.insert(profiles).values({
                id: "hari-haran-profile-id",
                name: "Hari Haran Jeyaramamoorthy",
                headline: "Web/App Developer | Business Consultant | Job Placement Expert | Operations & Partnerships Manager | Snack Business Owner | Project Management Pro",
                bio: "Versatile professional with expertise in management, soft skills training, coding, and career consulting.",
                about: "I specialize in leading, managing, and mentoring individuals and teams to achieve professional goals. I integrate technology with business solutions and am passionate about empowering people, fostering growth, and driving innovation.",
                location: "Tamil Nadu, India",
                avatarUrl: "/hari_photo.png",
                socialLinks: {
                    linkedin: "https://www.linkedin.com/in/hari-haran-jeyaramamoorthy/",
                    github: "https://github.com/startup-digi-3119",
                    twitter: "",
                    instagram: "",
                },
                stats: [
                    { label: "Years Experience", value: "3+", icon: "Briefcase" },
                    { label: "Projects Completed", value: "10+", icon: "Code" },
                    { label: "Clubs Led", value: "5+", icon: "Award" },
                    { label: "Colleges Partnered", value: "42", icon: "User" },
                ],
                updatedAt: now
            });
            diagnostics.steps.profiles = "OK";
        } catch (e: any) {
            diagnostics.steps.profiles = "FAILED: " + e.message;
            return NextResponse.json({ error: "Profile insertion failed", diagnostics }, { status: 500 });
        }

        // 3. Insert Experience (One by One)
        const experienceData = [
            {
                company: "Handyman Technologies",
                role: "Partnerships Manager",
                duration: "Mar 2022 – Dec 2025",
                description: "Established and managed partnerships with 42 colleges, broadening market reach. Oversaw a team of 17 members.",
                displayOrder: 1,
            },
            {
                company: "ICA Edu Skills",
                role: "Branch Manager (Freelance)",
                duration: "Dec 2024 – Jun 2025",
                description: "Oversaw branch operations and strategic growth through marketing initiatives. Led and mentored a team.",
                displayOrder: 2,
            },
            {
                company: "Focus Edumatics Pvt Ltd",
                role: "Online Tutor",
                duration: "Mar 2022 – Dec 2022",
                description: "Trained students in English, Science, and Social subjects.",
                displayOrder: 3,
            },
        ];

        let expCount = 0;
        for (const exp of experienceData) {
            try {
                await db.insert(experience).values({ ...exp, createdAt: now });
                expCount++;
            } catch (e: any) {
                diagnostics.steps.experience = `FAILED at index ${expCount}: ` + e.message;
                return NextResponse.json({ error: "Experience insertion failed", diagnostics }, { status: 500 });
            }
        }
        diagnostics.steps.experience = `OK (${expCount})`;

        // 4. Insert Education (One by One)
        const educationData = [
            {
                institution: "Kathir College of Engineering",
                degree: "Bachelor of Engineering (BE), Mechanical Engineering",
                period: "2017 – 2021",
                details: "Grade A; Class Representative; Basketball Team Captain.",
                displayOrder: 1,
            },
            {
                institution: "Sree Sakthi Matriculation Higher Secondary School",
                degree: "HSC, Computer Science",
                period: "2016 – 2017",
                details: "Grade A.",
                displayOrder: 2,
            },
        ];

        let eduCount = 0;
        for (const edu of educationData) {
            try {
                await db.insert(education).values(edu);
                eduCount++;
            } catch (e: any) {
                diagnostics.steps.education = `FAILED at index ${eduCount}: ` + e.message;
                return NextResponse.json({ error: "Education insertion failed", diagnostics }, { status: 500 });
            }
        }
        diagnostics.steps.education = `OK (${eduCount})`;

        // 5. Seed Skills
        const skillsData = [
            { name: "Python", category: "Technology", proficiency: 85, displayOrder: 1 },
            { name: "Firebase", category: "Technology", proficiency: 80, displayOrder: 2 },
            { name: "Razorpay", category: "Technology", proficiency: 75, displayOrder: 3 },
            { name: "Web Development", category: "Technology", proficiency: 90, displayOrder: 4 },
            { name: "Project Management", category: "Management", proficiency: 95, displayOrder: 5 },
            { name: "Public Speaking", category: "Soft Skills", proficiency: 90, displayOrder: 6 },
        ];

        let skillCount = 0;
        for (const skill of skillsData) {
            try {
                await db.insert(skills).values(skill);
                skillCount++;
            } catch (e: any) {
                diagnostics.steps.skills = `FAILED at index ${skillCount}: ` + e.message;
                return NextResponse.json({ error: "Skills insertion failed", diagnostics }, { status: 500 });
            }
        }
        diagnostics.steps.skills = `OK (${skillCount})`;

        // 6. Seed Projects
        try {
            await db.insert(projects).values({
                title: "startupmenswear.in",
                description: "Tech Founder; developed using Python, Firebase, and Razorpay.",
                liveUrl: "https://startupmenswear.in",
                technologies: ["Python", "Firebase", "Razorpay"],
                category: "Web Development",
                featured: true,
                displayOrder: 1,
                createdAt: now
            });
            diagnostics.steps.projects = "OK";
        } catch (e: any) {
            diagnostics.steps.projects = "FAILED: " + e.message;
            return NextResponse.json({ error: "Projects insertion failed", diagnostics }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: "Remote seeding (Individual Inserts) completed successfully!",
            diagnostics
        });
    } catch (error: any) {
        console.error("Remote Seeding error:", error);
        return NextResponse.json({
            error: error.message,
            diagnostics
        }, { status: 500 });
    }
}
