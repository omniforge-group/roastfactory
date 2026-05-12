"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Gift, Music2, Sparkles } from "lucide-react";
import { CtaAssurance } from "@/app/components/CtaAssurance";

export default function GiftCardPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBuy = async () => {
    if (!email.includes("@")) { setError("Vul een geldig e-mailadres in."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/create-giftcard-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyerEmail: email, locale: "nl" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Er is iets misgegaan. Probeer het opnieuw.");
        setLoading(false);
      }
    } catch {
      setError("Geen verbinding. Probeer het opnieuw.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(160deg,rgba(255,255,255,1)_0%,rgba(253,242,248,0.6)_50%,rgba(243,232,255,0.3)_100%)] text-slate-900">

      {/* Header */}
      <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-white/60 bg-white shadow-sm">
              <Image src="/logo.png" alt="RoastFactory logo" fill className="object-contain p-1" priority />
            </div>
            <p className="text-base font-semibold tracking-tight">RoastFactory</p>
          </Link>
          <Link href="/bestellen" className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
            Bestel nu
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">

        {/* Hero */}
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-4 py-2 text-sm font-semibold text-pink-700">
            <Gift className="h-4 w-4" />
            Cadeaubon
          </div>
          <h1 className="mt-2 text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">
            Geef een lied cadeau
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Een uniek, gepersonaliseerd lied als onvergetelijk cadeau. De ontvanger kiest zelf de stijl en vertelt het verhaal — wij maken het lied.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">

          {/* Uitleg + kenmerken */}
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-bold tracking-tight text-slate-950">Wat zit er in de cadeaubon?</h2>
              <ul className="mt-6 space-y-4">
                {[
                  { icon: Music2,        text: "2 volledig gepersonaliseerde songs op maat" },
                  { icon: Sparkles,      text: "Professionele lyrics gebaseerd op het verhaal van de ontvanger" },
                  { icon: CheckCircle2,  text: "Keuze uit 9 muziekstijlen, 10 sferen en 3 stemopties" },
                  { icon: CheckCircle2,  text: "Geleverd als MP3 via e-mail — binnen 24 uur" },
                  { icon: Gift,          text: "Unieke inwisselcode, geldig voor één bestelling" },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3 text-base text-slate-700">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[2rem] border border-pink-100/80 bg-[linear-gradient(135deg,rgba(253,242,248,0.6),rgba(243,232,255,0.4))] p-6">
              <p className="text-sm font-semibold text-slate-600">
                🎁 <strong>Hoe werkt het?</strong>{" "}
                Na betaling ontvang jij een e-mail met de unieke code. Stuur die code door naar de ontvanger. Die vult hem in bij stap 1 van het bestelformulier en de betaling wordt automatisch overgeslagen.
              </p>
            </div>
          </div>

          {/* Koopkaart */}
          <div className="rounded-[2rem] border border-pink-100/80 bg-white p-8 shadow-[0_20px_60px_rgba(236,72,153,0.1),0_4px_20px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Prijs</p>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-6xl font-black tracking-tight text-slate-950">€14,95</span>
            </div>
            <p className="mt-1 text-sm font-medium text-slate-500">Eenmalig · Geen abonnement</p>

            <div className="mt-8 space-y-3">
              <label className="block text-sm font-semibold text-slate-700">
                Jouw e-mailadres
                <span className="ml-1 font-normal text-slate-400">(hierop ontvang je de code)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleBuy()}
                placeholder="jouw@email.nl"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 placeholder-slate-400 shadow-sm transition focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-200"
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <button
              onClick={handleBuy}
              disabled={loading}
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#f59e0b_0%,#ec4899_50%,#3b82f6_100%)] px-7 py-4 text-base font-semibold text-white shadow-xl shadow-pink-200 disabled:opacity-50"
            >
              {loading ? "Doorsturen naar betaling..." : "Cadeaubon kopen"}
              {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
            </button>
            <CtaAssurance className="text-center" />

            {/* Betaallogos */}
            <div className="mt-5 flex items-center justify-center gap-3">
              <span className="text-xs text-slate-400">Betalen via:</span>
              <svg viewBox="0 0 40 24" width="40" height="24" aria-label="iDEAL"><rect width="40" height="24" rx="4" fill="#CC0066"/><text x="20" y="16" textAnchor="middle" fontSize="8" fontWeight="bold" fill="white" fontFamily="sans-serif">iDEAL</text></svg>
              <svg viewBox="0 0 40 24" width="40" height="24" aria-label="Visa"><rect width="40" height="24" rx="4" fill="#1A1F71"/><text x="20" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white" fontFamily="sans-serif" letterSpacing="1">VISA</text></svg>
              <svg viewBox="0 0 40 24" width="40" height="24" aria-label="Mastercard"><rect width="40" height="24" rx="4" fill="#f5f5f5"/><circle cx="15" cy="12" r="7" fill="#EB001B" opacity="0.9"/><circle cx="25" cy="12" r="7" fill="#F79E1B" opacity="0.9"/><path d="M20 6.8a7 7 0 010 10.4A7 7 0 0120 6.8z" fill="#FF5F00"/></svg>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
