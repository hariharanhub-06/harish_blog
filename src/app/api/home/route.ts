import { db } from "@/db";
import { profiles, projects, experience, education, volunteering } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const profileData = await db.query.profiles.findFirst();
        const allProjects = await db.query.projects.findMany({
            orderBy: [desc(projects.displayOrder), desc(projects.createdAt)],
        });
        const experiences = await db.query.experience.findMany({
            orderBy: [desc(experience.displayOrder)],
        });
        const educations = await db.query.education.findMany({
            orderBy: [desc(education.displayOrder)],
        });
        const volunteerings = await db.query.volunteering.findMany({
            orderBy: [desc(volunteering.displayOrder)],
        });

        const allPartnerships = await db.query.partnerships.findMany({
            where: (p, { eq }) => eq(p.isActive, true),
            orderBy: (p, { desc }) => [desc(p.displayOrder), desc(p.createdAt)],
        });

        const allSkills = await db.query.skills.findMany({
            orderBy: (s, { asc, desc }) => [desc(s.proficiency), asc(s.displayOrder)],
        });

        let allQuizzes: any[] = [];
        try {
            allQuizzes = await db.query.quizzes.findMany({
                where: (q, { eq }) => eq(q.isPublished, true),
                with: {
                    questions: {
                        with: {
                            options: true
                        }
                    }
                },
                orderBy: (q, { desc }) => [desc(q.createdAt)]
            });
        } catch (e) {
            console.error("Quiz fetch failed in API:", e);
        }

        const finalProfile = profileData || {
            name: "Hari Haran Jeyaramamoorthy",
            headline: "Web/App Developer | Business Consultant | Job Placement Expert | Operations & Partnerships Manager | Snack Business Owner | Project Management",
            about: "Passionate developer and business strategist focused on building innovative solutions.",
            location: "Tamil Nadu, India",
            avatarUrl: "/hari_photo.png",
            heroImageUrl: null,
            aboutImageUrl: null,
            socialLinks: { linkedin: "https://linkedin.com/in/hari-haran-j", github: "https://github.com/hari-haran-j", twitter: "", instagram: "" },
            stats: [
                { label: "Years Experience", value: "3+", icon: "Briefcase" },
                { label: "Projects Completed", value: "10+", icon: "Code" },
                { label: "Clubs Led", value: "5+", icon: "Award" },
                { label: "Colleges Partnered", value: "42", icon: "User" },
            ],
            trainingStats: [
                { label: "Expert Sessions", value: "150+", icon: "Presentation" },
                { label: "Partnered Colleges", value: "42+", icon: "GraduationCap" },
                { label: "Minds Empowered", value: "5000+", icon: "Users" },
            ]
        };

        const finalExperiences = experiences.length > 0 ? experiences : [
            {
                id: "default-1",
                role: "Web/App Developer",
                company: "Freelance",
                duration: "2021 - Present",
                description: "Building custom web applications and mobile apps."
            },
            {
                id: "default-2",
                role: "Operations Manager",
                company: "HM Snacks",
                duration: "2022 - Present",
                description: "Managing supply chain and business partnerships."
            }
        ];

        const finalEducations = educations.length > 0 ? educations : [
            {
                id: "edu-1",
                degree: "Professional Certification in Web Development",
                institution: "Industry Lead Programs",
                period: "2021"
            }
        ];

        const finalPartnerships = allPartnerships.length > 0 ? allPartnerships : [
            {
                id: "part-1",
                name: "Regional Tech Hubs",
                partnerType: "Academy",
                isActive: true
            }
        ];

        const finalProjects = allProjects.length > 0 ? allProjects : [
            {
                id: "proj-1",
                title: "HM Snacks E-Commerce",
                description: "A premium digital storefront for snack distribution and partnership management.",
                category: "Web App",
                technologies: ["Next.js", "Tailwind", "Drizzle"],
                featured: true
            },
            {
                id: "proj-2",
                title: "Student Mentorship Portal",
                description: "Interactive platform for job placement and session management.",
                category: "Web App",
                technologies: ["React", "Lucide", "Jitsi"],
                featured: true
            }
        ];

        return NextResponse.json({
            profile: finalProfile,
            projects: finalProjects,
            experiences: finalExperiences,
            educations: finalEducations,
            volunteerings,
            partnerships: finalPartnerships,
            skills: allSkills,
            quizzes: allQuizzes
        });
    } catch (error) {
        console.error("Error fetching home data:", error);
        return NextResponse.json({ error: "Failed to fetch home data" }, { status: 500 });
    }
}
