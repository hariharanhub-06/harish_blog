"use client";

import { Loader2, Video, MessageSquare, X, Mic, Hand, Users, Shield } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { motion } from "framer-motion";
import { useDistributedTranscription } from "@/hooks/useDistributedTranscription";

const LiveMinutesSidebar = dynamic(() => import("./LiveMinutesSidebar"), {
    ssr: false,
    loading: () => <div className="w-80 border-l border-white/5 bg-[#050505] animate-pulse" />
});

const LiveSubtitles = dynamic(() => import("./LiveSubtitles"), { ssr: false });

interface Props {
    session: any;
    user: {
        id: string;
        name: string;
        email: string;
        activeSessionId: string;
    };
    isAdmin: boolean;
}

export default function LiveRoomClient({ session, user, isAdmin }: Props) {
    const jitsiContainerRef = useRef<HTMLDivElement>(null); // Fix: Define ref
    const [jitsiApi, setJitsiApi] = useState<any>(null);
    const [modSettings, setModSettings] = useState<any>(session.moderatorSettings || {
        disableAudio: false,
        disableVideo: false,
        disableScreenSharing: false,
        disableReactions: false,
        disableChat: false,
    });
    const [isLocalAudioMuted, setIsLocalAudioMuted] = useState(true); // Start muted by default

    // Track local audio mute state from Jitsi
    useEffect(() => {
        if (!jitsiApi) return;

        const handleAudioMuteStatusChanged = ({ muted }: { muted: boolean }) => {
            setIsLocalAudioMuted(muted);
        };

        // Listen for mute events
        jitsiApi.addListener('audioMuteStatusChanged', handleAudioMuteStatusChanged);

        // Check initial state
        jitsiApi.isAudioMuted().then((muted: boolean) => {
            setIsLocalAudioMuted(muted);
        });

        return () => {
            jitsiApi.removeListener('audioMuteStatusChanged', handleAudioMuteStatusChanged);
        };
    }, [jitsiApi]);

    useEffect(() => {
        const fetchSettings = async () => {
            // ... existing fetch settings ...
            try {
                // 1. Fetch Mod Settings
                const res = await fetch(`/api/sessions/${session.id}/settings`);
                const data = await res.json();
                if (data && typeof data.disableAudio !== 'undefined') {
                    setModSettings(data);
                }
            } catch (e) {
                console.error("Polling error:", e);
            }
        };

        const checkHeartbeat = async () => {
            if (!user.activeSessionId) return;
            try {
                const res = await fetch('/api/sessions/heartbeat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        registrationId: user.id,
                        activeSessionId: user.activeSessionId
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.valid === false) {
                        setError("You have opened the session in another tab/device. This connection has been closed.");
                        if (jitsiApi) jitsiApi.dispose();
                    }
                }
            } catch (e) { console.error(e); }
        };

        const interval = setInterval(() => {
            fetchSettings();
            checkHeartbeat();
        }, 15000); // 15s interval to save bandwidth (4GB limit)
        return () => clearInterval(interval);
    }, [session.id, user.id, user.activeSessionId, jitsiApi]);

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
    const roomName = useMemo(() => {
        const hash = btoa(session.id).substring(0, 12).replace(/[^a-zA-Z]/g, 'x');
        return `HarishBlog_Webinar_${session.id.substring(0, 8)}_${hash}`;
    }, [session.id]);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    // Distributed Transcription for Participants
    // Only active if: 
    // 1. Audio is NOT globally disabled by moderator settings
    // 2. AND Local participant microphone is NOT muted
    const transcriptionActive = (modSettings ? !modSettings.disableAudio : true) && !isLocalAudioMuted;



    const { interimTranscript } = useDistributedTranscription({
        sessionId: session.id,
        userName: user.name,
        // Only active if audio is NOT disabled by moderator AND not locally muted
        isActive: transcriptionActive
    });

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
                        <motion.h2 className="text-white text-xl font-black uppercase tracking-tight">Entering Room</motion.h2>
                        <motion.p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em]">{session.title}</motion.p>
                    </div>
                </div>
            </div>
        );
    }



    return (
        <div className="h-[100dvh] bg-black flex flex-col supports-[height:100svh]:h-[100svh]">
            <header className="p-4 bg-black/40 backdrop-blur-md border-b border-white/5 flex items-center justify-between z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-600/10 rounded-lg">
                        <Video size={18} className="text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-sm font-black text-white uppercase tracking-tight truncate max-w-[200px] md:max-w-md">{session.title}</h1>
                        <div className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[7px] font-black uppercase tracking-[0.3em] text-gray-500">Live Studio Room</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20 group"
                    >
                        <X size={16} className="group-hover:rotate-90 transition-transform" />
                    </button>
                </div>
            </header>

            <div className="flex-1 w-full bg-[#050505] relative overflow-hidden flex">
                {/* Main Meeting Area */}
                <div className="flex-1 relative">


                    {/* Jitsi Container */}
                    <div
                        className="w-full h-full"
                        ref={jitsiContainerRef}
                    >
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
                                resolution: 480,
                                constraints: {
                                    video: {
                                        height: { ideal: 480, max: 720, min: 240 }
                                    }
                                },
                                enableLayerSuspension: true,
                                p2p: { enabled: true },
                                toolbarButtons: [
                                    'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                                    'fodeviceselection', 'hangup', 'profile', 'info', 'chat', 'recording',
                                    'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                                    'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
                                    'tileview', 'videobackgroundblur', 'download', 'help', 'e2ee'
                                ],
                                remoteVideoMenu: { disableKick: true },
                            }}
                            interfaceConfigOverwrite={{
                                DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                                SHOW_JITSI_WATERMARK: false,
                                HIDE_INVITE_ON_PAGE_START: true,
                                MOBILE_APP_PROMO: false,
                            }}
                            userInfo={{ displayName: user.name, email: user.email }}
                            onApiReady={(externalApi) => setJitsiApi(externalApi)}
                            onReadyToClose={() => window.location.href = '/'}
                            getIFrameRef={(iframeRef) => {
                                iframeRef.style.height = '100%';
                                iframeRef.style.width = '100%';
                                iframeRef.style.border = 'none';
                            }}
                        />
                    </div>

                    {/* Subtitles Overlay (Mobile/Desktop) */}
                    <LiveSubtitles
                        sessionId={session.id}
                        liveInterimText={interimTranscript}
                        liveSpeakerName={user.name}
                    />

                    {/* Minutes Sidebar (Visible to Everyone - Hidden on Mobile) */}
                    <div className="h-full hidden md:block w-80 border-l border-white/10 shrink-0">
                        <LiveMinutesSidebar
                            sessionId={session.id}
                            isAdmin={isAdmin}
                            liveInterimText={interimTranscript}
                            liveSpeakerName={user.name}
                        />
                    </div>
                </div>

                <style jsx global>{`
                .watermark { display: none !important; }
                .jitsi-meeting { height: 100% !important; background: black !important; }
            `}</style>
            </div>
        </div>
    );
}
