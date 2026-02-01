"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Loader2 } from "lucide-react";

interface WaitingRoomProps {
    sessionId: string;
}

export default function WaitingRoom({ sessionId }: WaitingRoomProps) {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await fetch(`/api/sessions/status?sessionId=${sessionId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.status === 'active') {
                        router.refresh(); // Reloads the server component
                    }
                }
            } catch (error) {
                console.error("Status check failed", error);
            }
        };

        // Poll every 10 seconds to save bandwidth
        const interval = setInterval(checkStatus, 10000);
        return () => clearInterval(interval);
    }, [sessionId, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white p-6 overflow-hidden relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-600/5 rounded-full blur-[120px]" />
            <div className="max-w-md w-full text-center space-y-6 relative z-10">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto border border-white/10 relative">
                    <Clock className="text-orange-500" size={32} />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-ping" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-black uppercase tracking-tight">Session Not Started</h1>
                    <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.2em]">Please Wait for Host</p>
                </div>
                <p className="text-gray-400 text-xs font-medium leading-relaxed">
                    The host hasn't started the session yet. You will join automatically when it starts.
                </p>
                <div className="pt-4 flex justify-center gap-4">
                    <div className="px-6 py-3 bg-white/5 text-white/50 font-black uppercase tracking-widest text-[10px] rounded-2xl flex items-center gap-2">
                        <Loader2 size={12} className="animate-spin" />
                        Waiting for host...
                    </div>
                </div>
            </div>
        </div>
    );
}
