import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import crypto from "crypto";
import Link from "next/link";

const COOKIE_NAME = "sf_admin_session";
const SALT = "songfactory-admin-2026";

function sign(p: string) {
  return crypto.createHmac("sha256", SALT).update(p).digest("hex");
}

function isLoggedIn(): boolean {
  const val = cookies().get(COOKIE_NAME)?.value;
  if (!val) return false;
  const dot = val.lastIndexOf(".");
  if (dot < 0) return false;
  return val.slice(dot + 1) === sign(val.slice(0, dot));
}

const STATUS: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:     { label: "Wacht op betaling", color: "#999999", bg: "#1a1a1a", border: "#333333" },
  paid:        { label: "Betaald",           color: "#60A5FA", bg: "#0d1a2e", border: "#1a3a6b" },
  in_progress: { label: "In behandeling",   color: "#FF6B00", bg: "#1e0e00", border: "#4a2000" },
  delivered:   { label: "Afgeleverd",        color: "#22C55E", bg: "#061a0e", border: "#16a34a" },
};

const PKG: Record<string, string> = {
  quick_roast: "Quick Roast",
  savage_pack: "Savage Pack",
  nuclear_pack: "Nuclear Pack",
  battle_mode: "Battle Mode",
};

const LEVEL: Record<string, string> = {
  mild: "Mild 😅", medium: "Medium 😬", savage: "Savage 🔥", nuclear: "Nuclear ☢️",
};

export default async function AdminPage() {
  if (!isLoggedIn()) redirect("/admin/login");

  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select("id, created_at, status, package, price, customer_name, customer_email, roast_target, occasion, roast_level, delivered_at, audio_url, inside_jokes")
    .order("created_at", { ascending: false });

  const rows = orders ?? [];

  const statPaid       = rows.filter(o => o.status === "paid").length;
  const statProgress   = rows.filter(o => o.status === "in_progress").length;
  const statDelivered  = rows.filter(o => o.status === "delivered").length;
  const statRevenue    = rows
    .filter(o => o.status !== "pending")
    .reduce((sum, o) => sum + Number(o.price ?? 0), 0);

  return (
    <main style={{ minHeight: "100vh", background: "#0A0A0A", color: "#FFFFFF", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <style>{`
        .rf-row:hover { background: #1a0505 !important; }
        .rf-btn:hover { background: #cc0000 !important; }
      `}</style>

      {/* ── Header ── */}
      <header style={{ background: "#111111", borderBottom: "2px solid #FF2D2D", padding: "0 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>🔥 ROASTFACTORY ADMIN</span>
            <span style={{ fontSize: 12, color: "#666", background: "#1a1a1a", border: "1px solid #333", borderRadius: 6, padding: "3px 10px" }}>
              Roast bestellingen beheren
            </span>
          </div>
          <a href="/api/admin/logout" style={{ fontSize: 13, color: "#666", textDecoration: "none" }}>Uitloggen →</a>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>

        {/* ── Stats ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { emoji: "💳", label: "Nieuwe bestellingen", value: statPaid,      color: "#60A5FA" },
            { emoji: "⚙️", label: "In behandeling",      value: statProgress,  color: "#FF6B00" },
            { emoji: "✅", label: "Afgeleverd",           value: statDelivered, color: "#22C55E" },
            { emoji: "💰", label: "Totale omzet",         value: `€${statRevenue.toFixed(2).replace(".", ",")}`, color: "#FF2D2D" },
          ].map(s => (
            <div key={s.label} style={{ background: "#111111", border: "1px solid #222222", borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>{s.emoji}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: s.color, letterSpacing: -1, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#666", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Titel ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>Alle roast bestellingen</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666" }}>{rows.length} bestellingen — klik op een rij om te openen</p>
          </div>
        </div>

        {error && (
          <div style={{ background: "#1a0505", border: "1px solid #FF2D2D44", borderRadius: 10, padding: "12px 18px", marginBottom: 20, color: "#ff8888", fontSize: 14 }}>
            Fout bij ophalen van bestellingen.
          </div>
        )}

        {/* ── Tabel ── */}
        <div style={{ background: "#111111", border: "1px solid #222222", borderRadius: 14, overflow: "hidden" }}>

          {/* Tabelheader */}
          <div style={{ display: "grid", gridTemplateColumns: "150px 1fr 130px 130px 130px 140px 110px", padding: "10px 20px", borderBottom: "1px solid #222222", background: "#0d0d0d" }}>
            {["Datum", "Klant", "Pakket", "Voor wie", "Roast level", "Status", "Actie"].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#555" }}>{h}</span>
            ))}
          </div>

          {rows.length === 0 && (
            <div style={{ padding: "48px 20px", textAlign: "center", color: "#555", fontSize: 14 }}>
              Nog geen roast bestellingen.
            </div>
          )}

          {rows.map((order, i) => {
            const s = STATUS[order.status] ?? STATUS.pending;
            const date = new Date(order.created_at).toLocaleString("nl-NL", {
              day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit",
            });

            return (
              <div
                key={order.id}
                className="rf-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "150px 1fr 130px 130px 130px 140px 110px",
                  padding: "14px 20px",
                  borderBottom: i < rows.length - 1 ? "1px solid #1a1a1a" : "none",
                  alignItems: "center",
                  transition: "background 0.12s",
                  background: "transparent",
                }}
              >
                <span style={{ fontSize: 12, color: "#555" }}>{date}</span>

                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#fff" }}>{order.customer_name || "—"}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#555" }}>{order.customer_email}</p>
                </div>

                <span style={{ fontSize: 12, fontWeight: 700, color: "#FF6B00" }}>{PKG[order.package] ?? order.package}</span>

                <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{order.roast_target || "—"}</span>

                <span style={{ fontSize: 12, color: "#aaa" }}>{LEVEL[order.roast_level] ?? order.roast_level ?? "—"}</span>

                <span style={{
                  display: "inline-block", fontSize: 11, fontWeight: 700,
                  padding: "4px 10px", borderRadius: 20,
                  color: s.color, background: s.bg, border: `1px solid ${s.border}`,
                  whiteSpace: "nowrap",
                }}>
                  {s.label}
                </span>

                <Link
                  href={`/admin/orders/${order.id}`}
                  className="rf-btn"
                  style={{
                    display: "inline-block", padding: "7px 14px", borderRadius: 8,
                    background: "#FF2D2D", color: "#fff",
                    fontSize: 12, fontWeight: 700, textDecoration: "none",
                    transition: "background 0.12s", textAlign: "center",
                  }}
                >
                  Bekijk roast
                </Link>
              </div>
            );
          })}
        </div>

      </div>
    </main>
  );
}
