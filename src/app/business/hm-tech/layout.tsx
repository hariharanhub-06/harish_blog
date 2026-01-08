import { Metadata } from "next";

export const metadata: Metadata = {
    title: "HM Tech | Digital Solutions",
    description: "Cutting-edge digital solutions and tech consulting.",
    icons: {
        icon: "/hm-tech-logo.png",
    },
};

export default function HMTechLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
