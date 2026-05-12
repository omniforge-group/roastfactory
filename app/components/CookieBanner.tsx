"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("cookie_consent")) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem("cookie_consent", "all");
    setVisible(false);
  }

  function necessary() {
    localStorage.setItem("cookie_consent", "necessary");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0d0d0d]/95 px-6 py-5 shadow-[0_-4px_24px_rgba(0,0,0,0.4)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between lg:px-2">
        <p className="text-sm leading-6 text-white/60">
          Wij gebruiken cookies voor een goede werking van de website en om je ervaring te verbeteren. Lees meer in onze{" "}
          <Link href="/privacy" className="font-semibold text-white underline hover:text-white/80">
            Privacyverklaring
          </Link>
          .
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <button
            onClick={necessary}
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/10 transition-colors"
          >
            Alleen noodzakelijk
          </button>
          <button
            onClick={accept}
            className="rounded-full bg-[#FF2D2D] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#E02020]"
          >
            Accepteren
          </button>
        </div>
      </div>
    </div>
  );
}
