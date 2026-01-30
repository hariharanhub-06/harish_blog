"use client";

import { useState, useEffect } from "react";
import {
    Calendar,
    Search,
    Filter,
    MoreVertical,
    ExternalLink,
    MessageCircle,
    Eye,
    Star,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Plus,
    Link as LinkIcon,
    Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MeetingChecklistModal from "./MeetingChecklistModal";
import MeetingScoringModal from "./MeetingScoringModal";
import { CHECKLIST_ITEMS } from "@/constants/meetingData";

interface Meeting {
    id: string;
    meetingType: string;
    clubName: string;
    numAttendees: number;
    notes: string;
    presidentName: string;
    mobileNumber: string;
    driveLink: string;
    scheduledDate: string;
    status: "requested" | "confirmed" | "completed";
    checklistData: any;
    scoringData: any;
    createdAt: string;
}

export default function AdminMeetingsModule() {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Modal & Availability State
    const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
    const [modalType, setModalType] = useState<"checklist" | "scoring" | null>(null);
    const [showAvailability, setShowAvailability] = useState(false);
    const [availability, setAvailability] = useState<any[]>([]);

    useEffect(() => {
        fetchMeetings();
        fetchAvailability();
    }, []);

    const fetchAvailability = async () => {
        try {
            const res = await fetch("/api/meetings/availability");
            if (res.ok) {
                const data = await res.json();
                setAvailability(data);
            }
        } catch (error) {
            console.error("Failed to fetch availability:", error);
        }
    };

    const toggleAvailability = async (day: number, current: boolean) => {
        try {
            const res = await fetch("/api/meetings/availability", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    dayOfWeek: day,
                    isAvailable: !current,
                    startTime: "10:00",
                    endTime: "18:00"
                }),
            });
            if (res.ok) fetchAvailability();
        } catch (error) {
            console.error("Failed to toggle availability:", error);
        }
    };

    const fetchMeetings = async () => {
        try {
            const res = await fetch("/api/meetings/admin");
            if (res.ok) {
                const data = await res.json();
                setMeetings(data);
            }
        } catch (error) {
            console.error("Failed to fetch meetings:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateMeetingStatus = async (id: string, status: string) => {
        try {
            const res = await fetch("/api/meetings/admin", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status }),
            });
            if (res.ok) fetchMeetings();
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    const handleDeleteMeeting = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this meeting?")) return;
        try {
            const res = await fetch(`/api/meetings/admin?id=${id}`, {
                method: "DELETE",
            });
            if (res.ok) fetchMeetings();
        } catch (error) {
            console.error("Failed to delete meeting:", error);
        }
    };

    const handleSaveChecklist = async (meetingId: string, data: any) => {
        try {
            const res = await fetch("/api/meetings/admin", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: meetingId, checklistData: data }),
            });
            if (res.ok) {
                fetchMeetings();
                setActiveMeeting(null);
                setModalType(null);
            }
        } catch (error) {
            console.error("Failed to save checklist:", error);
        }
    };

    const handleSaveScoring = async (meetingId: string, data: any) => {
        try {
            const res = await fetch("/api/meetings/admin", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: meetingId, scoringData: data }),
            });
            if (res.ok) {
                fetchMeetings();
                setActiveMeeting(null);
                setModalType(null);
            }
        } catch (error) {
            console.error("Failed to save scoring:", error);
        }
    };

    const calculateChecklistPercent = (data: any) => {
        if (!data) return 0;
        const total = CHECKLIST_ITEMS.length;
        const checked = Object.values(data).filter((v: any) => v.checked).length;
        return Math.round((checked / total) * 100);
    };

    const calculateTotalPoints = (data: any) => {
        if (!data) return 0;
        return Object.values(data).reduce((acc: number, curr: any) => acc + (curr.points || 0), 0);
    };

    const filteredMeetings = meetings.filter(m => {
        const matchesSearch = m.clubName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.presidentName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || m.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Meetings & Efficiency</h2>
                    <p className="text-sm text-gray-500 font-medium">Manage GRR/DRR visits and calculate club performance</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowAvailability(!showAvailability)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${showAvailability ? 'bg-gray-900 text-white shadow-lg' : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Calendar size={14} />
                        {showAvailability ? 'Close Availability' : 'Set Availability'}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-xs shadow-lg shadow-primary/20">
                        <Plus size={14} />
                        New Entry
                    </button>
                </div>
            </div>

            {/* Availability Management */}
            <AnimatePresence>
                {showAvailability && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-gray-900 p-8 rounded-[2rem] text-white mb-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-primary">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold">Weekly Visit Availability</h3>
                                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Enable days for clubs to schedule visits</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
                                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => {
                                    const av = availability.find(a => a.dayOfWeek === i);
                                    const isAv = av?.isAvailable ?? false;
                                    return (
                                        <button
                                            key={day}
                                            onClick={() => toggleAvailability(i, isAv)}
                                            className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${isAv ? 'border-primary bg-primary/10 text-white' : 'border-white/10 bg-white/5 text-gray-500'}`}
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-widest">{day}</span>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isAv ? 'bg-primary text-white' : 'bg-white/10'}`}>
                                                {isAv ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-white/20" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 text-gray-900">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="search"
                        placeholder="Search by club or president..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 ring-primary/20 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-400" />
                    <select
                        className="bg-gray-50 border-none rounded-xl text-sm py-2 px-4 focus:ring-2 ring-primary/20 font-bold transition-all text-gray-900"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="requested">Requested</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            {/* Meetings Table */}
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Club Details</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Meeting Info</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Monitoring</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredMeetings.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">
                                        No meetings found
                                    </td>
                                </tr>
                            ) : (
                                filteredMeetings.map((meeting) => (
                                    <tr key={meeting.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4 text-gray-900">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900">{meeting.clubName}</span>
                                                <span className="text-xs text-gray-500 font-medium">{meeting.presidentName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                                                    <Calendar size={12} className="text-primary" />
                                                    {new Date(meeting.scheduledDate).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase">
                                                    <Clock size={10} />
                                                    {new Date(meeting.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <span className="text-[10px] font-black uppercase text-accent bg-accent/5 px-2 py-0.5 rounded-full w-fit">
                                                    {meeting.meetingType}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                className={`text-[10px] font-black uppercase tracking-wider py-1 px-3 rounded-full border-none focus:ring-2 ring-primary/20 appearance-none text-center cursor-pointer transition-all
                                                    ${meeting.status === 'requested' ? 'bg-amber-100 text-amber-700' :
                                                        meeting.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                                            'bg-blue-100 text-blue-700'}`}
                                                value={meeting.status}
                                                onChange={(e) => updateMeetingStatus(meeting.id, e.target.value)}
                                            >
                                                <option value="requested">Requested</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-4">
                                                <button
                                                    onClick={() => { setActiveMeeting(meeting); setModalType("checklist"); }}
                                                    className="flex flex-col items-center gap-1 group/eye"
                                                >
                                                    <div className="p-2 rounded-xl bg-gray-50 group-hover/eye:bg-primary/10 group-hover/eye:text-primary transition-all">
                                                        <Eye size={18} className="text-gray-400 group-hover/eye:text-primary" />
                                                    </div>
                                                    <span className="text-[8px] font-black text-gray-400">
                                                        {calculateChecklistPercent(meeting.checklistData)}%
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => { setActiveMeeting(meeting); setModalType("scoring"); }}
                                                    className="flex flex-col items-center gap-1 group/star"
                                                >
                                                    <div className="p-2 rounded-xl bg-gray-50 group-hover/star:bg-yellow-500/10 group-hover/star:text-yellow-600 transition-all">
                                                        <Star size={18} className="text-gray-400 group-hover/star:text-yellow-600" />
                                                    </div>
                                                    <span className="text-[8px] font-black text-gray-400">
                                                        {calculateTotalPoints(meeting.scoringData)} pts
                                                    </span>
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {meeting.mobileNumber && (
                                                    <a
                                                        href={`https://wa.me/${meeting.mobileNumber}?text=Confirming your ${meeting.meetingType} schedule.`}
                                                        target="_blank"
                                                        className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                                        title="WhatsApp Confirm"
                                                    >
                                                        <MessageCircle size={16} />
                                                    </a>
                                                )}
                                                {meeting.driveLink && (
                                                    <a
                                                        href={meeting.driveLink}
                                                        target="_blank"
                                                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                                        title="Drive Link"
                                                    >
                                                        <LinkIcon size={16} />
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteMeeting(meeting.id)}
                                                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                    title="Delete Meeting"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {modalType === "checklist" && activeMeeting && (
                    <MeetingChecklistModal
                        meeting={activeMeeting}
                        onClose={() => { setModalType(null); setActiveMeeting(null); }}
                        onSave={(data) => handleSaveChecklist(activeMeeting.id, data)}
                    />
                )}
                {modalType === "scoring" && activeMeeting && (
                    <MeetingScoringModal
                        meeting={activeMeeting}
                        onClose={() => { setModalType(null); setActiveMeeting(null); }}
                        onSave={(data) => handleSaveScoring(activeMeeting.id, data)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
