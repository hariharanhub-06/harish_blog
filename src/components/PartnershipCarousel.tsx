"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import imageKitLoader from "@/lib/imagekitLoader";

interface Partnership {
    id: string;
    name: string;
    logo: string;
    partnerType: string;
}

export default function PartnershipCarousel() {
    const [partnerships, setPartnerships] = useState<Partnership[]>([]);

    useEffect(() => {
        fetch("/api/snacks/partnerships")
            .then((res) => res.json())
            .then((data) => setPartnerships(data))
            .catch((err) => console.error("Failed to load partnerships:", err));
    }, []);

    if (partnerships.length === 0) return null;

    // For a seamless infinite scroll, we need enough items to fill the width.
    // We'll duplicate the list multiple times if it's very short.
    const displayPartners = partnerships.length > 0
        ? (partnerships.length < 6 ? [...partnerships, ...partnerships, ...partnerships, ...partnerships] : [...partnerships, ...partnerships])
        : [];

    return (
        <section className="py-12 bg-white overflow-hidden border-b border-gray-50">
            <div className="container mx-auto px-6 mb-8">
                <div className="flex flex-col items-center">
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight text-center">Partnered <span className="text-primary italic">By</span></h2>
                    <div className="w-16 h-1 bg-gradient-to-r from-primary to-pink-500 rounded-full mt-3"></div>
                </div>
            </div>

            <div className="relative group flex overflow-hidden">
                <div
                    className="flex animate-scroll hover:[animation-play-state:paused] whitespace-nowrap"
                    style={{
                        animation: `scroll 30s linear infinite`
                    }}
                >
                    {displayPartners.map((partner, idx) => (
                        <div
                            key={`${partner.id}-${idx}`}
                            className="flex-shrink-0 w-[240px] md:w-[300px] mx-3"
                        >
                            <div className="bg-white rounded-[1.5rem] p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group/card">
                                <div className="relative h-20 md:h-24 w-full flex items-center justify-center">
                                    <Image
                                        loader={imageKitLoader}
                                        src={partner.logo}
                                        alt={partner.name}
                                        fill
                                        className="object-contain group-hover/card:scale-110 transition-transform duration-700"
                                    />
                                </div>
                                <div className="mt-6 text-center italic">
                                    <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">{partner.name}</h3>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-primary opacity-60 mt-1">{partner.partnerType}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Second track for seamlessness */}
                <div
                    className="flex animate-scroll hover:[animation-play-state:paused] whitespace-nowrap"
                    aria-hidden="true"
                    style={{
                        animation: `scroll 30s linear infinite`
                    }}
                >
                    {displayPartners.map((partner, idx) => (
                        <div
                            key={`dup-${partner.id}-${idx}`}
                            className="flex-shrink-0 w-[240px] md:w-[300px] mx-3"
                        >
                            <div className="bg-white rounded-[1.5rem] p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group/card">
                                <div className="relative h-20 md:h-24 w-full flex items-center justify-center">
                                    <Image
                                        loader={imageKitLoader}
                                        src={partner.logo}
                                        alt={partner.name}
                                        fill
                                        className="object-contain group-hover/card:scale-110 transition-transform duration-700"
                                    />
                                </div>
                                <div className="mt-6 text-center italic">
                                    <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">{partner.name}</h3>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-primary opacity-60 mt-1">{partner.partnerType}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-100%); }
                }
                .animate-scroll {
                    display: flex;
                    width: max-content;
                }

                .animate-scroll:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </section>
    );
}
