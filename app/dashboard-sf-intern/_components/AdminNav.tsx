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
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  async function logout() {
    await fetch("/api/dashboard-sf-intern/auth/logout", { method: "POST" });
    router.push("/dashboard-sf-intern/login");
    router.refresh();
  }

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard-sf-intern" && pathname.startsWith(href + "/"));

  const activeStyle = (href: string) =>
    isActive(href)
      ? { background: "#FF2D2D", color: "#fff", fontWeight: 700 }
      : { background: "transparent", color: "#666", fontWeight: 400 };

  return (
    <>
      <style>{`
        .rf-nav-desktop { display: flex; align-items: center; gap: 12px; overflow-x: auto; min-width: 0; }
        .rf-nav-hamburger { display: none; position: relative; }
        @media (max-width: 768px) {
          .rf-nav-desktop { display: none; }
          .rf-nav-hamburger { display: block; }
        }
      `}</style>

      {/* Desktop */}
      <div className="rf-nav-desktop">
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
                ...activeStyle(href),
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

      {/* Mobile hamburger */}
      <div className="rf-nav-hamburger" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? "Menu sluiten" : "Menu openen"}
          style={{
            width: 44, height: 44, background: "transparent", border: "none",
            cursor: "pointer", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 5, padding: 0,
            position: "relative",
          }}
        >
          {menuOpen ? (
            <span style={{ fontSize: 20, color: "#fff", lineHeight: 1 }}>✕</span>
          ) : (
            <>
              <span style={{ display: "block", width: 22, height: 2, background: "#fff", borderRadius: 2 }} />
              <span style={{ display: "block", width: 22, height: 2, background: "#fff", borderRadius: 2 }} />
              <span style={{ display: "block", width: 22, height: 2, background: "#fff", borderRadius: 2 }} />
            </>
          )}
          {!menuOpen && paidCount > 0 && (
            <span style={{
              position: "absolute", top: 4, right: 4,
              background: "#FF2D2D", color: "#fff",
              fontSize: 9, fontWeight: 900, lineHeight: 1,
              padding: "2px 5px", borderRadius: 10,
              minWidth: 16, textAlign: "center",
              border: "1px solid #111111",
            }}>
              {paidCount > 99 ? "99+" : paidCount}
            </span>
          )}
        </button>

        {menuOpen && (
          <div style={{
            position: "fixed", top: 54, left: 0, right: 0,
            background: "#111111", borderBottom: "2px solid #FF2D2D",
            zIndex: 999, boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
          }}>
            {NAV.map(({ href, label, badge }) => (
              <Link
                key={href}
                href={href}
                style={{
                  display: "flex", alignItems: "center",
                  height: 50, padding: "0 20px", gap: 8,
                  fontSize: 15, fontWeight: isActive(href) ? 700 : 400,
                  textDecoration: "none",
                  color: isActive(href) ? "#fff" : "#aaa",
                  background: isActive(href) ? "#FF2D2D" : "transparent",
                  borderBottom: "1px solid #1a1a1a",
                }}
              >
                {label}
                {badge && paidCount > 0 && (
                  <span style={{
                    background: isActive(href) ? "#fff" : "#FF2D2D",
                    color: isActive(href) ? "#FF2D2D" : "#fff",
                    fontSize: 10, fontWeight: 900, lineHeight: 1,
                    padding: "2px 6px", borderRadius: 10,
                  }}>
                    {paidCount > 99 ? "99+" : paidCount}
                  </span>
                )}
              </Link>
            ))}
            <button
              onClick={logout}
              style={{
                display: "flex", alignItems: "center",
                width: "100%", height: 50, padding: "0 20px",
                fontSize: 15, color: "#555", background: "transparent",
                border: "none", cursor: "pointer", textAlign: "left",
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
