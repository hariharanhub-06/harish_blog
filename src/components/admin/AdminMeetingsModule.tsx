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
    Trash2,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MeetingChecklistModal from "./MeetingChecklistModal";
import MeetingScoringModal from "./MeetingScoringModal";
import MeetingCreateEditModal from "./MeetingCreateEditModal";
import { CHECKLIST_ITEMS, getEfficiencyStatus } from "@/constants/meetingData";

interface Meeting {
    id: string;
    meetingType: string;
    clubName: string;
    numAttendees: number;
    notes: string;
    presidentName: string;
    mobileNumber: string;
    driveLink: string;
    venue: string;
    venueDetails: string;
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
    const [modalType, setModalType] = useState<"checklist" | "scoring" | "edit" | null>(null);
    const [showAvailability, setShowAvailability] = useState(false);
    const [availability, setAvailability] = useState<string[]>([]);
    const [stagedAvailability, setStagedAvailability] = useState<string[]>([]);
    const [isSavingAvailability, setIsSavingAvailability] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        fetchMeetings();
        fetchAvailability();
    }, []);

    const fetchAvailability = async () => {
        try {
            const res = await fetch("/api/meetings/availability");
            if (res.ok) {
                const data = await res.json();
                const fetchedAv = data.filter((d: any) => d.isAvailable).map((d: any) => d.specificDate.split('T')[0]);
                setAvailability(fetchedAv);
                setStagedAvailability(fetchedAv);
            }
        } catch (error) {
            console.error("Failed to fetch availability:", error);
        }
    };

    const toggleAvailability = (date: Date) => {
        const dateStr = date.toLocaleDateString('en-CA');
        const isCurrentlyAvailable = stagedAvailability.includes(dateStr);

        if (isCurrentlyAvailable) {
            setStagedAvailability(stagedAvailability.filter(d => d !== dateStr));
        } else {
            setStagedAvailability([...stagedAvailability, dateStr]);
        }
    };

    const handleSaveAvailability = async () => {
        setIsSavingAvailability(true);
        try {
            const res = await fetch("/api/meetings/availability", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    availableDates: stagedAvailability
                }),
            });

            if (res.ok) {
                setAvailability(stagedAvailability);
                alert("Availability saved successfully!");
            } else {
                const error = await res.json();
                alert(`Failed to save: ${error.error}`);
            }
        } catch (error) {
            console.error("Failed to save availability:", error);
            alert("A network error occurred while saving.");
        } finally {
            setIsSavingAvailability(false);
        }
    };

    const discardChanges = () => {
        setStagedAvailability(availability);
    };

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());

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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 relative"
        >
            {/* Background Particles */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-64 h-64 rounded-full bg-primary/5 blur-3xl"
                        animate={{
                            x: [Math.random() * 100, Math.random() * -100, Math.random() * 100],
                            y: [Math.random() * 100, Math.random() * -100, Math.random() * 100],
                        }}
                        transition={{
                            duration: 10 + i * 2,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                    />
                ))}
            </div>

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
                    <button
                        onClick={() => { setActiveMeeting(null); setModalType("edit"); }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-xs shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
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
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-primary">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">Availability Calendar</h3>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Enable specific dates for club visits</p>
                                            {JSON.stringify(availability.sort()) !== JSON.stringify(stagedAvailability.sort()) && (
                                                <span className="flex items-center gap-1 text-[8px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full animate-pulse">
                                                    <AlertCircle size={8} /> Unsaved Changes
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-4 bg-white/5 p-1.5 rounded-xl border border-white/10 mr-4">
                                        <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ChevronLeft size={16} /></button>
                                        <span className="text-sm font-bold min-w-[120px] text-center uppercase tracking-widest">
                                            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                        </span>
                                        <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ChevronRight size={16} /></button>
                                    </div>

                                    {JSON.stringify(availability.sort()) !== JSON.stringify(stagedAvailability.sort()) && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={discardChanges}
                                                className="px-4 py-2 rounded-xl text-xs font-black uppercase text-gray-400 hover:text-white transition-colors"
                                            >
                                                Discard
                                            </button>
                                            <button
                                                onClick={handleSaveAvailability}
                                                disabled={isSavingAvailability}
                                                className="px-6 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                                            >
                                                {isSavingAvailability ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-2">
                                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                                    <div key={d} className="text-center text-[10px] font-black uppercase text-gray-500 py-2">{d}</div>
                                ))}
                                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
                                    const dateStr = date.toLocaleDateString('en-CA');
                                    const isAv = stagedAvailability.includes(dateStr);
                                    const isSaved = availability.includes(dateStr);
                                    const isModified = isAv !== isSaved;
                                    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

                                    return (
                                        <button
                                            key={i}
                                            onClick={() => toggleAvailability(date)}
                                            disabled={isPast}
                                            className={`p-2 py-4 rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 transition-all relative
                                                ${isAv ? 'border-primary bg-primary/10 text-white shadow-lg shadow-primary/20' : 'border-white/5 bg-white/5 text-gray-500 hover:border-white/20'}
                                                ${isPast ? 'opacity-20 cursor-not-allowed grayscale' : ''}
                                                ${isModified ? 'ring-2 ring-amber-500/50 ring-offset-2 ring-offset-gray-900 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : ''}`}
                                        >
                                            {isModified && (
                                                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" title="Unsaved Change" />
                                            )}
                                            <span className="text-lg font-black">{i + 1}</span>
                                            <span className={`text-[7px] font-black uppercase tracking-widest ${isAv ? 'text-primary' : 'text-gray-600'}`}>
                                                {isAv ? 'Available' : 'Unavailable'}
                                            </span>
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
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Venue</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredMeetings.length === 0 ? (
                                <motion.tr
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <td colSpan={6} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center text-gray-200">
                                                <Calendar size={40} />
                                            </div>
                                            <div>
                                                <p className="text-gray-900 font-bold">No meetings found</p>
                                                <p className="text-sm text-gray-400 font-medium">Try adjusting your search or filters</p>
                                            </div>
                                            <button
                                                onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}
                                                className="mt-2 text-xs font-black uppercase text-primary hover:underline"
                                            >
                                                Clear all filters
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ) : (
                                filteredMeetings.map((meeting, index) => (
                                    <motion.tr
                                        key={meeting.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        className="hover:bg-gray-50/50 transition-colors group"
                                    >
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
                                                    {new Date(meeting.scheduledDate).toLocaleDateString("en-GB")}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase">
                                                    <Clock size={10} />
                                                    {new Date(meeting.scheduledDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                </div>
                                                <span className="text-[10px] font-black uppercase text-accent bg-accent/5 px-2 py-0.5 rounded-full w-fit">
                                                    {meeting.meetingType}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                className={`text-[10px] font-black uppercase tracking-wider py-1 px-3 rounded-full border-none focus:ring-2 ring-primary/20 appearance-none text-center cursor-pointer transition-all
                                                    ${meeting.status === "requested" ? "bg-amber-100 text-amber-700" :
                                                        meeting.status === "confirmed" ? "bg-emerald-100 text-emerald-700" :
                                                            "bg-blue-100 text-blue-700"}`}
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
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[8px] font-black text-gray-400">
                                                            {calculateTotalPoints(meeting.scoringData)} pts
                                                        </span>
                                                        {calculateTotalPoints(meeting.scoringData) > 0 && (
                                                            <span className={`text-[6px] font-black uppercase px-1 rounded-sm ${getEfficiencyStatus(calculateTotalPoints(meeting.scoringData)) === 'HYPERACTIVE' ? 'bg-purple-100 text-purple-700' :
                                                                getEfficiencyStatus(calculateTotalPoints(meeting.scoringData)) === 'SUPERACTIVE' ? 'bg-blue-100 text-blue-700' :
                                                                    getEfficiencyStatus(calculateTotalPoints(meeting.scoringData)) === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                                                                        'bg-gray-100 text-gray-400'
                                                                }`}>
                                                                {getEfficiencyStatus(calculateTotalPoints(meeting.scoringData))}
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col min-w-[120px]">
                                                <span className="text-xs font-bold text-gray-900">{meeting.venue || "No Venue"}</span>
                                                <span className="text-[10px] text-gray-500 font-medium truncate max-w-[150px]" title={meeting.venueDetails}>
                                                    {meeting.venueDetails || "No Details"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {/* Edit Button */}
                                                <button
                                                    onClick={() => { setActiveMeeting(meeting); setModalType("edit"); }}
                                                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                                    title="Edit Meeting"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>

                                                {meeting.mobileNumber && (
                                                    <a
                                                        href={`https://wa.me/${meeting.mobileNumber}?text=${encodeURIComponent(
                                                            `Hi, we are confirming your ${meeting.meetingType} visit for ${meeting.clubName} on ${new Date(meeting.scheduledDate).toLocaleDateString("en-GB")} at ${new Date(meeting.scheduledDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}. Venue: ${meeting.venue || "TBA"} - ${meeting.venueDetails || ""}`
                                                        )}`}
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
                                            </div>
                                        </td>
                                    </motion.tr>
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
                {modalType === "edit" && (
                    <MeetingCreateEditModal
                        meeting={activeMeeting}
                        onClose={() => { setModalType(null); setActiveMeeting(null); }}
                        onSave={() => { fetchMeetings(); setModalType(null); }}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}
