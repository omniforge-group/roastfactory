"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/dashboard-sf-intern",              label: "🔥 Bestellingen", badge: true },
  { href: "/dashboard-sf-intern/stats",         label: "📊 Statistieken" },
  { href: "/dashboard-sf-intern/kortingscodes", label: "🎟️ Kortingscodes" },
  { href: "/dashboard-sf-intern/gebruikers",    label: "👥 Gebruikers" },
  { href: "/dashboard-sf-intern/activiteiten",  label: "📋 Activiteiten" },
  { href: "/dashboard-sf-intern/toegang",       label: "🔐 Toegang" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [paidCount, setPaidCount] = useState(0);

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/dashboard-sf-intern/orders/count");
        if (res.ok) {
          const data = await res.json();
          setPaidCount(data.count ?? 0);
        }
      } catch {}
    }
    fetchCount();
    const interval = setInterval(fetchCount, 60_000);
    return () => clearInterval(interval);
  }, []);

  async function logout() {
    await fetch("/api/dashboard-sf-intern/auth/logout", { method: "POST" });
    router.push("/dashboard-sf-intern/login");
    router.refresh();
  }

  const active = (href: string) =>
    pathname === href || (href !== "/dashboard-sf-intern" && pathname.startsWith(href + "/"))
      ? { background: "#FF2D2D", color: "#fff", fontWeight: 700 }
      : { background: "transparent", color: "#666", fontWeight: 400 };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, overflowX: "auto", minWidth: 0 }}>
      <nav style={{ display: "flex", gap: 2, flexShrink: 0 }}>
        {NAV.map(({ href, label, badge }) => (
          <Link
            key={href}
            href={href}
            style={{
              position: "relative",
              padding: "5px 11px", borderRadius: 7, fontSize: 12,
              textDecoration: "none", whiteSpace: "nowrap",
              transition: "background 0.12s",
              ...active(href),
            }}
          >
            {label}
            {badge && paidCount > 0 && (
              <span style={{
                position: "absolute", top: -6, right: -6,
                background: "#FF2D2D", color: "#fff",
                fontSize: 9, fontWeight: 900, lineHeight: 1,
                padding: "2px 5px", borderRadius: 10,
                minWidth: 16, textAlign: "center",
                border: "1px solid #0A0A0A",
              }}>
                {paidCount > 99 ? "99+" : paidCount}
              </span>
            )}
          </Link>
        ))}
      </nav>
      <button
        onClick={logout}
        style={{
          background: "transparent", border: "1px solid #333",
          borderRadius: 7, padding: "5px 14px", color: "#555",
          fontSize: 12, cursor: "pointer", whiteSpace: "nowrap",
        }}
      >
        Uitloggen
      </button>
    </div>
  );
}
