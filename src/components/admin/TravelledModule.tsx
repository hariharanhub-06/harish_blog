"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { MapPin, Trash2, X, Globe2, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

const AdminTravelMap = dynamic(() => import("./AdminTravelMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-[#1a1a2e]">
            <Loader2 size={24} className="animate-spin text-sky-400" />
        </div>
    ),
});

interface Place {
    id: string;
    cityName: string;
    country: string;
    lat: number;
    lng: number;
}

export default function TravelledModule() {
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState(true);
    const [pendingPoint, setPendingPoint] = useState<{ lat: number; lng: number } | null>(null);
    const [form, setForm] = useState({ cityName: "", country: "" });
    const [saving, setSaving] = useState(false);

    const sessionId = typeof window !== "undefined" ? localStorage.getItem("admin_sessionId") || "" : "";

    const fetchPlaces = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/travelled", {
                headers: { "X-Session-Id": sessionId },
            });
            if (res.ok) setPlaces(await res.json());
        } finally {
            setLoading(false);
        }
    }, [sessionId]);

    useEffect(() => { fetchPlaces(); }, [fetchPlaces]);

    const handleMapClick = (lat: number, lng: number) => {
        setPendingPoint({ lat, lng });
        setForm({ cityName: "", country: "" });
    };

    const handleSave = async () => {
        if (!pendingPoint || !form.cityName.trim() || !form.country.trim()) return;
        setSaving(true);
        try {
            const res = await fetch("/api/admin/travelled", {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Session-Id": sessionId },
                body: JSON.stringify({ ...pendingPoint, ...form }),
            });
            if (res.ok) {
                const place = await res.json();
                setPlaces((p) => [...p, place]);
                setPendingPoint(null);
                toast.success(`${form.cityName} pinned!`);
            } else {
                toast.error("Failed to save location");
            }
        } catch {
            toast.error("Failed to save location");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        const prev = places;
        setPlaces((p) => p.filter((x) => x.id !== id));
        try {
            const res = await fetch(`/api/admin/travelled?id=${id}`, {
                method: "DELETE",
                headers: { "X-Session-Id": sessionId },
            });
            if (!res.ok) {
                setPlaces(prev);
                toast.error("Failed to remove pin");
            } else {
                toast.success(`${name} removed`);
            }
        } catch {
            setPlaces(prev);
            toast.error("Failed to remove pin");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">
                    Travelled{" "}
                    <span className="text-sky-500">{places.length}</span>{" "}
                    {places.length === 1 ? "City" : "Cities"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Click anywhere on the map to drop a pin
                </p>
            </div>

            {/* Map */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10" style={{ height: 460 }}>
                <AdminTravelMap
                    places={places}
                    pendingPoint={pendingPoint}
                    onMapClick={handleMapClick}
                />
            </div>

            {/* Pending pin form */}
            {pendingPoint && (
                <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <span className="text-xs font-black uppercase tracking-widest text-sky-500">Pin Location</span>
                            <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                                {pendingPoint.lat.toFixed(5)}°, {pendingPoint.lng.toFixed(5)}°
                            </p>
                        </div>
                        <button
                            onClick={() => setPendingPoint(null)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            aria-label="Cancel pin"
                        >
                            <X size={16} />
                        </button>
                    </div>
                    <div className="flex gap-3">
                        <input
                            placeholder="City name"
                            value={form.cityName}
                            onChange={(e) => setForm((f) => ({ ...f, cityName: e.target.value }))}
                            onKeyDown={(e) => e.key === "Enter" && handleSave()}
                            className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-sky-500 transition-colors"
                        />
                        <input
                            placeholder="Country"
                            value={form.country}
                            onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                            onKeyDown={(e) => e.key === "Enter" && handleSave()}
                            className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-sky-500 transition-colors"
                        />
                        <button
                            onClick={handleSave}
                            disabled={saving || !form.cityName.trim() || !form.country.trim()}
                            className="px-5 py-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shrink-0"
                        >
                            {saving ? <><Loader2 size={12} className="animate-spin" /> Saving</> : "Save Pin"}
                        </button>
                    </div>
                </div>
            )}

            {/* Places list */}
            {loading ? (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Loader2 size={14} className="animate-spin" /> Loading places...
                </div>
            ) : places.length === 0 ? (
                <div className="text-center py-10 text-gray-500 dark:text-gray-600">
                    <Globe2 size={36} className="mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-medium">No places pinned yet</p>
                    <p className="text-xs mt-1">Click anywhere on the map to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {places.map((p) => (
                        <div
                            key={p.id}
                            className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 group hover:border-sky-500/40 transition-colors"
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <MapPin size={11} className="text-sky-400 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate leading-tight">{p.cityName}</p>
                                    <p className="text-[10px] text-gray-400 truncate leading-tight">{p.country}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(p.id, p.cityName)}
                                className="p-1 ml-1 text-gray-300 dark:text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                                aria-label={`Remove ${p.cityName}`}
                            >
                                <Trash2 size={11} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
