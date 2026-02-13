import { ArrowRight, Briefcase, Database, Rocket, Code, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function BusinessSolutionsSection() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/admin/profile");
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                }
            } catch (error) {
                console.error("Failed to fetch profile for video:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const videoConfig = profile?.businessSolutionVideoConfig || { scale: 1.1, x: 0, y: 0, mixBlendMode: 'screen' };
    const videoUrl = profile?.businessSolutionVideoUrl || "https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-connection-loop-2747-large.mp4";

    return (
        <section className="container mx-auto px-6 py-12 md:py-20 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-orange-600/10 to-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl backdrop-blur-sm overflow-hidden group hover:border-white/20 transition-all duration-500 min-h-[400px] flex items-center">
                <div className="absolute top-0 left-0 w-full h-full opacity-90 group-hover:opacity-100 transition-opacity duration-1000 overflow-hidden rounded-[3rem] z-0">
                    {!loading ? (
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            key={videoUrl}
                            className="w-full h-full object-cover transition-all duration-1000"
                            style={{
                                transform: `scale(${videoConfig.scale}) translate(${videoConfig.x}%, ${videoConfig.y}%)`,
                                mixBlendMode: videoConfig.mixBlendMode as any
                            }}
                        >
                            <source src={videoUrl} type="video/mp4" />
                        </video>
                    ) : (
                        <div className="w-full h-full bg-black/20 animate-pulse flex items-center justify-center">
                            <Loader2 className="animate-spin text-white/20" size={32} />
                        </div>
                    )}
                    {/* Multi-layered gradient for deep contrast and readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-10" />
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent z-10 md:hidden" />
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="max-w-xl text-center md:text-left">
                        <span className="text-orange-500 font-black tracking-[0.3em] uppercase text-[10px] mb-4 block">Unified Systems</span>
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-6 leading-none">
                            Expert <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-600">Business Solutions</span>
                        </h2>
                        <p className="text-gray-400 font-medium leading-relaxed mb-8">
                            We provide end-to-end digital growth engines and robust financial logistics to scale your operations.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Link href="/services" className="px-8 py-5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-orange-600 hover:text-white transition-all shadow-xl flex items-center justify-center gap-3 group whitespace-nowrap">
                                <Code size={18} className="group-hover:rotate-12 transition-transform" /> Business Digital Solution
                            </Link>
                            <Link href="/financial-logistics" className="px-8 py-5 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-white/10 transition-all backdrop-blur-sm flex items-center justify-center gap-3 group whitespace-nowrap">
                                <Briefcase size={18} className="group-hover:-rotate-12 transition-transform" /> Financial Logistics
                            </Link>
                        </div>
                    </div>

                    <div className="w-full md:w-auto flex flex-col gap-4">
                        <div className="bg-black/40 p-6 rounded-2xl border border-white/5 md:w-[280px] hover:scale-105 transition-transform duration-300">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Free Consultation</span>
                            </div>
                            <p className="text-sm font-bold text-white mb-4">Discuss your project with an expert today.</p>
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent("open-ai-chat"))}
                                className="text-orange-500 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:translate-x-2 transition-transform"
                            >
                                Book Now <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
