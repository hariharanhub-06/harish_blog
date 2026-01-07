import { db } from "@/db";
import { profiles, experience, education } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Briefcase, GraduationCap, MapPin, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import CardWrapper from "@/components/CardWrapper";
import AboutHero from "@/components/AboutHero";

export default async function About() {
    const profile = await db.query.profiles.findFirst();
    const experiences = await db.query.experience.findMany({
        orderBy: [desc(experience.order)],
    });
    const educations = await db.query.education.findMany({
        orderBy: [desc(education.order)],
    });

    const experiencesData = experiences.map(exp => ({
        title: exp.role,
        company: exp.company,
        description: exp.description,
        period: exp.duration,
        order: exp.order,
        type: 'work',
        icon: Briefcase,
        color: 'bg-blue-500'
    }));

    const educationsData = educations.map(edu => ({
        title: edu.degree,
        company: edu.institution,
        description: edu.details,
        period: edu.period,
        order: edu.order,
        type: 'education',
        icon: GraduationCap,
        color: 'bg-amber-500'
    }));

    const timeline = [...experiencesData, ...educationsData].sort((a, b) => (b.order || 0) - (a.order || 0));

    return (
        <div className="container mx-auto px-6 py-24 max-w-6xl">
            <AboutHero
                name={profile?.name || "Hari Haran"}
                about={profile?.about || ""}
                location={profile?.location || ""}
            />

            <section className="mt-32">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">Career Timeline</h2>
                    <div className="w-24 h-2 bg-primary mx-auto rounded-full"></div>
                </div>

                <div className="relative space-y-12">
                    {/* Vertical Line */}
                    <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-100 hidden md:block" />

                    {timeline.map((item, i) => (
                        <CardWrapper key={i} index={i}>
                            <div className="relative md:pl-24 group">
                                <div className={`absolute left-0 md:left-4 top-0 w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center text-white shadow-xl z-10 group-hover:scale-110 transition-transform`}>
                                    <item.icon size={28} />
                                </div>

                                <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm group-hover:shadow-2xl transition-all">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900">{item.title}</h3>
                                            <p className="text-primary font-bold text-lg">{item.company}</p>
                                        </div>
                                        <div className="flex items-center space-x-2 text-secondary font-black bg-gray-50 px-4 py-2 rounded-xl text-sm">
                                            <Calendar size={16} />
                                            <span>{item.period}</span>
                                        </div>
                                    </div>
                                    <p className="text-secondary text-lg leading-relaxed font-normal">{item.description}</p>
                                </div>
                            </div>
                        </CardWrapper>
                    ))}
                </div>
            </section>

            <section className="mt-40 text-center">
                <h2 className="text-3xl md:text-5xl font-black mb-12">Want the full picture?</h2>
                <Link href="/resume" className="inline-flex items-center space-x-4 bg-gray-900 text-white px-12 py-6 rounded-3xl font-black text-xl hover:bg-black transition-all shadow-2xl hover:-translate-y-2">
                    <span>Download Resume</span>
                    <ArrowRight size={24} />
                </Link>
            </section>
        </div>
    );
}
