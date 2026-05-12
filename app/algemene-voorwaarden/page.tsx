import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Algemene Voorwaarden — RoastFactory",
  description: "Lees de algemene voorwaarden van RoastFactory.eu.",
};

const articles = [
  {
    title: "1. AI-gegenereerde content",
    body: "De liedteksten, muziek en eventuele aanvullende content worden geheel of gedeeltelijk gegenereerd met behulp van kunstmatige intelligentie (AI), op basis van de door jou aangeleverde informatie. RoastFactory levert een inspanningsverplichting en geen resultaatsverplichting.",
  },
  {
    title: "2. Persoonlijk en creatief karakter",
    body: "Elk lied is subjectief en creatief van aard. Verschillen in stijl, toon, stem en interpretatie zijn inherent aan het proces en vormen geen geldige reden voor afkeuring, annulering of terugbetaling.",
  },
  {
    title: "3. Gebruiksrechten (licentie)",
    body: "Na levering ontvang je een persoonlijke, niet-exclusieve en niet-overdraagbare licentie voor privédoeleinden. Commercieel gebruik is niet toegestaan zonder schriftelijke toestemming.",
  },
  {
    title: "4. Commercieel gebruik",
    body: "Indien je het lied commercieel wilt gebruiken, dien je vooraf contact op te nemen voor een aanvullende licentieovereenkomst.",
  },
  {
    title: "5. Aangeleverde gegevens",
    body: "Je bent volledig verantwoordelijk voor de inhoud, juistheid en rechtmatigheid van de aangeleverde informatie.",
  },
  {
    title: "6. Kwaliteitscontrole",
    body: "RoastFactory voert na elke bestelling een persoonlijke kwaliteitscontrole uit binnen 48 uur na levering. Voldoet het geleverde lied niet aan onze kwaliteitseisen, dan ontvang je kosteloos twee handgemaakte alternatieven inclusief liedteksten. Deze kwaliteitsgarantie geldt uitsluitend op basis van objectieve kwaliteitscriteria en niet op basis van persoonlijke smaak of voorkeur.",
  },
  {
    title: "7. Kwaliteitsgarantie",
    body: "Indien RoastFactory na kwaliteitscontrole vaststelt dat het geleverde product niet voldoet aan redelijke kwaliteitsnormen op het gebied van uitspraak, muzikale kwaliteit of technische uitvoering, zal RoastFactory uit eigen beweging contact opnemen met de klant en kosteloos twee nieuwe liedjes inclusief liedteksten leveren. De klant hoeft hiervoor geen actie te ondernemen.",
  },
  {
    title: "8. Levering en levertijd",
    body: "Levertijden zijn indicatief. Vertragingen geven geen recht op annulering, schadevergoeding of terugbetaling.",
  },
  {
    title: "9. Annulering en restitutie",
    body: "Na start van het creatieproces is annulering niet meer mogelijk. Na levering is restitutie uitgesloten.",
  },
  {
    title: "10. Geen professioneel advies",
    body: "De gegenereerde content is uitsluitend bedoeld voor entertainment en creatieve doeleinden.",
  },
  {
    title: "11. Aansprakelijkheid",
    body: "RoastFactory is niet aansprakelijk voor directe of indirecte schade. Totale aansprakelijkheid is beperkt tot het betaalde bedrag.",
  },
  {
    title: "12. Technische levering",
    body: "RoastFactory is niet verantwoordelijk voor compatibiliteit, downloadproblemen of externe diensten.",
  },
  {
    title: "13. Gebruik voor promotie",
    body: "RoastFactory mag geanonimiseerde delen gebruiken voor portfolio en marketing, tenzij de klant vooraf bezwaar maakt.",
  },
  {
    title: "14. Overmacht",
    body: "RoastFactory is niet aansprakelijk bij storingen in AI-systemen, technische problemen of uitval van externe leveranciers.",
  },
  {
    title: "15. Misbruik",
    body: "Bij misbruik of fraude behoudt RoastFactory zich het recht voor bestellingen te annuleren zonder restitutie.",
  },
  {
    title: "16. Wijzigingen",
    body: "RoastFactory behoudt zich het recht voor deze voorwaarden op elk moment te wijzigen. De meest actuele versie is altijd te vinden op roastfactory.eu/algemene-voorwaarden.",
  },
];

export default function AlgemeneVoorwaardenPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-white/60 bg-white shadow-sm">
              <Image
                src="/logo.png"
                alt="RoastFactory logo"
                fill
                className="object-contain p-1"
                priority
              />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">RoastFactory</p>
              <p className="text-xs text-slate-500">Persoonlijke songs op maat</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/#hoe-het-werkt" className="text-sm font-medium text-slate-600 hover:text-slate-950">
              Hoe het werkt
            </Link>
            <Link href="/#voorbeelden" className="text-sm font-medium text-slate-600 hover:text-slate-950">
              Inspiratie
            </Link>
            <Link href="/#faq" className="text-sm font-medium text-slate-600 hover:text-slate-950">
              FAQ
            </Link>
          </nav>

          <Link
            href="/bestellen"
            className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#f59e0b_0%,#ec4899_50%,#3b82f6_100%)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-200"
          >
            Start jouw song
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-16 lg:px-8 lg:py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
          Juridisch
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
          Algemene Voorwaarden
        </h1>
        <p className="mt-5 text-base leading-7 text-slate-500">
          Laatst bijgewerkt: april 2025
        </p>

        <div className="mt-8 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-8">
          <p className="font-semibold text-slate-900">Timber Services</p>
          <ul className="mt-3 space-y-1 text-sm text-slate-600">
            <li>KVK-nummer: 88562700</li>
            <li>BTW-nummer: NL004626847B65</li>
            <li>Abeltasmanstraat 22, 6413LT Heerlen, Nederland</li>
            <li>
              <a href="mailto:info@roastfactory.eu" className="underline hover:text-slate-950">
                info@roastfactory.eu
              </a>
            </li>
          </ul>
        </div>

        <p className="mt-6 text-base leading-8 text-slate-600">
          Door een bestelling te plaatsen via RoastFactory.eu ga je akkoord met de onderstaande
          algemene voorwaarden. Lees deze aandachtig door.
        </p>

        <div className="mt-12 space-y-6">
          {articles.map((article) => (
            <div
              key={article.title}
              className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-bold tracking-tight text-slate-950">{article.title}</h2>
              <p className="mt-3 text-base leading-8 text-slate-600">{article.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(249,115,22,0.08),rgba(236,72,153,0.08),rgba(59,130,246,0.08))] p-8 ring-1 ring-slate-200">
          <h2 className="text-xl font-bold tracking-tight text-slate-950">Contact</h2>
          <p className="mt-4 text-base leading-8 text-slate-700">
            Heb je vragen over deze voorwaarden? Neem dan contact met ons op via{" "}
            <a href="mailto:info@roastfactory.eu" className="font-semibold underline hover:text-slate-950">
              info@roastfactory.eu
            </a>
            .
          </p>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-slate-500 sm:flex-row lg:px-8">
          <p>© {new Date().getFullYear()} Timber Services — RoastFactory.eu</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-950">
              Privacyverklaring
            </Link>
            <Link href="/algemene-voorwaarden" className="hover:text-slate-950">
              Algemene Voorwaarden
            </Link>
            <Link
              href="/bestellen"
              className="inline-flex items-center font-semibold text-slate-900 hover:text-slate-700"
            >
              Start jouw song
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
