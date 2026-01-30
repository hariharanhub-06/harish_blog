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
    AlertCircle
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
        <div className="min-h-screen bg-[#fafbfc] py-20 px-6 font-poppins">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest mb-6"
                    >
                        <CalendarCheck size={14} />
                        Official Visit Scheduler
                    </motion.div>
                    <h1 className="text-5xl font-black tracking-tight text-gray-900 mb-4">Book Your <span className="text-primary">Official Visit</span></h1>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">Select a slot and provide your club details to schedule a GRR or DRR visit.</p>
                </div>

                <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                    {/* Left Sidebar - Steps */}
                    <div className="w-full md:w-80 bg-gray-900 p-10 text-white flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-bold mb-10">Steps</h3>
                            <div className="space-y-8">
                                {[
                                    { step: 1, title: "Select Date", icon: CalendarIcon },
                                    { step: 2, title: "Pick a Slot", icon: Clock },
                                    { step: 3, title: "Club Details", icon: Users }
                                ].map((s) => (
                                    <div key={s.step} className={`flex items-center gap-4 transition-all ${step === s.step ? 'opacity-100 translate-x-2' : 'opacity-40'}`}>
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black ${step === s.step ? 'bg-primary text-white shadow-lg shadow-primary/40' : 'bg-white/10'}`}>
                                            <s.icon size={18} />
                                        </div>
                                        <span className="font-bold text-sm tracking-tight">{s.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                            <div className="flex items-center gap-2 text-primary mb-2">
                                <AlertCircle size={14} />
                                <span className="text-[10px] font-black uppercase">Note</span>
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium leading-relaxed">Ensure all relevant documents are ready in your Drive link before the visit.</p>
                        </div>
                    </div>

                    {/* Right Side - Content */}
                    <div className="flex-1 p-10 md:p-14">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    key="step1"
                                    className="h-full flex flex-col"
                                >
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-2xl font-black flex items-center gap-2">Choose a Date <span className="text-primary">.</span></h2>
                                        <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                                            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ChevronLeft size={16} /></button>
                                            <span className="text-xs font-black min-w-[100px] text-center uppercase tracking-widest text-gray-500">
                                                {currentMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}
                                            </span>
                                            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ChevronRight size={16} /></button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-7 gap-1 mb-4">
                                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                                            <div key={d} className="text-center text-[8px] font-black uppercase text-gray-300 py-2">{d}</div>
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
                                                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center
                                                        ${selectedDate?.toDateString() === dateStr ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20 scale-105 z-10' :
                                                            isAvailable && !isTooEarly ? 'border-gray-50 bg-gray-50 text-gray-900 hover:border-primary/30 hover:bg-white' :
                                                                'border-transparent bg-transparent text-gray-200 cursor-not-allowed opacity-50'}`}
                                                >
                                                    <span className="text-lg font-black">{i + 1}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-auto p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <p className="text-[10px] text-gray-400 font-medium text-center italic">Dates are enabled based on official availability. Minimum 3-day lead time required.</p>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                                    key="step2"
                                    className="h-full flex flex-col"
                                >
                                    <button onClick={() => setStep(1)} className="text-primary text-xs font-black uppercase mb-4 flex items-center gap-1">
                                        <ChevronLeft size={14} /> Back
                                    </button>
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-2xl font-black">Set Time <span className="text-primary">/</span> {selectedDate?.toLocaleDateString('en-GB')}</h2>
                                        <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-lg">Available: 09:00 - 19:00</div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Start Time</label>
                                                <input
                                                    type="time"
                                                    min="09:00"
                                                    max="18:00"
                                                    value={startTime}
                                                    onChange={e => setStartTime(e.target.value)}
                                                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-xl font-black focus:ring-2 ring-primary/20 outline-none transition-all focus:border-primary/30"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">End Time</label>
                                                <input
                                                    type="time"
                                                    min="10:00"
                                                    max="19:00"
                                                    value={endTime}
                                                    onChange={e => setEndTime(e.target.value)}
                                                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-xl font-black focus:ring-2 ring-primary/20 outline-none transition-all focus:border-primary/30"
                                                />
                                            </div>
                                        </div>

                                        {bookedSessions.length > 0 && (
                                            <div className="p-6 bg-red-50 rounded-3xl border border-red-100">
                                                <div className="flex items-center gap-2 text-red-600 mb-3">
                                                    <AlertCircle size={16} />
                                                    <span className="text-xs font-black uppercase">Booked Intervals Today</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {bookedSessions.map((s, i) => (
                                                        <div key={i} className="px-3 py-1 bg-white border border-red-200 rounded-lg text-[10px] font-bold text-red-500">
                                                            {new Date(s.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} - {new Date(s.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
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
                                                    className={`w-full py-5 rounded-[1.5rem] font-black text-lg transition-all
                                                        ${hasConflict || !startTime || !endTime || startTime >= endTime
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            : 'bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99]'}`}
                                                >
                                                    {hasConflict ? "Time Already Booked" : startTime >= endTime ? "Invalid Time Range" : "Next Step"}
                                                </button>
                                            );
                                        })()}
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                                    key="step3"
                                    className="h-full"
                                >
                                    <button onClick={() => setStep(2)} className="text-primary text-xs font-black uppercase mb-4 flex items-center gap-1">
                                        <ChevronLeft size={14} /> Back
                                    </button>
                                    <h2 className="text-2xl font-black mb-8">Club Details <span className="text-primary">.</span></h2>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Visit Type</label>
                                                <select
                                                    className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 ring-primary/20"
                                                    value={form.meetingType}
                                                    onChange={e => setForm({ ...form, meetingType: e.target.value })}
                                                >
                                                    <option>GRR Visit</option>
                                                    <option>DRR Visit</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Club Name</label>
                                                <input
                                                    required
                                                    className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 ring-primary/20"
                                                    placeholder="e.g. RC Metro"
                                                    value={form.clubName}
                                                    onChange={e => setForm({ ...form, clubName: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">President Name</label>
                                                <input
                                                    className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 ring-primary/20"
                                                    placeholder="Full Name"
                                                    value={form.presidentName}
                                                    onChange={e => setForm({ ...form, presidentName: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">WhatsApp Number</label>
                                                <input
                                                    required
                                                    className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 ring-primary/20"
                                                    placeholder="91XXXXXXXXXX"
                                                    value={form.mobileNumber}
                                                    onChange={e => setForm({ ...form, mobileNumber: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Venue</label>
                                                <input
                                                    required
                                                    className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 ring-primary/20"
                                                    placeholder="Meeting Venue"
                                                    value={form.venue}
                                                    onChange={e => setForm({ ...form, venue: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Venue Details</label>
                                                <input
                                                    className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 ring-primary/20"
                                                    placeholder="Building/Floor/Room"
                                                    value={form.venueDetails}
                                                    onChange={e => setForm({ ...form, venueDetails: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Drive Link (Docs)</label>
                                            <input
                                                className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 ring-primary/20"
                                                placeholder="https://drive.google.com/..."
                                                value={form.driveLink}
                                                onChange={e => setForm({ ...form, driveLink: e.target.value })}
                                            />
                                        </div>

                                        <button
                                            disabled={isSubmitting}
                                            className="w-full py-5 bg-primary text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                                        >
                                            {isSubmitting ? "Processing..." : "Confirm Schedule"}
                                        </button>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
