import { db } from "@/db";
import { projects } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ExternalLink, Github, Filter } from "lucide-react";

export default async function Portfolio() {
    const allProjects = await db.query.projects.findMany({
        orderBy: [desc(projects.order), desc(projects.createdAt)],
    });

    return (
        <div className="container mx-auto px-6 py-20">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Project Portfolio</h1>
                <p className="text-secondary text-lg max-w-2xl mx-auto">
                    A collection of my work spanning web development, business automation, and digital innovation.
                </p>
            </div>

            {/* Filter Placeholder */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
                {["All", "Web Development", "Mobile Apps", "Business Tools"].map((filter) => (
                    <button
                        key={filter}
                        className={`px-6 py-2 rounded-full font-bold transition-all ${filter === "All"
                                ? "bg-primary text-white shadow-lg"
                                : "bg-white text-secondary hover:text-primary border border-gray-100"
                            }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                {allProjects.map((project) => (
                    <div key={project.id} className="group flex flex-col h-full bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                        <div className="relative h-64 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                                <span className="text-primary font-black text-4xl opacity-20 uppercase tracking-widest">{project.title.charAt(0)}</span>
                            </div>
                            <div className="absolute top-4 right-4 flex gap-2">
                                {project.featured && (
                                    <span className="bg-accent text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">Featured</span>
                                )}
                            </div>
                        </div>

                        <div className="p-10 flex flex-col flex-grow">
                            <div className="flex flex-wrap gap-2 mb-6">
                                {project.technologies?.map(tech => (
                                    <span key={tech} className="text-[10px] font-black uppercase tracking-widest text-primary bg-blue-50 px-3 py-1 rounded-md">{tech}</span>
                                ))}
                            </div>

                            <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">{project.title}</h3>
                            <p className="text-secondary text-base leading-relaxed mb-8 line-clamp-4 flex-grow">{project.description}</p>

                            <div className="pt-6 border-t border-gray-50 flex justify-between items-center mt-auto">
                                <div className="flex space-x-4">
                                    {project.liveUrl && (
                                        <a href={project.liveUrl} target="_blank" className="p-3 bg-gray-50 text-primary rounded-xl hover:bg-primary hover:text-white transition-all">
                                            <ExternalLink size={20} />
                                        </a>
                                    )}
                                    {project.repoUrl && (
                                        <a href={project.repoUrl} target="_blank" className="p-3 bg-gray-50 text-secondary rounded-xl hover:bg-gray-900 hover:text-white transition-all">
                                            <Github size={20} />
                                        </a>
                                    )}
                                </div>
                                <button className="text-primary font-bold text-sm hover:underline flex items-center">
                                    Case Study coming soon
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
