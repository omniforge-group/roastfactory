"use client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminToken } from "@/lib/admin-client";

type NavItem = { href: string; label: string; pageKey: string; roles?: string[] };

const NAV: NavItem[] = [
  { href: "/dashboard-sf-intern/bestellingen",                                   label: "🔥 Bestellingen",  pageKey: "bestellingen" },
  { href: "/dashboard-sf-intern/dashboard",           label: "Dashboard",        pageKey: "dashboard" },
  { href: "/dashboard-sf-intern/kortingscodes",       label: "Kortingscodes",    pageKey: "kortingscodes" },
  { href: "/dashboard-sf-intern/gebruikers",          label: "Gebruikers",       pageKey: "gebruikers" },
  { href: "/dashboard-sf-intern/activiteiten",        label: "Activiteiten",     pageKey: "activiteiten" },
  { href: "/dashboard-sf-intern/stats",               label: "Statistieken",     pageKey: "stats" },
  { href: "/dashboard-sf-intern/analytics",           label: "Analytics",        pageKey: "analytics" },
  { href: "/dashboard-sf-intern/toegang",             label: "Toegang",          pageKey: "toegang" },
];


export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.replace("/dashboard-sf-intern/login");
      return;
    }

    // Intercept all fetch calls to inject the admin token automatically
    const origFetch = window.fetch.bind(window);
    window.fetch = (input: RequestInfo | URL, init: RequestInit = {}) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : (input as Request).url;
      if (url.startsWith("/api/dashboard-sf-intern/")) {
        const t = localStorage.getItem("admin_token") ?? "";
        init = { ...init, headers: { ...init.headers as Record<string, string>, "x-admin-token": t } };
      }
      return origFetch(input, init);
    };

    origFetch("/api/dashboard-sf-intern/me", { headers: { "x-admin-token": token } })
      .then(r => {
        if (!r.ok) {
          localStorage.removeItem("admin_token");
          window.fetch = origFetch;
          router.replace("/dashboard-sf-intern/login");
        } else {
          setAuthed(true);
        }
      })
      .catch(() => {
        window.fetch = origFetch;
        router.replace("/dashboard-sf-intern/login");
      });

    return () => { window.fetch = origFetch; };
  }, [router]);

  function logout() {
    localStorage.removeItem("admin_token");
    router.push("/dashboard-sf-intern/login");
  }

  if (authed === null) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#555", fontSize: 14 }}>Laden...</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", fontFamily: "system-ui, sans-serif", color: "#fff" }}>
      <header style={{ background: "#111111", borderBottom: "2px solid #FF2D2D", padding: "0 28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 54 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: -0.5, whiteSpace: "nowrap" }}>
              🔥 ROASTFACTORY ADMIN
            </span>
            <nav style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {NAV.map(({ href, label, pageKey }) => {
                const active = pageKey === "bestellingen"
                  ? pathname === "/dashboard-sf-intern/bestellingen" || pathname.startsWith("/dashboard-sf-intern/orders")
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
