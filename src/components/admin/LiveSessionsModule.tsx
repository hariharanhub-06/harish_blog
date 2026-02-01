import { useState, useEffect } from "react";
import {
    Calendar,
    Search,
    MoreVertical,
    Clock,
    Plus,
    Trash2,
    Video,
    Users,
    IndianRupee,
    Globe,
    Loader2,
    Link as LinkIcon,
    Edit,
    Check,
    X,
    Eye,
    ExternalLink,
    Mail as MailIcon,
    MessageSquare,
    Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SessionCreateEditModal from "./SessionCreateEditModal";

interface Registration {
    id: string;
    userName: string;
    userEmail: string;
    userMobile?: string;
    status: string;
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
    registeredAt: string;
}

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
    createdAt: string;
    registrations?: Registration[];
}

export default function LiveSessionsModule() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal State
    const [editingSession, setEditingSession] = useState<Session | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [viewingRegistrations, setViewingRegistrations] = useState<Session | null>(null);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loadingRegistrations, setLoadingRegistrations] = useState(false);
    const [resending, setResending] = useState(false);
    const [searchRegistrations, setSearchRegistrations] = useState("");

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await fetch("/api/sessions/admin");
            if (res.ok) {
                const data = await res.json();
                setSessions(data);
            }
        } catch (error) {
            console.error("Failed to fetch sessions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSession = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this session?")) return;
        try {
            const res = await fetch(`/api/sessions/admin?id=${id}`, {
                method: "DELETE",
            });
            if (res.ok) fetchSessions();
        } catch (error) {
            console.error("Failed to delete session:", error);
        }
    };

    const fetchRegistrations = async (sessionId: string) => {
        setLoadingRegistrations(true);
        try {
            const res = await fetch(`/api/sessions/admin/registrations?sessionId=${sessionId}`);
            if (res.ok) {
                const data = await res.json();
                setRegistrations(data);
            }
        } catch (error) {
            console.error("Failed to fetch registrations", error);
        } finally {
            setLoadingRegistrations(false);
        }
    };

    const handleOpenRegistrations = (session: Session) => {
        setViewingRegistrations(session);
        fetchRegistrations(session.id);
    };

    const handleResendEmails = async () => {
        if (!viewingRegistrations) return;
        if (!window.confirm("Resend confirmation emails to ALL confirmed registrants?")) return;

        setResending(true);
        try {
            const res = await fetch("/api/sessions/admin/resend-emails", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId: viewingRegistrations.id })
            });
            const data = await res.json();
            if (res.ok) alert(data.message);
            else alert(data.error || "Failed to resend emails");
        } catch (error) {
            alert("An error occurred");
        } finally {
            setResending(false);
        }
    };

    const handleResendSingleEmail = async (reg: Registration) => {
        if (!viewingRegistrations) return;
        setResending(true);
        try {
            const res = await fetch("/api/sessions/admin/resend-emails", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: viewingRegistrations.id,
                    registrationId: reg.id
                })
            });
            if (res.ok) alert(`Email sent to ${reg.userName}`);
            else alert("Failed to send email");
        } catch (error) {
            alert("An error occurred");
        } finally {
            setResending(false);
        }
    };

    const handleDeleteRegistration = async (regId: string) => {
        if (!window.confirm("Delete this registration?")) return;
        try {
            const res = await fetch(`/api/sessions/admin/registrations?id=${regId}`, {
                method: "DELETE"
            });
            if (res.ok && viewingRegistrations) {
                fetchRegistrations(viewingRegistrations.id);
                fetchSessions(); // Update counts
            }
        } catch (error) {
            alert("Failed to delete");
        }
    };

    const handleWhatsApp = (reg: Registration) => {
        if (!reg.userMobile) return;
        const cleanMobile = reg.userMobile.replace(/\D/g, '');
        const message = `Hello ${reg.userName}, this is regarding your registration for ${viewingRegistrations?.title}. Here is your meeting link: ${viewingRegistrations?.meetingLink}`;
        window.open(`https://wa.me/${cleanMobile}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const filteredSessions = sessions.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredRegistrations = registrations.filter(reg =>
        reg.userName.toLowerCase().includes(searchRegistrations.toLowerCase()) ||
        reg.userEmail.toLowerCase().includes(searchRegistrations.toLowerCase()) ||
        (reg.userMobile || "").includes(searchRegistrations)
    );

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
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Video className="text-primary" /> Live Sessions
                    </h2>
                    <p className="text-sm text-gray-500 font-medium">Host paid webinars and masterclasses</p>
                </div>
                <button
                    onClick={() => { setEditingSession(null); setIsCreateModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-xs shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus size={14} />
                    Create Session
                </button>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
                <div className="relative flex-1 text-gray-900">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="search"
                        placeholder="Search sessions..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 ring-primary/20 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Sessions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSessions.map((session, index) => (
                    <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group bg-white rounded-3xl p-6 border border-gray-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all relative overflow-hidden"
                    >
                        {/* Status Badge */}
                        <div className={`absolute top-4 right-4 z-10 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full
                            ${session.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                            {session.isPublished ? "Published" : "Draft"}
                        </div>

                        {/* Content */}
                        <div className="mb-6">
                            {session.posterUrl && (
                                <div className="w-full h-32 rounded-2xl overflow-hidden mb-4 relative">
                                    <img src={session.posterUrl} alt={session.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                </div>
                            )}

                            <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{session.title}</h3>
                            <div className="flex items-center gap-4 text-xs font-bold text-gray-500 mb-4">
                                <span className="flex items-center gap-1">
                                    <Calendar size={12} className="text-primary" />
                                    {new Date(session.startTime).toLocaleDateString("en-GB")}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock size={12} className="text-primary" />
                                    {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mb-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-gray-400">Price</span>
                                    <span className="font-bold text-gray-900 flex items-center">
                                        <IndianRupee size={12} /> {session.price}
                                    </span>
                                </div>
                                <div className="h-8 w-[1px] bg-gray-200" />
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] font-black uppercase text-gray-400">Duration</span>
                                    <span className="font-bold text-gray-900">{session.duration}m</span>
                                </div>
                                <div className="h-8 w-[1px] bg-gray-200" />
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black uppercase text-gray-400">Registered</span>
                                    <div className="flex items-center gap-1 font-bold text-primary">
                                        <Users size={12} />
                                        {session.registrations?.length || 0}
                                    </div>
                                </div>
                            </div>

                            {session.meetingLink && (
                                <a
                                    href={session.meetingLink}
                                    target="_blank"
                                    className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline mb-2"
                                >
                                    <LinkIcon size={12} />
                                    {session.meetingLink}
                                </a>
                            )}
                        </div>

                        <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-50">
                            <button
                                onClick={() => { setEditingSession(session); setIsCreateModalOpen(true); }}
                                className="flex-1 py-2 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-black transition-colors"
                            >
                                Edit Details
                            </button>
                            <button
                                onClick={() => handleDeleteSession(session.id)}
                                className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <button
                            onClick={() => handleOpenRegistrations(session)}
                            className="w-full mt-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                        >
                            <Users size={14} /> View Registrations
                        </button>
                    </motion.div>
                ))}

                {filteredSessions.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-center text-gray-400">
                        <Video size={48} className="mb-4 opacity-20" />
                        <p className="font-bold">No sessions found</p>
                        <p className="text-sm">Create your first paid live session!</p>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <SessionCreateEditModal
                        session={editingSession}
                        onClose={() => {
                            setIsCreateModalOpen(false);
                            setEditingSession(null);
                        }}
                        onSave={() => {
                            fetchSessions();
                            setIsCreateModalOpen(false);
                            setEditingSession(null);
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Registrations Modal */}
            <AnimatePresence>
                {viewingRegistrations && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Registrations</h2>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{viewingRegistrations.title}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={handleResendEmails}
                                        disabled={resending || registrations.length === 0}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-black uppercase tracking-wider hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:pointer-events-none"
                                    >
                                        {resending ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
                                        Resend All Confirmations
                                    </button>
                                    <button onClick={() => setViewingRegistrations(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                    <input
                                        type="search"
                                        placeholder="Search by name, email, or mobile..."
                                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 ring-primary/20 transition-all font-medium"
                                        value={searchRegistrations}
                                        onChange={(e) => setSearchRegistrations(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                {loadingRegistrations ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="animate-spin text-primary" size={32} />
                                    </div>
                                ) : registrations.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400">
                                        <Users size={48} className="mx-auto mb-4 opacity-50" />
                                        <p className="font-bold">No registrations yet.</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="text-[10px] font-black uppercase tracking-wider text-gray-400 border-b border-gray-100">
                                                <th className="py-3 pl-2 text-left text-[10px] font-black uppercase tracking-wider text-gray-500">User Info</th>
                                                <th className="py-3 text-left text-[10px] font-black uppercase tracking-wider text-gray-500">Payment</th>
                                                <th className="py-3 text-left text-[10px] font-black uppercase tracking-wider text-gray-500">Status</th>
                                                <th className="py-3 text-right text-[10px] font-black uppercase tracking-wider text-gray-500">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {filteredRegistrations.map((reg) => (
                                                <tr key={reg.id} className="border-b border-gray-50 group hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-4 pl-2">
                                                        <div className="font-bold text-gray-900">{reg.userName}</div>
                                                        <div className="text-xs text-gray-500">{reg.userEmail}</div>
                                                        {reg.userMobile && <div className="text-xs text-gray-400 font-medium">{reg.userMobile}</div>}
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase">Order: <span className="text-gray-600 font-mono">{reg.razorpayOrderId || "-"}</span></div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase">Pay: <span className="text-gray-600 font-mono">{reg.razorpayPaymentId || "-"}</span></div>
                                                    </td>
                                                    <td className="py-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide
                                                            ${reg.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                                                reg.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                    'bg-amber-100 text-amber-700'
                                                            }
                                                        `}>
                                                            {reg.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 pr-2">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleResendSingleEmail(reg)}
                                                                title="Resend Email"
                                                                className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                                            >
                                                                <MailIcon size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleWhatsApp(reg)}
                                                                title="Open WhatsApp"
                                                                className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                            >
                                                                <MessageSquare size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteRegistration(reg.id)}
                                                                title="Delete Registration"
                                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredRegistrations.length === 0 && registrations.length > 0 && (
                                                <tr>
                                                    <td colSpan={4} className="py-12 text-center text-gray-400 italic">
                                                        No results match your search.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
