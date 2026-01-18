"use client";

import { motion } from "framer-motion";
import { Play, Clock, ArrowLeft, ExternalLink, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Story {
    id: string;
    title: string;
    description: string | null;
    thumbnailUrl: string | null;
}

interface Episode {
    id: string;
    title: string;
    description: string | null;
    youtubeVideoId: string;
    thumbnailUrl: string | null;
    duration: string | null;
    episodeNumber: number | null;
    isActive?: boolean | null;
}

interface StoryEpisodesViewerProps {
    story: Story;
    episodes: Episode[];
}

export default function StoryEpisodesViewer({ story: initialStory, episodes: initialEpisodes }: StoryEpisodesViewerProps) {
    const [story, setStory] = useState<Story>(initialStory);
    const [episodes, setEpisodes] = useState<Episode[]>(initialEpisodes || []);
    const [loading, setLoading] = useState(initialEpisodes?.length === 0);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (initialEpisodes?.length === 0) {
            const fetchStoryData = async () => {
                try {
                    const res = await fetch(`/api/stories/${initialStory.id}`);
                    if (res.status === 404) {
                        setNotFound(true);
                        return;
                    }
                    const data = await res.json();
                    if (data.story) {
                        setStory(data.story);
                        setEpisodes(data.episodes || []);
                    }
                } catch (error) {
                    console.error("Failed to fetch story data:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchStoryData();
        }
    }, [initialStory.id, initialEpisodes]);

    if (notFound) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
                <Play size={80} className="text-red-500 mb-6 opacity-50" />
                <h1 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter">Story Not Found</h1>
                <p className="text-gray-400 mb-8 max-w-md">The cinematic experience you're looking for might have been moved or removed.</p>
                <Link href="/business/hm-stories" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-all">
                    Return to Library
                </Link>
            </div>
        );
    }

    const handleWatchClick = (youtubeVideoId: string) => {
        window.open(`https://youtube.com/watch?v=${youtubeVideoId}`, "_blank", "noopener,noreferrer");
    };

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Cinematic Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {/* Glowing Blobs */}
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />

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

            {/* Top Navigation Overlay */}
            <div className="fixed top-0 left-0 right-0 z-50 p-6 pointer-events-none">
                <div className="container mx-auto flex justify-start pointer-events-auto">
                    <Link
                        href="/business/hm-stories"
                        className="group flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full backdrop-blur-md transition-all duration-300"
                    >
                        <ArrowLeft size={16} className="text-gray-400 group-hover:text-white transition-transform group-hover:-translate-x-1" />
                        <span className="text-sm font-medium text-gray-400 group-hover:text-white">Back to Stories</span>
                    </Link>
                </div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 pt-24">
                {/* Story Header */}
                <section className="relative px-6 py-12">
                    <div className="container mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="max-w-4xl"
                        >
                            <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                                {story.title}
                            </h1>

                            {story.description && (
                                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                                    {story.description}
                                </p>
                            )}

                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-full text-blue-400 text-sm font-bold backdrop-blur-sm">
                                <Play size={14} />
                                <span>{episodes.length} Episodes</span>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Episodes Grid */}
                <section className="px-6 pb-20">
                    <div className="container mx-auto">
                        {episodes.length === 0 ? (
                            <div className="text-center py-20">
                                <Play size={64} className="mx-auto mb-6 text-gray-600" />
                                <h3 className="text-2xl font-bold text-gray-400 mb-3">No Episodes Available</h3>
                                <p className="text-gray-500">Episodes will appear here once they're published.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {episodes.map((episode, index) => (
                                    <motion.div
                                        key={episode.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.05 }}
                                        onClick={() => handleWatchClick(episode.youtubeVideoId)}
                                        className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer hover:-translate-y-1"
                                    >
                                        {/* Thumbnail */}
                                        <div className="relative aspect-video overflow-hidden bg-gray-700">
                                            {episode.thumbnailUrl ? (
                                                <img
                                                    src={episode.thumbnailUrl}
                                                    alt={episode.title}
                                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Play size={48} className="text-gray-600" />
                                                </div>
                                            )}

                                            {/* Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                                            {/* Duration Badge */}
                                            {episode.duration && (
                                                <div className="absolute bottom-3 right-3 bg-black/90 backdrop-blur-sm px-3 py-1 rounded-md flex items-center gap-1.5">
                                                    <Clock size={12} />
                                                    <span className="text-xs font-bold">{episode.duration}</span>
                                                </div>
                                            )}

                                            {/* Episode Number */}
                                            <div className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-sm px-3 py-1 rounded-md">
                                                <span className="text-xs font-black">EP {episode.episodeNumber}</span>
                                            </div>

                                            {/* Play Button Overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <div className="bg-blue-600 p-5 rounded-full shadow-2xl shadow-blue-600/50 group-hover:scale-110 transition-transform">
                                                    <Play size={24} fill="white" className="text-white ml-0.5" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 space-y-3">
                                            <h3 className="font-bold text-lg text-white line-clamp-2 group-hover:text-blue-400 transition-colors leading-tight">
                                                {episode.title}
                                            </h3>

                                            {episode.description && (
                                                <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                                                    {episode.description}
                                                </p>
                                            )}

                                            {/* Watch on YouTube CTA */}
                                            <div className="pt-2 flex items-center gap-2 text-blue-400 text-sm font-bold group-hover:gap-3 transition-all">
                                                <ExternalLink size={14} />
                                                <span>Watch on YouTube</span>
                                            </div>
                                        </div>

                                        {/* Shine Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
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
