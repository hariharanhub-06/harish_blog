import Hero from "@/components/Hero";
import MainContent from "@/components/MainContent";
import { MatrixBackground } from "@/components/MatrixBackground";
import { db } from "@/db";

// Enable Incremental Static Regeneration (ISR)
// Revalidate every 0 seconds to ensure fresh data during debugging
export const dynamic = "force-dynamic";

export default async function Home() {
  console.log("Server: Rendering Home Page at " + new Date().toISOString());

  // Fetch all data with safe fallbacks
  let dbProfile: any = null;
  let dbProjects: any[] = [];
  let experiences: any[] = [];
  let educations: any[] = [];
  let volunteerings: any[] = [];
  let dbSkills: any[] = [];
  let partnerships: any[] = [];
  let quizzes: any[] = [];
  let liveSessions: any[] = [];

  try {
    // Parallel fetch with failure isolation (Promise.allSettled)
    const results = await Promise.allSettled([
      db.query.profiles.findFirst(),
      db.query.projects.findMany({
        orderBy: (projects, { desc }) => [desc(projects.featured), desc(projects.displayOrder), desc(projects.createdAt)]
      }),
      db.query.experience.findMany({
        orderBy: (experience, { desc }) => [desc(experience.displayOrder), desc(experience.createdAt)]
      }),
      db.query.education.findMany({
        orderBy: (education, { desc }) => [desc(education.displayOrder)]
      }),
      db.query.volunteering.findMany({
        orderBy: (volunteering, { desc }) => [desc(volunteering.displayOrder)]
      }),
      db.query.skills.findMany({
        orderBy: (skills, { desc }) => [desc(skills.displayOrder)]
      }),
      db.query.partnerships.findMany({
        where: (p, { eq }) => eq(p.isActive, true),
        orderBy: (p, { desc }) => [desc(p.displayOrder)]
      }),
      db.query.liveSessions.findMany({
        where: (s, { eq }) => eq(s.isPublished, true),
        orderBy: (s, { desc }) => [desc(s.startTime)]
      })
    ]);

    // Helper to safely extract data from settled promise
    // <T> syntax in TSX files confuses the parser unless extended or comma added
    const val = <T extends unknown>(res: PromiseSettledResult<T>, key: string) => {
      if (res.status === 'fulfilled') return res.value;
      console.error(`Failed to fetch ${key}:`, res.reason);
      return null; // or [] depending on needs, handled below
    };

    dbProfile = val(results[0], 'profile');
    dbProjects = val(results[1], 'projects') || [];
    experiences = val(results[2], 'experiences') || [];
    educations = val(results[3], 'educations') || [];
    volunteerings = val(results[4], 'volunteerings') || [];
    dbSkills = val(results[5], 'skills') || [];
    partnerships = val(results[6], 'partnerships') || [];
    liveSessions = val(results[7], 'liveSessions') || [];

    // Fetch Quizzes separately as it has relations that might fail if not pushed
    try {
      quizzes = await db.query.quizzes.findMany({
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
      console.error("Quiz query failed:", e);
    }
  } catch (error) {
    console.error("Database query failed:", error);
  }

  // Default fallback data
  const defaultProfile = {
    name: "Hari Haran Jeyaramamoorthy",
    headline: "Web/App Developer | Business Consultant | Job Placement Expert | Operations & Partnerships Manager | Snack Business Owner | Project Management",
    avatarUrl: "/hari_photo.png",
    heroImageUrl: null,
    about: "Passionate developer and business strategist focused on building innovative solutions.",
    location: "Tamil Nadu, India",
    socialLinks: {
      linkedin: "https://linkedin.com/in/hari-haran-j",
      github: "https://github.com/hari-haran-j",
      twitter: "",
      instagram: ""
    },
    stats: [
      { label: "Years Experience", value: "3+", icon: "Briefcase" },
      { label: "Projects Completed", value: "10+", icon: "Code" },
      { label: "Clubs Led", value: "5+", icon: "Award" },
      { label: "Colleges Partnered", value: "42", icon: "User" },
    ],
    aboutImageUrl: null,
    trainingStats: [
      { label: "Expert Sessions", value: "150+", icon: "Presentation" },
      { label: "Partnered Colleges", value: "42+", icon: "GraduationCap" },
      { label: "Minds Empowered", value: "5000+", icon: "Users" },
    ]
  };

  // Merge DB data with default (DB takes precedence if fields exist and are not null)
  const profile = {
    ...defaultProfile,
    ...(dbProfile || {}),
    // Ensure images don't get wiped if null in DB or DB missing
    avatarUrl: dbProfile?.avatarUrl || defaultProfile.avatarUrl,
    heroImageUrl: dbProfile?.heroImageUrl || defaultProfile.heroImageUrl,
    aboutImageUrl: dbProfile?.aboutImageUrl || (dbProfile as any)?.aboutImageUrl || null,
    // Ensure stats is an array even if DB returns something else (though schema says jsonb array)
    stats: Array.isArray(dbProfile?.stats) ? dbProfile.stats : defaultProfile.stats,
    trainingStats: Array.isArray(dbProfile?.trainingStats) ? dbProfile.trainingStats : defaultProfile.trainingStats,
    socialLinks: dbProfile?.socialLinks || defaultProfile.socialLinks
  };

  // 0. Fallback for Projects
  if (dbProjects.length === 0) {
    dbProjects = [
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
  }

  // 1. Fallback for Experiences
  if (experiences.length === 0) {
    experiences = [
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
  }

  // 2. Fallback for Education
  if (educations.length === 0) {
    educations = [
      {
        id: "edu-1",
        degree: "Professional Certification in Web Development",
        institution: "Industry Lead Programs",
        period: "2021"
      }
    ];
  }

  // 3. Fallback for Partnerships (Academy Carousel)
  if (partnerships.length === 0) {
    partnerships = [
      {
        id: "part-1",
        name: "Regional Tech Hubs",
        partnerType: "Academy",
        isActive: true
      }
    ];
  }

  return (
    <div className="flex flex-col gap-0 bg-[#0e0e0e] relative">
      <MatrixBackground />
      <section id="home">
        <Hero
          profile={{
            name: profile.name,
            headline: profile.headline,
            avatarUrl: profile.avatarUrl,
            heroImageUrl: profile.heroImageUrl,
            audioUrl: profile.audioUrl
          } as any}
          experiences={experiences}
          className=""
        />
      </section>

      <MainContent
        profile={profile as any}
        stats={profile.stats as any}
        projects={dbProjects as any}
        experiences={experiences as any}
        educations={educations as any}
        volunteerings={volunteerings as any}
        skills={dbSkills as any}
        partnerships={partnerships as any}
        quizzes={quizzes as any}
        liveSessions={liveSessions as any}
      />
    </div>
  );
}
