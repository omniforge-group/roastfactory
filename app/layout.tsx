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
  title: "RoastFactory | Persoonlijke roast op maat | Vanaf €4,99",
  description:
    "Laat een persoonlijke roast op maat maken voor je vriend, collega of ex. Grappig, rauw en binnen 24 uur geleverd. Geen AI onzin — echte roasts gemaakt voor jouw slachtoffer. Vanaf €4,99.",
  keywords:
    "roast op maat, persoonlijke roast, roast cadeau, roast laten maken, diss track, verjaardag roast, bachelor party roast, groepschat roast",
  metadataBase: new URL("https://www.roastfactory.eu"),
  alternates: {
    canonical: "https://www.roastfactory.eu",
  },
  openGraph: {
    title: "RoastFactory | Persoonlijke roast op maat 🔥",
    description:
      "Jij levert de inside jokes. Wij leveren de vernietiging. Binnen 24 uur klaar om je slachtoffer of groepschat te slopen.",
    url: "https://www.roastfactory.eu",
    siteName: "RoastFactory",
    images: [
      {
        url: "/images/og-image.png",
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
    title: "RoastFactory | Persoonlijke roast op maat 🔥",
    description: "Jij levert de inside jokes. Wij leveren de vernietiging.",
    images: ["/images/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
    shortcut: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`${bebasNeue.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="shortcut icon" href="/logo.png" />
      </head>
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
