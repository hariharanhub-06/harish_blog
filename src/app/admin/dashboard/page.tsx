"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
    LayoutDashboard,
    Briefcase,
    FileText,
    Settings,
    LogOut,
    PlusCircle,
    BarChart3,
    Globe
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";

export default function AdminDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/admin/login");
        }
    }, [user, loading, router]);

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/");
    };

    if (loading || !user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
                    <p className="text-secondary mt-1">Welcome back, {user.email}</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-red-600 font-bold bg-red-50 px-6 py-2 rounded-xl hover:bg-red-100 transition-all"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {[
                    { title: "Manage Portfolio", icon: Briefcase, color: "bg-blue-500", count: "3 Projects", link: "/admin/portfolio" },
                    { title: "Technical Blog", icon: FileText, color: "bg-emerald-500", count: "0 Posts", link: "/admin/blog" },
                    { title: "Inquiries", icon: Globe, color: "bg-amber-500", count: "0 Submissions", link: "/admin/inquiries" },
                ].map((item) => (
                    <div key={item.title} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
                        <div className={`${item.color} text-white p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform`}>
                            <item.icon size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                        <p className="text-secondary text-sm mb-6">{item.count}</p>
                        <Link
                            href={item.link}
                            className="flex items-center space-x-2 text-primary font-bold group-hover:underline"
                        >
                            <span>Manage</span>
                            <PlusCircle size={18} />
                        </Link>
                    </div>
                ))}
            </div>

            <div className="mt-12 bg-gray-50 border border-gray-100 p-8 rounded-[2rem] text-center">
                <BarChart3 className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-lg font-bold text-gray-500 uppercase tracking-widest">Site Analytics</h3>
                <p className="text-secondary mt-2">Enhanced metrics will appear once Google Analytics is integrated.</p>
            </div>
        </div>
    );
}
