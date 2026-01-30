import Hero from "@/components/Hero";
import MainContent from "@/components/MainContent";
import { MatrixBackground } from "@/components/MatrixBackground";
import { db } from "@/db";

// Enable Incremental Static Regeneration (ISR)
// Revalidate every 0 seconds to ensure fresh data during debugging
export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function Home() {
  // Fetch all data with safe fallbacks
  let dbProfile: any = null;
  let videos: any[] = [];
  let dbProjects: any[] = [];
  let experiences: any[] = [];
  let educations: any[] = [];
  let volunteerings: any[] = [];
  let dbSkills: any[] = [];
  let partnerships: any[] = [];
  let quizzes: any[] = [];

  try {
    // Parallel fetch with failure isolation (Promise.allSettled)
    const results = await Promise.allSettled([
      db.query.profiles.findFirst(),
      db.query.youtubeVideos.findMany({
        where: (videos, { eq }) => eq(videos.isActive, true),
        orderBy: (videos, { desc }) => [desc(videos.displayOrder), desc(videos.createdAt)]
      }),
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
    videos = val(results[1], 'videos') || [];
    dbProjects = val(results[2], 'projects') || [];
    experiences = val(results[3], 'experiences') || [];
    educations = val(results[4], 'educations') || [];
    volunteerings = val(results[5], 'volunteerings') || [];
    dbSkills = val(results[6], 'skills') || [];
    partnerships = val(results[7], 'partnerships') || [];

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
      linkedin: "",
      github: "",
      twitter: "",
      instagram: ""
    },
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

  // Merge DB data with default (DB takes precedence if fields exist)
  const profile = {
    ...defaultProfile,
    ...(dbProfile || {}),
    // Ensure stats is an array even if DB returns something else (though schema says jsonb array)
    stats: Array.isArray(dbProfile?.stats) ? dbProfile.stats : defaultProfile.stats,
    trainingStats: Array.isArray(dbProfile?.trainingStats) ? dbProfile.trainingStats : defaultProfile.trainingStats,
    socialLinks: dbProfile?.socialLinks || defaultProfile.socialLinks
  };

  return (
    <div className="flex flex-col gap-0 bg-[#0e0e0e] relative">
      <MatrixBackground />
      <section id="home">
        <Hero
          profile={{
            name: profile.name,
            headline: profile.headline,
            avatarUrl: profile.avatarUrl,
            heroImageUrl: profile.heroImageUrl
          } as any}
          className=""
        />
      </section>

      <MainContent
        profile={profile as any}
        stats={profile.stats as any}
        projects={dbProjects as any}
        videos={videos as any}
        experiences={experiences as any}
        educations={educations as any}
        volunteerings={volunteerings as any}
        skills={dbSkills as any}
        partnerships={partnerships as any}
        quizzes={quizzes as any}
      />
    </div>
  );
}
