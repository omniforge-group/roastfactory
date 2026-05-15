"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  async function logout() {
    await fetch("/api/dashboard-sf-intern/auth/logout", { method: "POST" });
    router.push("/dashboard-sf-intern/login");
    router.refresh();
  }

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard-sf-intern" && pathname.startsWith(href + "/"));

  return (
    <>
      <style>{`
        @media (min-width: 769px) {
          .rf-nav-desktop { display: flex !important; }
          .rf-nav-mobile-wrap { display: none !important; }
        }
        @media (max-width: 768px) {
          .rf-nav-desktop { display: none !important; }
          .rf-nav-mobile-wrap { display: flex !important; }
        }
        .rf-mobile-menu-item:hover { background: #FF2D2D !important; color: #fff !important; }
        .rf-mobile-logout-btn:hover { background: #1a1a1a !important; color: #fff !important; }
      `}</style>

      {/* Desktop nav */}
      <div className="rf-nav-desktop" style={{ alignItems: "center", gap: 12, overflowX: "auto", minWidth: 0 }}>
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
                background: isActive(href) ? "#FF2D2D" : "transparent",
                color: isActive(href) ? "#fff" : "#666",
                fontWeight: isActive(href) ? 700 : 400,
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

      {/* Mobile nav */}
      <div className="rf-nav-mobile-wrap" ref={menuRef} style={{ position: "relative", alignItems: "center" }}>
        <button
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? "Menu sluiten" : "Menu openen"}
          style={{
            background: "none", border: "none", cursor: "pointer",
            padding: "10px 8px", minWidth: 44, minHeight: 44,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {menuOpen ? (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <line x1="3" y1="3" x2="19" y2="19" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="19" y1="3" x2="3" y2="19" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="22" height="20" viewBox="0 0 22 20" fill="none">
              <line x1="1" y1="2" x2="21" y2="2" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="1" y1="10" x2="21" y2="10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="1" y1="18" x2="21" y2="18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          )}
        </button>

        {menuOpen && (
          <div style={{
            position: "fixed", top: 54, left: 0, right: 0,
            background: "#111111", borderBottom: "2px solid #FF2D2D",
            zIndex: 1000, display: "flex", flexDirection: "column",
            boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
          }}>
            {NAV.map(({ href, label, badge }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="rf-mobile-menu-item"
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "0 20px", height: 50, minHeight: 50,
                    textDecoration: "none", fontSize: 14,
                    fontWeight: active ? 700 : 500,
                    color: "#fff",
                    background: active ? "#FF2D2D" : "transparent",
                    transition: "background 0.12s",
                    borderBottom: "1px solid #1a1a1a",
                  }}
                >
                  {label}
                  {badge && paidCount > 0 && (
                    <span style={{
                      background: active ? "#fff" : "#FF2D2D",
                      color: active ? "#FF2D2D" : "#fff",
                      fontSize: 10, fontWeight: 900, lineHeight: 1,
                      padding: "2px 6px", borderRadius: 10,
                      minWidth: 18, textAlign: "center",
                    }}>
                      {paidCount > 99 ? "99+" : paidCount}
                    </span>
                  )}
                </Link>
              );
            })}
            <button
              onClick={() => { setMenuOpen(false); logout(); }}
              className="rf-mobile-logout-btn"
              style={{
                background: "transparent", border: "none",
                height: 50, minHeight: 50, padding: "0 20px",
                color: "#666", fontSize: 14, cursor: "pointer",
                textAlign: "left", fontFamily: "inherit",
                transition: "background 0.12s",
              }}
            >
              Uitloggen
            </button>
          </div>
        )}
      </div>
    </>
  );
}
