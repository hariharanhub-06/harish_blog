import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import ClientLayout from "@/components/ClientLayout";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins"
});

export const metadata: Metadata = {
  metadataBase: new URL('https://hariharanhub.com'),
  title: "Hari Haran | Business Consultant & Developer in Coimbatore",
  description: "Expert Business Consultant and Web Developer based in Coimbatore. Specializing in software solutions, startup strategy, and digital transformation.",
  keywords: [
    "Hari Haran Jeyaramamoorthy",
    "Hari Haran Blog",
    "Business Consultant Coimbatore",
    "Web Developer Coimbatore",
    "Software Engineer India",
    "Startup Consultant",
    "HM Snacks",
    "HM Tech",
    "Haripicks",
    "Freelance Developer Coimbatore",
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
    title: "Hari Haran's Blog | Developer & Consultant",
    description: "Read my latest thoughts on Technology, Business, and Software Development.",
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
              "jobTitle": "Business Consultant & Software Developer",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Coimbatore",
                "addressRegion": "Tamil Nadu",
                "addressCountry": "IN"
              },
              "worksFor": [],
              "knowsAbout": ["Web Development", "Business Consulting", "E-commerce", "Startup Strategy", "Software Engineering"],
              "sameAs": [
                "https://linkedin.com/in/hari-haran-j",
                "https://github.com/startup-digi-3119",
                "https://instagram.com/_mr_vibrant"
              ]
            })
          }}
        />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased text-text`}>
        <AuthProvider>
          <ClientLayout>
            {children}
            <Analytics />
          </ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
