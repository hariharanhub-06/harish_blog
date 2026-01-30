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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white p-12 rounded-[3rem] shadow-2xl text-center max-w-md w-full border border-gray-100"
                >
                    <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 size={48} />
                    </div>
                    <h2 className="text-3xl font-black mb-4">Request Sent!</h2>
                    <p className="text-gray-500 font-medium mb-8">Your meeting request for <span className="text-primary font-bold">{form.clubName}</span> has been submitted successfully. Our team will review and confirm your visit shortly.</p>
                    <button
                        onClick={() => window.location.href = "/"}
                        className="text-primary font-bold hover:underline"
                    >
                        Back to Home
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafbfc] py-20 px-6 font-poppins relative overflow-hidden">
            {/* Cinematic Floating Background Shapes */}
            <div className="absolute inset-0 -z-10 pointer-events-none opacity-40">
                {/* Large Blurred Blobs */}
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={`blob-${i}`}
                        className="absolute w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]"
                        animate={{
                            x: [Math.random() * 100 - 50, Math.random() * 100 - 50],
                            y: [Math.random() * 100 - 50, Math.random() * 100 - 50],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 10 + i * 2,
                            repeat: Infinity,
                            repeatType: "reverse",
                        }}
                        style={{
                            left: `${(i * 25) % 100}%`,
                            top: `${(i * 30) % 100}%`,
                        }}
                    />
                ))}

                {/* Shifting Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

                {/* Floating Geometric Icons */}
                {[...Array(12)].map((_, i) => {
                    const icons = [Star, Sparkles, CalendarIcon, Users, Zap, Clock];
                    const Icon = icons[i % icons.length];
                    return (
                        <motion.div
                            key={`icon-${i}`}
                            className="absolute text-primary/10"
                            animate={{
                                y: [-20, 20, -20],
                                rotate: [0, 90, 180, 270, 360],
                                scale: [0.8, 1.2, 0.8],
                                opacity: [0.2, 0.5, 0.2]
                            }}
                            transition={{
                                duration: 8 + i,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                            }}
                        >
                            <Icon size={20 + (i % 3) * 10} />
                        </motion.div>
                    );
                })}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="max-w-4xl mx-auto relative z-10"
            >
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-primary/20 backdrop-blur-sm shadow-xl shadow-primary/5"
                    >
                        <CalendarCheck size={14} className="animate-pulse" />
                        Official Visit Scheduler
                    </motion.div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight text-gray-900 mb-4 drop-shadow-sm">
                        Book Your <span className="text-primary relative inline-block">Official Visit
                            <motion.span
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 0.8, delay: 0.8 }}
                                className="absolute bottom-1 left-0 h-2 bg-primary/10 -z-10 rounded-full"
                            />
                        </span>
                    </h1>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
                        Select a slot and provide your club details to schedule a GRR or DRR visit with precision.
                    </p>
                </div>

                <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/40 overflow-hidden flex flex-col md:flex-row min-h-[650px] group transition-all duration-700 hover:shadow-[0_48px_80px_-20px_rgba(0,0,0,0.15)]">
                    {/* Left Sidebar - Steps */}
                    <div className="w-full md:w-80 bg-gray-950 p-10 text-white flex flex-col justify-between relative overflow-hidden">
                        {/* Animated gradient accent for sidebar */}
                        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-primary/0 via-primary/50 to-primary/0 opactiy-20" />

                        <div>
                            <h3 className="text-xl font-bold mb-10 tracking-tight flex items-center gap-2">
                                <span className="w-8 h-1 bg-primary rounded-full" />
                                Progress
                            </h3>
                            <div className="space-y-10">
                                {[
                                    { step: 1, title: "Select Date", icon: CalendarIcon },
                                    { step: 2, title: "Pick a Slot", icon: Clock },
                                    { step: 3, title: "Club Details", icon: Users }
                                ].map((s) => (
                                    <div key={s.step} className={`flex items-center gap-5 transition-all duration-500 ${step >= s.step ? 'opacity-100 translate-x-1' : 'opacity-30'}`}>
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-500 ${step === s.step ? 'bg-primary text-white shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)] scale-110' : step > s.step ? 'bg-emerald-500 text-white' : 'bg-white/5 border border-white/10'}`}>
                                            {step > s.step ? <CheckCircle2 size={20} /> : <s.icon size={20} />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${step === s.step ? 'text-primary' : 'text-gray-500'}`}>Step {s.step}</span>
                                            <span className="font-bold text-base mt-0.5">{s.title}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-sm group-hover:border-primary/20 transition-colors">
                            <div className="flex items-center gap-2 text-primary mb-3">
                                <AlertCircle size={16} className="animate-bounce" />
                                <span className="text-[10px] font-black uppercase tracking-wider">Crucial Note</span>
                            </div>
                            <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                                Please ensure all mandatory documents are uploaded to your Drive before confirming.
                            </p>
                        </div>
                    </div>

                    {/* Right Side - Content */}
                    <div className="flex-1 p-10 md:p-14 bg-gradient-to-br from-white/50 to-white/90">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    initial={{ x: 30, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -30, opacity: 0 }}
                                    key="step1"
                                    className="h-full flex flex-col"
                                >
                                    <div className="flex items-center justify-between mb-10">
                                        <div>
                                            <h2 className="text-3xl font-black tracking-tight">Timeline Selection <span className="text-primary animate-pulse">.</span></h2>
                                            <p className="text-gray-400 text-xs mt-1 font-bold uppercase tracking-widest">Pick your preferred visit date</p>
                                        </div>
                                        <div className="flex items-center gap-3 bg-gray-50/80 backdrop-blur-sm p-2 rounded-2xl border border-gray-100 shadow-sm">
                                            <button onClick={prevMonth} className="p-2.5 hover:bg-white rounded-xl transition-all hover:shadow-md active:scale-95"><ChevronLeft size={18} /></button>
                                            <span className="text-[10px] font-black min-w-[110px] text-center uppercase tracking-[0.15em] text-gray-700">
                                                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                            </span>
                                            <button onClick={nextMonth} className="p-2.5 hover:bg-white rounded-xl transition-all hover:shadow-md active:scale-95"><ChevronRight size={18} /></button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-7 gap-3 mb-8">
                                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                                            <div key={d} className="text-center text-[10px] font-black uppercase text-gray-300 py-2 tracking-widest">{d}</div>
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
                                                    className={`aspect-square rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center group/btn relative overflow-hidden
                                                        ${selectedDate?.toDateString() === dateStr ? 'border-primary bg-primary text-white shadow-[0_12px_24px_-8px_rgba(var(--primary-rgb),0.5)] scale-105 z-10' :
                                                            isAvailable && !isTooEarly ? 'border-gray-50 bg-white shadow-sm text-gray-900 hover:border-primary/40 hover:scale-105 active:scale-95' :
                                                                'border-transparent bg-transparent text-gray-200 cursor-not-allowed opacity-40'}`}
                                                >
                                                    <span className="text-xl font-black relative z-10">{i + 1}</span>
                                                    {isAvailable && !isTooEarly && selectedDate?.toDateString() !== dateStr && (
                                                        <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover/btn:translate-y-0 transition-transform" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-auto p-5 bg-primary/5 rounded-[2rem] border border-dashed border-primary/20 backdrop-blur-sm">
                                        <p className="text-[11px] text-primary/60 font-bold text-center italic leading-relaxed">
                                            Dates are dynamically enabled based on officer availability. <br />
                                            A standard 3-day buffer is maintained for quality logistics.
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }}
                                    key="step2"
                                    className="h-full flex flex-col"
                                >
                                    <button onClick={() => setStep(1)} className="group/back text-primary text-[10px] font-black uppercase mb-6 flex items-center gap-1.5 hover:gap-2 transition-all w-fit">
                                        <ChevronLeft size={16} /> <span className="tracking-widest">Revisit Dates</span>
                                    </button>
                                    <div className="flex items-center justify-between mb-12">
                                        <div>
                                            <h2 className="text-3xl font-black tracking-tight">Clock In <span className="text-primary">/</span> {selectedDate?.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</h2>
                                            <p className="text-gray-400 text-xs mt-1 font-bold uppercase tracking-widest">Define your visit window</p>
                                        </div>
                                        <div className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-xl border border-primary/10 tracking-widest">Window: 09:00 - 19:00</div>
                                    </div>

                                    <div className="space-y-10">
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 pl-2">Start Time</label>
                                                <div className="relative group/input">
                                                    <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-primary transition-colors" size={20} />
                                                    <input
                                                        type="time"
                                                        min="09:00"
                                                        max="18:00"
                                                        value={startTime}
                                                        onChange={e => setStartTime(e.target.value)}
                                                        className="w-full pl-14 pr-6 py-5 bg-white border-2 border-gray-100 rounded-[1.5rem] text-2xl font-black focus:ring-4 ring-primary/10 outline-none transition-all focus:border-primary/40 shadow-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 pl-2">End Time</label>
                                                <div className="relative group/input">
                                                    <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-primary transition-colors" size={20} />
                                                    <input
                                                        type="time"
                                                        min="10:00"
                                                        max="19:00"
                                                        value={endTime}
                                                        onChange={e => setEndTime(e.target.value)}
                                                        className="w-full pl-14 pr-6 py-5 bg-white border-2 border-gray-100 rounded-[1.5rem] text-2xl font-black focus:ring-4 ring-primary/10 outline-none transition-all focus:border-primary/40 shadow-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {bookedSessions.length > 0 && (
                                            <motion.div
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                className="p-8 bg-red-50/50 backdrop-blur-sm rounded-[2rem] border border-red-100"
                                            >
                                                <div className="flex items-center gap-2.5 text-red-600 mb-5 text-sm font-black uppercase tracking-wider">
                                                    <AlertCircle size={18} className="animate-pulse" />
                                                    Conflict Alerts (Already Booked)
                                                </div>
                                                <div className="flex flex-wrap gap-3">
                                                    {bookedSessions.map((s, i) => (
                                                        <div key={i} className="px-4 py-2 bg-white border border-red-200 rounded-xl text-xs font-black text-red-500 shadow-sm">
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
                                                    className={`w-full py-6 rounded-[2rem] font-black text-xl tracking-tight transition-all relative overflow-hidden group/next
                                                        ${hasConflict || !startTime || !endTime || startTime >= endTime
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            : 'bg-primary text-white shadow-[0_20px_40px_-10px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] active:scale-[0.98]'}`}
                                                >
                                                    <span className="relative z-10">{hasConflict ? "Time Interval Occupied" : startTime >= endTime ? "Invalid Time Span" : "Continue to Logistics"}</span>
                                                    {!hasConflict && startTime < endTime && (
                                                        <div className="absolute inset-0 bg-white/20 translate-x-full group-hover/next:translate-x-0 transition-transform duration-500" />
                                                    )}
                                                </button>
                                            );
                                        })()}
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }}
                                    key="step3"
                                    className="h-full"
                                >
                                    <button onClick={() => setStep(2)} className="group/back text-primary text-[10px] font-black uppercase mb-6 flex items-center gap-1.5 hover:gap-2 transition-all w-fit">
                                        <ChevronLeft size={16} /> <span className="tracking-widest">Revisit Time</span>
                                    </button>
                                    <h2 className="text-3xl font-black tracking-tight mb-10">Logistics & Details <span className="text-primary">.</span></h2>
                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 pl-2">Engagement Type</label>
                                                <select
                                                    className="w-full p-4 bg-white border-2 border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 ring-primary/10 outline-none transition-all focus:border-primary/40 appearance-none shadow-sm"
                                                    value={form.meetingType}
                                                    onChange={e => setForm({ ...form, meetingType: e.target.value })}
                                                >
                                                    <option>GRR Visit</option>
                                                    <option>DRR Visit</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 pl-2">Rotaract Club Name</label>
                                                <input
                                                    required
                                                    className="w-full p-4 bg-white border-2 border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 ring-primary/10 outline-none transition-all focus:border-primary/40 shadow-sm"
                                                    placeholder="e.g. RC Metro South"
                                                    value={form.clubName}
                                                    onChange={e => setForm({ ...form, clubName: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 pl-2">President Name</label>
                                                <input
                                                    className="w-full p-4 bg-white border-2 border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 ring-primary/10 outline-none transition-all focus:border-primary/40 shadow-sm"
                                                    placeholder="Official Full Name"
                                                    value={form.presidentName}
                                                    onChange={e => setForm({ ...form, presidentName: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 pl-2">Coordination Number</label>
                                                <input
                                                    required
                                                    className="w-full p-4 bg-white border-2 border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 ring-primary/10 outline-none transition-all focus:border-primary/40 shadow-sm"
                                                    placeholder="91XXXXXXXXXX"
                                                    value={form.mobileNumber}
                                                    onChange={e => setForm({ ...form, mobileNumber: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 pl-2">Primary Venue</label>
                                                <input
                                                    required
                                                    className="w-full p-4 bg-white border-2 border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 ring-primary/10 outline-none transition-all focus:border-primary/40 shadow-sm"
                                                    placeholder="Main Location"
                                                    value={form.venue}
                                                    onChange={e => setForm({ ...form, venue: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 pl-2">Specific Map/Details</label>
                                                <input
                                                    className="w-full p-4 bg-white border-2 border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 ring-primary/10 outline-none transition-all focus:border-primary/40 shadow-sm"
                                                    placeholder="Floor, Hall Name, Landmark"
                                                    value={form.venueDetails}
                                                    onChange={e => setForm({ ...form, venueDetails: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 pl-2">Centralized Document Link (Drive)</label>
                                            <div className="relative group/drive">
                                                <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/drive:text-primary transition-colors" size={18} />
                                                <input
                                                    className="w-full pl-14 pr-6 py-4 bg-white border-2 border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 ring-primary/10 outline-none transition-all focus:border-primary/40 shadow-sm"
                                                    placeholder="https://drive.google.com/share-id..."
                                                    value={form.driveLink}
                                                    onChange={e => setForm({ ...form, driveLink: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            disabled={isSubmitting}
                                            className="w-full py-6 bg-gray-900 text-white rounded-[2rem] font-black text-xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 group/submit"
                                        >
                                            {isSubmitting ? (
                                                <><Loader2 className="animate-spin" size={20} /> Deploying Request...</>
                                            ) : (
                                                <><CheckCircle2 className="group-hover/submit:scale-125 transition-transform" size={20} /> Finalize Booking</>
                                            )}
                                        </button>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
