"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function PageViewTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (pathname === lastTracked.current) return;
    lastTracked.current = pathname;

    const payload = JSON.stringify({
      path: pathname,
      referrer: document.referrer || null,
    });

    // sendBeacon is fire-and-forget en blokkeert navigatie niet
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
    } else {
      fetch("/api/track", { method: "POST", body: payload, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
    }
  }, [pathname]);

  return null;
}
