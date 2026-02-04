"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { JitsiMeeting } from '@jitsi/react-sdk';
import { Loader2, Video, Users, MessageSquare, Shield, X, Copy, Settings, Layout, Mic, ExternalLink, Hand, Trash2, Menu, ScrollText } from "lucide-react";
import LiveMinutesSidebar from "../live/LiveMinutesSidebar";

interface Props {
    session: any;
}

export default function AdminLiveRoomClient({ session }: Props) {
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'mod' | 'minutes'>('mod');

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

    const [jitsiApi, setJitsiApi] = useState<any>(null);
    const [modSettings, setModSettings] = useState({
        disableAudio: false,
        disableVideo: false,
        disableScreenSharing: false,
        disableReactions: false,
        disableChat: false,
    });
    const [updating, setUpdating] = useState(false);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    // Initial fetch of policies
    useEffect(() => {
        const loadSettings = async () => {
            const res = await fetch(`/api/sessions/${session.id}/settings`);
            if (res.ok) {
                const data = await res.json();
                setModSettings(data);
            }
        };
        loadSettings();
    }, [session.id]);

    // Push settings to DB whenever they change
    const updateSettings = async (newSettings: any) => {
        setUpdating(true);
        try {
            await fetch(`/api/sessions/${session.id}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings)
            });
            setModSettings(newSettings);
        } catch (e) {
            console.error("Failed to update settings:", e);
        } finally {
            setUpdating(false);
        }
    };

    const handleMuteAll = async (mediaType: 'audio' | 'video') => {
        if (!jitsiApi) return;

        // 1. Try built-in command
        jitsiApi.executeCommand('muteEveryone', mediaType);

        // 2. Loop through participants for hard-mute reliability
        const participants = jitsiApi.getParticipantsInfo();
        participants.forEach((p: any) => {
            jitsiApi.executeCommand('muteRemoteParticipant', p.participantId, mediaType);
        });
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
                    <button
                        onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                        className="xl:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="hidden md:flex flex-col items-end mr-4">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Room Name (Secure)</span>
                        <span className="text-[10px] font-bold text-gray-900 font-mono truncate max-w-[150px]">{roomName}</span>
                    </div>
                    <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-200/50">
                        {updating ? <Loader2 size={12} className="animate-spin" /> : <Settings size={12} />}
                        <span className="text-[9px] font-black uppercase tracking-widest">
                            {updating ? "Saving Policy..." : "Room Policy Active"}
                        </span>
                    </div>
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
            <div className="flex-1 w-full flex relative overflow-hidden">
                {/* Left Panel: Jitsi */}
                <div className="flex-1 relative">
                    <JitsiMeeting
                        domain="meet.ffmuc.net"
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
                        onApiReady={(api) => {
                            setJitsiApi(api);
                        }}
                        onReadyToClose={() => {
                            window.location.href = '/admin';
                        }}
                        getIFrameRef={(iframeRef) => {
                            iframeRef.style.height = '100%';
                            iframeRef.style.width = '100%';
                            iframeRef.style.border = 'none';
                        }}
                    />
                </div>

                {/* Right Panel: Host Sidebar (Desktop) */}
                <div className="w-80 bg-white border-l border-gray-100 flex flex-col shrink-0 overflow-hidden hidden xl:flex">
                    <div className="flex border-b border-gray-100">
                        <button
                            onClick={() => setActiveTab('mod')}
                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'mod' ? 'bg-black text-white' : 'bg-gray-50 text-gray-400 hover:text-gray-900'}`}
                        >
                            Moderation
                        </button>
                        <button
                            onClick={() => setActiveTab('minutes')}
                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'minutes' ? 'bg-black text-white' : 'bg-gray-50 text-gray-400 hover:text-gray-900'}`}
                        >
                            Live Minutes
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className={`flex flex-col h-full ${activeTab === 'mod' ? '' : 'hidden'}`}>
                            <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Moderation Policy</h3>
                                <div className="space-y-4">
                                    {[
                                        { id: 'disableAudio', label: 'Lock Microphones', icon: Mic },
                                        { id: 'disableVideo', label: 'Lock Cameras', icon: Video },
                                        { id: 'disableScreenSharing', label: 'Lock Screen Sharing', icon: Layout },
                                        { id: 'disableChat', label: 'Lock Public Chat', icon: MessageSquare },
                                        { id: 'disableReactions', label: 'Lock Reactions', icon: Hand },
                                    ].map((item: any) => (
                                        <label key={item.id} className="flex items-center justify-between group cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg transition-colors ${(modSettings as any)[item.id] ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
                                                    <item.icon size={14} />
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">{item.label}</span>
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded-md border-gray-300 text-black focus:ring-black cursor-pointer"
                                                checked={(modSettings as any)[item.id]}
                                                onChange={(e) => updateSettings({ ...modSettings, [item.id]: e.target.checked })}
                                            />
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 flex-1">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Quick Actions</h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => handleMuteAll('audio')}
                                        className="w-full flex items-center justify-between p-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all active:scale-95 group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Mic size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-left leading-none font-sans">Mute All<br />Audio</span>
                                        </div>
                                        <X size={14} className="opacity-40 group-hover:opacity-100" />
                                    </button>

                                    <button
                                        onClick={() => handleMuteAll('video')}
                                        className="w-full flex items-center justify-between p-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all active:scale-95 group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Video size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-left leading-none font-sans">Mute All<br />Video</span>
                                        </div>
                                        <X size={14} className="opacity-40 group-hover:opacity-100" />
                                    </button>

                                    <button
                                        onClick={() => jitsiApi?.executeCommand('toggleLobby', true)}
                                        className="w-full flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl hover:bg-emerald-100 transition-all active:scale-95"
                                    >
                                        <Shield size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-left leading-tight font-mono">Enable Lobby</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className={`h-full ${activeTab === 'minutes' ? 'block' : 'hidden'}`}>
                            <LiveMinutesSidebar sessionId={session.id} isAdmin={true} />
                        </div>
                    </div>
                </div>

                {/* Mobile/Tablet Sidebar Overlay */}
                {showMobileSidebar && (
                    <div className="absolute inset-0 z-50 bg-black/50 xl:hidden flex justify-end">
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            className="w-80 bg-white h-full shadow-2xl flex flex-col overflow-y-auto"
                        >
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                                <h3 className="text-xs font-black uppercase tracking-wider">Moderator Controls</h3>
                                <button onClick={() => setShowMobileSidebar(false)} className="p-2 hover:bg-gray-200 rounded-lg"><X size={18} /></button>
                            </div>

                            {/* Reusing the controls content (simplified duplication for responsiveness) */}
                            <div className="p-4 space-y-4 flex-1">
                                <div className="space-y-4">
                                    {[
                                        { id: 'disableAudio', label: 'Lock Microphones', icon: Mic },
                                        { id: 'disableVideo', label: 'Lock Cameras', icon: Video },
                                        { id: 'disableScreenSharing', label: 'Lock Screen Sharing', icon: Layout },
                                        { id: 'disableChat', label: 'Lock Public Chat', icon: MessageSquare },
                                        { id: 'disableReactions', label: 'Lock Reactions', icon: Hand },
                                    ].map((item: any) => (
                                        <label key={item.id} className="flex items-center justify-between group cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg transition-colors ${(modSettings as any)[item.id] ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
                                                    <item.icon size={14} />
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">{item.label}</span>
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded-md border-gray-300 text-black focus:ring-black cursor-pointer"
                                                checked={(modSettings as any)[item.id]}
                                                onChange={(e) => updateSettings({ ...modSettings, [item.id]: e.target.checked })}
                                            />
                                        </label>
                                    ))}
                                </div>
                                <div className="h-px bg-gray-100 my-4" />
                                <div className="space-y-2">
                                    <button
                                        onClick={() => handleMuteAll('audio')}
                                        className="w-full flex items-center justify-between p-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all active:scale-95 group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Mic size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-left leading-none font-sans">Mute All<br />Audio</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => handleMuteAll('video')}
                                        className="w-full flex items-center justify-between p-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all active:scale-95 group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Video size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-left leading-none font-sans">Mute All<br />Video</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>

            {/* Mobile Footer Moderation (Simplified) */}
            <div className="bg-white border-t border-gray-100 p-3 flex xl:hidden items-center justify-center gap-3 shrink-0">
                <button
                    onClick={() => handleMuteAll('audio')}
                    className="flex-1 p-3 bg-gray-100 rounded-xl flex flex-col items-center"
                >
                    <Mic size={14} />
                    <span className="text-[8px] font-black uppercase mt-1">Mute All</span>
                </button>
                <button
                    onClick={() => handleMuteAll('video')}
                    className="flex-1 p-3 bg-gray-100 rounded-xl flex flex-col items-center"
                >
                    <Video size={14} />
                    <span className="text-[8px] font-black uppercase mt-1">Video All</span>
                </button>
                <button
                    onClick={() => jitsiApi?.executeCommand('toggleChat')}
                    className="flex-1 p-3 bg-gray-900 text-white rounded-xl flex flex-col items-center"
                >
                    <MessageSquare size={14} />
                    <span className="text-[8px] font-black uppercase mt-1">Chat Pane</span>
                </button>
            </div>

            <style jsx global>{`
                .watermark { display: none !important; }
                .jitsi-meeting { height: 100% !important; background: #050505 !important; }
            `}</style>
        </div>
    );
}
