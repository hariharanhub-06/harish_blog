import { NextResponse } from "next/server";
import { db } from "@/db";
import { profiles, experience, education, skills, projects } from "@/db/schema";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log("Remote Seeding started...");

        // Seed Profile
        await db.insert(profiles).values({
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
        }).onConflictDoUpdate({
            target: profiles.id,
            set: { name: "Hari Haran Jeyaramamoorthy" } // Just to allow upsert
        });

        // Seed Experience
        await db.insert(experience).values([
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
        ]).onConflictDoNothing();

        // Seed Education
        await db.insert(education).values([
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
        ]).onConflictDoNothing();

        // Seed Skills
        await db.insert(skills).values([
            { name: "Python", category: "Technology", proficiency: 85 },
            { name: "Firebase", category: "Technology", proficiency: 80 },
            { name: "Razorpay", category: "Technology", proficiency: 75 },
            { name: "Web Development", category: "Technology", proficiency: 90 },
            { name: "Project Management", category: "Management", proficiency: 95 },
            { name: "Public Speaking", category: "Soft Skills", proficiency: 90 },
        ]).onConflictDoNothing();

        // Seed Projects
        await db.insert(projects).values([
            {
                title: "startupmenswear.in",
                description: "Tech Founder; developed using Python, Firebase, and Razorpay.",
                liveUrl: "https://startupmenswear.in",
                technologies: ["Python", "Firebase", "Razorpay"],
                category: "Web Development",
                featured: true,
            },
        ]).onConflictDoNothing();

        return NextResponse.json({ success: true, message: "Remote seeding completed successfully!" });
    } catch (error: any) {
        console.error("Remote Seeding error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
