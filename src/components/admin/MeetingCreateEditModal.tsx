"use client";

import { useState, useEffect } from "react";
import { X, Save, Calendar, MapPin, Link as LinkIcon, User, Phone, FileText } from "lucide-react";

interface MeetingCreateEditModalProps {
    meeting?: any | null; // null for Create mode
    onClose: () => void;
    onSave: () => void;
}

export default function MeetingCreateEditModal({ meeting, onClose, onSave }: MeetingCreateEditModalProps) {
    const isEdit = !!meeting;
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        clubName: "",
        presidentName: "",
        mobileNumber: "",
        meetingType: "GRR Visit",
        scheduledDate: "",
        venue: "",
        venueDetails: "",
        driveLink: "", // The requested field
        notes: "",
        numAttendees: 0
    });

    useEffect(() => {
        if (meeting) {
            // Populate form if editing
            setFormData({
                clubName: meeting.clubName || "",
                presidentName: meeting.presidentName || "",
                mobileNumber: meeting.mobileNumber || "",
                meetingType: meeting.meetingType || "GRR Visit",
                scheduledDate: meeting.scheduledDate ? new Date(meeting.scheduledDate).toISOString().slice(0, 16) : "", // Format for datetime-local
                venue: meeting.venue || "",
                venueDetails: meeting.venueDetails || "",
                driveLink: meeting.driveLink || "",
                notes: meeting.notes || "",
                numAttendees: meeting.numAttendees || 0
            });
        }
    }, [meeting]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = isEdit
            ? { ...formData, id: meeting.id }
            : formData;

        const method = isEdit ? "PATCH" : "POST";

        try {
            const res = await fetch("/api/meetings/admin", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                onSave();
                onClose();
            } else {
                alert("Failed to save meeting.");
            }
        } catch (error) {
            console.error("Error saving meeting:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
                    <h2 className="text-xl font-black uppercase tracking-tight">
                        {isEdit ? "Edit Meeting" : "New Meeting"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-500">Club Name</label>
                            <input
                                required
                                type="text"
                                className="w-full p-3 bg-gray-50 rounded-xl font-semibold outline-none focus:ring-2 ring-primary/20"
                                placeholder="e.g. RaC TNAU"
                                value={formData.clubName}
                                onChange={e => setFormData({ ...formData, clubName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-500">Meeting Type</label>
                            <select
                                className="w-full p-3 bg-gray-50 rounded-xl font-semibold outline-none focus:ring-2 ring-primary/20"
                                value={formData.meetingType}
                                onChange={e => setFormData({ ...formData, meetingType: e.target.value })}
                            >
                                <option>GRR Visit</option>
                                <option>DRR Visit</option>
                                <option>Installation</option>
                                <option>General Meeting</option>
                                <option>Project</option>
                            </select>
                        </div>
                    </div>

                    {/* Date & Time */}
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-gray-500 flex items-center gap-2">
                            <Calendar size={14} /> Date & Time
                        </label>
                        <input
                            required
                            type="datetime-local"
                            className="w-full p-3 bg-gray-50 rounded-xl font-semibold outline-none focus:ring-2 ring-primary/20"
                            value={formData.scheduledDate}
                            onChange={e => setFormData({ ...formData, scheduledDate: e.target.value })}
                        />
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-500 flex items-center gap-2">
                                <User size={14} /> President Name
                            </label>
                            <input
                                type="text"
                                className="w-full p-3 bg-gray-50 rounded-xl font-semibold outline-none focus:ring-2 ring-primary/20"
                                placeholder="e.g. Rtr. John Doe"
                                value={formData.presidentName}
                                onChange={e => setFormData({ ...formData, presidentName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-500 flex items-center gap-2">
                                <Phone size={14} /> Mobile Number
                            </label>
                            <input
                                type="tel"
                                className="w-full p-3 bg-gray-50 rounded-xl font-semibold outline-none focus:ring-2 ring-primary/20"
                                placeholder="e.g. 919876543210"
                                value={formData.mobileNumber}
                                onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Venue & Drive Link */}
                    <div className="space-y-4 border-t border-gray-100 pt-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-500 flex items-center gap-2">
                                <MapPin size={14} /> Venue Short Name
                            </label>
                            <input
                                type="text"
                                className="w-full p-3 bg-gray-50 rounded-xl font-semibold outline-none focus:ring-2 ring-primary/20"
                                placeholder="e.g. TNAU Campus"
                                value={formData.venue}
                                onChange={e => setFormData({ ...formData, venue: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-500">Venue Full Details</label>
                            <textarea
                                className="w-full p-3 bg-gray-50 rounded-xl font-semibold outline-none focus:ring-2 ring-primary/20 min-h-[80px]"
                                placeholder="Complete address..."
                                value={formData.venueDetails}
                                onChange={e => setFormData({ ...formData, venueDetails: e.target.value })}
                            />
                        </div>

                        {/* THE DRIVE LINK */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-blue-600 flex items-center gap-2">
                                <LinkIcon size={14} /> Google Drive Link
                            </label>
                            <input
                                type="url"
                                className="w-full p-3 bg-blue-50/50 border border-blue-100 rounded-xl font-medium outline-none focus:ring-2 ring-blue-500/20 text-blue-800"
                                placeholder="https://drive.google.com/..."
                                value={formData.driveLink}
                                onChange={e => setFormData({ ...formData, driveLink: e.target.value })}
                            />
                            <p className="text-[10px] text-gray-400 font-medium">Paste the folder link here. It will appear as a button in the dashboard.</p>
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
                            {loading ? "Saving..." : "Save Meeting"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
