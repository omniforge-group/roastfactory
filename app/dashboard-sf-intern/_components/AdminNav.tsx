"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/dashboard-sf-intern",              label: "🔥 Bestellingen" },
  { href: "/dashboard-sf-intern/stats",         label: "📊 Statistieken" },
  { href: "/dashboard-sf-intern/kortingscodes", label: "🎟️ Kortingscodes" },
  { href: "/dashboard-sf-intern/gebruikers",    label: "👥 Gebruikers" },
  { href: "/dashboard-sf-intern/activiteiten",  label: "📋 Activiteiten" },
  { href: "/dashboard-sf-intern/toegang",       label: "🔐 Toegang" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

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
        {NAV.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            style={{
              padding: "5px 11px", borderRadius: 7, fontSize: 12,
              textDecoration: "none", whiteSpace: "nowrap",
              transition: "background 0.12s",
              ...active(href),
            }}
          >
            {label}
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
