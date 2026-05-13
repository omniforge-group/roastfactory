"use client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type NavItem = { href: string; label: string; pageKey: string; roles?: string[] };

const NAV: NavItem[] = [
  { href: "/admin",                                   label: "🔥 Bestellingen",  pageKey: "bestellingen" },
  { href: "/dashboard-sf-intern/dashboard",           label: "Dashboard",        pageKey: "dashboard" },
  { href: "/dashboard-sf-intern/kortingscodes",       label: "Kortingscodes",    pageKey: "kortingscodes", roles: ["admin", "tier2"] },
  { href: "/dashboard-sf-intern/gebruikers",          label: "Gebruikers",       pageKey: "gebruikers",    roles: ["admin"] },
  { href: "/dashboard-sf-intern/activiteiten",        label: "Activiteiten",     pageKey: "activiteiten",  roles: ["admin", "tier2"] },
  { href: "/dashboard-sf-intern/stats",               label: "Statistieken",     pageKey: "stats" },
  { href: "/dashboard-sf-intern/analytics",           label: "Analytics",        pageKey: "analytics" },
  { href: "/dashboard-sf-intern/toegang",             label: "Toegang",          pageKey: "toegang",       roles: ["admin"] },
];

type PagePerm = { page_key: string; medewerker: boolean; tier2: boolean };

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [perms, setPerms] = useState<PagePerm[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/me").then(r => r.ok ? r.json() : null).then(d => { if (d?.role) setRole(d.role); });
    fetch("/api/admin/permissions").then(r => r.ok ? r.json() : null).then(d => { if (Array.isArray(d)) setPerms(d); });
  }, []);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  function canAccess(item: NavItem): boolean {
    if (!role) return true;
    if (role === "admin") return true;
    if (item.roles && !item.roles.includes(role)) return false;
    if (perms) {
      const perm = perms.find(p => p.page_key === item.pageKey);
      if (perm) {
        if (role === "medewerker" && !perm.medewerker) return false;
        if (role === "tier2" && !perm.tier2) return false;
      }
    }
    return true;
  }

  const visibleNav = NAV.filter(canAccess);

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", fontFamily: "system-ui, sans-serif", color: "#fff" }}>
      <header style={{ background: "#111111", borderBottom: "2px solid #FF2D2D", padding: "0 28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 54 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: -0.5, whiteSpace: "nowrap" }}>
              🔥 ROASTFACTORY ADMIN
            </span>
            <nav style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {visibleNav.map(({ href, label, pageKey }) => {
                const active = pageKey === "bestellingen"
                  ? pathname === "/admin" || pathname.startsWith("/admin/orders")
                  : pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    style={{
                      padding: "5px 13px",
                      borderRadius: 7,
                      fontSize: 13,
                      fontWeight: active ? 700 : 400,
                      color: active ? "#fff" : "#555",
                      background: active ? "#FF2D2D" : "transparent",
                      textDecoration: "none",
                      transition: "all 0.12s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <button
            onClick={logout}
            style={{ background: "transparent", border: "1px solid #333", borderRadius: 7, padding: "5px 14px", color: "#555", fontSize: 13, cursor: "pointer" }}
          >
            Uitloggen
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}
