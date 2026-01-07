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
    ChevronUp,
    Eye,
    MessageCircle,
    Edit3,
    X
} from "lucide-react";

export default function MessagesModule() {
    const [messages, setMessages] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [viewing, setViewing] = useState<any>(null);
    const [editing, setEditing] = useState<any>(null);

    // Default Options
    const defaultCategories = [
        "Business Development",
        "Web Development",
        "Graphic or Poster Designing",
        "Education Training purpose",
        "Not Determined"
    ];

    const defaultStatuses = [
        "Fresh",
        "RNR",
        "Call Connected",
        "On Process",
        "On Discussion",
        "Delivered"
    ];

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

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this message?")) return;
        const res = await fetch(`/api/admin/messages?id=${id}`, { method: "DELETE" });
        if (res.ok) fetchMessages();
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/admin/messages", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editing),
            });
            if (res.ok) {
                setEditing(null);
                fetchMessages();
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Derived options from existing data + defaults
    const availableCategories = Array.from(new Set([...defaultCategories, ...messages.map(m => m.category || "Not Determined")]));
    const availableStatuses = Array.from(new Set([...defaultStatuses, ...messages.map(m => m.status || "Fresh")]));

    if (fetching) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-black text-gray-900">Inbox ({messages.length})</h2>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-6 text-xs font-black uppercase tracking-widest text-secondary/50">Details</th>
                                <th className="p-6 text-xs font-black uppercase tracking-widest text-secondary/50">Status</th>
                                <th className="p-6 text-xs font-black uppercase tracking-widest text-secondary/50">Category</th>
                                <th className="p-6 text-xs font-black uppercase tracking-widest text-secondary/50 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {messages.map((msg) => (
                                <tr key={msg.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="p-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 text-primary flex items-center justify-center font-black text-sm">
                                                {msg.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{msg.name}</h3>
                                                <p className="text-xs font-medium text-secondary">{msg.email}</p>
                                                <p className="text-[10px] text-secondary/50 uppercase tracking-widest mt-1">{new Date(msg.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${msg.status === 'Fresh' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                                            {msg.status || 'Fresh'}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <span className="text-xs font-bold text-gray-700">{msg.category || 'Not Determined'}</span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex justify-end items-center space-x-2">
                                            <button onClick={() => setViewing(msg)} title="View Details" className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-500 rounded-lg transition-colors">
                                                <Eye size={18} />
                                            </button>
                                            <a
                                                href={`https://wa.me/${msg.mobile?.replace(/\D/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title="WhatsApp"
                                                className="p-2 hover:bg-green-50 text-gray-400 hover:text-green-500 rounded-lg transition-colors"
                                            >
                                                <MessageCircle size={18} />
                                            </a>
                                            <button onClick={() => setEditing(msg)} title="Edit Status" className="p-2 hover:bg-amber-50 text-gray-400 hover:text-amber-500 rounded-lg transition-colors">
                                                <Edit3 size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(msg.id)} title="Delete" className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {messages.length === 0 && (
                    <div className="text-center py-20 px-6">
                        <div className="bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <MessageSquare size={24} className="text-gray-300" />
                        </div>
                        <p className="text-secondary font-black uppercase tracking-widest text-sm">No messages found</p>
                    </div>
                )}
            </div>

            {/* View Details Modal */}
            {viewing && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black">Message Details</h3>
                            <button onClick={() => setViewing(null)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Name</p>
                                    <p className="font-bold text-gray-900">{viewing.name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Company</p>
                                    <p className="font-bold text-gray-900">{viewing.company || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Email</p>
                                    <a href={`mailto:${viewing.email}`} className="font-bold text-primary hover:underline">{viewing.email}</a>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Mobile</p>
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-gray-900">{viewing.mobile}</p>
                                        <a href={`https://wa.me/${viewing.mobile?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-green-500 hover:scale-110 transition-transform"><MessageCircle size={16} /></a>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Website</p>
                                    {viewing.website ? (
                                        <a href={viewing.website} target="_blank" rel="noreferrer" className="font-bold text-primary hover:underline truncate block">{viewing.website}</a>
                                    ) : <span className="text-gray-400 font-medium">-</span>}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Social</p>
                                    <p className="font-bold text-gray-900">{viewing.socialMedia || '-'}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Subject</p>
                                <p className="font-bold text-gray-900">{viewing.subject || 'No Subject'}</p>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-2xl">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Message Content</p>
                                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{viewing.message}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Current Status</p>
                                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-bold">{viewing.status || 'Fresh'}</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Category</p>
                                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-bold">{viewing.category || 'Not Determined'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editing && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black">Update Status</h3>
                            <button onClick={() => setEditing(null)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">Category</label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-primary appearance-none font-bold"
                                        value={availableCategories.includes(editing.category) ? editing.category : '__new__'}
                                        onChange={(e) => {
                                            if (e.target.value === '__new__') {
                                                setEditing({ ...editing, category: "", isNewCategory: true });
                                            } else {
                                                setEditing({ ...editing, category: e.target.value, isNewCategory: false });
                                            }
                                        }}
                                    >
                                        {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                        <option value="__new__">+ Add New Category...</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                                {editing.isNewCategory && (
                                    <input
                                        autoFocus
                                        placeholder="Enter new category name..."
                                        className="w-full mt-2 bg-white border-2 border-primary/20 rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none font-bold animate-in fade-in slide-in-from-top-1"
                                        value={editing.category}
                                        onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                                    />
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">Status</label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-primary appearance-none font-bold"
                                        value={availableStatuses.includes(editing.status) ? editing.status : '__new__'}
                                        onChange={(e) => {
                                            if (e.target.value === '__new__') {
                                                setEditing({ ...editing, status: "", isNewStatus: true });
                                            } else {
                                                setEditing({ ...editing, status: e.target.value, isNewStatus: false });
                                            }
                                        }}
                                    >
                                        {availableStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                        <option value="__new__">+ Add New Status...</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                                {editing.isNewStatus && (
                                    <input
                                        autoFocus
                                        placeholder="Enter new status..."
                                        className="w-full mt-2 bg-white border-2 border-primary/20 rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none font-bold animate-in fade-in slide-in-from-top-1"
                                        value={editing.status}
                                        onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                                    />
                                )}
                            </div>

                            <button className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transition-all">
                                Save Updates
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
