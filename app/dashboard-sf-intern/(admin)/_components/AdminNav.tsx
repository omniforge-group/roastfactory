"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/dashboard-sf-intern/bestellingen", label: "🔥 Bestellingen", key: "bestellingen" },
  { href: "/dashboard-sf-intern/dashboard",    label: "Dashboard",       key: "dashboard" },
  { href: "/dashboard-sf-intern/stats",        label: "Statistieken",    key: "stats" },
  { href: "/dashboard-sf-intern/analytics",    label: "Analytics",       key: "analytics" },
  { href: "/dashboard-sf-intern/kortingscodes",label: "Kortingscodes",   key: "kortingscodes" },
  { href: "/dashboard-sf-intern/gebruikers",   label: "Gebruikers",      key: "gebruikers" },
  { href: "/dashboard-sf-intern/activiteiten", label: "Activiteiten",    key: "activiteiten" },
  { href: "/dashboard-sf-intern/toegang",      label: "Toegang",         key: "toegang" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/dashboard-sf-intern/auth/logout", { method: "POST" });
    router.push("/dashboard-sf-intern/login");
  }

  return (
    <>
      <nav style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        {NAV.map(({ href, label, key }) => {
          const active = key === "bestellingen"
            ? pathname === href || pathname.startsWith("/dashboard-sf-intern/orders")
            : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} style={{
              padding: "5px 13px", borderRadius: 7, fontSize: 13,
              fontWeight: active ? 700 : 400,
              color: active ? "#fff" : "#555",
              background: active ? "#FF2D2D" : "transparent",
              textDecoration: "none", whiteSpace: "nowrap",
              transition: "all 0.12s",
            }}>
              {label}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={logout}
        style={{ background: "transparent", border: "1px solid #333", borderRadius: 7, padding: "5px 14px", color: "#555", fontSize: 13, cursor: "pointer", marginLeft: 16 }}
      >
        Uitloggen
      </button>
    </>
  );
}
