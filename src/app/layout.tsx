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
  title: "Hariharan Jeyaramamoorthy | Business Consultant & Developer – Coimbatore",
  description: "Hariharan Jeyaramamoorthy (Hari Haran J), Business Consultant and Software Developer based in Coimbatore, Tamil Nadu. Expert in digital solutions, startup strategy, web development, and financial consulting.",
  keywords: [
    "Hariharan Jeyaramamoorthy",
    "Hariharan Coimbatore",
    "Hariharan J",
    "Hari Coimbatore",
    "Hariharan",
    "Hari Haran J Coimbatore",
    "Hari Haran Jeyaramamoorthy",
    "Hari Haran Blog",
    "Business Consultant Coimbatore",
    "Web Developer Coimbatore",
    "Software Developer Coimbatore",
    "Startup Consultant Tamil Nadu",
    "Software Engineer India",
    "Freelance Developer Coimbatore",
    "HM Snacks",
    "HM Tech",
    "Haripicks",
    "Next.js Developer"
  ],
  alternates: {
    canonical: "https://hariharanhub.com",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hariharan Jeyaramamoorthy",
  },
  icons: {
    icon: [
      { url: "/hari-favicon.png" },
      { url: "/hari-favicon.png", sizes: "32x32" },
    ],
    shortcut: "/hari-favicon.png",
    apple: "/hari-favicon.png",
  },
  openGraph: {
    title: "Hariharan Jeyaramamoorthy | Business Consultant & Developer – Coimbatore",
    description: "Hariharan Jeyaramamoorthy (Hari Haran J) — Business Consultant, Software Developer, and Entrepreneur based in Coimbatore, Tamil Nadu.",
    url: 'https://hariharanhub.com',
    siteName: 'Hariharan Jeyaramamoorthy',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/hari_photo.png',
        width: 800,
        height: 800,
        alt: 'Hariharan Jeyaramamoorthy',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hariharan Jeyaramamoorthy | Business Consultant & Developer",
    description: "Hariharan Jeyaramamoorthy (Hari Haran J) — Business Consultant and Software Developer based in Coimbatore, Tamil Nadu.",
    images: ['/hari_photo.png'],
  },
  other: {
    "google-adsense-account": "ca-pub-8379879880114790"
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
        {/* rel="me" links tell Google that these social profiles belong to hariharanhub.com */}
        <link rel="me" href="https://www.linkedin.com/in/hari-haran-jeyaramamoorthy/" />
        <link rel="me" href="https://www.instagram.com/_mr_vibrant/" />
        <link rel="me" href="https://www.facebook.com/profile.php?id=61573749598737" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Person",
                "name": "Hariharan Jeyaramamoorthy",
                "alternateName": ["Hari Haran J", "Hariharan J", "Hari Haran Jeyaramamoorthy", "Hariharan Coimbatore"],
                "url": "https://hariharanhub.com",
                "image": "https://hariharanhub.com/hari_photo.png",
                "jobTitle": "Business Consultant & Software Developer",
                "email": "support@powerconnect.ai",
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "Coimbatore",
                  "addressRegion": "Tamil Nadu",
                  "addressCountry": "IN"
                },
                "knowsAbout": ["Web Development", "Business Consulting", "E-commerce", "Startup Strategy", "Software Engineering", "Financial Consulting"],
                "sameAs": [
                  "https://www.linkedin.com/in/hari-haran-jeyaramamoorthy/",
                  "https://github.com/startup-digi-3119",
                  "https://www.instagram.com/_mr_vibrant/",
                  "https://www.facebook.com/profile.php?id=61573749598737"
                ]
              },
              {
                "@context": "https://schema.org",
                "@type": "LocalBusiness",
                "name": "Hariharan Jeyaramamoorthy – Business Consulting",
                "url": "https://hariharanhub.com",
                "image": "https://hariharanhub.com/hari_photo.png",
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "Coimbatore",
                  "addressRegion": "Tamil Nadu",
                  "addressCountry": "IN"
                },
                "priceRange": "₹₹"
              }
            ])
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
