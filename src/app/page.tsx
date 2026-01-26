import Hero from "@/components/Hero";
import MainContent from "@/components/MainContent";
import { MatrixBackground } from "@/components/MatrixBackground";
import { db } from "@/db";

// Force dynamic rendering to ensure we get the latest data
export const dynamic = "force-dynamic";

export default async function Home() {
  // Fetch profile from DB
  const dbProfile = await db.query.profiles.findFirst();

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
    ]
  };

  // Merge DB data with default (DB takes precedence if fields exist)
  const profile = {
    ...defaultProfile,
    ...dbProfile,
    // Ensure stats is an array even if DB returns something else (though schema says jsonb array)
    stats: Array.isArray(dbProfile?.stats) ? dbProfile.stats : defaultProfile.stats,
    socialLinks: dbProfile?.socialLinks || defaultProfile.socialLinks
  };

  // Fetch videos
  const videos = await db.query.youtubeVideos.findMany({
    where: (videos, { eq }) => eq(videos.isActive, true),
    orderBy: (videos, { desc }) => [desc(videos.displayOrder), desc(videos.createdAt)]
  });

  // Fetch Projects
  const dbProjects = await db.query.projects.findMany({
    orderBy: (projects, { desc }) => [desc(projects.featured), desc(projects.displayOrder), desc(projects.createdAt)]
  });

  // Fetch Experience
  const experiences = await db.query.experience.findMany({
    orderBy: (experience, { desc }) => [desc(experience.displayOrder), desc(experience.createdAt)]
  });

  // Fetch Education
  const educations = await db.query.education.findMany({
    orderBy: (education, { desc }) => [desc(education.displayOrder)]
  });

  // Fetch Volunteering
  const volunteerings = await db.query.volunteering.findMany({
    orderBy: (volunteering, { desc }) => [desc(volunteering.displayOrder)]
  });

  // Fetch Skills
  const dbSkills = await db.query.skills.findMany({
    orderBy: (skills, { desc }) => [desc(skills.displayOrder)]
  });

  // Fetch Partnerships
  const partnerships = await db.query.partnerships.findMany({
    where: (p, { eq }) => eq(p.isActive, true),
    orderBy: (p, { desc }) => [desc(p.displayOrder)]
  });

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
          }}
          className=""
        />
      </section>

      <MainContent
        profile={profile}
        stats={profile.stats}
        projects={dbProjects}
        videos={videos}
        experiences={experiences}
        educations={educations}
        volunteerings={volunteerings}
        skills={dbSkills}
        partnerships={partnerships}
      />
    </div>
  );
}
