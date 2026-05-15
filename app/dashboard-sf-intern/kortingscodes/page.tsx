"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type PromoCode = {
  id: string;
  code: string;
  active: boolean;
  coupon_id: string;
  coupon_name: string | null;
  percent_off: number | null;
  amount_off: number | null;
  currency: string | null;
  times_redeemed: number;
  max_redemptions: number | null;
  expires_at: number | null;
  created: number;
};

const BTN: React.CSSProperties = {
  background: "#FF2D2D", color: "#fff", border: "none", borderRadius: 8,
  padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
  minHeight: 44,
};

const INPUT: React.CSSProperties = {
  width: "100%", background: "#0d0d0d", border: "1px solid #2a2a2a",
  borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 13,
  outline: "none", boxSizing: "border-box",
};

export default function KortingscodesPage() {
  const router = useRouter();
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ code: "", type: "percent", amount: "", max_redemptions: "", expires_at: "" });
  const [formError, setFormError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/dashboard-sf-intern/discount-codes");
    if (res.status === 401) { router.push("/dashboard-sf-intern/login"); return; }
    if (!res.ok) { setError("Fout bij ophalen van kortingscodes."); setLoading(false); return; }
    setCodes(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    const res = await fetch("/api/dashboard-sf-intern/discount-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code.trim().toUpperCase(),
        type: form.type,
        amount: form.amount,
        max_redemptions: form.max_redemptions || undefined,
        expires_at: form.expires_at || undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setFormError(data.error || "Aanmaken mislukt."); setSubmitting(false); return; }
    setShowModal(false);
    setForm({ code: "", type: "percent", amount: "", max_redemptions: "", expires_at: "" });
    await load();
    setSubmitting(false);
  }

  async function handleDelete(code: PromoCode) {
    if (!confirm(`Kortingscode "${code.code}" verwijderen?`)) return;
    await fetch("/api/dashboard-sf-intern/discount-codes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: code.id, coupon_id: code.coupon_id, code: code.code }),
    });
    await load();
  }

  const discount = (c: PromoCode) =>
    c.percent_off ? `${c.percent_off}%` : c.amount_off ? `€${(c.amount_off / 100).toFixed(2)}` : "—";

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
      <style>{`
        .rf-k-desktop { display: block; }
        .rf-k-mobile { display: none; flex-direction: column; gap: 12px; }
        .rf-k-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        @media (max-width: 768px) {
          .rf-k-desktop { display: none; }
          .rf-k-mobile { display: flex; }
          .rf-k-header { flex-direction: column; align-items: flex-start; gap: 12px; }
          .rf-k-header button { width: 100%; }
        }
      `}</style>

      <div className="rf-k-header">
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>Kortingscodes</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666" }}>Stripe promo codes beheren</p>
        </div>
        <button style={BTN} onClick={() => setShowModal(true)}>+ Nieuwe code</button>
      </div>

      {error && (
        <div style={{ background: "#1a0505", border: "1px solid #FF2D2D44", borderRadius: 10, padding: "12px 18px", marginBottom: 20, color: "#ff8888", fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Desktop table */}
      <div className="rf-k-desktop">
        <div style={{ background: "#111111", border: "1px solid #222", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 90px 90px 90px 100px 80px", padding: "10px 20px", borderBottom: "1px solid #222", background: "#0d0d0d" }}>
            {["Code", "Korting", "Gebruikt", "Max", "Verloopt", "Status", "Actie"].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#555" }}>{h}</span>
            ))}
          </div>

          {loading && (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#555", fontSize: 14 }}>Laden...</div>
          )}
          {!loading && codes.length === 0 && (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#555", fontSize: 14 }}>Geen kortingscodes gevonden.</div>
          )}

          {codes.map((c, i) => (
            <div key={c.id} style={{
              display: "grid", gridTemplateColumns: "1fr 90px 90px 90px 90px 100px 80px",
              padding: "13px 20px", borderBottom: i < codes.length - 1 ? "1px solid #1a1a1a" : "none",
              alignItems: "center",
            }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#fff", letterSpacing: 0.5 }}>{c.code}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#FF6B00" }}>{discount(c)}</span>
              <span style={{ fontSize: 13, color: "#aaa" }}>{c.times_redeemed}x</span>
              <span style={{ fontSize: 13, color: "#aaa" }}>{c.max_redemptions ?? "∞"}</span>
              <span style={{ fontSize: 11, color: "#666" }}>
                {c.expires_at ? new Date(c.expires_at * 1000).toLocaleDateString("nl-NL") : "Nooit"}
              </span>
              <span style={{
                display: "inline-block", fontSize: 11, fontWeight: 700, padding: "3px 9px",
                borderRadius: 20, whiteSpace: "nowrap",
                color: c.active ? "#22C55E" : "#666",
                background: c.active ? "#061a0e" : "#1a1a1a",
                border: `1px solid ${c.active ? "#16a34a" : "#333"}`,
              }}>
                {c.active ? "Actief" : "Inactief"}
              </span>
              <button
                onClick={() => handleDelete(c)}
                style={{ background: "transparent", border: "1px solid #333", borderRadius: 7, padding: "5px 10px", color: "#666", fontSize: 11, cursor: "pointer" }}
              >
                Verwijder
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile cards */}
      <div className="rf-k-mobile">
        {loading && (
          <div style={{ padding: "20px 0", textAlign: "center", color: "#555", fontSize: 14 }}>Laden...</div>
        )}
        {!loading && codes.length === 0 && (
          <div style={{ padding: "20px 0", textAlign: "center", color: "#555", fontSize: 14 }}>Geen kortingscodes gevonden.</div>
        )}
        {!loading && codes.map(c => (
          <div key={c.id + "-m"} style={{
            background: "#111111", border: "1px solid #222",
            borderLeft: "3px solid #FF2D2D", borderRadius: 12, padding: 16,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: 0.5 }}>{c.code}</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#FF6B00" }}>{discount(c)}</span>
            </div>
            <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: "#888" }}>Gebruikt: <strong style={{ color: "#ccc" }}>{c.times_redeemed}x</strong></span>
              <span style={{ fontSize: 13, color: "#888" }}>Max: <strong style={{ color: "#ccc" }}>{c.max_redemptions ?? "∞"}</strong></span>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 12, color: "#666" }}>
                Verloopt: {c.expires_at ? new Date(c.expires_at * 1000).toLocaleDateString("nl-NL") : "Nooit"}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
                color: c.active ? "#22C55E" : "#666",
                background: c.active ? "#061a0e" : "#1a1a1a",
                border: `1px solid ${c.active ? "#16a34a" : "#333"}`,
              }}>
                {c.active ? "Actief" : "Inactief"}
              </span>
            </div>
            <button
              onClick={() => handleDelete(c)}
              style={{ width: "100%", minHeight: 44, background: "transparent", border: "1px solid #333", borderRadius: 8, color: "#666", fontSize: 13, cursor: "pointer" }}
            >
              Verwijder
            </button>
          </div>
        ))}
      </div>

      {/* Create modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 18, padding: 28, width: "100%", maxWidth: 440 }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 900 }}>Nieuwe kortingscode</h2>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: "#888", fontWeight: 600, display: "block", marginBottom: 6 }}>Code</label>
                <input style={INPUT} value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="b.v. SUMMER20" required />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#888", fontWeight: 600, display: "block", marginBottom: 6 }}>Type</label>
                <select style={{ ...INPUT }} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Vast bedrag (€)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#888", fontWeight: 600, display: "block", marginBottom: 6 }}>
                  {form.type === "percent" ? "Percentage" : "Bedrag (€)"}
                </label>
                <input style={INPUT} type="number" min="1" step={form.type === "percent" ? "1" : "0.01"} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder={form.type === "percent" ? "20" : "5.00"} required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#888", fontWeight: 600, display: "block", marginBottom: 6 }}>Max gebruik</label>
                  <input style={INPUT} type="number" min="1" value={form.max_redemptions} onChange={e => setForm(f => ({ ...f, max_redemptions: e.target.value }))} placeholder="Onbeperkt" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#888", fontWeight: 600, display: "block", marginBottom: 6 }}>Vervaldatum</label>
                  <input style={INPUT} type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} />
                </div>
              </div>
              {formError && <div style={{ color: "#ff8888", fontSize: 13 }}>{formError}</div>}
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="submit" disabled={submitting} style={{ ...BTN, flex: 1 }}>
                  {submitting ? "Bezig..." : "Aanmaken"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, background: "transparent", border: "1px solid #333", borderRadius: 8, padding: "10px 16px", color: "#888", fontSize: 13, cursor: "pointer", minHeight: 44 }}>
                  Annuleer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
