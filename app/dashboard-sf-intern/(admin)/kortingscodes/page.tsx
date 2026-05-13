"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";

type DiscountCode = {
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

export default function KortingscodesPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", color: "#444", padding: 64 }}>Laden...</div>}>
      <KortingscodesContent />
    </Suspense>
  );
}

function KortingscodesContent() {
  const router = useRouter();
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [formCode, setFormCode] = useState("");
  const [formType, setFormType] = useState<"percent" | "fixed">("percent");
  const [formAmount, setFormAmount] = useState("");
  const [formMax, setFormMax] = useState("");
  const [formExpires, setFormExpires] = useState("");
  const [formError, setFormError] = useState("");
  const [formSaving, setFormSaving] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<DiscountCode | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    const res = await fetch("/api/dashboard-sf-intern/discount-codes");
    if (res.status === 401) { router.push("/dashboard-sf-intern"); return; }
    if (res.status === 403) { setForbidden(true); setLoading(false); return; }
    const data = await res.json();
    setCodes(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function createCode(e: React.FormEvent) {
    e.preventDefault();
    setFormSaving(true);
    setFormError("");
    const res = await fetch("/api/dashboard-sf-intern/discount-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: formCode,
        type: formType,
        amount: formAmount,
        max_redemptions: formMax || undefined,
        expires_at: formExpires || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setFormError(data.error || "Fout."); setFormSaving(false); return; }
    setShowForm(false);
    setFormCode(""); setFormType("percent"); setFormAmount(""); setFormMax(""); setFormExpires("");
    setFormSaving(false);
    load();
  }

  async function deleteCode() {
    if (!confirmDelete) return;
    setDeleting(true);
    const res = await fetch("/api/dashboard-sf-intern/discount-codes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: confirmDelete.id, coupon_id: confirmDelete.coupon_id, code: confirmDelete.code }),
    });
    if (!res.ok) {
      const d = await res.json();
      alert(d.error || "Verwijderen mislukt.");
      setDeleting(false);
      return;
    }
    setConfirmDelete(null);
    setDeleting(false);
    load();
  }

  if (forbidden) {
    return (
        <div style={{ textAlign: "center", padding: 80, color: "#666" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
          <div>Je hebt geen toegang tot deze pagina.</div>
        </div>
    );
  }

  return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px 64px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Kortingscodes</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666" }}>{codes.length} codes via Stripe</p>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            style={{ background: "linear-gradient(135deg,#f59e0b,#ec4899,#a855f7)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
          >
            + Nieuwe code
          </button>
        </div>

        {showForm && (
          <form onSubmit={createCode} style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 16, padding: 24, marginBottom: 20 }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 600, color: "#ccc" }}>Nieuwe kortingscode aanmaken</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <Field label="Code">
                <input
                  value={formCode}
                  onChange={e => setFormCode(e.target.value.toUpperCase())}
                  required
                  placeholder="ZOMER25"
                  style={inputStyle}
                />
              </Field>
              <Field label="Type">
                <select value={formType} onChange={e => setFormType(e.target.value as "percent" | "fixed")} style={inputStyle}>
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Vast bedrag (€)</option>
                </select>
              </Field>
              <Field label={formType === "percent" ? "Percentage" : "Bedrag (€)"}>
                <input
                  type="number"
                  value={formAmount}
                  onChange={e => setFormAmount(e.target.value)}
                  required
                  min={1}
                  max={formType === "percent" ? 100 : undefined}
                  step={formType === "percent" ? 1 : 0.01}
                  placeholder={formType === "percent" ? "25" : "5.00"}
                  style={inputStyle}
                />
              </Field>
              <Field label="Max. gebruik (optioneel)">
                <input
                  type="number"
                  value={formMax}
                  onChange={e => setFormMax(e.target.value)}
                  min={1}
                  placeholder="Onbeperkt"
                  style={inputStyle}
                />
              </Field>
              <Field label="Vervaldatum (optioneel)">
                <input
                  type="date"
                  value={formExpires}
                  onChange={e => setFormExpires(e.target.value)}
                  style={inputStyle}
                />
              </Field>
            </div>
            {formError && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>{formError}</div>}
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" disabled={formSaving}
                style={{ background: "#a855f7", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                {formSaving ? "Aanmaken..." : "Aanmaken"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                style={{ background: "none", border: "1px solid #333", color: "#666", borderRadius: 8, padding: "10px 16px", fontSize: 14, cursor: "pointer" }}>
                Annuleren
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div style={{ textAlign: "center", color: "#444", padding: 64 }}>Laden...</div>
        ) : (
          <div style={{ background: "#111", borderRadius: 16, border: "1px solid #1f1f1f", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1f1f1f" }}>
                  {["Code", "Korting", "Gebruik", "Vervalt", "Status", ""].map((h, i) => (
                    <th key={i} style={{ padding: "12px 16px", textAlign: i === 5 ? "right" : "left", fontSize: 11, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {codes.map((c, i) => {
                  const discount = c.percent_off != null
                    ? `${c.percent_off}%`
                    : c.amount_off != null
                      ? `€${(c.amount_off / 100).toFixed(2)}`
                      : "—";
                  const expires = c.expires_at
                    ? new Date(c.expires_at * 1000).toLocaleDateString("nl-NL")
                    : "—";
                  const usage = c.max_redemptions
                    ? `${c.times_redeemed} / ${c.max_redemptions}`
                    : `${c.times_redeemed}×`;
                  return (
                    <tr key={c.id} style={{ borderBottom: i < codes.length - 1 ? "1px solid #1a1a1a" : "none" }}>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "#e2e8f0", background: "#1a1a1a", padding: "3px 8px", borderRadius: 6 }}>
                          {c.code}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 700, color: "#a855f7" }}>{discount}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#888" }}>{usage}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#888" }}>{expires}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: c.active ? "#22c55e" : "#ef4444", background: "rgba(255,255,255,0.04)", padding: "3px 8px", borderRadius: 6 }}>
                          {c.active ? "Actief" : "Inactief"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <button
                          onClick={() => setConfirmDelete(c)}
                          style={{ background: "none", border: "1px solid #2a2a2a", borderRadius: 8, padding: "5px 12px", color: "#ef4444", fontSize: 12, cursor: "pointer" }}
                        >
                          Verwijder
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {codes.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: 48, textAlign: "center", color: "#444", fontSize: 14 }}>Geen kortingscodes gevonden.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 16, padding: 32, maxWidth: 420, width: "90%" }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700 }}>Kortingscode verwijderen</h3>
            <p style={{ margin: "0 0 20px", fontSize: 14, color: "#aaa", lineHeight: 1.6 }}>
              Weet je zeker dat je{" "}
              <span style={{ fontFamily: "monospace", background: "#1a1a1a", padding: "2px 6px", borderRadius: 4, color: "#e2e8f0" }}>
                {confirmDelete.code}
              </span>{" "}
              wilt verwijderen? Hij wordt ook in Stripe verwijderd.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
                style={{ background: "none", border: "1px solid #333", color: "#666", borderRadius: 8, padding: "9px 18px", fontSize: 13, cursor: "pointer" }}
              >
                Annuleren
              </button>
              <button
                onClick={deleteCode}
                disabled={deleting}
                style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: deleting ? "wait" : "pointer" }}
              >
                {deleting ? "Verwijderen..." : "Ja, verwijder"}
              </button>
            </div>
          </div>
        </div>
      )}
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#0f0f0f", border: "1px solid #2a2a2a", borderRadius: 10,
  padding: "10px 12px", color: "#ccc", fontSize: 14, outline: "none", boxSizing: "border-box",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, color: "#666", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}
