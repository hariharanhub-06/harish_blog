"use client";

import dynamic from "next/dynamic";

interface Place {
    id: string;
    cityName: string;
    country: string;
    lat: number;
    lng: number;
}

const TravelledMapView = dynamic(() => import("./TravelledMapView"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-2 border-sky-500/30 border-t-sky-500 animate-spin" />
        </div>
    ),
});

export default function TravelledGlobe({ places }: { places: Place[] }) {
    return <TravelledMapView places={places} />;
}
