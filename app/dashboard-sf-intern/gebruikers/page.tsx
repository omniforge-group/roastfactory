"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
};

const BTN: React.CSSProperties = {
  background: "#FF2D2D", color: "#fff", border: "none", borderRadius: 8,
  padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
};

const INPUT: React.CSSProperties = {
  width: "100%", background: "#0d0d0d", border: "1px solid #2a2a2a",
  borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 13,
  outline: "none", boxSizing: "border-box",
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin", medewerker: "Medewerker", tier2: "Tier 2",
};

const ROLE_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  admin:      { color: "#FF2D2D", bg: "#1a0505", border: "#4a0a0a" },
  medewerker: { color: "#60A5FA", bg: "#0d1a2e", border: "#1a3a6b" },
  tier2:      { color: "#FF6B00", bg: "#1e0e00", border: "#4a2000" },
};

export default function GebruikersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "medewerker" });
  const [formError, setFormError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/dashboard-sf-intern/users");
    if (res.status === 401) { router.push("/dashboard-sf-intern/login"); return; }
    if (res.status === 403) { setError("Geen toegang."); setLoading(false); return; }
    if (!res.ok) { setError("Fout bij ophalen van gebruikers."); setLoading(false); return; }
    setUsers(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    const res = await fetch("/api/dashboard-sf-intern/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setFormError(data.error || "Aanmaken mislukt."); setSubmitting(false); return; }
    setShowModal(false);
    setForm({ name: "", email: "", password: "", role: "medewerker" });
    await load();
    setSubmitting(false);
  }

  async function toggleActive(user: AdminUser) {
    await fetch(`/api/dashboard-sf-intern/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !user.is_active }),
    });
    await load();
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
      <style>{`
        @media (max-width: 768px) {
          .rf-gb-page { padding: 16px 14px !important; }
          .rf-gb-header { flex-wrap: wrap !important; gap: 12px !important; }
          .rf-gb-header h1 { font-size: 20px !important; }
          .rf-gb-new-btn { width: 100% !important; padding: 12px 16px !important; min-height: 44px !important; font-size: 14px !important; }
          .rf-gb-desktop { display: none !important; }
          .rf-gb-mobile { display: flex !important; }
          .rf-gb-toggle-btn { width: 100% !important; padding: 12px !important; min-height: 44px !important; font-size: 14px !important; }
        }
        @media (min-width: 769px) {
          .rf-gb-mobile { display: none !important; }
        }
      `}</style>
      <div className="rf-gb-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>Gebruikers</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666" }}>Admin-accounts beheren</p>
        </div>
        <button className="rf-gb-new-btn" style={BTN} onClick={() => setShowModal(true)}>+ Nieuwe gebruiker</button>
      </div>

      {error && (
        <div style={{ background: "#1a0505", border: "1px solid #FF2D2D44", borderRadius: 10, padding: "12px 18px", marginBottom: 20, color: "#ff8888", fontSize: 14 }}>{error}</div>
      )}

      {/* Desktop table */}
      <div className="rf-gb-desktop" style={{ background: "#111111", border: "1px solid #222", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 110px 140px 90px", padding: "10px 20px", borderBottom: "1px solid #222", background: "#0d0d0d" }}>
          {["Naam", "E-mail", "Rol", "Laatste login", "Status"].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#555" }}>{h}</span>
          ))}
        </div>

        {loading && <div style={{ padding: "40px 20px", textAlign: "center", color: "#555", fontSize: 14 }}>Laden...</div>}
        {!loading && users.length === 0 && <div style={{ padding: "40px 20px", textAlign: "center", color: "#555", fontSize: 14 }}>Geen gebruikers gevonden.</div>}

        {users.map((u, i) => {
          const rc = ROLE_COLORS[u.role] ?? ROLE_COLORS.medewerker;
          return (
            <div key={u.id} style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 110px 140px 90px",
              padding: "13px 20px", borderBottom: i < users.length - 1 ? "1px solid #1a1a1a" : "none",
              alignItems: "center",
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{u.name}</span>
              <span style={{ fontSize: 12, color: "#666" }}>{u.email}</span>
              <span style={{
                display: "inline-block", fontSize: 11, fontWeight: 700, padding: "3px 9px",
                borderRadius: 20, whiteSpace: "nowrap",
                color: rc.color, background: rc.bg, border: `1px solid ${rc.border}`,
              }}>
                {ROLE_LABELS[u.role] ?? u.role}
              </span>
              <span style={{ fontSize: 11, color: "#555" }}>
                {u.last_login ? new Date(u.last_login).toLocaleString("nl-NL", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "Nooit"}
              </span>
              <button
                onClick={() => toggleActive(u)}
                style={{
                  background: "transparent", border: `1px solid ${u.is_active ? "#333" : "#16a34a"}`,
                  borderRadius: 7, padding: "4px 10px", fontSize: 11, cursor: "pointer",
                  color: u.is_active ? "#666" : "#22C55E",
                }}
              >
                {u.is_active ? "Deactiveer" : "Activeer"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Mobile cards */}
      <div className="rf-gb-mobile" style={{ flexDirection: "column", gap: 12, display: "none" }}>
        {loading && <div style={{ padding: "40px 20px", textAlign: "center", color: "#555", fontSize: 14 }}>Laden...</div>}
        {!loading && users.length === 0 && <div style={{ padding: "40px 20px", textAlign: "center", color: "#555", fontSize: 14, background: "#111", borderRadius: 14 }}>Geen gebruikers gevonden.</div>}
        {users.map(u => {
          const rc = ROLE_COLORS[u.role] ?? ROLE_COLORS.medewerker;
          return (
            <div key={u.id} style={{
              background: "#111", border: "1px solid #222", borderRadius: 14,
              padding: 12, display: "flex", flexDirection: "column", gap: 10,
              borderLeft: "4px solid #333",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#fff" }}>{u.name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#555" }}>{u.email}</p>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "3px 10px",
                  borderRadius: 20, whiteSpace: "nowrap",
                  color: rc.color, background: rc.bg, border: `1px solid ${rc.border}`,
                }}>
                  {ROLE_LABELS[u.role] ?? u.role}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: "#555" }}>
                Laatste login: {u.last_login ? new Date(u.last_login).toLocaleString("nl-NL", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "Nooit"}
              </p>
              <button
                onClick={() => toggleActive(u)}
                className="rf-gb-toggle-btn"
                style={{
                  background: "transparent",
                  border: `1px solid ${u.is_active ? "#333" : "#16a34a"}`,
                  borderRadius: 8, padding: "10px", fontSize: 13, cursor: "pointer",
                  color: u.is_active ? "#666" : "#22C55E",
                  textAlign: "center",
                }}
              >
                {u.is_active ? "Deactiveer" : "Activeer"}
              </button>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 18, padding: 32, width: "100%", maxWidth: 420 }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 900 }}>Nieuwe gebruiker</h2>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: "#888", fontWeight: 600, display: "block", marginBottom: 6 }}>Naam</label>
                <input style={INPUT} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#888", fontWeight: 600, display: "block", marginBottom: 6 }}>E-mailadres</label>
                <input style={INPUT} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#888", fontWeight: 600, display: "block", marginBottom: 6 }}>Wachtwoord</label>
                <input style={INPUT} type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={8} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#888", fontWeight: 600, display: "block", marginBottom: 6 }}>Rol</label>
                <select style={{ ...INPUT }} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="medewerker">Medewerker</option>
                  <option value="tier2">Tier 2</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {formError && <div style={{ color: "#ff8888", fontSize: 13 }}>{formError}</div>}
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="submit" disabled={submitting} style={{ ...BTN, flex: 1 }}>{submitting ? "Bezig..." : "Aanmaken"}</button>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, background: "transparent", border: "1px solid #333", borderRadius: 8, padding: "8px 16px", color: "#888", fontSize: 13, cursor: "pointer" }}>Annuleer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
