import { useState, useEffect, useRef } from "react";
import { X, Save, Calendar, Link as LinkIcon, Clock, IndianRupee, FileText, Globe, Image as ImageIcon, Upload, Loader2 } from "lucide-react";
import { uploadToImageKit } from "@/lib/imagekit-upload";

interface Session {
    id: string;
    title: string;
    description: string;
    price: number;
    startTime: string;
    duration: number;
    meetingLink: string;
    posterUrl: string;
    isPublished: boolean;
    status: string;
}

interface SessionCreateEditModalProps {
    session?: Session | null; // null for Create mode
    onClose: () => void;
    onSave: () => void;
}

export default function SessionCreateEditModal({ session, onClose, onSave }: SessionCreateEditModalProps) {
    const isEdit = !!session;
    const [loading, setLoading] = useState(false);
    const sessionId = typeof window !== "undefined" ? localStorage.getItem("admin_sessionId") || "" : "";
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: 0,
        startTime: "",
        duration: 60,
        meetingLink: "",
        posterUrl: "",
        isPublished: false
    });

    useEffect(() => {
        if (session) {
            setFormData({
                title: session.title || "",
                description: session.description || "",
                price: session.price || 0,
                startTime: session.startTime ? new Date(session.startTime).toISOString().slice(0, 16) : "",
                duration: session.duration || 60,
                meetingLink: session.meetingLink || "",
                posterUrl: session.posterUrl || "",
                isPublished: session.isPublished || false
            });
        }
    }, [session]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setUploading(true);
            try {
                const url = await uploadToImageKit(file, "live_sessions");
                setFormData(prev => ({ ...prev, posterUrl: url }));
            } catch (error) {
                console.error("Upload failed", error);
                alert("Failed to upload image.");
            } finally {
                setUploading(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = isEdit
            ? { ...formData, id: session.id }
            : formData;

        const method = isEdit ? "PATCH" : "POST";

        try {
            const res = await fetch("/api/sessions/admin", {
                method,
                headers: { "Content-Type": "application/json", "X-Session-Id": sessionId },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                onSave();
                onClose();
            } else {
                alert("Failed to save session.");
            }
        } catch (error) {
            console.error("Error saving session:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
                    <h2 className="text-xl font-black uppercase tracking-tight">
                        {isEdit ? "Edit Session" : "New Session"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-gray-500">Session Title</label>
                        <input
                            required
                            type="text"
                            className="w-full p-3 bg-gray-50 rounded-xl font-semibold outline-none focus:ring-2 ring-primary/20"
                            placeholder="e.g. Masterclass on AI Agents"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    {/* Date & Time & Duration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-500 flex items-center gap-2">
                                <Calendar size={14} /> Start Time
                            </label>
                            <input
                                required
                                type="datetime-local"
                                className="w-full p-3 bg-gray-50 rounded-xl font-semibold outline-none focus:ring-2 ring-primary/20"
                                value={formData.startTime}
                                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-500 flex items-center gap-2">
                                <Clock size={14} /> Duration (mins)
                            </label>
                            <input
                                type="number"
                                className="w-full p-3 bg-gray-50 rounded-xl font-semibold outline-none focus:ring-2 ring-primary/20"
                                placeholder="60"
                                value={formData.duration}
                                onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>

                    {/* Price & Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-500 flex items-center gap-2">
                                <IndianRupee size={14} /> Price (INR)
                            </label>
                            <input
                                type="number"
                                className="w-full p-3 bg-gray-50 rounded-xl font-semibold outline-none focus:ring-2 ring-primary/20"
                                placeholder="99"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                            />
                            <p className="text-[10px] text-gray-400 font-medium">Set to 0 for free sessions.</p>
                        </div>
                        <div className="space-y-2 flex flex-col justify-end pb-3">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/20"
                                    checked={formData.isPublished}
                                    onChange={e => setFormData({ ...formData, isPublished: e.target.checked })}
                                />
                                <span className="font-bold text-gray-700 group-hover:text-primary transition-colors">Publish to Website</span>
                            </label>
                            <p className="text-[10px] text-gray-400 font-medium pl-8">If unchecked, it will only be visible to admins.</p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-gray-500 flex items-center gap-2">
                            <FileText size={14} /> Description
                        </label>
                        <textarea
                            className="w-full p-3 bg-gray-50 rounded-xl font-semibold outline-none focus:ring-2 ring-primary/20 min-h-[100px]"
                            placeholder="What will users learn in this session?"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {/* Meeting Link & Poster */}
                    <div className="space-y-4">
                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-4">
                            <div className="p-2 bg-emerald-500 rounded-lg text-white">
                                <Globe size={18} />
                            </div>
                            <div>
                                <h4 className="text-xs font-black uppercase text-emerald-800 tracking-wider">System Generated Link</h4>
                                <p className="text-[10px] text-emerald-600 font-bold leading-relaxed mt-1">
                                    No more manual links! The system will automatically generate a secure webinar room on your website.
                                    Attendees will receive a direct "Join" link in their confirmation email.
                                </p>
                            </div>
                        </div>

                        {isEdit && (
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-gray-500">Attendee Preview Link</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        readOnly
                                        type="text"
                                        className="flex-1 p-2 bg-gray-50 rounded-lg text-[10px] font-mono text-gray-400 outline-none"
                                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/live/${session.id}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const link = `${window.location.origin}/live/${session.id}`;
                                            navigator.clipboard.writeText(link);
                                            alert("Link copied!");
                                        }}
                                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                        title="Copy Link"
                                    >
                                        <LinkIcon size={14} className="text-gray-600" />
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-400 font-medium italic">Use this link for marketing. Attendees will be asked for their email on arrival.</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-500 flex items-center gap-2">
                                <ImageIcon size={14} /> Session Poster
                            </label>

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-4 flex items-center justify-center cursor-pointer transition-all gap-4
                                    ${formData.posterUrl ? "border-green-200 bg-green-50/50" : "border-gray-200 hover:border-primary hover:bg-primary/5"}
                                `}
                            >
                                {uploading ? (
                                    <div className="flex flex-col items-center gap-2 text-primary py-4">
                                        <Loader2 size={24} className="animate-spin" />
                                        <span className="text-xs font-bold">Uploading...</span>
                                    </div>
                                ) : formData.posterUrl ? (
                                    <div className="flex items-center gap-4 w-full">
                                        <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 shadow-sm border border-gray-100">
                                            <img src={formData.posterUrl} alt="Poster" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-gray-900 mb-1">Poster Uploaded</p>
                                            <p className="text-[10px] text-gray-500 truncate max-w-[200px]">{formData.posterUrl}</p>
                                            <span className="text-[10px] font-black uppercase text-primary mt-1 inline-block">Click to Change</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-gray-400 py-4">
                                        <Upload size={24} />
                                        <div className="text-center">
                                            <p className="text-xs font-bold text-gray-600">Click to Upload Poster</p>
                                            <p className="text-[10px]">Supports PNG, JPG, WEBP</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white/80 backdrop-blur pb-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-black text-white rounded-xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save Session"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
