"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Home, AlertCircle } from "lucide-react";
import { Suspense } from "react";

function NotFoundContent() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    return (
        <div className="max-w-md w-full text-center space-y-8">
            <div className="relative">
                <div className="absolute inset-0 bg-red-600/20 blur-3xl rounded-full" />
                <h1 className="relative text-9xl font-black text-white/5 uppercase tracking-tighter select-none">404</h1>
            </div>

            <div className="space-y-4 relative">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Lost in Space?</h2>
                <p className="text-gray-400 font-bold">
                    The resource you are looking for does not exist or has been relocated.
                </p>

                {/* Debug Info for iOS 404 Investigation */}
                <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-2xl text-left overflow-hidden">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-2 flex items-center gap-2">
                        <AlertCircle size={10} /> Debugging Trace
                    </p>
                    <p className="text-[10px] font-mono text-gray-500 break-all leading-relaxed">
                        <span className="text-white/40">URL:</span> {pathname}<br />
                        <span className="text-white/40">Query:</span> {searchParams.toString() || "none"}
                    </p>
                </div>
            </div>

            <div className="pt-4 flex justify-center">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-orange-600 hover:text-white transition-all shadow-2xl active:scale-95 group"
                >
                    <Home size={18} className="group-hover:-translate-y-1 transition-transform" /> Back to Safety
                </Link>
            </div>
        </div>
    );
}

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center px-6">
            <Suspense fallback={
                <div className="text-white font-black uppercase tracking-widest text-[10px] animate-pulse">
                    Loading Safety...
                </div>
            }>
                <NotFoundContent />
            </Suspense>
        </div>
    );
}
