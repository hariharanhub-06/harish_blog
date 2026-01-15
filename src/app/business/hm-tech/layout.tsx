import { Metadata } from "next";

export const metadata: Metadata = {
    title: "HM Tech | Innovative Software & Digital Solutions",
    description: "Transform your business with HM Tech. Custom web development, mobile apps, and digital strategy consulting by Hari Haran.",
    keywords: ["HM Tech", "Software Development", "Web Development", "App Development", "Digital Consulting", "Tech Solutions", "Hari Haran Tech"],
    icons: {
        icon: "/hm-tech-logo.png",
        shortcut: "/hm-tech-logo.png",
        apple: "/hm-tech-logo.png",
    },
    openGraph: {
        title: "HM Tech | Innovative Software & Digital Solutions",
        description: "Transform your business with cutting-edge digital solutions.",
        url: 'https://hariharanhub.com/business/hm-tech',
        siteName: 'HM Tech',
        locale: 'en_IN',
        type: 'website',
    }
};

export default function HMTechLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
