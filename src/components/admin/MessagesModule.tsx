"use client";

import { useEffect, useState } from "react";
import {
    Trash2,
    Mail,
    User,
    Calendar,
    Loader2,
    MessageSquare,
    ChevronDown,
    ChevronUp
} from "lucide-react";

export default function MessagesModule() {
    const [messages, setMessages] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        setFetching(true);
        const res = await fetch("/api/admin/messages");
        if (res.ok) {
            const data = await res.json();
            setMessages(data);
        }
        setFetching(false);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Delete this message?")) return;
        const res = await fetch(`/api/admin/messages?id=${id}`, { method: "DELETE" });
        if (res.ok) fetchMessages();
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-black text-gray-900">Inbox</h2>

            <div className="space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`bg-white rounded-3xl border border-gray-100 shadow-sm transition-all overflow-hidden cursor-pointer hover:shadow-md ${expanded === msg.id ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setExpanded(expanded === msg.id ? null : msg.id)}
                    >
                        <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center space-x-6">
                                <div className="bg-gray-50 p-4 rounded-2xl text-secondary">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg">{msg.name}</h3>
                                    <p className="text-secondary text-sm font-medium">{msg.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-6 w-full md:w-auto justify-between">
                                <div className="flex items-center space-x-2 text-secondary/60 text-[10px] font-black uppercase tracking-widest">
                                    <Calendar size={14} />
                                    <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={(e) => handleDelete(msg.id, e)}
                                        className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all outline-none"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    {expanded === msg.id ? <ChevronUp size={20} className="text-gray-300" /> : <ChevronDown size={20} className="text-gray-300" />}
                                </div>
                            </div>
                        </div>

                        {expanded === msg.id && (
                            <div className="px-8 pb-8 pt-4 border-t border-gray-50 flex flex-col space-y-4 animate-in fade-in slide-in-from-top-2">
                                <p className="text-secondary/60 text-[10px] font-black uppercase tracking-widest">Subject: {msg.subject || 'No Subject'}</p>
                                <div className="bg-gray-50 p-8 rounded-2xl">
                                    <p className="text-gray-900 font-medium whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {messages.length === 0 && (
                    <div className="text-center py-32 bg-gray-50 rounded-[4rem] border-2 border-dashed border-gray-200">
                        <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <MessageSquare size={32} className="text-gray-200" />
                        </div>
                        <p className="text-secondary font-black uppercase tracking-widest">Your inbox is empty</p>
                    </div>
                )}
            </div>
        </div>
    );
}
