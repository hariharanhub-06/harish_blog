"use client";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Tooltip, useMapEvents } from "react-leaflet";

interface Place {
    id: string;
    cityName: string;
    country: string;
    lat: number;
    lng: number;
}

const placeIcon = L.divIcon({
    html: `<div style="width:13px;height:13px;border-radius:50%;background:#38bdf8;border:2.5px solid #fff;box-shadow:0 0 8px rgba(56,189,248,0.8)"></div>`,
    className: "",
    iconSize: [13, 13],
    iconAnchor: [6, 6],
    tooltipAnchor: [8, 0],
});

const pendingIcon = L.divIcon({
    html: `<div style="width:18px;height:18px;border-radius:50%;background:#facc15;border:2.5px solid #fff;box-shadow:0 0 12px rgba(250,204,21,1)"></div>`,
    className: "",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    tooltipAnchor: [11, 0],
});

function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

interface Props {
    places: Place[];
    pendingPoint: { lat: number; lng: number } | null;
    onMapClick: (lat: number, lng: number) => void;
}

export default function AdminTravelMap({ places, pendingPoint, onMapClick }: Props) {
    return (
        <MapContainer
            center={[20, 0]}
            zoom={2}
            minZoom={2}
            maxZoom={18}
            style={{ width: "100%", height: "100%" }}
            worldCopyJump
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
            />
            <ClickHandler onMapClick={onMapClick} />
            {places.map((p) => (
                <Marker key={p.id} position={[p.lat, p.lng]} icon={placeIcon}>
                    <Tooltip direction="right" offset={[8, 0]}>
                        <strong>{p.cityName}</strong>, {p.country}
                    </Tooltip>
                </Marker>
            ))}
            {pendingPoint && (
                <Marker position={[pendingPoint.lat, pendingPoint.lng]} icon={pendingIcon}>
                    <Tooltip permanent direction="right" offset={[11, 0]}>
                        Drop here?
                    </Tooltip>
                </Marker>
            )}
        </MapContainer>
    );
}
