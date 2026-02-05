"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Trash2,
    Loader2,
    Image as ImageIcon,
    Upload,
    Gamepad2,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { uploadToImageKit } from "@/lib/imagekit-upload";

interface GameAsset {
    id: string;
    gameId: string;
    assetUrl: string;
    assetType: string;
    isActive: boolean;
}

export default function GameAssetsModule() {
    const [assets, setAssets] = useState<GameAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedGame, setSelectedGame] = useState("memory");
    const [newAssetUrl, setNewAssetUrl] = useState("");

    const games = [
        { id: "memory", name: "Memory Card", minAssets: 8 },
        { id: "puzzle", name: "Picture Puzzle", minAssets: 3 }
    ];

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        try {
            const res = await fetch("/api/admin/game-assets");
            if (res.ok) {
                const data = await res.json();
                setAssets(data);
            }
        } catch (error) {
            console.error("Failed to fetch assets", error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const url = await uploadToImageKit(file, "game-assets");
            await saveAsset(url);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const saveAsset = async (url: string) => {
        try {
            const res = await fetch("/api/admin/game-assets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    gameId: selectedGame,
                    assetUrl: url
                })
            });

            if (res.ok) {
                fetchAssets();
                setNewAssetUrl("");
            }
        } catch (error) {
            console.error("Save asset failed", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            const res = await fetch(`/api/admin/game-assets?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setAssets(assets.filter(a => a.id !== id));
            }
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

    const filteredAssets = assets.filter(a => a.gameId === selectedGame);
    const currentGame = games.find(g => g.id === selectedGame)!;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <Gamepad2 className="text-primary" size={24} />
                        Game Assets Manager
                    </h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Manage custom content for games</p>
                </div>
            </div>

            <div className="flex gap-4 p-1 bg-gray-100 rounded-2xl w-fit">
                {games.map(game => (
                    <button
                        key={game.id}
                        onClick={() => setSelectedGame(game.id)}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${selectedGame === game.id ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {game.name}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
                        <h3 className="font-black text-lg text-gray-900 uppercase tracking-tight">Add New Asset</h3>

                        <div className="space-y-4">
                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                    {uploading ? (
                                        <Loader2 className="animate-spin text-primary" size={32} />
                                    ) : (
                                        <>
                                            <Upload className="w-10 h-10 mb-3 text-gray-400" />
                                            <p className="text-sm text-gray-600 font-bold">Click to upload photo</p>
                                            <p className="text-[10px] text-gray-400 uppercase font-black mt-2">Friends' photos match best!</p>
                                        </>
                                    )}
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                            </label>

                            <div className="relative flex items-center gap-2">
                                <div className="h-px bg-gray-100 flex-1" />
                                <span className="text-[10px] font-black text-gray-300 uppercase">OR</span>
                                <div className="h-px bg-gray-100 flex-1" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Direct Image URL</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newAssetUrl}
                                        onChange={(e) => setNewAssetUrl(e.target.value)}
                                        className="flex-1 bg-gray-50 border-0 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                        placeholder="https://..."
                                    />
                                    <button
                                        onClick={() => saveAsset(newAssetUrl)}
                                        disabled={!newAssetUrl}
                                        className="p-2.5 bg-primary text-white rounded-xl disabled:opacity-50"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {currentGame.minAssets > 0 && (
                            <div className={`p-4 rounded-2xl flex items-center gap-3 ${filteredAssets.length >= currentGame.minAssets ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                {filteredAssets.length >= currentGame.minAssets ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                <div className="text-[10px] font-black uppercase tracking-tight">
                                    {filteredAssets.length} / {currentGame.minAssets} assets uploaded
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        <AnimatePresence>
                            {filteredAssets.map((asset) => (
                                <motion.div
                                    key={asset.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm group bg-white"
                                >
                                    <Image src={asset.assetUrl} alt="Asset" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            onClick={() => handleDelete(asset.id)}
                                            className="p-3 bg-red-500 text-white rounded-full hover:scale-110 transition-transform shadow-lg"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {filteredAssets.length === 0 && (
                            <div className="col-span-full py-24 text-center space-y-4">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                                    <ImageIcon size={32} />
                                </div>
                                <p className="text-sm font-bold text-gray-400">No assets uploaded for this game yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
