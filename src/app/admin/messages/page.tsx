"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Trash2, ArrowLeft, Loader2, MessageSquare, Mail, Calendar, User } from "lucide-react";
import Link from "next/link";

export default function AdminMessages() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [messages, setMessages] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/admin/login");
        } else if (user) {
            fetchMessages();
        }
    }, [user, loading, router]);

    const fetchMessages = async () => {
        setFetching(true);
        const res = await fetch("/api/admin/messages");
        if (res.ok) {
            const data = await res.json();
            setMessages(data);
        }
        setFetching(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const res = await fetch(`/api/admin/messages?id=${id}`, { method: "DELETE" });
        if (res.ok) fetchMessages();
    };

    if (loading || fetching) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-12 max-w-5xl">
            <div className="mb-12">
                <Link href="/admin/dashboard" className="text-secondary hover:text-primary flex items-center space-x-2 font-black transition-colors mb-4 uppercase tracking-widest text-xs">
                    <ArrowLeft size={16} />
                    <span>Dashboard</span>
                </Link>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Inquiries & Messages</h1>
            </div>

            <div className="space-y-6">
                {messages.length === 0 ? (
                    <div className="bg-white p-20 rounded-[3rem] border border-gray-100 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-gray-200">
                            <Mail size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Inbox is empty</h2>
                        <p className="text-secondary font-medium">When people contact you through the website, their messages will appear here.</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-indigo-50 text-indigo-500 p-4 rounded-2xl">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900">{msg.name}</h3>
                                        <div className="flex items-center space-x-2 text-secondary font-bold text-sm">
                                            <Mail size={14} />
                                            <span>{msg.email}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2 text-secondary font-black bg-gray-50 px-4 py-2 rounded-xl text-xs uppercase tracking-widest">
                                        <Calendar size={14} />
                                        <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(msg.id)}
                                        className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-8 rounded-[2rem]">
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Subject: {msg.subject || "No Subject"}</p>
                                <p className="text-gray-900 leading-relaxed font-medium whitespace-pre-wrap">{msg.message}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
