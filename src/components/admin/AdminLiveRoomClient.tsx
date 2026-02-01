"use client";

import { useEffect, useState } from "react";
import {
    StreamVideoClient,
    StreamVideo,
    StreamCall,
    ParticipantView,
    useCallStateHooks,
    useCall,
    CallingState,
} from "@stream-io/video-react-sdk";
import { Chat, Channel, Window, MessageList, MessageInput } from "stream-chat-react";
import { StreamChat } from "stream-chat";
import { motion } from "framer-motion";
import { Loader2, Video, Users, MessageSquare, Shield, Copy, Settings, Layout, Mic, ExternalLink, Hand, Trash2, X } from "lucide-react";

interface Props {
    session: any;
}

export default function AdminLiveRoomClient({ session }: Props) {
    const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
    const [chatClient, setChatClient] = useState<StreamChat | null>(null);
    const [call, setCall] = useState<any>(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initStream = async () => {
            try {
                const res = await fetch("/api/sessions/live-token", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: "admin", name: "Admin (Host)" })
                });
                const { token, apiKey } = await res.json();

                const vClient = new StreamVideoClient({
                    apiKey,
                    user: { id: "admin", name: "Host (Admin)" },
                    token,
                });
                setVideoClient(vClient);

                const cClient = StreamChat.getInstance(apiKey);
                await cClient.connectUser({ id: "admin", name: "Host (Admin)" }, token);
                setChatClient(cClient);

                const callInstance = vClient.call("livestream", session.id);
                await callInstance.join({ create: true });
                setCall(callInstance);

            } catch (error: any) {
                console.error("Admin init failed:", error);
                setError(error.message || "Failed to initialize host dashboard. Please try again later.");
            }
        };

        initStream();
        return () => {
            if (videoClient) videoClient.disconnectUser();
            if (chatClient) chatClient.disconnectUser();
        };
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

    if (!videoClient || !chatClient || !call) {
        return (
            <div className="min-h-screen relative flex items-center justify-center bg-gray-50 overflow-hidden">
                {/* Subtle Background Pattern */}
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
        <StreamVideo client={videoClient}>
            <StreamCall call={call}>
                <div className="h-screen flex bg-gray-100">
                    {/* Main Workspace */}
                    <div className="flex-1 flex flex-col p-6 gap-6 overflow-hidden">
                        {/* Header */}
                        <header className="flex items-center justify-between bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-black rounded-2xl">
                                    <Video className="text-white" size={20} />
                                </div>
                                <div>
                                    <h1 className="font-black text-gray-900 tracking-tight">{session.title}</h1>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Shield size={10} className="text-emerald-500" /> Administrative Host Mode
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                                    <Settings size={20} />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                                    <Layout size={20} />
                                </button>
                                <div className="h-6 w-[1px] bg-gray-200 mx-2" />
                                <button className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 transition-colors">
                                    End Session
                                </button>
                            </div>
                        </header>

                        {/* Content Grid */}
                        <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
                            {/* Live Preview */}
                            <div className="col-span-8 flex flex-col gap-6 overflow-hidden">
                                <div className="flex-1 bg-black rounded-[40px] overflow-hidden shadow-2xl relative">
                                    <AdminStagePreview />
                                </div>
                                {/* OBS Settings Card */}
                                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">OBS Streaming Setup</h2>
                                        <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase">Low Latency enabled</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Stream URL (RTMP)</label>
                                            <div className="flex gap-2">
                                                <input readOnly value="rtmp://stream-ingest.com/app" className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2 text-xs font-mono text-gray-600 outline-none" />
                                                <button onClick={copyKey} className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200"><Copy size={16} /></button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Stream Key</label>
                                            <div className="flex gap-2">
                                                <input readOnly value={session.id} className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2 text-xs font-mono text-gray-600 outline-none" />
                                                <button onClick={copyKey} className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200"><Copy size={16} /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar - Management */}
                            <div className="col-span-4 flex flex-col gap-6 overflow-hidden">
                                {/* Participants */}
                                <div className="bg-white flex-1 rounded-[40px] border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                                    <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Users size={16} className="text-primary" />
                                            <h2 className="text-xs font-black uppercase tracking-widest">Participants</h2>
                                        </div>
                                        <span className="text-[10px] font-black text-primary bg-primary/10 px-2.5 py-1 rounded-full">0 Active</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4">
                                        <ParticipantManager />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chat Sidebar */}
                    <aside className="w-[380px] bg-white border-l border-gray-100 flex flex-col relative z-30">
                        <Chat client={chatClient} theme="str-chat__theme-light">
                            <Channel channel={chatClient.channel('messaging', session.id)}>
                                <Window>
                                    <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <MessageSquare size={16} className="text-primary" />
                                                <h2 className="text-xs font-black uppercase tracking-widest">Moderation Chat</h2>
                                            </div>
                                        </div>
                                    </div>
                                    <MessageList />
                                    <MessageInput focus />
                                </Window>
                            </Channel>
                        </Chat>
                    </aside>
                </div>
            </StreamCall>
            <style jsx global>{`
                .str-chat {
                    --str-chat__primary-color: #ea580c;
                    --str-chat__border-radius-medium: 16px;
                    height: 100% !important;
                }
                .str-chat__list {
                    padding-bottom: 20px !important;
                }
                .str-chat__message-input {
                    padding: 20px !important;
                }
            `}</style>
        </StreamVideo>
    );
}

function AdminStagePreview() {
    const { useParticipants } = useCallStateHooks();
    const participants = useParticipants();
    const host = participants[0];

    return (
        <div className="w-full h-full relative">
            {host ? (
                <ParticipantView participant={host} />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-800 gap-4">
                    <Video size={64} className="opacity-10" />
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Studio Preview Offline</p>
                </div>
            )}
            <div className="absolute top-6 left-6 flex gap-2">
                <div className="px-3 py-1.5 bg-red-600 text-white rounded-full text-[10px] font-black uppercase flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    Recording
                </div>
                <div className="px-3 py-1.5 bg-black/60 backdrop-blur-md text-white rounded-full text-[10px] font-black uppercase">
                    1080p | 60 FPS
                </div>
            </div>
        </div>
    );
}

function ParticipantManager() {
    const { useParticipants } = useCallStateHooks();
    const participants = useParticipants();
    const call = useCall();

    const handleGrantStage = async (p: any) => {
        // In Stream, to allow someone to speak we update their permissions
        try {
            await (call as any)?.updateParticipantPermissions(p.sessionId, {
                can_publish_audio: true,
                can_publish_video: true
            });
            alert(`${p.name} can now go on stage!`);
        } catch (e) {
            console.error(e);
        }
    };

    if (participants.filter(p => p.userId !== 'admin').length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4 py-20">
                <Users size={32} strokeWidth={1} className="opacity-20" />
                <p className="text-[10px] font-bold uppercase tracking-widest">No attendees currently online</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {(participants as any[]).filter(p => p.userId !== 'admin').map((p: any) => (
                <div key={p.sessionId} className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between group hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                            {p.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 text-sm">{p.name || "Anonymous User"}</div>
                            <div className="flex items-center gap-3">
                                {p.isMuted ? <Mic size={10} className="text-gray-400" /> : <Mic size={10} className="text-emerald-500" />}
                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Lobby</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => handleGrantStage(p)}
                            className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100" title="Grant Stage Access"
                        >
                            <Hand size={14} />
                        </button>
                        <button className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Kick">
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
