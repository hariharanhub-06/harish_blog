"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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

    // Duplicate the array to create seamless loop
    const duplicatedPartnerships = [...partnerships, ...partnerships, ...partnerships];

    return (
        <section className="bg-gradient-to-r from-gray-50 via-white to-gray-50 py-12 overflow-hidden">
            <div className="container mx-auto px-4 mb-8">
                <h2 className="text-3xl font-black text-center text-gray-900">
                    Partnered By
                </h2>
                <div className="h-1 w-24 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto mt-3 rounded-full"></div>
            </div>

            {/* Auto-scrolling carousel */}
            <div className="relative">
                <div className="flex gap-12 animate-scroll">
                    {duplicatedPartnerships.map((partner, index) => (
                        <div
                            key={`${partner.id}-${index}`}
                            className="flex-shrink-0 flex flex-col items-center justify-center gap-4 min-w-[200px]"
                        >
                            <div className="relative w-40 h-20 bg-white rounded-xl shadow-lg p-4 flex items-center justify-center hover:shadow-2xl transition-shadow">
                                <Image
                                    src={partner.logo}
                                    alt={partner.name}
                                    fill
                                    className="object-contain p-2"
                                />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-gray-800">{partner.name}</p>
                                <p className="text-xs text-gray-500">{partner.partnerType}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes scroll {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-33.33%);
                    }
                }

                .animate-scroll {
                    animation: scroll 30s linear infinite;
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
