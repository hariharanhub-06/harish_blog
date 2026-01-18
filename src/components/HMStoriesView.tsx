"use client";

import { motion } from "framer-motion";
import { Play, Film, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Story {
    id: string;
    title: string;
    description: string | null;
    thumbnailUrl: string | null;
    episodeCount?: number;
}

interface HMStoriesViewProps {
    stories: Story[];
}

export default function HMStoriesView({ stories: initialStories }: HMStoriesViewProps) {
    const [stories, setStories] = useState<Story[]>(initialStories || []);
    const [loading, setLoading] = useState(initialStories?.length === 0);

    useEffect(() => {
        if (initialStories?.length === 0) {
            const fetchStories = async () => {
                try {
                    const res = await fetch("/api/stories");
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setStories(data);
                    }
                } catch (error) {
                    console.error("Failed to fetch stories:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchStories();
        }
    }, [initialStories]);

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            {/* Cinematic Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {/* Glowing Blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-pink-600/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "4s" }} />

                {/* Floating Particles/Nodes */}
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
                        initial={{
                            x: Math.random() * 100 + "%",
                            y: Math.random() * 100 + "%",
                            opacity: Math.random() * 0.5
                        }}
                        animate={{
                            y: [null, Math.random() * -100 - 50],
                            opacity: [0, 0.5, 0]
                        }}
                        transition={{
                            duration: Math.random() * 10 + 10,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                ))}
            </div>



            {/* Content Container */}
            <div className="relative z-10">
                {/* Hero Section */}
                <section className="relative overflow-hidden pt-32 pb-16 px-6">
                    <div className="container mx-auto relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center max-w-4xl mx-auto"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-full text-blue-400 text-sm font-bold mb-6 backdrop-blur-sm">
                                <Film size={16} />
                                <span>HM STORIES</span>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
                                Episodic Content
                                <br />
                                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    Built for You
                                </span>
                            </h1>

                            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                                Discover curated video series, storytelling journeys, and episodic adventures. Watch, learn, and get inspired.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Stories Grid */}
                <section className="px-6 pb-20">
                    <div className="container mx-auto">
                        {loading ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-20"
                            >
                                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
                                <h3 className="text-xl font-bold text-gray-400 mb-3 uppercase tracking-widest">Scanning Archive...</h3>
                            </motion.div>
                        ) : stories.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-20"
                            >
                                <Play size={64} className="mx-auto mb-6 text-gray-600" />
                                <h3 className="text-2xl font-bold text-gray-400 mb-3">No Stories Yet</h3>
                                <p className="text-gray-500">Check back soon for exciting episodic content!</p>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {stories.map((story, index) => (
                                    <motion.div
                                        key={story.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                    >
                                        <Link href={`/business/hm-stories/${story.id}`}>
                                            <div className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:-translate-y-2">
                                                {/* Thumbnail */}
                                                <div className="relative aspect-video overflow-hidden bg-gray-700">
                                                    {story.thumbnailUrl ? (
                                                        <img
                                                            src={story.thumbnailUrl}
                                                            alt={story.title}
                                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Play size={64} className="text-gray-600" />
                                                        </div>
                                                    )}

                                                    {/* Gradient Overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90" />

                                                    {/* Episode Count Badge */}
                                                    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full">
                                                        <span className="text-sm font-black text-white">
                                                            {story.episodeCount || 0} Episodes
                                                        </span>
                                                    </div>

                                                    {/* Play Button Overlay */}
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                        <div className="bg-blue-600 p-6 rounded-full shadow-2xl shadow-blue-600/50 group-hover:scale-110 transition-transform">
                                                            <Play size={32} fill="white" className="text-white ml-1" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="p-6 space-y-4">
                                                    <h3 className="text-2xl font-black text-white line-clamp-2 group-hover:text-blue-400 transition-colors">
                                                        {story.title}
                                                    </h3>

                                                    {story.description && (
                                                        <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                                                            {story.description}
                                                        </p>
                                                    )}

                                                    {/* Watch Now CTA */}
                                                    <div className="pt-4 flex items-center gap-2 text-blue-400 font-bold text-sm group-hover:gap-4 transition-all">
                                                        <span>Watch Now</span>
                                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                                    </div>
                                                </div>

                                                {/* Shine Effect */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>


            </div>
        </div>
    );
}
