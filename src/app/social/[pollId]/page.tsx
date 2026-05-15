import { db } from "@/db";
import { websitePolls } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import SocialInteractionSection from "@/components/SocialInteractionSection";

interface Props {
    params: { pollId: string };
    searchParams: { from?: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const poll = await db.query.websitePolls.findFirst({
        where: eq(websitePolls.id, params.pollId),
    });
    return {
        title: poll?.question ?? "Vote Now",
        description: "Cast your vote and see what others think!",
    };
}

export default async function PublicPollPage({ params, searchParams }: Props) {
    const poll = await db.query.websitePolls.findFirst({
        where: eq(websitePolls.id, params.pollId),
    });

    if (!poll || !poll.isActive) redirect("/");

    const profile = await db.query.profiles.findFirst() ?? {};
    const platform = searchParams?.from ?? "direct";

    return (
        <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
            <SocialInteractionSection
                poll={poll as any}
                profile={profile as any}
                platform={platform}
                standalone={true}
            />
            <p className="mt-6 text-white/30 text-xs tracking-[0.3em] uppercase">hariharanhub.com</p>
        </main>
    );
}
