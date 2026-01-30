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
            <div className="min-h-screen flex items-center justify-center bg-[#050608] p-6 text-white">
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
        <div className="min-h-screen bg-[#000] py-20 px-6 font-poppins relative overflow-hidden text-white">
            {/* Cinematic Video Background */}
            <div className="absolute inset-0 -z-20 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-black/60 z-10" /> {/* Cinematic Overlay */}
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute min-w-full min-h-full object-cover opacity-50 grayscale-[20%] brightness-[40%] scale-110"
                >
                    <source src="https://assets.mixkit.co/videos/preview/mixkit-abstract-purple-and-blue-colors-flowing-33824-large.mp4" type="video/mp4" />
                </video>
            </div>

            {/* Glowing Depth Layers */}
            <div className="absolute inset-0 -z-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/20 to-transparent opacity-30" />
                <motion.div
                    animate={{
                        opacity: [0.3, 0.5, 0.3],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/20 blur-[150px] rounded-full"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-4xl mx-auto relative z-10"
            >
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="inline-flex items-center gap-3 px-6 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-10 backdrop-blur-md shadow-[0_0_40px_rgba(var(--primary-rgb),0.2)]"
                    >
                        <CalendarCheck size={16} className="text-primary animate-pulse" />
                        Elite Visit System
                    </motion.div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 leading-none">
                        Schedule <br />
                        <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent italic">Your Impact .</span>
                    </h1>
                    <p className="text-gray-400 text-xl max-w-2xl mx-auto font-medium leading-relaxed opacity-70">
                        A high-performance interface for high-performance Rotaractors.
                    </p>
                </div>

                {/* Main Integrated Container with Glow Border */}
                <div className="relative p-[1.5px] rounded-[4rem] group overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
                    {/* Continuous Border Animation */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_280deg,rgba(var(--primary-rgb),0.8)_360deg)] group-hover:scale-110 transition-transform duration-1000"
                    />

                    <div className="relative bg-[#0a0b0e]/95 backdrop-blur-3xl rounded-[4rem] overflow-hidden flex flex-col md:flex-row min-h-[750px] border border-white/5">
                        {/* Interactive Left Sidebar */}
                        <div className="w-full md:w-85 bg-black p-12 text-white flex flex-col justify-between relative border-r border-white/5">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 opacity-20" />

                            <div>
                                <h3 className="text-2xl font-black mb-14 tracking-tight flex items-center gap-3 group/sidebar">
                                    <span className="w-10 h-1 bg-primary rounded-full group-hover/sidebar:w-16 transition-all duration-500" />
                                    Phase
                                </h3>
                                <div className="space-y-12">
                                    {[
                                        { step: 1, title: "Calendar", icon: CalendarIcon },
                                        { step: 2, title: "Timeframe", icon: Clock },
                                        { step: 3, title: "Club Core", icon: Users }
                                    ].map((s) => (
                                        <div key={s.step} className={`flex items-center gap-6 transition-all duration-700 ${step >= s.step ? 'opacity-100' : 'opacity-20 translate-x-4'}`}>
                                            <div className={`w-14 h-14 rounded-3xl flex items-center justify-center transition-all duration-700 ${step === s.step ? 'bg-primary text-white shadow-[0_0_40px_rgba(var(--primary-rgb),0.5)] scale-110' : step > s.step ? 'bg-emerald-500 text-white' : 'bg-white/5 border border-white/10'}`}>
                                                {step > s.step ? <CheckCircle2 size={24} /> : <s.icon size={24} />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${step === s.step ? 'text-primary' : 'text-gray-600'}`}>0{s.step}</span>
                                                <span className="text-lg font-bold tracking-tight">{s.title}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 group-hover:bg-primary/5 transition-all duration-700">
                                <div className="flex items-center gap-3 text-primary-light mb-4">
                                    <AlertCircle size={18} className="animate-bounce" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">System Notice</span>
                                </div>
                                <p className="text-xs text-gray-500 font-bold leading-relaxed">
                                    Finalize all cloud documents before hitting the deploy button.
                                </p>
                            </div>
                        </div>

                        {/* High-Contrast Right Content */}
                        <div className="flex-1 p-12 md:p-16 bg-gradient-to-br from-white/[0.02] to-transparent">
                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div
                                        initial={{ x: 50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: -50, opacity: 0 }}
                                        key="step1"
                                        className="h-full flex flex-col"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
                                            <div className="flex-1">
                                                <h2 className="text-4xl font-black tracking-tighter">Timeline <span className="text-primary italic">.</span></h2>
                                                <p className="text-gray-500 text-[10px] mt-2 font-black uppercase tracking-[0.4em]">Target your Preferred Date</p>
                                            </div>
                                            <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-2xl shadow-xl">
                                                <button onClick={prevMonth} className="p-3 hover:bg-primary/20 text-white rounded-xl transition-all active:scale-90"><ChevronLeft size={20} /></button>
                                                <span className="text-xs font-black min-w-[130px] text-center uppercase tracking-[0.2em] text-white">
                                                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                                </span>
                                                <button onClick={nextMonth} className="p-3 hover:bg-primary/20 text-white rounded-xl transition-all active:scale-90"><ChevronRight size={20} /></button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-7 gap-4 mb-12">
                                            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                                                <div key={d} className="text-center text-[10px] font-black uppercase text-gray-600 py-3 tracking-widest">{d}</div>
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
                                                        className={`aspect-square rounded-[1.5rem] border-2 transition-all duration-500 flex flex-col items-center justify-center relative overflow-hidden group/btn font-black
                                                            ${selectedDate?.toDateString() === dateStr ? 'border-primary bg-primary text-white shadow-[0_15px_35px_rgba(var(--primary-rgb),0.4)] scale-110 z-10' :
                                                                isAvailable && !isTooEarly ? 'border-white/10 bg-white/5 hover:border-primary/50 hover:bg-primary/5 hover:scale-105 active:scale-95' :
                                                                    'border-transparent bg-transparent text-gray-800 cursor-not-allowed opacity-20'}`}
                                                    >
                                                        <span className="text-2xl relative z-10">{i + 1}</span>
                                                        {isAvailable && !isTooEarly && (
                                                            <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div className="mt-auto p-6 bg-primary/5 rounded-[2.5rem] border border-dashed border-primary/20 backdrop-blur-md">
                                            <p className="text-[11px] text-primary-light font-bold text-center italic leading-relaxed uppercase tracking-tighter">
                                                Dates are dynamically unlocked. 3-day buffer enforced for quality deployments.
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
                                        <button onClick={() => setStep(1)} className="group/back text-primary text-[10px] font-black uppercase mb-8 flex items-center gap-2 hover:gap-3 transition-all">
                                            <ChevronLeft size={18} /> Re-configure Dates
                                        </button>
                                        <div className="flex items-center justify-between mb-16">
                                            <div>
                                                <h2 className="text-4xl font-black tracking-tighter">T-Interval <span className="text-primary">/</span> {selectedDate?.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</h2>
                                                <p className="text-gray-500 text-[10px] mt-2 font-black uppercase tracking-[0.4em]">Initialize Visit Window</p>
                                            </div>
                                            <div className="px-5 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-xl border border-primary/20 tracking-widest shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">09:00 - 19:00 Hub</div>
                                        </div>

                                        <div className="space-y-12">
                                            <div className="grid grid-cols-2 gap-10">
                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 ml-4">Start Op</label>
                                                    <div className="relative group/input">
                                                        <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/input:text-primary transition-colors" size={24} />
                                                        <input
                                                            type="time"
                                                            value={startTime}
                                                            onChange={e => setStartTime(e.target.value)}
                                                            className="w-full pl-16 pr-8 py-6 bg-white/[0.03] border-2 border-white/10 rounded-[2rem] text-3xl font-black focus:ring-4 ring-primary/10 outline-none transition-all focus:border-primary/40 focus:bg-primary/[0.02]"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 ml-4">End Op</label>
                                                    <div className="relative group/input">
                                                        <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/input:text-primary transition-colors" size={24} />
                                                        <input
                                                            type="time"
                                                            value={endTime}
                                                            onChange={e => setEndTime(e.target.value)}
                                                            className="w-full pl-16 pr-8 py-6 bg-white/[0.03] border-2 border-white/10 rounded-[2rem] text-3xl font-black focus:ring-4 ring-primary/10 outline-none transition-all focus:border-primary/40 focus:bg-primary/[0.02]"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {bookedSessions.length > 0 && (
                                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-8 bg-red-500/5 rounded-[2.5rem] border border-red-500/20">
                                                    <div className="flex items-center gap-3 text-red-500 mb-6 font-black uppercase text-xs tracking-[0.2em] animate-pulse">
                                                        <AlertCircle size={20} /> Sector Conflicts Detected
                                                    </div>
                                                    <div className="flex flex-wrap gap-4">
                                                        {bookedSessions.map((s, i) => (
                                                            <div key={i} className="px-5 py-3 bg-red-500/10 border border-red-500/10 rounded-2xl text-[10px] font-black text-red-400">
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
                                        <button onClick={() => setStep(2)} className="group/back text-primary text-[10px] font-black uppercase mb-10 flex items-center gap-2 hover:gap-3 transition-all">
                                            <ChevronLeft size={18} /> Re-configure Intervals
                                        </button>
                                        <h2 className="text-4xl font-black tracking-tighter mb-12">Core Logistics <span className="text-primary italic">.</span></h2>
                                        <form onSubmit={handleSubmit} className="space-y-8">
                                            <div className="grid grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 ml-4">Mission Type</label>
                                                    <select
                                                        className="w-full p-5 bg-white/[0.03] border-2 border-white/10 rounded-2xl text-sm font-bold focus:ring-4 ring-primary/10 transition-all focus:border-primary/40 appearance-none outline-none"
                                                        value={form.meetingType}
                                                        onChange={e => setForm({ ...form, meetingType: e.target.value })}
                                                    >
                                                        <option className="bg-gray-900">GRR Visit</option>
                                                        <option className="bg-gray-900">DRR Visit</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 ml-4">Deployment Club</label>
                                                    <input
                                                        required
                                                        className="w-full p-5 bg-white/[0.03] border-2 border-white/10 rounded-2xl text-sm font-bold focus:ring-4 ring-primary/10 transition-all focus:border-primary/40 outline-none"
                                                        placeholder="e.g. RC Metro"
                                                        value={form.clubName}
                                                        onChange={e => setForm({ ...form, clubName: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 ml-4">Leadership Name</label>
                                                    <input
                                                        className="w-full p-5 bg-white/[0.03] border-2 border-white/10 rounded-2xl text-sm font-bold focus:ring-4 ring-primary/10 transition-all focus:border-primary/40 outline-none"
                                                        placeholder="Full Name"
                                                        value={form.presidentName}
                                                        onChange={e => setForm({ ...form, presidentName: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 ml-4">Secure Contact</label>
                                                    <input
                                                        required
                                                        className="w-full p-5 bg-white/[0.03] border-2 border-white/10 rounded-2xl text-sm font-bold focus:ring-4 ring-primary/10 transition-all focus:border-primary/40 outline-none"
                                                        placeholder="91XXXXXXXXXX"
                                                        value={form.mobileNumber}
                                                        onChange={e => setForm({ ...form, mobileNumber: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 ml-4">Primary HQ (Venue)</label>
                                                    <input
                                                        required
                                                        className="w-full p-5 bg-white/[0.03] border-2 border-white/10 rounded-2xl text-sm font-bold focus:ring-4 ring-primary/10 transition-all focus:border-primary/40 outline-none"
                                                        placeholder="Main Venue"
                                                        value={form.venue}
                                                        onChange={e => setForm({ ...form, venue: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 ml-4">Tactical Details (Room/Floor)</label>
                                                    <input
                                                        className="w-full p-5 bg-white/[0.03] border-2 border-white/10 rounded-2xl text-sm font-bold focus:ring-4 ring-primary/10 transition-all focus:border-primary/40 outline-none"
                                                        placeholder="Location Intel"
                                                        value={form.venueDetails}
                                                        onChange={e => setForm({ ...form, venueDetails: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 ml-4">Document Intel (Drive)</label>
                                                <div className="relative group/drive">
                                                    <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/drive:text-primary transition-colors" size={20} />
                                                    <input
                                                        className="w-full pl-16 pr-8 py-5 bg-white/[0.03] border-2 border-white/10 rounded-[2rem] text-sm font-bold focus:ring-4 ring-primary/10 transition-all focus:border-primary/40 outline-none"
                                                        placeholder="https://drive.google.com/..."
                                                        value={form.driveLink}
                                                        onChange={e => setForm({ ...form, driveLink: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                disabled={isSubmitting}
                                                className="w-full py-8 bg-white text-black rounded-[3rem] font-black text-2xl shadow-[0_40px_80px_-20px_rgba(255,255,255,0.1)] hover:scale-[1.03] active:scale-[0.97] transition-all disabled:opacity-50 flex items-center justify-center gap-4 group/submit"
                                            >
                                                {isSubmitting ? (
                                                    <><Loader2 className="animate-spin" size={24} /> Deploying Intel...</>
                                                ) : (
                                                    <><Zap className="text-primary group-hover/submit:scale-125 transition-transform duration-500" size={24} /> Confirm Deployment</>
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
