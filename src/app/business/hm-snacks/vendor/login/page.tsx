"use client";

import { useState } from "react";
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react";
import { useVendorAuth } from "@/lib/vendor-auth-context";

export default function VendorLoginPage() {
    const { login } = useVendorAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/vendor/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                login(data.vendor, data.token);
            } else {
                setError(data.error || "Login failed");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 bg-[url('https://images.unsplash.com/photo-1621939514649-28b12e816a8d?auto=format&fit=crop&q=80&w=2560')] bg-cover bg-center">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>

            <div className="relative w-full max-w-md bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-white/10">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Vendor Portal</h1>
                    <p className="text-gray-500 font-medium">Log in to manage your shipments</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl flex items-center justify-center text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="email"
                            required
                            placeholder="Vendor Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-black transition-all"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="password"
                            required
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-black transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-black text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-900 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <>
                                Access Dashboard <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-400 font-medium">Having trouble logging in? <br />Contact Admin Support.</p>
                </div>
            </div>
        </div>
    );
}
