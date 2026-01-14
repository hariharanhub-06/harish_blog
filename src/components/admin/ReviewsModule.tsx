"use client";

import { useEffect, useState } from "react";
import { Star, Check, X, RefreshCw, MessageSquare, Loader2 } from "lucide-react";

export default function ReviewsModule() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/reviews");
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        } catch (error) {
            console.error("Failed to fetch reviews:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleModerate = async (id: string, status: "Approved" | "Spam") => {
        try {
            const res = await fetch("/api/admin/reviews", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status }),
            });
            if (res.ok) fetchReviews();
        } catch (error) {
            console.error("Failed to moderate review:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Reviews Moderation</h2>
                    <p className="text-gray-400 text-[10px] font-medium uppercase tracking-widest">Manage customer feedback across HM Snacks.</p>
                </div>
                <button
                    onClick={fetchReviews}
                    className="p-2 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-all text-gray-400 hover:text-gray-900 shadow-sm"
                >
                    <RefreshCw size={16} />
                </button>
            </div>

            <div className="grid gap-4">
                {reviews.map((review) => (
                    <div
                        key={review.id}
                        className={`bg-white p-4 rounded-2xl border transition-all ${review.status === "Pending" ? "border-amber-100 bg-amber-50/10 shadow-md" : "border-gray-50"
                            }`}
                    >
                        <div className="flex justify-between items-start">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white font-black text-xs">
                                        {review.customerName.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-gray-900">{review.customerName}</h4>
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={10}
                                                    className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-600 text-[13px] font-medium italic">"{review.comment}"</p>
                                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
                                    <span className={
                                        review.status === "Approved" ? "text-emerald-500 bg-emerald-50 px-2.5 py-0.5 rounded-full" :
                                            review.status === "Spam" ? "text-rose-500 bg-rose-50 px-2.5 py-0.5 rounded-full" :
                                                "text-amber-500 bg-amber-50 px-2.5 py-0.5 rounded-full"
                                    }>
                                        {review.status}
                                    </span>
                                    <span className="text-gray-300">• {new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {review.status === "Pending" && (
                                <div className="flex gap-1.5">
                                    <button
                                        onClick={() => handleModerate(review.id, "Approved")}
                                        className="p-2 bg-emerald-50 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                        title="Approve"
                                    >
                                        <Check size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleModerate(review.id, "Spam")}
                                        className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                        title="Mark Spam"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {reviews.length === 0 && (
                    <div className="py-20 text-center bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                        <Star size={48} className="text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest">No reviews found yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
