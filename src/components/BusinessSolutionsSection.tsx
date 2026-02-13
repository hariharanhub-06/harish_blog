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

            <div className="relative z-10 bg-black/40 border border-white/10 rounded-[2.5rem] p-6 md:p-10 shadow-2xl backdrop-blur-md overflow-hidden group hover:border-white/20 transition-all duration-500 max-w-4xl mx-auto flex items-center justify-center text-center">
                {/* Full Background Video Container */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    {!loading ? (
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            key={videoUrl}
                            src={videoUrl}
                            className="w-full h-full object-cover transition-all duration-1000"
                            style={{
                                transform: `scale(${videoConfig.scale}) translate(${videoConfig.x}%, ${videoConfig.y}%)`,
                                mixBlendMode: videoConfig.mixBlendMode as any,
                                opacity: 0.6
                            }}
                        />
                    ) : (
                        <div className="w-full h-full bg-white/5 animate-pulse" />
                    )}
                    {/* Dynamic Overlay for Visibility - centered gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80 md:bg-radial-gradient md:from-black/60 md:to-black/90 z-10" />
                </div>

                <div className="relative z-20 flex flex-col items-center gap-6 max-w-2xl">
                    <div className="text-center">
                        <span className="text-orange-500 font-black tracking-[0.3em] uppercase text-[8px] mb-3 block">Unified Systems</span>
                        <h2 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-white mb-4 leading-tight">
                            Expert <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-500">Business Solutions</span>
                        </h2>
                        <p className="text-gray-300 font-medium leading-relaxed mb-8 text-xs opacity-80 max-w-md mx-auto">
                            We provide end-to-end digital growth engines and robust financial logistics to scale your operations.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/services" className="px-6 py-3.5 bg-white text-black font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-orange-600 hover:text-white transition-all shadow-xl flex items-center justify-center gap-2 group whitespace-nowrap">
                                <Code size={14} className="group-hover:rotate-12 transition-transform" /> Business Digital Solution
                            </Link>
                            <Link href="/financial-logistics" className="px-6 py-3.5 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-white/10 transition-all backdrop-blur-sm flex items-center justify-center gap-2 group whitespace-nowrap">
                                <Briefcase size={14} className="group-hover:-rotate-12 transition-transform" /> Financial Logistics
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
