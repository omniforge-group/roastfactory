import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function GiftCardSuccesPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(160deg,rgba(255,255,255,1)_0%,rgba(253,242,248,0.6)_50%,rgba(243,232,255,0.3)_100%)] px-6">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center rounded-full bg-emerald-100 p-5">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        </div>
        <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-950">
          Betaling geslaagd!
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Je cadeaubon wordt nu aangemaakt. Binnen enkele minuten ontvang je een e-mail met de unieke code en instructies.
        </p>
        <div className="mt-8 rounded-[1.5rem] border border-pink-100/80 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Stuur de code door naar de ontvanger — die kan hem inwisselen bij stap 1 op roastfactory.eu/bestellen
          </p>
        </div>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Terug naar de homepage
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </main>
  );
}
