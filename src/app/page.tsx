import { db } from "@/db"; // Database entry point
import { profiles, projects, experience, education } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Code, Briefcase, Award, User, Star } from "lucide-react";
import Hero from "@/components/Hero";
import CardWrapper from "@/components/CardWrapper";
import MainContent from "@/components/MainContent";

export default async function Home() {
  const profileData = await db.query.profiles.findFirst();
  const allProjects = await db.query.projects.findMany({
    orderBy: [desc(projects.order), desc(projects.createdAt)],
  });
  const experiences = await db.query.experience.findMany({
    orderBy: [desc(experience.order)],
  });
  const educations = await db.query.education.findMany({
    orderBy: [desc(education.order)],
  });

  const defaultProfile = {
    name: "Hari Haran Jeyaramamoorthy",
    headline: "Web/App Developer | Business Consultant | Job Placement Expert | Operations & Partnerships Manager | Snack Business Owner | Project Management Pro",
    avatarUrl: "/hari_photo.png",
    about: "Passionate developer and business strategist focused on building innovative solutions.",
    location: "Tamil Nadu, India",
    stats: [
      { label: "Years Experience", value: "3+", icon: "Briefcase" },
      { label: "Projects Completed", value: "10+", icon: "Code" },
      { label: "Clubs Led", value: "5+", icon: "Award" },
      { label: "Colleges Partnered", value: "42", icon: "User" },
    ]
  };

  const profile = profileData || defaultProfile;
  const homeStats = (profile.stats || defaultProfile.stats) as any[];

  return (
    <div className="flex flex-col gap-0">
      <section id="home">
        <Hero profile={{
          name: profile.name,
          headline: profile.headline,
          avatarUrl: profile.avatarUrl,
          heroImageUrl: (profile as any).heroImageUrl
        }} />
      </section>

      <MainContent
        profile={profile}
        stats={homeStats}
        projects={allProjects}
        experiences={experiences}
        educations={educations}
      />
    </div>
  );
}
