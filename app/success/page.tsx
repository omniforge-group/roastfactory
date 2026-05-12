import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Mail, Music2, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RoastFactory — Bestelling ontvangen",
};

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#FF6B00_0%,#7B2FBE_50%,#3B82F6_100%)] px-6 py-16 text-white">
      <div className="mx-auto max-w-xl">

        <div className="flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ring-4 ring-white/30">
            <Music2 className="h-12 w-12 text-white" />
          </div>
        </div>

        <div className="mt-8 text-center">
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Jouw roast is onderweg! 🎉
          </h1>
          <p className="mt-5 text-lg leading-8 text-white/85">
            We zijn gestart met jouw persoonlijke roast. Je ontvangt hem binnen 24 uur als MP3 in je mailbox.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white/20 px-4 py-3 text-sm font-medium text-white/90 ring-1 ring-white/30">
            💡 Tip: Ontvang je geen mail? Controleer dan ook je spam of ongewenste mail folder.
          </p>
        </div>

        <div className="mt-10 rounded-[2rem] bg-white/15 p-8 backdrop-blur-sm ring-1 ring-white/25">
          <h2 className="text-xl font-bold">Wat nu?</h2>
          <ul className="mt-5 space-y-4">
            {[
              { icon: CheckCircle2, text: "Je ontvangt een bevestiging per e-mail" },
              { icon: Music2,       text: "Binnen 24 uur ontvang je je persoonlijke MP3" },
              { icon: Mail,         text: "Vragen? Mail naar info@roastfactory.eu" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-base text-white/90">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-white" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-white/20">
          <h2 className="text-lg font-bold text-slate-950">✅ Wat gebeurt er nu?</h2>
          <ol className="mt-5 space-y-4">
            {[
              { icon: Music2,      text: "Je ontvangt binnen 24 uur je persoonlijke roast per mail" },
              { icon: Clock,       text: "Binnen 48 uur controleren wij de kwaliteit persoonlijk" },
              { icon: ShieldCheck, text: "Niet goed? Dan krijg je gratis twee nieuwe versies" },
            ].map(({ icon: Icon, text }, i) => (
              <li key={text} className="flex items-start gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f59e0b,#ec4899)] text-xs font-bold text-white">
                  {i + 1}
                </span>
                <div className="flex items-start gap-2 pt-0.5">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <span className="text-sm leading-6 text-slate-700">{text}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-base font-semibold text-slate-950 shadow-xl hover:bg-white/90"
          >
            Terug naar home
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>

      </div>
    </main>
  );
}
