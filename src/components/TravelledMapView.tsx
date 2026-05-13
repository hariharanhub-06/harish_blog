"use client";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";

interface Place {
    id: string;
    cityName: string;
    country: string;
    lat: number;
    lng: number;
}

const pinIcon = L.divIcon({
    html: `<div style="width:14px;height:14px;border-radius:50%;background:#38bdf8;border:2.5px solid #fff;box-shadow:0 0 10px rgba(56,189,248,0.9)"></div>`,
    className: "",
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
});

function FitBounds({ places }: { places: Place[] }) {
    const map = useMap();
    useEffect(() => {
        if (places.length === 0) return;
        if (places.length === 1) {
            map.setView([places[0].lat, places[0].lng], 5);
        } else {
            const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lng]));
            map.fitBounds(bounds, { padding: [40, 40] });
        }
    }, [places, map]);
    return null;
}

export default function TravelledMapView({ places }: { places: Place[] }) {
    return (
        <MapContainer
            center={[20, 0]}
            zoom={2}
            minZoom={2}
            maxZoom={18}
            style={{ width: "100%", height: "100%" }}
            scrollWheelZoom
            worldCopyJump
            zoomControl
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                subdomains="abcd"
                maxZoom={20}
            />
            <FitBounds places={places} />
            {places.map((p) => (
                <Marker key={p.id} position={[p.lat, p.lng]} icon={pinIcon}>
                    <Popup>
                        <div style={{ fontFamily: "inherit", minWidth: 120 }}>
                            <strong style={{ fontSize: 13 }}>{p.cityName}</strong>
                            <br />
                            <span style={{ fontSize: 11, color: "#64748b" }}>{p.country}</span>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
