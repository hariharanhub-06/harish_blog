import { db } from "@/db";
import { projects } from "@/db/schema";
import { desc } from "drizzle-orm";
import {
    Layout,
    Smartphone,
    Box,
    Video,
    ShoppingCart,
    Database,
    FileText,
    Users,
    PieChart,
    Calculator,
    ArrowRight,
    Send,
    CheckCircle2
} from "lucide-react";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function HMTechPage() {
    // Fetch Projects
    const allProjects = await db.query.projects.findMany({
        orderBy: [desc(projects.order), desc(projects.createdAt)],
    });

    const services = [
        { title: "Static/Dynamic Web", icon: Layout, desc: "High-performance websites tailored to your brand." },
        { title: "3D Animated", icon: Box, desc: "Immersive 3D experiences that captivate users." },
        { title: "Video Animated", icon: Video, desc: "Engaging video-driven storytelling interfaces." },
        { title: "E-Commerce", icon: ShoppingCart, desc: "Robust online stores with seamless payment integration." },
        { title: "Backend Integration", icon: Database, desc: "Secure and scalable server-side solutions." },
        { title: "Billing Software", icon: FileText, desc: "Automated invoicing and inventory management." },
        { title: "CRM Software", icon: Users, desc: "Customer relationship tools to boost sales." },
        { title: "ERP Software", icon: PieChart, desc: "Comprehensive enterprise resource planning." },
        { title: "Auditing/Accounting", icon: Calculator, desc: "Precision tools for financial management." },
    ];

    const steps = [
        "Approach Us",
        "Give us your requirements",
        "Will give you the design",
        "Design Approved",
        "Give us details",
        "Deployment",
        "One more Free support",
        "One year Glitch Support",
        "Low cost Updation support"
    ];

    return (
        <main className="min-h-screen bg-slate-50 overflow-x-hidden pt-20">
            {/* Hero Section */}
            <section className="relative min-h-[80vh] flex items-center justify-center p-6 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900 via-indigo-900 to-black animate-gradient"></div>
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
                    {/* Animated blobs */}
                    <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                    <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                </div>

                <div className="relative z-10 text-center max-w-4xl mx-auto space-y-6">
                    <div className="inline-block px-4 py-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 backdrop-blur-sm text-blue-300 font-bold text-sm tracking-widest uppercase mb-4 animate-fade-in-up">
                        HM Tech (Test Design)
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-blue-200 tracking-tight leading-tight animate-fade-in-up animation-delay-300">
                        Building Digital <br /> Masterpieces.
                    </h1>
                    <p className="text-lg md:text-xl text-blue-100/80 max-w-2xl mx-auto font-medium leading-relaxed animate-fade-in-up animation-delay-500">
                        Web • App • Software • Solutions from Coimbatore. <br />
                        <span className="text-white font-bold">200% Reasonable Pricing.</span> Faster delivery than you think.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4 pt-4 animate-fade-in-up animation-delay-700">
                        <a href="#contact" className="px-8 py-4 bg-white text-blue-900 rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:scale-105 transition-transform flex items-center gap-2">
                            Start Project <ArrowRight size={20} />
                        </a>
                        <a href="#services" className="px-8 py-4 bg-blue-800/30 backdrop-blur-sm border border-blue-400/30 text-white rounded-2xl font-bold hover:bg-blue-800/50 transition-all">
                            Explore Services
                        </a>
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section id="services" className="py-24 px-6 relative z-10">
                <div className="container mx-auto max-w-7xl">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900">Our Expertise</h2>
                        <p className="text-lg text-gray-600 font-medium max-w-2xl mx-auto">
                            From simple static sites to complex ERP systems, we craft solutions that drive growth.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service, index) => (
                            <div key={index} className="group p-8 bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 border border-gray-100 hover:border-blue-100 transition-all duration-300">
                                <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm">
                                    <service.icon size={32} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{service.title}</h3>
                                <p className="text-gray-500 font-medium leading-relaxed">{service.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Travel Route (Process) */}
            <section className="py-24 px-6 bg-gray-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-20 opacity-10">
                    <Image src="/grid.svg" width={400} height={400} alt="Grid" />
                </div>
                <div className="container mx-auto max-w-5xl relative z-10">
                    <div className="text-center mb-20">
                        <span className="text-blue-400 font-black tracking-widest uppercase text-sm">Process</span>
                        <h2 className="text-4xl md:text-5xl font-black mt-2">The Travel Route</h2>
                    </div>

                    <div className="relative">
                        {/* Vertical Line */}
                        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full md:-translate-x-1/2"></div>

                        <div className="space-y-12">
                            {steps.map((step, index) => (
                                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                                    {/* Content */}
                                    <div className="flex-1 ml-20 md:ml-0 md:px-12">
                                        <div className={`p-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl hover:border-blue-500/50 transition-colors ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
                                            <span className="text-5xl font-black text-gray-800/50 absolute top-2 right-4 select-none">{index + 1}</span>
                                            <h3 className="text-xl md:text-2xl font-bold relative z-10">{step}</h3>
                                        </div>
                                    </div>

                                    {/* Dot */}
                                    <div className="absolute left-8 md:left-1/2 w-8 h-8 md:-ml-4 rounded-full border-4 border-gray-900 bg-blue-500 shadow-lg shadow-blue-500/50 z-20 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>

                                    {/* Spacer for layout balance */}
                                    <div className="flex-1 hidden md:block"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Projects Gallery */}
            <section className="py-24 px-6 bg-slate-50">
                <div className="container mx-auto max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900">Projects Done</h2>
                        <p className="text-gray-500 font-bold mt-4">Selected works from our portfolio</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {allProjects.map((project: any) => (
                            <div key={project.id} className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 flex flex-col">
                                <div className="relative h-64 overflow-hidden">
                                    <Image
                                        src={project.imageUrl || "/placeholder.jpg"}
                                        alt={project.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                        <div className="flex gap-2 flex-wrap">
                                            {project.technologies?.slice(0, 3).map((tech: string, i: number) => (
                                                <span key={i} className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs text-white font-bold">{tech}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 flex-1 flex flex-col">
                                    <h3 className="text-2xl font-black text-gray-900 mb-2">{project.title}</h3>
                                    <p className="text-gray-500 font-medium text-sm line-clamp-3 mb-6 flex-1">{project.description}</p>
                                    <a href={project.link || "#"} target="_blank" className="inline-flex items-center gap-2 text-blue-600 font-black uppercase tracking-widest text-xs hover:gap-4 transition-all">
                                        View Case Study <ArrowRight size={16} />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form */}
            <section id="contact" className="py-24 px-6 bg-white relative">
                <div className="container mx-auto max-w-4xl">
                    <div className="bg-slate-50 rounded-[3rem] p-8 md:p-14 shadow-2xl shadow-blue-900/5 border border-gray-100">
                        <div className="text-center mb-12">
                            <span className="inline-block p-3 rounded-2xl bg-blue-100 text-blue-600 mb-4">
                                <Send size={24} />
                            </span>
                            <h2 className="text-4xl font-black text-gray-900 mb-2">Start Your Project</h2>
                            <p className="text-gray-500 font-bold">1 Month Free Support • Faster Delivery</p>
                        </div>

                        <form action="/api/contact" method="POST" className="space-y-6">
                            {/* Hidden Category Field */}
                            <input type="hidden" name="category" value="HM Tech" />

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Name</label>
                                    <input required name="name" type="text" placeholder="John Doe" className="w-full bg-white border border-gray-200 rounded-2xl p-4 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all shadow-sm outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Mobile Number</label>
                                    <input required name="mobile" type="tel" placeholder="+91 90423 87152" className="w-full bg-white border border-gray-200 rounded-2xl p-4 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all shadow-sm outline-none" />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Email ID</label>
                                    <input required name="email" type="email" placeholder="john@example.com" className="w-full bg-white border border-gray-200 rounded-2xl p-4 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all shadow-sm outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Website (Optional)</label>
                                    <input name="website" type="url" placeholder="https://yourbrand.com" className="w-full bg-white border border-gray-200 rounded-2xl p-4 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all shadow-sm outline-none" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Social Media (Optional)</label>
                                <input name="socialMedia" type="text" placeholder="LinkedIn / Instagram URL" className="w-full bg-white border border-gray-200 rounded-2xl p-4 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all shadow-sm outline-none" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Requirement</label>
                                <textarea required name="message" rows={4} placeholder="Describe your project needs..." className="w-full bg-white border border-gray-200 rounded-2xl p-4 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all shadow-sm resize-none outline-none" />
                            </div>

                            <button type="submit" className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-xl shadow-gray-200 hover:shadow-blue-200">
                                Send Request
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </main>
    );
}
