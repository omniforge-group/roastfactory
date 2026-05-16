import Image from "next/image";
import Link from "next/link";
import Navbar from "./components/Navbar";
import UseCasesSection from "./components/UseCasesSection";
import BattleAudioCards from "./components/BattleAudioCards";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";

// ─── Pakketten ────────────────────────────────────────────────────────────────
const packages = [
  {
    name: "Quick Roast",
    price: "€4,99",
    duration: "45–60 sec",
    items: ["MP3 download", "Simpele cover art", "Klaar in 24 uur"],
    cta: "Bestel Quick Roast",
    highlight: false,
    badge: null,
  },
  {
    name: "Savage Pack",
    price: "€9,99",
    duration: "60–90 sec",
    items: ["Meer persoonlijke details", "Custom cover art", "Klaar in 24 uur"],
    cta: "Bestel Savage Pack",
    highlight: true,
    badge: "BESTSELLER",
  },
  {
    name: "Nuclear Pack",
    price: "€19,99",
    duration: "90 sec+",
    items: ["Extra persoonlijk", "Intro op naam", "Custom cover art", "Klaar in 24 uur"],
    cta: "Bestel Nuclear Pack",
    highlight: false,
    badge: null,
  },
  {
    name: "Battle Mode",
    price: "€14,99",
    duration: "2 rondes",
    items: ["2 personen", "Twee rondes diss", "MP3 per persoon"],
    cta: "Start een battle",
    highlight: false,
    badge: "🥊",
  },
];

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: "Hoe lang duurt een roast?",
    a: "Afhankelijk van het pakket: een Quick Roast duurt 45–60 seconden, een Savage Pack 60–90 seconden en een Nuclear Pack 90 seconden of meer. Battle Mode bestaat uit twee rondes.",
  },
  {
    q: "Is het echt persoonlijk?",
    a: "Ja. Jij vult naam, bijnamen, inside jokes en grappige momenten in. AI verwerkt dat in een roast die aanvoelt alsof ie uit de groepschat zelf komt.",
  },
  {
    q: "Kan ik het op TikTok gebruiken?",
    a: "Absoluut. De roast is jouw eigendom na aankoop. Perfect voor TikTok, Instagram Reels, WhatsApp of gewoon op het feestje zelf.",
  },
  {
    q: "Kan het minder hard?",
    a: "Ja. Bij het bestellen kies je het roast-level: mild, medium of nuclear. Jij bepaalt hoe hard het aankomt.",
  },
  {
    q: "Wat mag niet?",
    a: "Racisme, discriminatie, persoonlijke bedreigingen of content over minderjarigen. We roasten voor de lol — niet om te kwetsen. Bestellingen die deze grenzen overschrijden worden geweigerd.",
  },
];

// ─── Schema ───────────────────────────────────────────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "RoastFactory",
      url: "https://www.roastfactory.eu",
      logo: "https://www.roastfactory.eu/logo.png",
      contactPoint: {
        "@type": "ContactPoint",
        email: "info@roastfactory.eu",
        contactType: "customer service",
        availableLanguage: "Dutch",
      },
    },
    {
      "@type": "Product",
      name: "Quick Roast",
      description: "Persoonlijke AI-roast van 45–60 seconden. Inclusief MP3 download en simpele cover art. Klaar in 24 uur.",
      brand: { "@type": "Brand", name: "RoastFactory" },
      offers: {
        "@type": "Offer",
        price: "4.99",
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
        url: "https://www.roastfactory.eu/bestellen",
      },
    },
    {
      "@type": "Product",
      name: "Savage Pack",
      description: "Persoonlijke AI-roast van 60–90 seconden met meer details en custom cover art. Klaar in 24 uur.",
      brand: { "@type": "Brand", name: "RoastFactory" },
      offers: {
        "@type": "Offer",
        price: "9.99",
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
        url: "https://www.roastfactory.eu/bestellen",
      },
    },
    {
      "@type": "Product",
      name: "Nuclear Pack",
      description: "Ultrapersoonlijke AI-roast van 90 seconden of meer, met intro op naam en custom cover art. Klaar in 24 uur.",
      brand: { "@type": "Brand", name: "RoastFactory" },
      offers: {
        "@type": "Offer",
        price: "19.99",
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
        url: "https://www.roastfactory.eu/bestellen",
      },
    },
    {
      "@type": "Product",
      name: "Battle Mode",
      description: "Twee personen, twee rondes diss. Een MP3 per persoon. Wie wint de battle?",
      brand: { "@type": "Brand", name: "RoastFactory" },
      offers: {
        "@type": "Offer",
        price: "14.99",
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
        url: "https://www.roastfactory.eu/bestellen",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: {
          "@type": "Answer",
          text: a,
        },
      })),
    },
  ],
};

// ─── FAQ accordion (client-rendered via details/summary) ─────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-2xl border border-white/10 bg-[#111111]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5">
        <span className="text-base font-semibold text-white">{q}</span>
        <span className="shrink-0 text-[#FF2D2D]">
          <ChevronDown className="h-5 w-5 transition-transform group-open:hidden" />
          <ChevronUp className="hidden h-5 w-5 group-open:block" />
        </span>
      </summary>
      <p className="px-6 pb-6 text-sm leading-7 text-white/60">{a}</p>
    </details>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-[#0A0A0A] text-white">
        <Navbar />

        {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
        <section className="relative flex min-h-screen items-center overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/hero.png"
              alt=""
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/70" />
            {/* Red vignette bottom */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
          </div>

          <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:px-8">
            {/* Left */}
            <div>
              <p className="mb-4 font-bebas text-lg tracking-[0.3em] text-[#FF2D2D]">
                🔥 ROASTFACTORY.EU
              </p>
              <h1 className="font-bebas text-7xl leading-none tracking-wide text-white sm:text-8xl lg:text-[6.5rem]">
                ROAST YOUR<br />
                <span className="text-[#FF2D2D]">FRIENDS.</span>
              </h1>
              <p className="mt-5 font-bebas text-2xl tracking-widest text-[#FF6B00] sm:text-3xl">
                DE ROAST DIE ZE NIET ZAGEN AANKOMEN.
              </p>
              <p className="mt-4 max-w-lg text-base leading-7 text-white/60">
                Jij levert de inside jokes. Wij leveren de vernietiging. Binnen 24 uur klaar om je slachtoffer of groepschat te slopen.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/bestellen"
                  className="animate-pulse-red inline-flex items-center justify-center rounded-full bg-[#FF2D2D] px-7 py-4 text-base font-semibold text-white transition-colors hover:bg-[#E02020]"
                >
                  Maak je roast
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <a
                  href="#voorbeelden"
                  className="inline-flex items-center justify-center rounded-full border border-white/30 bg-transparent px-7 py-4 text-base font-semibold text-white transition-colors hover:border-white hover:bg-white/5"
                >
                  Luister voorbeelden
                </a>
              </div>

              {/* Trust strip */}
              <div className="mt-10 flex flex-wrap gap-4 text-sm text-white/40">
                {["Klaar in 24 uur", "MP3 download", "Vanaf €4,99"].map(t => (
                  <span key={t} className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-[#FF2D2D]" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — mic illustration */}
            <div className="relative mx-auto flex h-[400px] w-full max-w-sm items-center justify-center lg:h-[520px] lg:max-w-none">
              <Image
                src="/images/heromic.png"
                alt="RoastFactory mic"
                fill
                className="object-contain drop-shadow-[0_0_60px_rgba(255,45,45,0.3)]"
                priority
              />
            </div>
          </div>
        </section>

        {/* ── 2. USE CASES ────────────────────────────────────────────────── */}
        <span id="voorbeelden" />
        <section id="wie-ga-je-slopen" className="bg-[#111111] py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="mb-12 font-bebas text-5xl tracking-wide text-white sm:text-6xl">
              Wie ga jij slopen? <span className="text-[#FF2D2D]">🔥</span>
            </h2>

            <UseCasesSection />
          </div>
        </section>

        {/* ── 3. HOE WERKT HET ────────────────────────────────────────────── */}
        <section id="hoe-werkt-het" className="texture-overlay bg-[#0A0A0A] py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <p className="mb-2 font-bebas text-sm tracking-[0.3em] text-[#FF2D2D]">HOE HET WERKT</p>
            <h2 className="mb-14 font-bebas text-5xl tracking-wide text-white sm:text-6xl">
              Van inside joke naar diss track.
            </h2>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {[
                { n: "01", title: "Vul je doelwit in", body: "Naam, bijnaam en de inside jokes die écht raak zijn." },
                { n: "02", title: "Kies stijl & level", body: "Mild, medium of nuclear. Jij bepaalt hoe hard het aankomt." },
                { n: "03", title: "Wij maken de roast", body: "AI maakt jouw persoonlijke diss track — klaar in 24 uur." },
                { n: "04", title: "Drop hem", body: "Gooi hem in de groepschat, op TikTok of speel hem af op het feestje." },
              ].map(({ n, title, body }) => (
                <div key={n} className="relative">
                  <span className="font-bebas text-8xl leading-none text-[#FAFF00]/15 select-none">
                    {n}
                  </span>
                  <div className="-mt-6">
                    <h3 className="font-bebas text-2xl tracking-wide text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/50">{body}</p>
                  </div>
                  {/* Connector line on desktop */}
                  <div className="absolute right-0 top-10 hidden h-px w-8 bg-[#FF2D2D]/20 lg:block" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. BATTLE MODE ──────────────────────────────────────────────── */}
        <section className="relative overflow-hidden py-24">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/battlemode.png"
              alt=""
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/75" />
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0A0A0A] to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
          </div>

          <div className="relative z-10 mx-auto max-w-4xl px-6 text-center lg:px-8">
            <p className="mb-4 font-bebas text-sm tracking-[0.3em] text-[#FF6B00]">NIEUW</p>
            <h2 className="font-bebas text-6xl leading-none tracking-wide text-white sm:text-7xl lg:text-8xl">
              BATTLE MODE <span className="text-[#FF6B00]">🥊</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/70">
              Twee personen. Twee rondes. Één winnaar. Laat AI twee vrienden tegen elkaar laten battlen in een persoonlijke diss track.
            </p>
            <div className="mt-8">
              <Link
                href="/bestellen"
                className="inline-flex items-center justify-center rounded-full bg-[#FF6B00] px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-[#E05A00]"
              >
                Start een battle
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            <BattleAudioCards />
          </div>
        </section>

        {/* ── 5. PAKKETTEN ────────────────────────────────────────────────── */}
        <section id="pakketten" className="bg-[#111111] py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <p className="mb-2 font-bebas text-sm tracking-[0.3em] text-[#FF2D2D]">PAKKETTEN</p>
            <h2 className="mb-12 font-bebas text-5xl tracking-wide text-white sm:text-6xl">
              Kies je wapen.
            </h2>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.name}
                  className={`group relative flex flex-col overflow-hidden rounded-3xl border transition-all hover:shadow-[0_0_30px_rgba(255,45,45,0.15)] ${
                    pkg.highlight
                      ? "border-[#FF2D2D] shadow-[0_0_20px_rgba(255,45,45,0.1)]"
                      : "border-white/10 hover:border-[#FF2D2D]/60"
                  }`}
                  style={{ backgroundImage: "url('/images/packagekaart.png')", backgroundSize: "cover", backgroundPosition: "center" }}
                >
                  {/* Dark overlay over bg image */}
                  <div className="absolute inset-0 bg-[#0A0A0A]/85" />

                  {/* Badge */}
                  {pkg.badge && (
                    <div className={`relative z-10 px-6 pt-5`}>
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${
                        pkg.badge === "BESTSELLER"
                          ? "bg-[#FF2D2D] text-white"
                          : "bg-[#FF6B00]/20 text-[#FF6B00]"
                      }`}>
                        {pkg.badge}
                      </span>
                    </div>
                  )}

                  <div className={`relative z-10 flex flex-1 flex-col p-6 ${pkg.badge ? 'pt-3' : 'pt-6'}`}>
                    <h3 className="font-bebas text-3xl tracking-wide text-white">{pkg.name}</h3>
                    <p className="mt-1 text-sm text-white/40">{pkg.duration}</p>

                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="font-bebas text-5xl text-white">{pkg.price}</span>
                    </div>

                    <ul className="mt-5 space-y-2 flex-1">
                      {pkg.items.map(item => (
                        <li key={item} className="flex items-center gap-2 text-sm text-white/60">
                          <span className="h-1 w-1 shrink-0 rounded-full bg-[#FF2D2D]" />
                          {item}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href="/bestellen"
                      className={`mt-6 inline-flex w-full items-center justify-center rounded-full py-3 text-sm font-semibold transition-colors ${
                        pkg.highlight
                          ? "bg-[#FF2D2D] text-white hover:bg-[#E02020]"
                          : "border border-white/20 bg-transparent text-white hover:border-[#FF2D2D] hover:text-[#FF2D2D]"
                      }`}
                    >
                      {pkg.cta}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 6. GROEPSCHAT ───────────────────────────────────────────────── */}
        <section className="bg-[#0A0A0A] py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="overflow-hidden rounded-[2rem] lg:grid lg:grid-cols-2">
              {/* Image */}
              <div className="relative min-h-[320px] lg:min-h-[460px]">
                <Image
                  src="/images/groepschat.png"
                  alt="Groepschat roast"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0A0A0A] hidden lg:block" />
              </div>

              {/* Text */}
              <div className="flex flex-col justify-center bg-[#111111] p-10 lg:p-14">
                <p className="mb-3 font-bebas text-sm tracking-[0.3em] text-[#FF2D2D]">VOOR DE GROEPSCHAT</p>
                <h2 className="font-bebas text-5xl leading-tight tracking-wide text-white sm:text-6xl">
                  Van groepschat<br />naar diss track.
                </h2>
                <p className="mt-5 text-base leading-7 text-white/60">
                  Geen standaard grapjes. Echte inside jokes, bijnamen en gênante momenten. Daardoor voelt elke roast alsof hij uit jullie eigen groepschat komt.
                </p>
                <Link
                  href="/bestellen"
                  className="mt-8 inline-flex w-fit items-center justify-center rounded-full bg-[#FF2D2D] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#E02020]"
                >
                  Maak de roast
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. FAQ ──────────────────────────────────────────────────────── */}
        <section id="faq" className="bg-[#0A0A0A] py-20">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <p className="mb-2 font-bebas text-sm tracking-[0.3em] text-[#FF2D2D]">FAQ</p>
            <h2 className="mb-10 font-bebas text-5xl tracking-wide text-white sm:text-6xl">
              Veel gestelde vragen.
            </h2>

            <div className="space-y-3">
              {faqs.map(({ q, a }) => (
                <FaqItem key={q} q={q} a={a} />
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ──────────────────────────────────────────────────── */}
        <section className="bg-[#FF2D2D] py-16">
          <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
            <h2 className="font-bebas text-5xl tracking-wide text-white sm:text-6xl lg:text-7xl">
              Klaar om iemand te slopen?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/80">
              Maak nu jouw persoonlijke roast. Klaar in 24 uur, direct downloadbaar.
            </p>
            <Link
              href="/bestellen"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-black px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-white hover:text-black"
            >
              Maak je roast nu
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
        <footer className="bg-black">
          {/* Red top line */}
          <div className="h-0.5 w-full bg-[#FF2D2D]" />

          <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <p className="font-bebas text-xl tracking-widest text-white">RoastFactory.eu</p>
                <p className="mt-1 text-sm text-white/30">AI roasts, diss tracks &amp; savage content.</p>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-white/40">
                <Link href="/algemene-voorwaarden" className="transition-colors hover:text-white">
                  Algemene Voorwaarden
                </Link>
                <Link href="/privacy" className="transition-colors hover:text-white">
                  Privacybeleid
                </Link>
                <a href="mailto:info@roastfactory.eu" className="transition-colors hover:text-white">
                  Contact
                </a>
                <Link
                  href="/bestellen"
                  className="inline-flex items-center font-semibold text-[#FF2D2D] transition-colors hover:text-[#FF6B00]"
                >
                  Maak je roast
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="mt-8 border-t border-white/5 pt-6 text-xs text-white/20">
              © {new Date().getFullYear()} RoastFactory.eu — Alle rechten voorbehouden
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
