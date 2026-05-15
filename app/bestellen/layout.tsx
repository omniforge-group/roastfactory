import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maak je roast | RoastFactory",
  description:
    "Bestel jouw persoonlijke roast. Kies je pakket, vul je details in en ontvang binnen 24 uur jouw AI-gegenereerde diss track.",
};

export default function BestellenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
