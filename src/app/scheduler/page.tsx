"use client";

import { useState, useEffect } from "react";
import {
    Calendar as CalendarIcon,
    Clock,
    Users,
    FileText,
    User,
    Phone,
    Link as LinkIcon,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Loader2,
    CalendarCheck,
    AlertCircle,
    Star,
    Sparkles,
    MousePointer2,
    Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Availability {
    specificDate: string;
    isAvailable: boolean;
}

interface BookedSession {
    scheduledDate: string;
    endDate: string;
}

export default function MeetingScheduler() {
    const [step, setStep] = useState(1);
    const [availability, setAvailability] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [startTime, setStartTime] = useState("10:00");
    const [endTime, setEndTime] = useState("12:00");
    const [bookedSessions, setBookedSessions] = useState<BookedSession[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const [form, setForm] = useState({
        meetingType: "GRR Visit",
        clubName: "",
        numAttendees: "",
        notes: "",
        presidentName: "",
        mobileNumber: "",
        driveLink: "",
        venue: "",
        venueDetails: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchAvailability();
    }, []);

    const fetchAvailability = async () => {
        try {
            const res = await fetch("/api/meetings/availability");
            if (res.ok) {
                const data = await res.json();
                setAvailability(data.filter((d: any) => d.isAvailable).map((d: any) => new Date(d.specificDate).toDateString()));
            }
        } catch (error) {
            console.error("Failed to fetch availability:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBookedSessions = async (date: Date) => {
        try {
            const res = await fetch(`/api/meetings/schedule?date=${date.toLocaleDateString('en-CA')}`);
            if (res.ok) {
                const data = await res.json();
                setBookedSessions(data);
            }
        } catch (error) {
            console.error("Failed to fetch booked slots:", error);
        }
    };

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDate || !startTime || !endTime) return;

        setIsSubmitting(true);
        try {
            const start = new Date(selectedDate);
            const [sH, sM] = startTime.split(":");
            start.setHours(parseInt(sH), parseInt(sM), 0, 0);

            const end = new Date(selectedDate);
            const [eH, eM] = endTime.split(":");
            end.setHours(parseInt(eH), parseInt(eM), 0, 0);

            const res = await fetch("/api/meetings/schedule", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    numAttendees: parseInt(form.numAttendees) || 0,
                    scheduledDate: start.toISOString(),
                    endDate: end.toISOString()
                }),
            });

            if (res.ok) {
                setSuccess(true);
            } else {
                const errorData = await res.json();
                alert(errorData.error || "Failed to schedule meeting");
            }
        } catch (error) {
            console.error("Failed to schedule:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050608]">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white p-6 text-gray-900">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gray-900/50 backdrop-blur-3xl p-12 rounded-[3.5rem] shadow-2xl text-center max-w-md w-full border border-white/10"
                >
                    <div className="w-24 h-24 bg-emerald-500/10 text-emerald-400 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                        <CheckCircle2 size={48} />
                    </div>
                    <h2 className="text-4xl font-black mb-4 tracking-tight">Booking Finalized!</h2>
                    <p className="text-gray-400 font-medium mb-10 leading-relaxed">Your request for <span className="text-primary font-bold">{form.clubName}</span> is being processed. Expect a confirmation shortly.</p>
                    <button
                        onClick={() => window.location.href = "/"}
                        className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        Return to Hub
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] py-4 px-6 font-poppins relative overflow-x-hidden text-gray-900 flex flex-col justify-center items-center bg-white">
            {/* Subtle Gradient Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-4xl w-full relative z-10"
            >
                <div className="text-center mb-6">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[9px] font-black uppercase tracking-[0.4em] mb-4"
                    >
                        <CalendarCheck size={12} className="text-primary animate-pulse" />
                        Elite Visit System
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 mb-2 leading-none">
                        Schedule <span className="bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent italic">Your Impact</span>
                    </h1>
                    <p className="text-gray-600 text-sm max-w-xl mx-auto font-medium">
                        High-performance interface for elite deployments.
                    </p>
                </div>

                {/* Main Integrated Container */}
                <div className="relative p-[1.5px] rounded-[3rem] group overflow-hidden shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)]">
                    {/* Continuous Border Animation */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_280deg,rgba(var(--primary-rgb),0.5)_360deg)] group-hover:scale-110 transition-transform duration-1000"
                    />

                    <div className="relative bg-white backdrop-blur-3xl rounded-[3rem] overflow-hidden flex flex-col md:flex-row min-h-[580px] border border-gray-200">
                        {/* Interactive Phase Sidebar */}
                        <div className="w-full md:w-72 bg-gray-50 p-4 md:p-8 text-gray-900 flex flex-row md:flex-col justify-between md:justify-start gap-4 md:gap-0 relative border-b md:border-b-0 md:border-r border-gray-200 overflow-x-auto md:overflow-visible scrollbar-hide">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 opacity-20 hidden md:block" />

                            <div className="flex flex-row md:flex-col gap-4 md:gap-0 w-full">
                                <h3 className="text-base md:text-lg font-black mb-0 md:mb-10 tracking-tight flex items-center gap-2 whitespace-nowrap">
                                    <span className="w-6 md:w-8 h-1 bg-primary rounded-full" />
                                    Phase
                                </h3>
                                <div className="flex flex-row md:flex-col md:space-y-8 gap-4 md:gap-0">
                                    {[
                                        { step: 1, title: "Calendar", icon: CalendarIcon },
                                        { step: 2, title: "Timeframe", icon: Clock },
                                        { step: 3, title: "Club Core", icon: Users }
                                    ].map((s) => (
                                        <div key={s.step} className={`flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4 transition-all duration-500 ${step >= s.step ? 'opacity-100' : 'opacity-30'}`}>
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 shrink-0 ${step === s.step ? 'bg-primary text-white shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] scale-110' : step > s.step ? 'bg-emerald-500 text-white' : 'bg-gray-200 border border-gray-300 text-gray-400'}`}>
                                                {step > s.step ? <CheckCircle2 size={18} /> : <s.icon size={18} />}
                                            </div>
                                            <div className="flex flex-col items-center md:items-start">
                                                <span className={`text-[8px] font-black uppercase tracking-[0.3em] ${step === s.step ? 'text-primary' : 'text-gray-600'}`}>0{s.step}</span>
                                                <span className="text-xs md:text-sm font-bold tracking-tight whitespace-nowrap">{s.title}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="hidden md:block p-5 bg-blue-50/50 rounded-[1.5rem] border border-blue-100">
                                <p className="text-[10px] text-gray-600 font-bold leading-relaxed italic">
                                    Finalize cloud docs before deployment.
                                </p>
                            </div>
                        </div>

                        {/* Right Content Area */}
                        <div className="flex-1 p-8 md:p-10">
                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div
                                        initial={{ x: 50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: -50, opacity: 0 }}
                                        key="step1"
                                        className="h-full flex flex-col"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                                            <div className="flex-1">
                                                <h2 className="text-3xl font-black tracking-tighter text-gray-900">Timeline <span className="text-primary italic">.</span></h2>
                                                <p className="text-gray-500 text-[9px] mt-1 font-black uppercase tracking-[0.4em]">Target your Preferred Date</p>
                                            </div>
                                            <div className="flex items-center gap-3 bg-gray-100 p-1.5 rounded-xl border border-gray-200 shadow-sm h-fit">
                                                <button onClick={prevMonth} className="p-2 hover:bg-primary/10 text-gray-700 rounded-lg transition-all active:scale-90"><ChevronLeft size={16} /></button>
                                                <span className="text-[10px] font-black min-w-[110px] text-center uppercase tracking-[0.2em] text-gray-900">
                                                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                                </span>
                                                <button onClick={nextMonth} className="p-2 hover:bg-primary/10 text-gray-700 rounded-lg transition-all active:scale-90"><ChevronRight size={16} /></button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-7 gap-2 mb-6">
                                            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                                                <div key={d} className="text-center text-[9px] font-black uppercase text-gray-600 py-2 tracking-widest">{d}</div>
                                            ))}
                                            {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() }).map((_, i) => <div key={`empty-${i}`} />)}
                                            {Array.from({ length: getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map((_, i) => {
                                                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
                                                const dateStr = date.toDateString();
                                                const isAvailable = availability.includes(dateStr);
                                                const leadTimeDate = new Date();
                                                leadTimeDate.setHours(0, 0, 0, 0);
                                                leadTimeDate.setDate(leadTimeDate.getDate() + 3);
                                                const isTooEarly = date < leadTimeDate;

                                                return (
                                                    <button
                                                        key={i}
                                                        disabled={!isAvailable || isTooEarly}
                                                        onClick={() => {
                                                            setSelectedDate(date);
                                                            setStep(2);
                                                            fetchBookedSessions(date);
                                                        }}
                                                        className={`aspect-square rounded-xl border transition-all duration-300 flex flex-col items-center justify-center relative overflow-hidden group/btn font-black
                                                            ${selectedDate?.toDateString() === dateStr ? 'border-primary bg-primary text-white shadow-[0_10px_20px_rgba(var(--primary-rgb),0.3)] scale-105 z-10' :
                                                                isAvailable && !isTooEarly ? 'border-white/10 bg-white/5 hover:border-primary/40 hover:bg-primary/5 hover:scale-105 active:scale-95' :
                                                                    'border-transparent bg-transparent text-gray-800 cursor-not-allowed opacity-10'}`}
                                                    >
                                                        <span className="text-lg relative z-10">{i + 1}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div className="mt-auto p-4 bg-primary/5 rounded-2xl border border-dashed border-primary/20">
                                            <p className="text-[9px] text-primary-light font-bold text-center italic leading-relaxed uppercase tracking-tighter">
                                                3-day buffer enforced for quality deployments.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div
                                        initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}
                                        key="step2"
                                        className="h-full flex flex-col"
                                    >
                                        <button onClick={() => setStep(1)} className="group/back text-primary text-[9px] font-black uppercase mb-4 flex items-center gap-2 hover:gap-3 transition-all">
                                            <ChevronLeft size={16} /> Re-configure Dates
                                        </button>
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <h2 className="text-3xl font-black tracking-tighter">T-Interval <span className="text-primary">/</span> {selectedDate?.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</h2>
                                                <p className="text-gray-500 text-[9px] mt-1 font-black uppercase tracking-[0.4em]">Initialize Visit Window</p>
                                            </div>
                                            <div className="px-4 py-1.5 bg-primary/10 text-primary text-[9px] font-black uppercase rounded-lg border border-primary/20 tracking-widest shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">09:00 - 19:00 Hub</div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 ml-3">Start Op</label>
                                                    <div className="relative group/input">
                                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/input:text-primary transition-colors" size={18} />
                                                        <input
                                                            type="time"
                                                            value={startTime}
                                                            onChange={e => setStartTime(e.target.value)}
                                                            className="w-full pl-12 pr-6 py-4 bg-white/[0.03] border-2 border-white/10 rounded-2xl text-xl font-black focus:ring-4 ring-primary/10 outline-none transition-all focus:border-primary/40"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 ml-3">End Op</label>
                                                    <div className="relative group/input">
                                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/input:text-primary transition-colors" size={18} />
                                                        <input
                                                            type="time"
                                                            value={endTime}
                                                            onChange={e => setEndTime(e.target.value)}
                                                            className="w-full pl-12 pr-6 py-4 bg-white/[0.03] border-2 border-white/10 rounded-2xl text-xl font-black focus:ring-4 ring-primary/10 outline-none transition-all focus:border-primary/40"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {bookedSessions.length > 0 && (
                                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                                                    <div className="flex items-center gap-2 text-red-500 mb-3 font-black uppercase text-[10px] tracking-[0.2em]">
                                                        <AlertCircle size={16} className="animate-pulse" /> Deployment Interference Detected
                                                    </div>
                                                    <p className="text-[9px] text-red-400/80 mb-3 font-bold uppercase tracking-wider">This time window is already occupied. Select an alternative interval.</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {bookedSessions.map((s, i) => (
                                                            <div key={i} className="px-3 py-1.5 bg-red-500/20 border border-red-500/20 rounded-xl text-[9px] font-black text-red-200">
                                                                {new Date(s.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} - {new Date(s.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}

                                            {(() => {
                                                const start = startTime;
                                                const end = endTime;
                                                const hasConflict = bookedSessions.some(s => {
                                                    const sStart = new Date(s.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                                                    const sEnd = new Date(s.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                                                    return (start < sEnd && end > sStart);
                                                });

                                                return (
                                                    <button
                                                        disabled={hasConflict || !startTime || !endTime || startTime >= endTime}
                                                        onClick={() => setStep(3)}
                                                        className={`w-full py-7 rounded-[2.5rem] font-black text-2xl tracking-tighter transition-all relative overflow-hidden group/next
                                                            ${hasConflict || !startTime || !endTime || startTime >= endTime
                                                                ? 'bg-white/5 text-gray-700 cursor-not-allowed opacity-50'
                                                                : 'bg-primary text-white shadow-[0_30px_60px_-15px_rgba(var(--primary-rgb),0.5)] hover:scale-[1.03] active:scale-[0.97]'}`}
                                                    >
                                                        <span className="relative z-10">{hasConflict ? "Conflict Intercepted" : startTime >= endTime ? "Logical Time Error" : "Proceed to Core Details"}</span>
                                                        <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/next:translate-x-0 transition-transform duration-700" />
                                                    </button>
                                                );
                                            })()}
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div
                                        initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}
                                        key="step3"
                                        className="h-full"
                                    >
                                        <button onClick={() => setStep(2)} className="group/back text-primary text-[9px] font-black uppercase mb-4 flex items-center gap-2 hover:gap-3 transition-all">
                                            <ChevronLeft size={16} /> Re-configure Intervals
                                        </button>
                                        <h2 className="text-3xl font-black tracking-tighter mb-8">Core Logistics <span className="text-primary italic">.</span></h2>
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 ml-3">Mission Type</label>
                                                    <select
                                                        className="w-full p-3.5 bg-white/[0.03] border-2 border-white/10 rounded-xl text-xs font-bold focus:ring-4 ring-primary/10 transition-all focus:border-primary/40 appearance-none outline-none"
                                                        value={form.meetingType}
                                                        onChange={e => setForm({ ...form, meetingType: e.target.value })}
                                                    >
                                                        <option className="bg-gray-900">GRR Visit</option>
                                                        <option className="bg-gray-900">DRR Visit</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 ml-3">Deployment Club</label>
                                                    <input
                                                        required
                                                        className="w-full p-3.5 bg-white/[0.03] border-2 border-white/10 rounded-xl text-xs font-bold focus:ring-4 ring-primary/10 transition-all focus:border-primary/40 outline-none"
                                                        placeholder="e.g. RC Metro"
                                                        value={form.clubName}
                                                        onChange={e => setForm({ ...form, clubName: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 ml-3">Leadership Name</label>
                                                    <input
                                                        className="w-full p-3.5 bg-white/[0.03] border-2 border-white/10 rounded-xl text-xs font-bold focus:ring-4 ring-primary/10 transition-all focus:border-primary/40 outline-none"
                                                        placeholder="Full Name"
                                                        value={form.presidentName}
                                                        onChange={e => setForm({ ...form, presidentName: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 ml-3">Secure Contact</label>
                                                    <input
                                                        required
                                                        className="w-full p-3.5 bg-white/[0.03] border-2 border-white/10 rounded-xl text-xs font-bold focus:ring-4 ring-primary/10 transition-all focus:border-primary/40 outline-none"
                                                        placeholder="91XXXXXXXXXX"
                                                        value={form.mobileNumber}
                                                        onChange={e => setForm({ ...form, mobileNumber: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 ml-3">Primary HQ (Venue)</label>
                                                    <input
                                                        required
                                                        className="w-full p-3.5 bg-white/[0.03] border-2 border-white/10 rounded-xl text-xs font-bold focus:ring-4 ring-primary/10 transition-all focus:border-primary/40 outline-none"
                                                        placeholder="Main Venue"
                                                        value={form.venue}
                                                        onChange={e => setForm({ ...form, venue: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 ml-3">Tactical Details</label>
                                                    <input
                                                        className="w-full p-3.5 bg-white/[0.03] border-2 border-white/10 rounded-xl text-xs font-bold focus:ring-4 ring-primary/10 transition-all focus:border-primary/40 outline-none"
                                                        placeholder="Location Intel"
                                                        value={form.venueDetails}
                                                        onChange={e => setForm({ ...form, venueDetails: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 ml-3">Document Intel (Drive)</label>
                                                <div className="relative group/drive">
                                                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/drive:text-primary transition-colors" size={16} />
                                                    <input
                                                        className="w-full pl-12 pr-6 py-3.5 bg-white/[0.03] border-2 border-white/10 rounded-2xl text-xs font-bold focus:ring-4 ring-primary/10 transition-all focus:border-primary/40 outline-none"
                                                        placeholder="https://drive.google.com/..."
                                                        value={form.driveLink}
                                                        onChange={e => setForm({ ...form, driveLink: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                disabled={isSubmitting}
                                                className="w-full py-5 bg-white text-black rounded-2xl font-black text-lg shadow-[0_20px_40px_-10px_rgba(255,255,255,0.1)] hover:scale-[1.03] active:scale-[0.97] transition-all disabled:opacity-50 flex items-center justify-center gap-3 group/submit"
                                            >
                                                {isSubmitting ? (
                                                    <><Loader2 className="animate-spin" size={20} /> Deploying Intel...</>
                                                ) : (
                                                    <><Zap className="text-primary group-hover/submit:scale-125 transition-transform duration-500" size={20} /> Confirm Deployment</>
                                                )}
                                            </button>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
