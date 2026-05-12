"use client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type NavItem = { href: string; label: string; pageKey: string; roles?: string[] };

const NAV: NavItem[] = [
  { href: "/dashboard-sf-intern/dashboard", label: "Dashboard", pageKey: "dashboard" },
  { href: "/dashboard-sf-intern/orders", label: "Orders", pageKey: "orders" },
  { href: "/dashboard-sf-intern/surveys", label: "Surveys", pageKey: "surveys" },
  { href: "/dashboard-sf-intern/stats", label: "Statistieken", pageKey: "stats" },
  { href: "/dashboard-sf-intern/analytics", label: "Analytics", pageKey: "analytics" },
  { href: "/dashboard-sf-intern/werkprocessen", label: "Werkprocessen", pageKey: "werkprocessen", roles: ["admin", "tier2"] },
  { href: "/dashboard-sf-intern/kortingscodes", label: "Kortingscodes", pageKey: "kortingscodes", roles: ["admin", "tier2"] },
  { href: "/dashboard-sf-intern/gebruikers", label: "Gebruikers", pageKey: "gebruikers", roles: ["admin"] },
  { href: "/dashboard-sf-intern/activiteiten", label: "Activiteiten", pageKey: "activiteiten", roles: ["admin", "tier2"] },
  { href: "/dashboard-sf-intern/toegang", label: "Toegang", pageKey: "toegang", roles: ["admin"] },
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
    router.push("/dashboard-sf-intern");
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
    <div style={{ minHeight: "100vh", background: "#0a0a0a", fontFamily: "system-ui, sans-serif", color: "#fff" }}>
      <div style={{ borderBottom: "1px solid #1f1f1f", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <span style={{ fontSize: 18, fontWeight: 800 }}>
            Song<span style={{ background: "linear-gradient(135deg,#f59e0b,#ec4899,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Factory</span>
          </span>
          <nav style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {visibleNav.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    color: active ? "#fff" : "#666",
                    background: active ? "#1f1f1f" : "none",
                    textDecoration: "none",
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
          style={{ background: "none", border: "1px solid #333", borderRadius: 8, padding: "6px 14px", color: "#666", fontSize: 13, cursor: "pointer" }}
        >
          Uitloggen
        </button>
      </div>
      {children}
    </div>
  );
}
