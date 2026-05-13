import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import crypto from "crypto";
import Link from "next/link";

const COOKIE_NAME = "sf_admin_session";
const SALT = "songfactory-admin-2026";

function sign(payload: string) {
  return crypto.createHmac("sha256", SALT).update(payload).digest("hex");
}

function isLoggedIn(): boolean {
  const cookieStore = cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  if (!value) return false;
  const dot = value.lastIndexOf(".");
  if (dot < 0) return false;
  const payload = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  return sig === sign(payload);
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending:     { label: "Pending",     color: "#888888", bg: "#1A1A1A" },
  paid:        { label: "Betaald",     color: "#60A5FA", bg: "#1E2A3A" },
  in_progress: { label: "Bezig",       color: "#FF6B00", bg: "#2A1A0A" },
  delivered:   { label: "Geleverd",    color: "#22C55E", bg: "#0A2A0A" },
};

const PACKAGE_LABELS: Record<string, string> = {
  quick_roast: "Quick Roast",
  savage_pack: "Savage Pack",
  nuclear_pack: "Nuclear Pack",
  battle_mode: "Battle Mode",
};

export default async function AdminPage() {
  if (!isLoggedIn()) redirect("/admin/login");

  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select("id, created_at, status, package, price, customer_name, customer_email, roast_target, occasion, roast_level, delivered_at, audio_url")
    .order("created_at", { ascending: false });

  const safeOrders = orders ?? [];

  const BG = "#0A0A0A";
  const GRAY = "#1A1A1A";
  const GRAY2 = "#2A2A2A";
  const WHITE = "#FFFFFF";
  const RED = "#FF2D2D";
  const ORANGE = "#FF6B00";
  const GRAY_TEXT = "#888888";

  return (
    <main style={{ minHeight: "100vh", background: BG, color: WHITE, fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* Header */}
      <header style={{ borderBottom: `1px solid ${GRAY2}`, background: "#0D0D0D", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontWeight: 900, fontSize: 18, color: WHITE }}>🔥 RoastFactory</span>
          <span style={{ color: GRAY2, fontSize: 18 }}>|</span>
          <span style={{ color: GRAY_TEXT, fontSize: 14 }}>Admin</span>
        </div>
        <div style={{ display: "flex", gap: 24, fontSize: 13 }}>
          <span style={{ color: GRAY_TEXT }}>
            Totaal: <strong style={{ color: WHITE }}>{safeOrders.length}</strong>
          </span>
          <span style={{ color: GRAY_TEXT }}>
            Betaald: <strong style={{ color: "#60A5FA" }}>{safeOrders.filter(o => o.status === "paid" || o.status === "in_progress" || o.status === "delivered").length}</strong>
          </span>
          <span style={{ color: GRAY_TEXT }}>
            Geleverd: <strong style={{ color: "#22C55E" }}>{safeOrders.filter(o => o.status === "delivered").length}</strong>
          </span>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0, letterSpacing: -0.5 }}>Bestellingen</h1>
          <p style={{ color: GRAY_TEXT, fontSize: 14, margin: "6px 0 0" }}>Klik op een bestelling voor details en acties.</p>
        </div>

        {error && (
          <div style={{ background: "#2A0A0A", border: `1px solid ${RED}44`, borderRadius: 12, padding: "14px 20px", marginBottom: 20, color: "#FF8888", fontSize: 14 }}>
            Fout bij ophalen van bestellingen.
          </div>
        )}

        {/* Tabel */}
        <div style={{ background: GRAY, borderRadius: 16, border: `1px solid ${GRAY2}`, overflow: "hidden" }}>
          {/* Header row */}
          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 140px 120px 110px 100px 80px", gap: 0, borderBottom: `1px solid ${GRAY2}`, padding: "10px 20px" }}>
            {["Datum", "Klant", "Pakket", "Roast target", "Status", "Prijs", ""].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: GRAY_TEXT }}>{h}</span>
            ))}
          </div>

          {safeOrders.length === 0 && (
            <div style={{ padding: "40px 20px", textAlign: "center", color: GRAY_TEXT, fontSize: 14 }}>
              Nog geen bestellingen.
            </div>
          )}

          {safeOrders.map((order, i) => {
            const status = STATUS_LABELS[order.status] ?? STATUS_LABELS.pending;
            const date = new Date(order.created_at).toLocaleString("nl-NL", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
            const price = order.price ? `€${Number(order.price).toFixed(2).replace(".", ",")}` : "—";

            return (
              <div
                key={order.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "160px 1fr 140px 120px 110px 100px 80px",
                  gap: 0,
                  padding: "14px 20px",
                  borderBottom: i < safeOrders.length - 1 ? `1px solid ${GRAY2}` : "none",
                  alignItems: "center",
                  transition: "background 0.15s",
                }}
              >
                <span style={{ fontSize: 12, color: GRAY_TEXT }}>{date}</span>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: WHITE }}>{order.customer_name || "—"}</p>
                  <p style={{ margin: 0, fontSize: 12, color: GRAY_TEXT }}>{order.customer_email}</p>
                </div>
                <span style={{ fontSize: 13, color: ORANGE, fontWeight: 700 }}>{PACKAGE_LABELS[order.package] ?? order.package}</span>
                <span style={{ fontSize: 13, color: WHITE, fontWeight: 600 }}>{order.roast_target || "—"}</span>
                <span style={{
                  display: "inline-block", fontSize: 11, fontWeight: 700,
                  padding: "4px 10px", borderRadius: 20,
                  color: status.color, background: status.bg,
                  border: `1px solid ${status.color}44`,
                }}>
                  {status.label}
                </span>
                <span style={{ fontSize: 13, color: WHITE }}>{price}</span>
                <Link
                  href={`/admin/orders/${order.id}`}
                  style={{
                    display: "inline-block", padding: "6px 14px", borderRadius: 8,
                    background: `${RED}22`, border: `1px solid ${RED}55`,
                    color: RED, fontSize: 12, fontWeight: 700, textDecoration: "none",
                  }}
                >
                  Open →
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
