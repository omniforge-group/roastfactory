"use client";

import { useState } from "react";

export default function TestMailPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/deliver-song", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderId.trim(), toEmail: email.trim() }),
      });

      const text = await res.text();

      if (res.ok) {
        setStatus("success");
        setMessage(`Mail verstuurd naar ${email}`);
      } else {
        setStatus("error");
        setMessage(`Fout (${res.status}): ${text}`);
      }
    } catch {
      setStatus("error");
      setMessage("Verbindingsfout — controleer je internetverbinding.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 font-sans">
      <div className="mx-auto max-w-md">

        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">SongFactory</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
            Testmail versturen
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Verstuur de leveringsmail opnieuw naar een opgegeven adres.
            De database wordt <strong>niet</strong> aangepast.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Ordernummer (UUID)
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              required
              spellCheck={false}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm text-slate-900 shadow-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              E-mailadres
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jij@voorbeeld.nl"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-full bg-[linear-gradient(135deg,#f59e0b_0%,#ec4899_50%,#3b82f6_100%)] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-pink-200 transition hover:opacity-90 disabled:opacity-50"
          >
            {status === "loading" ? "Bezig met versturen…" : "Verstuur testmail"}
          </button>
        </form>

        {message && (
          <div
            className={`mt-6 rounded-2xl px-5 py-4 text-sm leading-6 ${
              status === "success"
                ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                : "bg-red-50 text-red-800 ring-1 ring-red-200"
            }`}
          >
            {status === "success" ? "✅ " : "❌ "}
            {message}
          </div>
        )}

      </div>
    </main>
  );
}
