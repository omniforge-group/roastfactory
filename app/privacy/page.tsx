import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacyverklaring — RoastFactory",
  description: "Lees hoe RoastFactory omgaat met jouw persoonsgegevens.",
};

export default function PrivacyPage() {
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
          Privacyverklaring
        </h1>
        <p className="mt-5 text-base leading-7 text-slate-500">
          Laatst bijgewerkt: april 2025
        </p>

        <div className="mt-12 space-y-10 text-base leading-8 text-slate-700">

          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-8">
            <h2 className="text-xl font-bold tracking-tight text-slate-950">1. Wie zijn wij?</h2>
            <p className="mt-4">
              RoastFactory is een dienst van:
            </p>
            <ul className="mt-4 space-y-1">
              <li><span className="font-semibold text-slate-900">Bedrijfsnaam:</span> Timber Services</li>
              <li><span className="font-semibold text-slate-900">KVK-nummer:</span> 88562700</li>
              <li><span className="font-semibold text-slate-900">BTW-nummer:</span> NL004626847B65</li>
              <li><span className="font-semibold text-slate-900">Adres:</span> Abeltasmanstraat 22, 6413LT Heerlen, Nederland</li>
              <li>
                <span className="font-semibold text-slate-900">E-mail:</span>{" "}
                <a href="mailto:info@roastfactory.eu" className="underline hover:text-slate-950">
                  info@roastfactory.eu
                </a>
              </li>
            </ul>
            <p className="mt-4">
              Timber Services is verantwoordelijk voor de verwerking van jouw persoonsgegevens zoals
              omschreven in deze privacyverklaring.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-950">2. Welke gegevens verwerken wij?</h2>
            <p className="mt-4">
              Bij het plaatsen van een bestelling via RoastFactory.eu verwerken wij de volgende
              persoonsgegevens:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li><span className="font-semibold text-slate-900">Naam</span> — zodat we het lied persoonlijk kunnen maken.</li>
              <li><span className="font-semibold text-slate-900">E-mailadres</span> — om de bestelling te bevestigen en het lied te bezorgen.</li>
              <li>
                <span className="font-semibold text-slate-900">Persoonlijk verhaal</span> — de informatie die jij invult over de ontvanger,
                herinneringen, gelegenheid en gewenste sfeer. Dit vormt de basis van jouw unieke lied.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-950">3. Waarvoor gebruiken wij jouw gegevens?</h2>
            <p className="mt-4">
              Wij verwerken jouw gegevens uitsluitend voor het volgende doel:
            </p>
            <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="font-semibold text-slate-900">Het maken en bezorgen van een gepersonaliseerd lied.</p>
              <p className="mt-2 text-slate-600">
                Jouw verhaal wordt gebruikt om songteksten en muziek te genereren. Vervolgens wordt het
                lied per e-mail naar jou verstuurd.
              </p>
            </div>
            <p className="mt-4">
              Wij verkopen jouw gegevens niet en gebruiken ze niet voor marketingdoeleinden, tenzij
              je hier apart toestemming voor geeft.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-950">4. Bewaartermijn</h2>
            <p className="mt-4">
              Wij bewaren jouw persoonsgegevens maximaal <span className="font-semibold text-slate-900">1 jaar</span> na
              het plaatsen van jouw bestelling. Daarna worden de gegevens verwijderd, tenzij een wettelijke
              bewaarplicht een langere termijn vereist (bijvoorbeeld voor belastingdoeleinden).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-950">5. Delen met derden</h2>
            <p className="mt-4">
              Om onze dienst te kunnen leveren, maken wij gebruik van de volgende verwerkers. Met elk
              van deze partijen is een verwerkersovereenkomst of vergelijkbare juridische basis aanwezig:
            </p>
            <div className="mt-6 space-y-4">
              {[
                {
                  name: "OpenAI",
                  purpose: "Genereren van de songtekst (lyrics) op basis van jouw persoonlijke verhaal.",
                  link: "https://openai.com/policies/privacy-policy",
                },
                {
                  name: "Replicate",
                  purpose: "Genereren van de muziek op basis van de gegenereerde songtekst.",
                  link: "https://replicate.com/privacy",
                },
                {
                  name: "Stripe",
                  purpose: "Verwerken van de betaling. Stripe verwerkt betaalgegevens als zelfstandige verwerkingsverantwoordelijke.",
                  link: "https://stripe.com/nl/privacy",
                },
                {
                  name: "Resend",
                  purpose: "Versturen van bevestigings- en bezorgingsmails met het lied.",
                  link: "https://resend.com/legal/privacy-policy",
                },
              ].map((party) => (
                <div key={party.name} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="font-semibold text-slate-900">{party.name}</p>
                  <p className="mt-1 text-slate-600">{party.purpose}</p>
                  <a
                    href={party.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm font-medium text-slate-500 underline hover:text-slate-900"
                  >
                    Privacybeleid {party.name} →
                  </a>
                </div>
              ))}
            </div>
            <p className="mt-4">
              Wij delen jouw gegevens niet met andere partijen zonder jouw toestemming, tenzij wij
              daartoe wettelijk verplicht zijn.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-950">6. Cookies</h2>
            <p className="mt-4">
              RoastFactory.eu maakt gebruik van cookies. Hieronder een overzicht:
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="font-semibold text-slate-900">Stripe — functionele cookies</p>
                <p className="mt-1 text-slate-600">
                  Stripe plaatst cookies die nodig zijn voor het veilig verwerken van betalingen en het
                  voorkomen van fraude. Deze cookies zijn functioneel en kunnen niet worden uitgeschakeld
                  zonder de betaalfunctionaliteit te verliezen.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="font-semibold text-slate-900">Supabase — functionele cookies</p>
                <p className="mt-1 text-slate-600">
                  Supabase wordt gebruikt voor het opslaan van bestellingen en sessies. De bijbehorende
                  cookies zijn technisch noodzakelijk voor de werking van de dienst.
                </p>
              </div>
            </div>
            <p className="mt-4">
              Wij maken geen gebruik van tracking- of advertentiecookies van derden.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-950">7. Grondslag voor verwerking</h2>
            <p className="mt-4">
              Wij verwerken jouw persoonsgegevens op basis van de volgende rechtsgrondslagen
              (AVG/GDPR artikel 6):
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>
                <span className="font-semibold text-slate-900">Uitvoering van een overeenkomst</span> — het verwerken van jouw naam, e-mailadres
                en verhaal is noodzakelijk om het lied te maken en te bezorgen.
              </li>
              <li>
                <span className="font-semibold text-slate-900">Wettelijke verplichting</span> — het bewaren van factuurgegevens voor de belasting.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-950">8. Jouw rechten</h2>
            <p className="mt-4">
              Als betrokkene heb je onder de AVG (Algemene Verordening Gegevensbescherming) de
              volgende rechten:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li><span className="font-semibold text-slate-900">Recht op inzage</span> — je kunt opvragen welke gegevens wij van je hebben.</li>
              <li><span className="font-semibold text-slate-900">Recht op correctie</span> — je kunt onjuiste gegevens laten corrigeren.</li>
              <li><span className="font-semibold text-slate-900">Recht op verwijdering</span> — je kunt vragen jouw gegevens te verwijderen ("recht op vergetelheid").</li>
              <li><span className="font-semibold text-slate-900">Recht op beperking</span> — je kunt de verwerking van jouw gegevens laten beperken.</li>
              <li><span className="font-semibold text-slate-900">Recht op bezwaar</span> — je kunt bezwaar maken tegen de verwerking van jouw gegevens.</li>
              <li><span className="font-semibold text-slate-900">Recht op overdraagbaarheid</span> — je kunt jouw gegevens opvragen in een machineleesbaar formaat.</li>
            </ul>
            <p className="mt-4">
              Stuur een e-mail naar{" "}
              <a href="mailto:info@roastfactory.eu" className="font-semibold underline hover:text-slate-950">
                info@roastfactory.eu
              </a>{" "}
              om een van deze rechten uit te oefenen. Wij reageren binnen 30 dagen.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-950">9. Klacht indienen</h2>
            <p className="mt-4">
              Ben je het niet eens met hoe wij met jouw gegevens omgaan? Je hebt het recht een klacht
              in te dienen bij de toezichthoudende autoriteit:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>
                <span className="font-semibold text-slate-900">Nederland:</span>{" "}
                Autoriteit Persoonsgegevens —{" "}
                <a
                  href="https://www.autoriteitpersoonsgegevens.nl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-slate-950"
                >
                  autoriteitpersoonsgegevens.nl
                </a>
              </li>
              <li>
                <span className="font-semibold text-slate-900">België:</span>{" "}
                Gegevensbeschermingsautoriteit —{" "}
                <a
                  href="https://www.gegevensbeschermingsautoriteit.be"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-slate-950"
                >
                  gegevensbeschermingsautoriteit.be
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-950">10. Beveiliging</h2>
            <p className="mt-4">
              Wij nemen passende technische en organisatorische maatregelen om jouw persoonsgegevens
              te beschermen tegen verlies, misbruik of ongeautoriseerde toegang. Gegevens worden
              versleuteld opgeslagen en verstuurd via beveiligde verbindingen (HTTPS).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-950">11. Wijzigingen</h2>
            <p className="mt-4">
              Wij behouden ons het recht voor deze privacyverklaring te wijzigen. De meest actuele
              versie is altijd te vinden op{" "}
              <Link href="/privacy" className="font-semibold underline hover:text-slate-950">
                roastfactory.eu/privacy
              </Link>
              . Bij ingrijpende wijzigingen informeren wij je per e-mail.
            </p>
          </div>

          <div className="rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(249,115,22,0.08),rgba(236,72,153,0.08),rgba(59,130,246,0.08))] p-8 ring-1 ring-slate-200">
            <h2 className="text-xl font-bold tracking-tight text-slate-950">Contact</h2>
            <p className="mt-4">
              Heb je vragen over deze privacyverklaring of over de verwerking van jouw gegevens?
              Neem dan contact met ons op:
            </p>
            <ul className="mt-4 space-y-1">
              <li><span className="font-semibold text-slate-900">Timber Services</span></li>
              <li>Abeltasmanstraat 22, 6413LT Heerlen</li>
              <li>
                <a href="mailto:info@roastfactory.eu" className="font-semibold underline hover:text-slate-950">
                  info@roastfactory.eu
                </a>
              </li>
            </ul>
          </div>

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
