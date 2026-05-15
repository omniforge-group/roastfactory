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
  title: "RoastFactory | Persoonlijke roast laten maken | Vanaf €4,99",
  description:
    "Laat een professionele roast maken voor je vriend, collega of ex. Grappig, persoonlijk en binnen 24 uur geleverd. Battle mode, diss tracks en meer. Vanaf €4,99.",
  keywords:
    "roast maken, persoonlijke roast, diss track, roast cadeau, verjaardag roast, bachelor party roast, roast laten maken, grappig cadeau, roast factory",
  authors: [{ name: "RoastFactory" }],
  creator: "RoastFactory",
  metadataBase: new URL("https://www.roastfactory.eu"),
  alternates: {
    canonical: "https://www.roastfactory.eu",
  },
  openGraph: {
    title: "RoastFactory | Laat iemand professioneel roosteren 🔥",
    description:
      "Personaliseerde roasts voor verjaardagen, bachelor parties en meer. Grappig, rauw en binnen 24 uur geleverd.",
    url: "https://www.roastfactory.eu",
    siteName: "RoastFactory",
    images: [
      {
        url: "/images/og-image.svg",
        width: 1200,
        height: 630,
        alt: "RoastFactory - Persoonlijke roasts op maat",
      },
    ],
    locale: "nl_NL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RoastFactory | Laat iemand professioneel roosteren 🔥",
    description:
      "Personaliseerde roasts voor verjaardagen, bachelor parties en meer.",
    images: ["/images/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
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
