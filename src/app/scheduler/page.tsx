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
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
}

export default function MeetingScheduler() {
    const [step, setStep] = useState(1);
    const [availability, setAvailability] = useState<Availability[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [form, setForm] = useState({
        meetingType: "GRR Visit",
        clubName: "",
        numAttendees: "",
        notes: "",
        presidentName: "",
        mobileNumber: "",
        driveLink: ""
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
                setAvailability(data);
            }
        } catch (error) {
            console.error("Failed to fetch availability:", error);
        } finally {
            setLoading(false);
        }
    };

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // Generate dates for the next 30 days
    const availableDates = Array.from({ length: 30 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i + 1); // Start from tomorrow
        return d;
    }).filter(d => {
        const av = availability.find(a => a.dayOfWeek === d.getDay());
        return av?.isAvailable;
    });

    const slots = [
        "10:00 - 12:00",
        "13:00 - 15:00",
        "16:00 - 18:00"
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDate || !selectedSlot) return;

        setIsSubmitting(true);
        try {
            const startTime = selectedSlot.split(" - ")[0];
            const finalDate = new Date(selectedDate);
            const [hours, minutes] = startTime.split(":");
            finalDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            const res = await fetch("/api/meetings/schedule", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    numAttendees: parseInt(form.numAttendees) || 0,
                    scheduledDate: finalDate.toISOString()
                }),
            });

            if (res.ok) {
                setSuccess(true);
                // WhatsApp redirect
                const text = `Hi, I've scheduled a ${form.meetingType} for ${form.clubName} on ${finalDate.toLocaleDateString()} at ${selectedSlot}.`;
                setTimeout(() => {
                    window.open(`https://wa.me/91XXXXXXXXXX?text=${encodeURIComponent(text)}`, "_blank");
                }, 2000);
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
                    <p className="text-gray-500 font-medium mb-8">Your meeting request for <span className="text-primary font-bold">{form.clubName}</span> has been submitted. Redirecting to WhatsApp for confirmation...</p>
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
                                    <h2 className="text-2xl font-black mb-8 flex items-center gap-2">Choose a Date <span className="text-primary">.</span></h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto max-h-[400px] pr-2 scrollbar-hide">
                                        {availableDates.map((date) => (
                                            <button
                                                key={date.getTime()}
                                                onClick={() => { setSelectedDate(date); setStep(2); }}
                                                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${selectedDate?.toDateString() === date.toDateString() ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-primary/30 hover:bg-gray-50'}`}
                                            >
                                                <span className="text-[10px] font-black uppercase text-gray-400">{days[date.getDay()]}</span>
                                                <span className="text-2xl font-black text-gray-900">{date.getDate()}</span>
                                                <span className="text-[10px] font-black text-primary uppercase">{date.toLocaleString('default', { month: 'short' })}</span>
                                            </button>
                                        ))}
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
                                    <h2 className="text-2xl font-black mb-8">Available Slots <span className="text-primary">/</span> {selectedDate?.toLocaleDateString()}</h2>
                                    <div className="space-y-4">
                                        {slots.map((slot) => (
                                            <button
                                                key={slot}
                                                onClick={() => { setSelectedSlot(slot); setStep(3); }}
                                                className={`w-full p-6 rounded-3xl border-2 flex items-center justify-between transition-all ${selectedSlot === slot ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-primary/30 hover:bg-gray-50'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedSlot === slot ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-100 text-gray-400'}`}>
                                                        <Clock size={20} />
                                                    </div>
                                                    <span className="text-lg font-bold text-gray-900">{slot}</span>
                                                </div>
                                                <ChevronRight className={selectedSlot === slot ? 'text-primary' : 'text-gray-300'} />
                                            </button>
                                        ))}
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
