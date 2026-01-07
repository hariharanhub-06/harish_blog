import { db } from "@/db";
import { profiles, education, experience } from "@/db/schema";
import { asc } from "drizzle-orm";
import { GraduationCap, Briefcase, Calendar, MapPin } from "lucide-react";

export default async function About() {
    const profile = await db.query.profiles.findFirst();
    const experiences = await db.query.experience.findMany({
        orderBy: [asc(experience.order)],
    });
    const educations = await db.query.education.findMany({
        orderBy: [asc(education.order)],
    });

    return (
        <div className="container mx-auto px-6 py-20">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <section className="mb-20">
                    <h1 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">About Me</h1>
                    <div className="prose prose-lg text-secondary leading-relaxed">
                        <p className="mb-6">{profile?.about}</p>
                        <p>{profile?.bio}</p>
                    </div>
                </section>

                {/* Experience Timeline */}
                <section className="mb-24">
                    <h2 className="text-3xl font-bold mb-12 flex items-center space-x-3">
                        <Briefcase className="text-primary" />
                        <span>Professional Journey</span>
                    </h2>
                    <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                        {experiences.map((exp, index) => (
                            <div key={exp.id} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active`}>
                                {/* Dot */}
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-primary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                    <Briefcase size={16} />
                                </div>
                                {/* Content */}
                                <div className="w-[calc(100%-4rem)] md:w-[45%] bg-white p-6 rounded-3xl shadow-lg border border-gray-100 transform hover:-translate-y-1 transition-transform">
                                    <div className="flex items-center justify-between mb-2">
                                        <time className="font-bold text-accent text-sm">{exp.duration}</time>
                                    </div>
                                    <div className="text-xl font-bold text-slate-900">{exp.role}</div>
                                    <div className="text-primary font-semibold mb-2">{exp.company}</div>
                                    <div className="text-slate-500 text-sm leading-relaxed">{exp.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Education Section */}
                <section>
                    <h2 className="text-3xl font-bold mb-12 flex items-center space-x-3">
                        <GraduationCap className="text-primary" />
                        <span>Education</span>
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {educations.map((edu) => (
                            <div key={edu.id} className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col items-start">
                                <div className="bg-blue-50 p-4 rounded-2xl mb-6">
                                    <GraduationCap size={32} className="text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{edu.institution}</h3>
                                <p className="text-primary font-semibold mb-2">{edu.degree}</p>
                                <div className="flex items-center text-secondary text-sm space-x-4 mb-4">
                                    <span className="flex items-center">
                                        <Calendar size={14} className="mr-1" />
                                        {edu.period}
                                    </span>
                                </div>
                                {edu.details && (
                                    <p className="text-slate-500 text-sm italic">{edu.details}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
