"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    StreamVideoClient,
    StreamVideo,
    StreamCall,
    SpeakerLayout,
    CallControls,
    useCallStateHooks,
    ParticipantView,
    StreamTheme,
    CallingState,
    ToggleAudioPublishingButton,
    ToggleVideoPublishingButton,
    ScreenShareButton,
} from "@stream-io/video-react-sdk";
import {
    Chat,
    Channel,
    ChannelHeader,
    MessageInput,
    MessageList,
    Thread,
    Window,
    useChatContext,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import "stream-chat-react/dist/css/v2/index.css";
import { Loader2, Users, MessageSquare, Hand, Mic, Video, ScreenShare, X, Settings2 } from "lucide-react";

interface Props {
    session: any;
    user: {
        id: string;
        name: string;
        email: string;
    };
}

export default function LiveRoomClient({ session, user }: Props) {
    const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
    const [chatClient, setChatClient] = useState<StreamChat | null>(null);
    const [call, setCall] = useState<any>(null);
    const [showChat, setShowChat] = useState(true);

    useEffect(() => {
        const initStream = async () => {
            try {
                // 1. Get Token from our API
                const res = await fetch("/api/sessions/live-token", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: user.id, name: user.name })
                });
                const { token, apiKey } = await res.json();

                if (!token) throw new Error("Failed to get token");

                // 2. Init Video Client
                const vClient = new StreamVideoClient({
                    apiKey,
                    user: {
                        id: user.id,
                        name: user.name,
                        image: `https://getstream.io/random_svg/?name=${user.name}`,
                    },
                    token,
                });
                setVideoClient(vClient);

                // 3. Init Chat Client
                const cClient = StreamChat.getInstance(apiKey);
                await cClient.connectUser({
                    id: user.id,
                    name: user.name,
                    image: `https://getstream.io/random_svg/?name=${user.name}`,
                }, token);
                setChatClient(cClient);

                // 4. Join the Call
                const callInstance = vClient.call("livestream", session.id);
                await callInstance.join({ create: true });
                setCall(callInstance);

            } catch (error) {
                console.error("Stream init error:", error);
            }
        };

        initStream();

        return () => {
            if (videoClient) videoClient.disconnectUser();
            if (chatClient) chatClient.disconnectUser();
        };
    }, [user.id]);

    if (!videoClient || !chatClient || !call) {
        return (
            <div className="min-h-screen relative flex items-center justify-center bg-[#050505] overflow-hidden">
                {/* Background Glow */}
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
                            Initializing encrypted secure connection...
                        </p>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <StreamVideo client={videoClient}>
            <StreamCall call={call}>
                <div className="h-screen flex flex-col md:flex-row bg-[#050505] overflow-hidden">
                    {/* Main Stage */}
                    <div className="flex-1 relative flex flex-col">
                        <header className="p-4 bg-black/40 backdrop-blur-md border-b border-white/5 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-600/10 rounded-lg">
                                    <Video size={18} className="text-red-500" />
                                </div>
                                <div>
                                    <h1 className="text-base font-black text-white uppercase tracking-tight truncate max-w-[200px] md:max-w-md">{session.title}</h1>
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-500">Live Webinar Room</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowChat(!showChat)}
                                    className={`p-2.5 rounded-xl transition-all border ${showChat ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                                >
                                    <MessageSquare size={18} />
                                </button>
                            </div>
                        </header>

                        <div className="flex-1 relative p-4 flex flex-col gap-4 overflow-y-auto">
                            <StageLayout />
                        </div>

                        <footer className="p-6 bg-gradient-to-t from-black via-black/80 to-transparent flex justify-center z-10 shrink-0">
                            <CustomCallControls />
                        </footer>
                    </div>

                    {/* Chat Sidebar */}
                    {showChat && (
                        <aside className="w-full md:w-[350px] border-l border-white/5 bg-[#0a0a0a] flex flex-col shadow-2xl relative z-20">
                            <Chat client={chatClient} theme="str-chat__theme-dark">
                                <Channel channel={chatClient.channel('messaging', session.id)}>
                                    <Window>
                                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/40">
                                            <h2 className="font-black text-[10px] uppercase tracking-[0.3em] text-gray-400">Interactive Chat</h2>
                                            <div className="flex gap-1.5">
                                                <div className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase">Active</div>
                                            </div>
                                        </div>
                                        <MessageList />
                                        <MessageInput focus />
                                    </Window>
                                    <Thread />
                                </Channel>
                            </Chat>
                        </aside>
                    )}
                </div>
            </StreamCall>
            <style jsx global>{`
                .str-chat {
                    --str-chat__primary-color: #ea580c;
                    --str-chat__active-primary-color: #f97316;
                    --str-chat__surface-color: #0a0a0a;
                    --str-chat__background-color: #0a0a0a;
                    --str-chat__secondary-background-color: #1a1a1a;
                    --str-chat__border-radius-medium: 12px;
                    height: 100% !important;
                }
                .str-chat__container {
                    background: transparent !important;
                }
                .str-chat-channel {
                    height: 100% !important;
                }
                .str-chat__list {
                    background: #0a0a0a !important;
                }
            `}</style>
        </StreamVideo>
    );
}

function StageLayout() {
    const { useParticipants, useCallCallingState } = useCallStateHooks();
    const participants = useParticipants();
    const callingState = useCallCallingState();

    // The first participant (usually the host) takes the main stage
    const mainParticipant = participants[0];
    const otherParticipants = participants.slice(1);

    if (callingState !== CallingState.JOINED) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-700 bg-white/5 rounded-3xl border border-dashed border-white/10">
                <Loader2 className="animate-spin mb-4" />
                <p className="text-xs font-black uppercase tracking-widest">Connecting to stage...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col gap-4 relative">
            {/* Main Speaker / OBS Content */}
            <div className="flex-1 bg-black rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative min-h-[300px]">
                {mainParticipant ? (
                    <ParticipantView participant={mainParticipant} />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 text-gray-800">
                        <Video size={48} strokeWidth={1} className="opacity-10" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-20">Waiting for live broadcast</p>
                    </div>
                )}
            </div>

            {/* Side Speakers (Group Stage) */}
            {otherParticipants.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 py-2 shrink-0">
                    {otherParticipants.map(pic => (
                        <div key={pic.sessionId} className="aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 group relative">
                            <ParticipantView participant={pic} />
                            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[8px] font-black text-white uppercase tracking-wider">
                                {pic.name || "Participant"}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function CustomCallControls() {
    const { useCallCallingState, useMicrophoneState, useCameraState, useLocalParticipant } = useCallStateHooks();
    const callingState = useCallCallingState();
    const { microphone, isMute: micMute } = useMicrophoneState();
    const { camera, isMute: camMute } = useCameraState();
    const localParticipant = useLocalParticipant();

    if (callingState !== CallingState.JOINED) return null;

    const handleRaiseHand = async () => {
        // Placeholder for raise hand logic
        alert("You have raised your hand! The host will be notified.");
    };

    return (
        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-3xl shadow-2xl">
            <button
                onClick={() => microphone.toggle()}
                className={`p-3.5 rounded-xl transition-all shadow-lg ${!micMute ? 'bg-primary text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                title={micMute ? "Unmute Mic" : "Mute Mic"}
            >
                <Mic size={18} />
            </button>
            <button
                onClick={() => camera.toggle()}
                className={`p-3.5 rounded-xl transition-all shadow-lg ${!camMute ? 'bg-primary text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                title={camMute ? "Start Video" : "Stop Video"}
            >
                <Video size={18} />
            </button>

            <div className="w-[1.5px] h-8 bg-white/10 mx-1" />

            <button
                onClick={handleRaiseHand}
                className="p-3.5 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all shadow-lg flex items-center gap-2"
                title="Raise Hand"
            >
                <Hand size={18} />
                <span className="hidden md:inline text-[10px] font-black uppercase tracking-wider">Ask Query</span>
            </button>

            <div className="w-[1.5px] h-8 bg-white/10 mx-1" />

            <button
                onClick={() => window.location.href = '/'}
                className="p-3.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                title="Leave Session"
            >
                <X size={18} />
            </button>
        </div>
    );
}
