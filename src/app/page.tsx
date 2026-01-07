import { db } from "@/db";
import { profiles, projects, skills, experience } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { ArrowRight, Code, Briefcase, Award, Terminal, User } from "lucide-react";
import { motion } from "framer-motion"; // Note: Server components can't use motion directly, will use client wrappers if needed

export default async function Home() {
  const profileData = await db.query.profiles.findFirst();
  const featuredProjects = await db.query.projects.findMany({
    where: eq(projects.featured, true),
    limit: 3,
  });
  const mainSkills = await db.query.skills.findMany({
    limit: 6,
    orderBy: [desc(skills.proficiency)],
  });

  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center space-x-2 bg-blue-50 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-8 animate-fade-in">
          <Terminal size={16} />
          <span>Available for new opportunities</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold font-poppins text-gray-900 mb-6 tracking-tight leading-tight">
          Crafting Digital Excellence <br />
          <span className="text-primary italic">One Project at a Time.</span>
        </h1>
        <p className="text-xl text-secondary max-w-2xl mb-12 leading-relaxed">
          Hi, I&apos;m <span className="text-gray-900 font-semibold">{profileData?.name}</span>.
          {profileData?.headline}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/portfolio"
            className="bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-800 transition-all flex items-center justify-center space-x-2"
          >
            <span>View Portfolio</span>
            <ArrowRight size={20} />
          </Link>
          <Link
            href="/contact"
            className="bg-white text-primary border-2 border-primary/20 px-8 py-4 rounded-full font-bold text-lg hover:border-primary transition-all text-center"
          >
            Contact Me
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Years Experience", value: "3+", icon: Briefcase },
              { label: "Projects Completed", value: "10+", icon: Code },
              { label: "Clubs Led", value: "5+", icon: Award },
              { label: "Colleges Partnered", value: "42", icon: User },
            ].map((stat) => (
              <div key={stat.label} className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100 transform hover:-translate-y-1 transition-transform">
                <stat.icon className="mx-auto text-accent mb-4" size={32} />
                <h3 className="text-4xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-secondary text-sm font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="container mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-poppins tracking-tight">Featured Projects</h2>
            <div className="w-20 h-1.5 bg-accent rounded-full"></div>
          </div>
          <Link href="/portfolio" className="text-primary font-bold hover:underline hidden md:flex items-center space-x-1">
            <span>Explore all projects</span>
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {featuredProjects.map((project) => (
            <div key={project.id} className="group bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all h-full flex flex-col">
              <div className="relative h-48 bg-gray-200">
                {/* Image Placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  <span className="text-primary/40 font-bold text-2xl uppercase tracking-widest">{project.title.split('.')[0]}</span>
                </div>
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies?.map(tech => (
                    <span key={tech} className="bg-blue-50 text-primary text-xs font-bold px-3 py-1 rounded-full">{tech}</span>
                  ))}
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{project.title}</h3>
                <p className="text-secondary mb-6 line-clamp-3 text-sm leading-relaxed">{project.description}</p>
                <div className="mt-auto pt-4 flex gap-4">
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" className="text-primary font-bold text-sm hover:underline">Live Demo</a>
                  )}
                  {project.repoUrl && (
                    <a href={project.repoUrl} target="_blank" className="text-secondary font-bold text-sm hover:underline">View Code</a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills Section */}
      <section className="bg-primary text-white py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 font-poppins">Technical Arsenal</h2>
            <p className="text-blue-200 text-lg max-w-2xl mx-auto">
              A diverse set of technologies and methodologies I use to bring ideas to life.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {mainSkills.map((skill) => (
              <div key={skill.id} className="bg-white/10 backdrop-blur-sm p-6 rounded-3xl border border-white/10 hover:bg-white/20 transition-all text-center">
                <div className="text-accent mb-4 flex justify-center">
                  {/* Skill Icon mapping would go here */}
                  <Code size={32} />
                </div>
                <h4 className="font-bold mb-2">{skill.name}</h4>
                <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-accent h-full" style={{ width: `${skill.proficiency}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
