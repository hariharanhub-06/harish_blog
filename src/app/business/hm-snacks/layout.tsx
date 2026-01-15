import { Metadata } from "next";

export const metadata: Metadata = {
    title: "HM Snacks | Authentic Traditional Indian Snacks",
    description: "Taste the tradition with HM Snacks. Authentic swal (kara sev), murukku, and savory mixes. Freshly made and delivered to your doorstep.",
    keywords: ["HM Snacks", "Indian Snacks", "Murukku", "Traditional Snacks", "Swal", "Kara Sev", "Food Delivery", "Authentic Taste"],
    icons: {
        icon: "/hm-snacks-logo.png",
        shortcut: "/hm-snacks-logo.png",
        apple: "/hm-snacks-logo.png",
    },
    openGraph: {
        title: "HM Snacks | Authentic Traditional Indian Snacks",
        description: "Taste the tradition. Freshly made authentic Indian snacks.",
        url: 'https://hariharanhub.com/business/hm-snacks',
        siteName: 'HM Snacks',
        locale: 'en_IN',
        type: 'website',
    }
};

export default function HMSnacksLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
