import Hero from "@/components/Hero";
import MainContent from "@/components/MainContent";

export default function Home() {
  const profile = {
    name: "Hari Haran Jeyaramamoorthy",
    headline: "Web/App Developer | Business Consultant | Operations & Partnerships Manager",
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

  return (
    <div className="flex flex-col gap-0">
      <section id="home">
        <Hero profile={{
          name: profile.name,
          headline: profile.headline,
          avatarUrl: profile.avatarUrl,
          heroImageUrl: null
        }} />
      </section>

      <MainContent
        profile={profile}
        stats={profile.stats}
        projects={[]}
        experiences={[]}
        educations={[]}
        volunteerings={[]}
      />
    </div>
  );
}
