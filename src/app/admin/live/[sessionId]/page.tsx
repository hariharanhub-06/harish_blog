import { db } from "@/db";
import { liveSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import AdminLiveRoomClient from "@/components/admin/AdminLiveRoomClient";

interface Props {
    params: Promise<{
        sessionId: string;
    }>;
}

export default async function AdminLivePage({ params }: Props) {
    const { sessionId } = await params;

    // Fetch Session
    const session = await db.query.liveSessions.findFirst({
        where: eq(liveSessions.id, sessionId)
    });

    if (!session) {
        redirect("/admin?error=not_found");
    }

    return (
        <div className="min-h-screen bg-gray-50 overflow-hidden">
            <AdminLiveRoomClient session={session} />
        </div>
    );
}
