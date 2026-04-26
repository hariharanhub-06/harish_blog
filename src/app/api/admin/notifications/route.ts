import { db } from "@/db";
import { contactSubmissions, feedbacks, formResponses, forms } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const notifications: any[] = [];

        // Fetch recent contact submissions (Enquiries)
        const contacts = await db
            .select()
            .from(contactSubmissions)
            .where(eq(contactSubmissions.status, "New"))
            .orderBy(desc(contactSubmissions.createdAt))
            .limit(10);

        contacts.forEach(c => {
            notifications.push({
                id: c.id,
                type: "enquiry",
                title: "New Client Enquiry",
                message: `From ${c.name} (${c.email})`,
                date: c.createdAt,
                icon: "MessageSquare",
                color: "text-emerald-500",
                bg: "bg-emerald-500/10",
                actionTab: "messages"
            });
        });

        // Fetch recent feedbacks (Testimonials)
        const feedbackList = await db
            .select()
            .from(feedbacks)
            .where(eq(feedbacks.status, "New"))
            .orderBy(desc(feedbacks.createdAt))
            .limit(10);

        feedbackList.forEach(f => {
            notifications.push({
                id: f.id,
                type: "feedback",
                title: "Student Testimonial",
                message: `New feedback received from ${f.name}.`,
                date: f.createdAt,
                icon: "HeartHandshake",
                color: "text-pink-500",
                bg: "bg-pink-500/10",
                actionTab: "feedbacks"
            });
        });

        // Fetch recent form responses
        // We join with forms to get the form title
        const responses = await db
            .select({
                id: formResponses.id,
                createdAt: formResponses.createdAt,
                formTitle: forms.title
            })
            .from(formResponses)
            .innerJoin(forms, eq(formResponses.formId, forms.id))
            .orderBy(desc(formResponses.createdAt))
            .limit(10);

        responses.slice(0, 5).forEach(r => {
            notifications.push({
                id: r.id,
                type: "form",
                title: "New Form Submission",
                message: `Response received for: ${r.formTitle}`,
                date: r.createdAt,
                icon: "FileText",
                color: "text-blue-500",
                bg: "bg-blue-500/10",
                actionTab: "forms"
            });
        });

        // Sort by date desc
        notifications.sort((a, b) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        // Returns count for red badge, and the items for the tray itself
        return NextResponse.json({
            unreadMessages: contacts.length,
            pendingFeedbacks: feedbackList.length,
            items: notifications.slice(0, 15),
            totalNew: notifications.length
        });
    } catch (error: any) {
        console.error("Notifications API Error:", error.message);
        return NextResponse.json({ error: "Failed to fetch counts" }, { status: 500 });
    }
}
