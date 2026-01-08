import { Metadata } from "next";

export const metadata: Metadata = {
    title: "HM Snacks | Tradition Taste",
    description: "Authentic traditional snacks from HM Snacks.",
    icons: {
        icon: "/hm-snacks-logo.png",
        shortcut: "/hm-snacks-logo.png",
        apple: "/hm-snacks-logo.png",
    },
};

export default function HMSnacksLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
