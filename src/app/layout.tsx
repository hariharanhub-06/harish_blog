import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins"
});

export const metadata: Metadata = {
  metadataBase: new URL('https://harishblog.fyi'),
  title: "Hari Haran Jeyaramamoorthy | Developer & Consultant",
  description: "Portfolio of Hari Haran J.; specializing in HM Snacks (E-commerce) & HM Tech (Software Solutions). Small Scale ➜ Big Scale.",
  keywords: ["Hari Haran Jeyaramamoorthy", "Web Developer", "Business Consultant", "HM Snacks", "HM Tech"],
  icons: {
    icon: [
      { url: "/hh-gold-logo.png" },
      { url: "/hh-gold-logo.png", sizes: "32x32" },
    ],
    shortcut: "/hh-gold-logo.png",
    apple: "/hh-gold-logo.png",
  },
  other: {
    "google-adsense-account": "ca-pub-8379879880114790",
  },
};

import ClientLayout from "@/components/ClientLayout";
import { CartProvider } from "@/context/CartContext";
import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8379879880114790"
          crossOrigin="anonymous"
          strategy="afterInteractive"
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
