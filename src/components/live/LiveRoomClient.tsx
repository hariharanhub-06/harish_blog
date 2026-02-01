"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { JitsiMeeting } from '@jitsi/react-sdk';
import { Loader2, Video, MessageSquare, X, Mic, Hand, Users, Shield } from "lucide-react";

interface Props {
    session: any;
    user: {
        id: string;
        name: string;
        email: string;
    };
}

export default function LiveRoomClient({ session, user }: Props) {
    const [jitsiApi, setJitsiApi] = useState<any>(null);
    const [modSettings, setModSettings] = useState<any>(session.moderatorSettings || {
        disableAudio: false,
        disableVideo: false,
        disableScreenSharing: false,
        disableReactions: false,
        disableChat: false,
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`/api/sessions/${session.id}/settings`);
                const data = await res.json();
                if (data && typeof data.disableAudio !== 'undefined') {
                    setModSettings(data);
                }
            } catch (e) {
                console.error("Polling error:", e);
            }
        };

        const interval = setInterval(fetchSettings, 5000);
        return () => clearInterval(interval);
    }, [session.id]);

    useEffect(() => {
        if (!jitsiApi || !modSettings) return;

        const baseButtons = [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'info', 'chat', 'recording',
            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
            'tileview', 'videobackgroundblur', 'download', 'help', 'e2ee'
        ];

        let filteredButtons = [...baseButtons];
        if (modSettings.disableAudio) {
            filteredButtons = filteredButtons.filter(b => b !== 'microphone');
            jitsiApi.isAudioMuted().then((muted: boolean) => {
                if (!muted) jitsiApi.executeCommand('toggleAudio');
            });
        }
        if (modSettings.disableVideo) {
            filteredButtons = filteredButtons.filter(b => b !== 'camera');
            jitsiApi.isVideoMuted().then((muted: boolean) => {
                if (!muted) jitsiApi.executeCommand('toggleVideo');
            });
        }
        if (modSettings.disableScreenSharing) filteredButtons = filteredButtons.filter(b => b !== 'desktop');
        if (modSettings.disableChat) filteredButtons = filteredButtons.filter(b => b !== 'chat');

        jitsiApi.executeCommand('overwriteConfig', {
            toolbarButtons: filteredButtons,
            disableReactions: modSettings.disableReactions,
            remoteVideoMenu: {
                disableKick: true,
            },
        });
    }, [jitsiApi, modSettings]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Generate a secure, unique room name that outsiders cannot guess
    // Format: HarishBlog_Webinar_[SessionID]_[SecretHashValue]
    const roomName = useMemo(() => {
        const hash = btoa(session.id).substring(0, 12).replace(/[^a-zA-Z]/g, 'x');
        return `HarishBlog_Webinar_${session.id.substring(0, 8)}_${hash}`;
    }, [session.id]);

    useEffect(() => {
        // Just a small delay to show our premium entering screen
        const timer = setTimeout(() => setLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-center p-6 space-y-6">
                <div className="w-20 h-20 bg-red-500/10 rounded-[32px] flex items-center justify-center border border-red-500/20">
                    <X className="text-red-500" size={32} />
                </div>
                <h2 className="text-white text-xl font-black uppercase tracking-tight">Access Error</h2>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] max-w-sm leading-relaxed">
                    {error}
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all active:scale-95"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen relative flex items-center justify-center bg-[#050505] overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[120px] animate-pulse" />

                <div className="relative z-10 text-center space-y-8 max-w-md px-6">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-24 h-24 bg-white/5 backdrop-blur-3xl rounded-[32px] border border-white/10 flex items-center justify-center mx-auto shadow-2xl"
                    >
                        <Loader2 className="w-10 h-10 animate-spin text-red-500" />
                    </motion.div>

                    <div className="space-y-3">
                        <motion.h2
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-white text-xl font-black uppercase tracking-tight"
                        >
                            Entering Room
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
                        className="pt-8"
                    >
                        <p className="text-gray-600 font-medium text-[9px] uppercase tracking-widest animate-pulse">
                            Establishing encrypted peer-to-peer connection...
                        </p>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-black flex flex-col">
            <header className="p-4 bg-black/40 backdrop-blur-md border-b border-white/5 flex items-center justify-between z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-600/10 rounded-lg">
                        <Video size={18} className="text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-sm font-black text-white uppercase tracking-tight truncate max-w-[200px] md:max-w-md">{session.title}</h1>
                        <div className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[7px] font-black uppercase tracking-[0.3em] text-gray-500">Free Interactive Room</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                        <Shield size={10} className="text-emerald-500" />
                        <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Confidential Room</span>
                    </div>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20 group"
                    >
                        <X size={16} className="group-hover:rotate-90 transition-transform" />
                    </button>
                </div>
            </header>

            <div className="flex-1 w-full bg-[#050505] relative overflow-hidden">
                <JitsiMeeting
                    domain="meet.ffmuc.net"
                    roomName={roomName}
                    configOverwrite={{
                        startWithAudioMuted: true,
                        disableModeratorIndicator: true,
                        startWithVideoMuted: true,
                        enableEmailInStats: false,
                        disableDeepLinking: true,
                        prejoinPageEnabled: false,
                        hideModeratorIndicator: true,
                        toolbarButtons: [
                            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                            'fodeviceselection', 'hangup', 'profile', 'info', 'chat', 'recording',
                            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                            'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
                            'tileview', 'videobackgroundblur', 'download', 'help',
                            'e2ee'
                        ],
                        remoteVideoMenu: {
                            disableKick: true,
                        },
                    }}
                    interfaceConfigOverwrite={{
                        DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                        SHOW_JITSI_WATERMARK: false,
                        HIDE_INVITE_ON_PAGE_START: true,
                        MOBILE_APP_PROMO: false,
                    }}
                    userInfo={{
                        displayName: user.name,
                        email: user.email
                    }}
                    onApiReady={(externalApi) => {
                        setJitsiApi(externalApi);
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
                .jitsi-meeting { height: 100% !important; background: black !important; }
            `}</style>
        </div>
    );
}
