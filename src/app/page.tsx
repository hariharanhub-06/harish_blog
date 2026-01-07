import { db } from "@/db";
import { profiles, projects } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { ArrowRight, Code, Briefcase, Award, User } from "lucide-react";
import Hero from "@/components/Hero";
import CardWrapper from "@/components/CardWrapper";

export default async function Home() {
  const profileData = await db.query.profiles.findFirst();
  const recentProject = await db.query.projects.findFirst({
    orderBy: [desc(projects.createdAt)],
  });

  const defaultProfile = {
    name: "Hari Haran Jeyaramamoorthy",
    headline: "Web/App Developer | Business Consultant | Job Placement Expert | Operations & Partnerships Manager | Snack Business Owner | Project Management Pro",
    avatarUrl: "/hari_photo.png",
    stats: [
      { label: "Years Experience", value: "3+", icon: "Briefcase" },
      { label: "Projects Completed", value: "10+", icon: "Code" },
      { label: "Clubs Led", value: "5+", icon: "Award" },
      { label: "Colleges Partnered", value: "42", icon: "User" },
    ]
  };

  const profile = profileData || defaultProfile;
  const homeStats = (profile.stats || defaultProfile.stats) as any[];
  const iconMap: any = { Briefcase, Code, Award, User };

  return (
    <div className="flex flex-col gap-12 pb-24">
      <Hero profile={{
        name: profile.name,
        headline: profile.headline,
        avatarUrl: profile.avatarUrl
      }} />

      {/* Stats Section */}
      <section className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {homeStats.map((stat: any, i: number) => {
            const Icon = iconMap[stat.icon] || User;
            const colors = [
              { color: "text-blue-600", bg: "bg-blue-50" },
              { color: "text-emerald-600", bg: "bg-emerald-50" },
              { color: "text-amber-600", bg: "bg-amber-50" },
              { color: "text-purple-600", bg: "bg-purple-50" },
            ];
            const color = colors[i % colors.length];

            return (
              <CardWrapper key={i} index={i}>
                <div className="group p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-white transition-all duration-500 overflow-hidden relative h-full">
                  <span className="absolute -bottom-4 -right-2 text-9xl font-black text-gray-50 group-hover:text-gray-100 transition-colors -z-10">
                    {String(stat.value).replace('+', '')}
                  </span>

                  <div className={`${color.bg} ${color.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon size={28} />
                  </div>
                  <h3 className="text-4xl font-black text-gray-900 mb-2">{stat.value}</h3>
                  <p className="text-secondary text-xs font-black uppercase tracking-widest leading-none">{stat.label}</p>
                </div>
              </CardWrapper>
            );
          })}
        </div>
      </section>

      {/* Featured Section Preview */}
      <section className="container mx-auto px-6 mt-12 mb-12">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">Recent Projects</h2>
            <div className="w-24 h-2 bg-accent rounded-full"></div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-10">
          {recentProject ? (
            <CardWrapper index={0}>
              <div className="bg-white rounded-[3rem] p-4 border border-gray-100 shadow-sm group overflow-hidden h-full">
                <div className="h-80 bg-gray-50 rounded-[2.5rem] mb-8 flex items-center justify-center overflow-hidden">
                  <div className="text-primary font-black text-6xl opacity-10 group-hover:scale-125 transition-transform duration-700 uppercase tracking-tighter">
                    {recentProject.title.slice(0, 3)}
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <h3 className="text-2xl font-black mb-4 group-hover:text-primary transition-colors">{recentProject.title}</h3>
                  <p className="text-secondary font-medium leading-relaxed mb-8 line-clamp-3">{recentProject.description}</p>
                  <Link href="/portfolio" className="text-primary font-black flex items-center space-x-2 group-hover:translate-x-2 transition-transform">
                    <span>View Details</span>
                    <ArrowRight size={20} />
                  </Link>
                </div>
              </div>
            </CardWrapper>
          ) : (
            <div className="col-span-2 text-center py-20 bg-gray-50 rounded-[3rem]">
              <p className="text-secondary font-black uppercase tracking-widest">No projects found.</p>
              <p className="text-gray-400 mt-2">Add your work in the admin panel.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA section */}
      <section className="container mx-auto px-6 mt-12">
        <div className="bg-primary rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-primary/30">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <h2 className="text-3xl md:text-6xl font-black text-white mb-8 font-poppins relative z-10 leading-tight tracking-tight">
            Ready to Start Your Next <br /> <span className="text-accent underline decoration-8 underline-offset-8">Great Project</span>?
          </h2>
          <Link
            href="/contact"
            className="inline-flex items-center space-x-3 bg-white text-primary px-10 py-5 rounded-2xl font-black text-xl hover:bg-gray-100 transition-all shadow-xl hover:-translate-y-1 relative z-10"
          >
            <span>Get Started Now</span>
            <ArrowRight size={24} />
          </Link>
        </div>
      </section>
    </div>
  );
}
