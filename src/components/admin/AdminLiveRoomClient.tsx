"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { JitsiMeeting } from '@jitsi/react-sdk';
import { Loader2, Video, Users, MessageSquare, Shield, X, Copy, Settings, Layout, Mic, ExternalLink, Hand, Trash2 } from "lucide-react";

interface Props {
    session: any;
}

export default function AdminLiveRoomClient({ session }: Props) {
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Generate the same secure, unique room name used by participants
    const roomName = useMemo(() => {
        const hash = btoa(session.id).substring(0, 12).replace(/[^a-zA-Z]/g, 'x');
        return `HarishBlog_Webinar_${session.id.substring(0, 8)}_${hash}`;
    }, [session.id]);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    const copyKey = () => {
        navigator.clipboard.writeText(session.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6 space-y-6">
                <div className="w-20 h-20 bg-red-500/10 rounded-[32px] flex items-center justify-center border border-red-500/20">
                    <X className="text-red-500" size={32} />
                </div>
                <h2 className="text-gray-900 text-xl font-black uppercase tracking-tight">Host Dashboard Error</h2>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] max-w-sm leading-relaxed">
                    {error}
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all active:scale-95 shadow-xl shadow-black/10"
                >
                    Retry Initialization
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen relative flex items-center justify-center bg-gray-50 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

                <div className="relative z-10 text-center space-y-8 max-w-md px-6">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-24 h-24 bg-white rounded-[32px] border border-gray-100 flex items-center justify-center mx-auto shadow-2xl shadow-black/5"
                    >
                        <Loader2 className="w-10 h-10 animate-spin text-gray-900" />
                    </motion.div>

                    <div className="space-y-3">
                        <motion.h2
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-900 text-xl font-black uppercase tracking-tight"
                        >
                            Host Dashboard
                        </motion.h2>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em]"
                        >
                            {session.title}
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="pt-8 flex flex-col items-center gap-3"
                    >
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100/50">
                            <Shield size={12} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Secure Admin Access</span>
                        </div>
                        <p className="text-gray-400 font-medium text-[9px] uppercase tracking-[0.2em] animate-pulse">
                            Initializing interactive broadcast environment...
                        </p>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between bg-white p-4 rounded-b-3xl shadow-sm border-b border-gray-100 z-20 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-black rounded-2xl">
                        <Video className="text-white" size={20} />
                    </div>
                    <div>
                        <h1 className="font-black text-gray-900 tracking-tight leading-none">{session.title}</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                            <Shield size={10} className="text-emerald-500" /> Administrative Host Mode
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex flex-col items-end mr-4">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Room Name (Secure)</span>
                        <span className="text-[10px] font-bold text-gray-900 font-mono truncate max-w-[150px]">{roomName}</span>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                        <Settings size={20} />
                    </button>
                    <div className="h-6 w-[1px] bg-gray-200 mx-2" />
                    <button
                        onClick={() => window.location.href = '/admin'}
                        className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 transition-colors"
                    >
                        Close Studio
                    </button>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex-1 w-full relative">
                <JitsiMeeting
                    domain="meet.jit.si"
                    roomName={roomName}
                    configOverwrite={{
                        startWithAudioMuted: false,
                        startWithVideoMuted: false,
                        enableWelcomePage: false,
                        enableClosePage: false,
                        disableModeratorIndicator: false,
                        disableDeepLinking: true,
                        prejoinPageEnabled: false,
                        toolbarButtons: [
                            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                            'fodeviceselection', 'hangup', 'profile', 'info', 'chat', 'recording',
                            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                            'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                            'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                            'e2ee', 'security'
                        ],
                    }}
                    userInfo={{
                        displayName: "Admin (Host)",
                        email: "admin@harishblog.com"
                    }}
                    onApiReady={(externalApi) => {
                        // Admin-only event or API calls
                    }}
                    getIFrameRef={(iframeRef) => {
                        iframeRef.style.height = '100%';
                        iframeRef.style.width = '100%';
                        iframeRef.style.border = 'none';
                    }}
                />
            </div>

            <style jsx global>{`
                .watermark { display: none !important; }
                .jitsi-meeting { height: 100% !important; background: #050505 !important; }
            `}</style>
        </div>
    );
}
