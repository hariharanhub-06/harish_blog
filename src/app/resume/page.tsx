import { db } from "@/db";
import { profiles, skills, experience, education } from "@/db/schema";
import { asc, desc } from "drizzle-orm";
import { Download, Printer, User, Mail, MapPin, Globe, Linkedin, Github } from "lucide-react";

export default async function Resume() {
    const profile = await db.query.profiles.findFirst();
    const allSkills = await db.query.skills.findMany({
        orderBy: [desc(skills.proficiency)],
    });
    const experiences = await db.query.experience.findMany({
        orderBy: [asc(experience.order)],
    });
    const educations = await db.query.education.findMany({
        orderBy: [asc(education.order)],
    });

    return (
        <div className="container mx-auto px-6 py-20">
            <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-[3rem] overflow-hidden border border-gray-100 p-8 md:p-16">
                {/* Header Actions */}
                <div className="flex justify-end gap-4 mb-12 print:hidden">
                    <button className="flex items-center space-x-2 text-primary font-bold hover:bg-blue-50 px-6 py-2 rounded-full transition-all">
                        <Printer size={20} />
                        <span>Print Version</span>
                    </button>
                    <button className="flex items-center space-x-2 bg-primary text-white font-bold px-8 py-3 rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all">
                        <Download size={20} />
                        <span>Download PDF</span>
                    </button>
                </div>

                {/* Resume Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 pb-16 border-b border-gray-100">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">{profile?.name}</h1>
                        <p className="text-xl text-primary font-semibold tracking-wide uppercase">{profile?.headline?.split('|')[0]}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-secondary">
                        <div className="flex items-center space-x-3">
                            <Mail size={18} className="text-accent" />
                            <span>{profile?.email || "hariharan@example.com"}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <MapPin size={18} className="text-accent" />
                            <span>{profile?.location}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Linkedin size={18} className="text-accent" />
                            <span>/in/hari-haran-jeyaramamoorthy</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Github size={18} className="text-accent" />
                            <span>/startup-digi-3119</span>
                        </div>
                    </div>
                </header>

                {/* Content Grid */}
                <div className="grid md:grid-cols-3 gap-16">
                    {/* Main Column */}
                    <div className="md:col-span-2 space-y-16">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-4">
                                <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-sm">Pr</span>
                                <span>Professional Summary</span>
                            </h2>
                            <p className="text-secondary text-lg leading-relaxed">{profile?.about}</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center space-x-4">
                                <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-sm">Ex</span>
                                <span>Experience</span>
                            </h2>
                            <div className="space-y-12">
                                {experiences.map((exp) => (
                                    <div key={exp.id} className="relative pl-8 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-0.5 before:bg-gray-100">
                                        <div className="absolute left-[-4px] top-2 w-2.5 h-2.5 bg-primary rounded-full"></div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-gray-900">{exp.role}</h3>
                                            <span className="text-sm font-bold text-accent bg-amber-50 px-3 py-1 rounded-full">{exp.duration}</span>
                                        </div>
                                        <p className="text-primary font-semibold mb-4">{exp.company}</p>
                                        <p className="text-secondary leading-relaxed">{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-16">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center space-x-4">
                                <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-sm">Sk</span>
                                <span>Skills</span>
                            </h2>
                            <div className="space-y-6">
                                {allSkills.map((skill) => (
                                    <div key={skill.id}>
                                        <div className="flex justify-between text-sm font-bold mb-2">
                                            <span>{skill.name}</span>
                                            <span className="text-primary">{skill.proficiency}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                            <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${skill.proficiency}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center space-x-4">
                                <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-sm">Ed</span>
                                <span>Education</span>
                            </h2>
                            <div className="space-y-8">
                                {educations.map((edu) => (
                                    <div key={edu.id}>
                                        <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                                        <p className="text-primary text-sm font-medium">{edu.institution}</p>
                                        <p className="text-secondary text-xs mt-1">{edu.period}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
