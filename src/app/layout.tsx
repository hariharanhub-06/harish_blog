import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import ClientLayout from "@/components/ClientLayout";
import { CartProvider } from "@/context/CartContext";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins"
});

export const metadata: Metadata = {
  metadataBase: new URL('https://hariharanhub.com'),
  title: "Hari Haran's Blog | Developer, Consultant & Entrepreneur",
  description: "Official Blog & Portfolio of Hari Haran Jeyaramamoorthy. Insights on Web Development, HM Snacks (E-commerce), HM Tech, and HariPicks.",
  keywords: [
    "Hari Haran Jeyaramamoorthy",
    "Hari Haran Blog",
    "Tech Blog",
    "Web Developer",
    "Business Consultant",
    "HM Snacks",
    "HM Tech",
    "Haripicks",
    "Snack Business",
    "Tech Solutions",
    "Software Engineer",
    "Next.js Developer"
  ],
  icons: {
    icon: [
      { url: "/hh-gold-logo.png" },
      { url: "/hh-gold-logo.png", sizes: "32x32" },
    ],
    shortcut: "/hh-gold-logo.png",
    apple: "/hh-gold-logo.png",
  },
  openGraph: {
    title: "Hari Haran's Blog | Developer, Consultant & Entrepreneur",
    description: "Read my latest thoughts on Technology, Business, and E-commerce. Featuring HM Snacks, HM Tech, and HariPicks.",
    url: 'https://hariharanhub.com',
    siteName: 'Hari Haran Jeyaramamoorthy',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Hari Haran Jeyaramamoorthy",
              "url": "https://hariharanhub.com",
              "jobTitle": "Founder & Developer",
              "worksFor": [
                {
                  "@type": "Organization",
                  "name": "HM Tech",
                  "url": "https://hariharanhub.com/business/hm-tech"
                },
                {
                  "@type": "Organization",
                  "name": "HM Snacks",
                  "url": "https://hariharanhub.com/business/hm-snacks"
                }
              ],
              "knowsAbout": ["Web Development", "E-commerce", "Business Strategy", "Software Engineering"],
              "sameAs": [
                "https://linkedin.com/in/hari-haran-j",
                "https://github.com/startup-digi-3119"
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "HM Snacks",
              "url": "https://hariharanhub.com/business/hm-snacks",
              "logo": "https://hariharanhub.com/hm-snacks-logo.png",
              "description": "Authentic traditional snacks from HM Snacks.",
              "parentOrganization": {
                "@type": "Person",
                "name": "Hari Haran Jeyaramamoorthy"
              }
            })
          }}
        />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased text-text`}>
        <AuthProvider>
          <CartProvider>
            <ClientLayout>
              {children}
              <Analytics />
            </ClientLayout>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
