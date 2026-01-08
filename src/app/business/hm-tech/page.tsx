import { db } from "@/db";
import { projects } from "@/db/schema";
import { desc } from "drizzle-orm";
import HMTechView from "@/components/HMTechView";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "HM Tech | Digital Solutions",
    description: "Cutting-edge digital solutions and tech consulting.",
    icons: {
        icon: "/hm-tech-logo.png",
    },
};

export default async function HMTechPage() {
    // Fetch Projects using Server Component functionality
    const allProjects = await db.query.projects.findMany({
        orderBy: [desc(projects.order), desc(projects.createdAt)],
    });

    return (
        <HMTechView projects={allProjects} />
    );
}
