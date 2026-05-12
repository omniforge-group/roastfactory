import "./globals.css";
import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import Script from "next/script";
import PageViewTracker from "./_components/PageViewTracker";
import CrispChat from "./components/CrispChat";
import CookieBanner from "./components/CookieBanner";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RoastFactory | AI Roasts & Diss Tracks op Maat | Vanaf €4,99",
  description:
    "Laat AI een persoonlijke roast maken van je vriend, collega of ex. Diss tracks, battle mode en savage content — klaar voor TikTok, Reels of de groepschat. Vanaf €4,99.",
  keywords: [
    "roast op maat",
    "AI diss track",
    "persoonlijke roast",
    "grappig cadeau",
    "verjaardag roast",
    "battle mode",
    "groepschat roast",
    "TikTok roast",
  ],
  metadataBase: new URL("https://www.roastfactory.eu"),
  alternates: {
    canonical: "https://www.roastfactory.eu",
  },
  openGraph: {
    title: "RoastFactory | AI Roasts & Diss Tracks op Maat",
    description:
      "Laat AI een persoonlijke roast maken van je vriend, collega of ex. Klaar voor TikTok, Reels of de groepschat. Vanaf €4,99.",
    url: "https://www.roastfactory.eu",
    siteName: "RoastFactory",
    locale: "nl_NL",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "RoastFactory – AI Roasts & Diss Tracks op Maat",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RoastFactory | AI Roasts & Diss Tracks op Maat",
    description:
      "Laat AI een persoonlijke roast maken van je vriend, collega of ex. Vanaf €4,99.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`${bebasNeue.variable} ${inter.variable}`} suppressHydrationWarning>
      <body>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-FGSBTQFQ75"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-FGSBTQFQ75');
          `}
        </Script>
        <PageViewTracker />
        <CrispChat />
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
