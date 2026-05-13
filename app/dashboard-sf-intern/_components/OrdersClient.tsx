"use client";
import { useState } from "react";
import Link from "next/link";

type Order = {
  id: string;
  created_at: string;
  status: string;
  package: string;
  price: number | null;
  customer_name: string | null;
  customer_email: string;
  roast_target: string | null;
  occasion: string | null;
  roast_level: string | null;
};

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

const COLS = "36px 130px 1fr 110px 110px 100px 185px 100px";

function statusSelectStyle(status: string): React.CSSProperties {
  const s = STATUS[status] ?? STATUS.pending;
  return {
    color: s.color,
    background: s.bg,
    border: `1px solid ${s.border}`,
    borderRadius: 8,
    padding: "5px 8px",
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    flex: 1,
    minWidth: 0,
  };
}

export default function OrdersClient({
  initialOrders,
  fetchError,
}: {
  initialOrders: Order[];
  fetchError: boolean;
}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState<Record<string, "saving" | "saved" | null>>({});
  const [deleting, setDeleting] = useState(false);

  // Computed stats
  const statPaid      = orders.filter(o => o.status === "paid").length;
  const statProgress  = orders.filter(o => o.status === "in_progress").length;
  const statDelivered = orders.filter(o => o.status === "delivered").length;
  const statRevenue   = orders
    .filter(o => o.status !== "pending")
    .reduce((sum, o) => sum + Number(o.price ?? 0), 0);

  const allSelected = orders.length > 0 && selected.size === orders.length;

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected(allSelected ? new Set() : new Set(orders.map(o => o.id)));
  }

  async function handleStatusChange(id: string, newStatus: string) {
    setSaving(s => ({ ...s, [id]: "saving" }));
    await fetch(`/api/dashboard-sf-intern/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    setSaving(s => ({ ...s, [id]: "saved" }));
    setTimeout(() => setSaving(s => ({ ...s, [id]: null })), 2000);
  }

  async function handleDelete() {
    if (!confirm(`Weet je zeker dat je ${selected.size} bestelling${selected.size !== 1 ? "en" : ""} wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`)) return;
    setDeleting(true);
    const res = await fetch("/api/dashboard-sf-intern/orders", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selected) }),
    });
    if (res.ok) {
      setOrders(prev => prev.filter(o => !selected.has(o.id)));
      setSelected(new Set());
    }
    setDeleting(false);
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
      <style>{`
        .rf-row:hover { background: #1a0505 !important; }
        .rf-btn:hover { background: #cc0000 !important; }
        .rf-del-btn:hover { background: #7f0000 !important; }
        .rf-status-select { appearance: none; -webkit-appearance: none; }
        @media (max-width: 768px) {
          .rf-stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .rf-desktop { display: none !important; }
          .rf-mobile { display: flex !important; }
          .rf-page-pad { padding: 16px 14px !important; }
        }
        @media (min-width: 769px) {
          .rf-mobile { display: none !important; }
        }
      `}</style>

      {/* Stats */}
      <div className="rf-stats-grid rf-page-pad" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32, padding: 0 }}>
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

      {/* Header + delete bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>Alle roast bestellingen</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666" }}>{orders.length} bestellingen — klik op Bekijk roast om te openen</p>
        </div>
        {selected.size > 0 && (
          <button
            className="rf-del-btn"
            onClick={handleDelete}
            disabled={deleting}
            style={{
              background: "#8b0000", color: "#fff", border: "none", borderRadius: 8,
              padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: deleting ? "wait" : "pointer",
              transition: "background 0.12s",
            }}
          >
            {deleting ? "Verwijderen..." : `🗑 Verwijder ${selected.size} geselecteerde`}
          </button>
        )}
      </div>

      {fetchError && (
        <div style={{ background: "#1a0505", border: "1px solid #FF2D2D44", borderRadius: 10, padding: "12px 18px", marginBottom: 20, color: "#ff8888", fontSize: 14 }}>
          Fout bij ophalen van bestellingen.
        </div>
      )}

      {/* ── DESKTOP TABEL ── */}
      <div className="rf-desktop" style={{ background: "#111111", border: "1px solid #222222", borderRadius: 14, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: COLS, padding: "10px 20px", borderBottom: "1px solid #222222", background: "#0d0d0d", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              style={{ cursor: "pointer", accentColor: "#FF2D2D", width: 15, height: 15 }}
            />
          </div>
          {["Datum", "Klant", "Pakket", "Voor wie", "Level", "Status", "Actie"].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#555" }}>{h}</span>
          ))}
        </div>

        {orders.length === 0 && (
          <div style={{ padding: "48px 20px", textAlign: "center", color: "#555", fontSize: 14 }}>
            Nog geen roast bestellingen.
          </div>
        )}

        {orders.map((order, i) => {
          const date = new Date(order.created_at).toLocaleString("nl-NL", {
            day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit",
          });
          const isSelected = selected.has(order.id);
          return (
            <div
              key={order.id}
              className="rf-row"
              style={{
                display: "grid", gridTemplateColumns: COLS,
                padding: "12px 20px", borderBottom: i < orders.length - 1 ? "1px solid #1a1a1a" : "none",
                alignItems: "center", transition: "background 0.12s",
                background: isSelected ? "#1a0a0a" : "transparent",
              }}
            >
              {/* Checkbox */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(order.id)}
                  style={{ cursor: "pointer", accentColor: "#FF2D2D", width: 15, height: 15 }}
                />
              </div>

              {/* Datum */}
              <span style={{ fontSize: 11, color: "#555" }}>{date}</span>

              {/* Klant */}
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#fff" }}>{order.customer_name || "—"}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#555" }}>{order.customer_email}</p>
              </div>

              {/* Pakket */}
              <span style={{ fontSize: 12, fontWeight: 700, color: "#FF6B00" }}>{PKG[order.package] ?? order.package}</span>

              {/* Voor wie */}
              <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{order.roast_target || "—"}</span>

              {/* Level */}
              <span style={{ fontSize: 11, color: "#aaa" }}>{LEVEL[order.roast_level ?? ""] ?? order.roast_level ?? "—"}</span>

              {/* Status dropdown */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <select
                  className="rf-status-select"
                  value={order.status}
                  onChange={e => handleStatusChange(order.id, e.target.value)}
                  style={statusSelectStyle(order.status)}
                >
                  <option value="pending">Wacht op betaling</option>
                  <option value="paid">Betaald</option>
                  <option value="in_progress">In behandeling</option>
                  <option value="delivered">Afgeleverd</option>
                </select>
                {saving[order.id] === "saving" && <span style={{ fontSize: 11, color: "#555", flexShrink: 0 }}>…</span>}
                {saving[order.id] === "saved"  && <span style={{ fontSize: 14, color: "#22C55E", flexShrink: 0 }}>✓</span>}
              </div>

              {/* Actie */}
              <Link
                href={`/dashboard-sf-intern/orders/${order.id}`}
                className="rf-btn"
                style={{
                  display: "inline-block", padding: "7px 14px", borderRadius: 8,
                  background: "#FF2D2D", color: "#fff", fontSize: 12, fontWeight: 700,
                  textDecoration: "none", transition: "background 0.12s", textAlign: "center",
                }}
              >
                Bekijk roast
              </Link>
            </div>
          );
        })}
      </div>

      {/* ── MOBIELE KAARTEN ── */}
      <div className="rf-mobile" style={{ flexDirection: "column", gap: 12, display: "none" }}>
        {orders.length === 0 && (
          <div style={{ padding: "48px 20px", textAlign: "center", color: "#555", fontSize: 14, background: "#111", borderRadius: 14 }}>
            Nog geen roast bestellingen.
          </div>
        )}
        {orders.map(order => {
          const date = new Date(order.created_at).toLocaleString("nl-NL", {
            day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit",
          });
          return (
            <div
              key={order.id}
              style={{
                background: "#111", border: "1px solid #222", borderRadius: 14,
                padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10,
              }}
            >
              {/* Top row: name + date */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#fff" }}>{order.customer_name || "—"}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#555" }}>{order.customer_email}</p>
                </div>
                <span style={{ fontSize: 11, color: "#555", textAlign: "right", flexShrink: 0 }}>{date}</span>
              </div>

              {/* Package + roast target */}
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#FF6B00" }}>{PKG[order.package] ?? order.package}</span>
                <span style={{ fontSize: 11, color: "#666" }}>voor</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{order.roast_target || "—"}</span>
              </div>

              {/* Status dropdown + save indicator */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <select
                  className="rf-status-select"
                  value={order.status}
                  onChange={e => handleStatusChange(order.id, e.target.value)}
                  style={{ ...statusSelectStyle(order.status), flex: 1, padding: "8px 10px", fontSize: 12 }}
                >
                  <option value="pending">Wacht op betaling</option>
                  <option value="paid">Betaald</option>
                  <option value="in_progress">In behandeling</option>
                  <option value="delivered">Afgeleverd</option>
                </select>
                {saving[order.id] === "saving" && <span style={{ fontSize: 12, color: "#555" }}>…</span>}
                {saving[order.id] === "saved"  && <span style={{ fontSize: 16, color: "#22C55E" }}>✓</span>}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8 }}>
                <Link
                  href={`/dashboard-sf-intern/orders/${order.id}`}
                  style={{
                    flex: 1, display: "block", textAlign: "center",
                    padding: "12px", borderRadius: 8, minHeight: 44,
                    background: "#FF2D2D", color: "#fff", fontSize: 14, fontWeight: 700,
                    textDecoration: "none", lineHeight: "20px",
                  }}
                >
                  🔥 Bekijk roast
                </Link>
                <button
                  onClick={() => toggleSelect(order.id)}
                  style={{
                    padding: "12px 14px", borderRadius: 8, minHeight: 44, border: "none",
                    background: selected.has(order.id) ? "#8b0000" : "#1a1a1a",
                    color: selected.has(order.id) ? "#fff" : "#555",
                    fontSize: 16, cursor: "pointer",
                  }}
                >
                  {selected.has(order.id) ? "✓" : "☐"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
