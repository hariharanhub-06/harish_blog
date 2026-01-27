import Hero from "@/components/Hero";
import MainContent from "@/components/MainContent";
import { MatrixBackground } from "@/components/MatrixBackground";
import { db } from "@/db";

// Force dynamic rendering to ensure we get the latest data
export const dynamic = "force-dynamic";

export default async function Home() {
  // Fetch all data with safe fallbacks
  let dbProfile = null;
  let videos = [];
  let dbProjects = [];
  let experiences = [];
  let educations = [];
  let volunteerings = [];
  let dbSkills = [];
  let partnerships = [];
  let quizzes = [];

  try {
    // Parallel fetch for basic data
    const [p, v, pr, exp, edu, vol, sk, part] = await Promise.all([
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

    dbProfile = p;
    videos = v;
    dbProjects = pr;
    experiences = exp;
    educations = edu;
    volunteerings = vol;
    dbSkills = sk;
    partnerships = part;

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
