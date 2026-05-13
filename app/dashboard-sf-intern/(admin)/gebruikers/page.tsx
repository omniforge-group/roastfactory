"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  last_login: string | null;
  is_active: boolean;
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  medewerker: "Medewerker",
  tier2: "Tier 2",
};
const ROLE_COLORS: Record<string, string> = {
  admin: "#a855f7",
  medewerker: "#3b82f6",
  tier2: "#f59e0b",
};

export default function GebruikersPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", color: "#444", padding: 64 }}>Laden...</div>}>
      <GebruikersContent />
    </Suspense>
  );
}

function GebruikersContent() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  // Nieuw gebruiker form
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("medewerker");
  const [formError, setFormError] = useState("");
  const [formSaving, setFormSaving] = useState(false);

  // Reset wachtwoord
  const [resetId, setResetId] = useState<string | null>(null);
  const [resetPw, setResetPw] = useState("");
  const [resetSaving, setResetSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/dashboard-sf-intern/users");
    if (res.status === 401) { router.push("/dashboard-sf-intern"); return; }
    if (res.status === 403) { setForbidden(true); setLoading(false); return; }
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setFormSaving(true);
    setFormError("");
    const res = await fetch("/api/dashboard-sf-intern/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: formName, email: formEmail, password: formPassword, role: formRole }),
    });
    const data = await res.json();
    if (!res.ok) { setFormError(data.error || "Fout."); setFormSaving(false); return; }
    setShowForm(false);
    setFormName(""); setFormEmail(""); setFormPassword(""); setFormRole("medewerker");
    setFormSaving(false);
    load();
  }

  async function toggleActive(id: string, is_active: boolean) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active } : u));
    await fetch(`/api/dashboard-sf-intern/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active }),
    });
  }

  async function changeRole(id: string, role: string) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
    await fetch(`/api/dashboard-sf-intern/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetId || !resetPw) return;
    setResetSaving(true);
    await fetch(`/api/dashboard-sf-intern/users/${resetId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: resetPw }),
    });
    setResetId(null);
    setResetPw("");
    setResetSaving(false);
  }

  if (forbidden) {
    return (
      <div style={{ textAlign: "center", padding: 80, color: "#666" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
          <div>Alleen admins hebben toegang tot deze pagina.</div>
      </div>
    );
  }

  return (
    <>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px 64px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Gebruikers</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666" }}>{users.length} accounts</p>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            style={{ background: "linear-gradient(135deg,#f59e0b,#ec4899,#a855f7)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
          >
            + Nieuwe gebruiker
          </button>
        </div>

        {/* Nieuw gebruiker form */}
        {showForm && (
          <form onSubmit={createUser} style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 16, padding: 24, marginBottom: 20 }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 600, color: "#ccc" }}>Nieuwe gebruiker aanmaken</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <Field label="Naam">
                <input value={formName} onChange={e => setFormName(e.target.value)} required placeholder="Jan de Vries"
                  style={inputStyle} />
              </Field>
              <Field label="E-mailadres">
                <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} required placeholder="jan@songfactory.eu"
                  style={inputStyle} />
              </Field>
              <Field label="Wachtwoord">
                <input type="password" value={formPassword} onChange={e => setFormPassword(e.target.value)} required minLength={8}
                  style={inputStyle} />
              </Field>
              <Field label="Rol">
                <select value={formRole} onChange={e => setFormRole(e.target.value)} style={inputStyle}>
                  <option value="admin">Admin</option>
                  <option value="medewerker">Medewerker</option>
                  <option value="tier2">Tier 2</option>
                </select>
              </Field>
            </div>
            {formError && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>{formError}</div>}
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" disabled={formSaving}
                style={{ background: "#a855f7", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                {formSaving ? "Bezig..." : "Aanmaken"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                style={{ background: "none", border: "1px solid #333", color: "#666", borderRadius: 8, padding: "10px 16px", fontSize: 14, cursor: "pointer" }}>
                Annuleren
              </button>
            </div>
          </form>
        )}

        {/* Gebruikers tabel */}
        {loading ? (
          <div style={{ textAlign: "center", color: "#444", padding: 64 }}>Laden...</div>
        ) : (
          <div style={{ background: "#111", borderRadius: 16, border: "1px solid #1f1f1f", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1f1f1f" }}>
                  {["Naam / E-mail", "Rol", "Laatste login", "Status", "Acties"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? "1px solid #1a1a1a" : "none" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{u.name}</div>
                      <div style={{ fontSize: 12, color: "#666" }}>{u.email}</div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <select
                        value={u.role}
                        onChange={e => changeRole(u.id, e.target.value)}
                        style={{ background: "#1a1a1a", border: `1px solid ${ROLE_COLORS[u.role] || "#2a2a2a"}`, color: ROLE_COLORS[u.role] || "#ccc", borderRadius: 8, padding: "4px 8px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}
                      >
                        <option value="admin">Admin</option>
                        <option value="medewerker">Medewerker</option>
                        <option value="tier2">Tier 2</option>
                      </select>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#666" }}>
                      {u.last_login ? new Date(u.last_login).toLocaleString("nl-NL") : "—"}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: u.is_active ? "#22c55e" : "#ef4444", background: "rgba(255,255,255,0.04)", padding: "3px 8px", borderRadius: 6 }}>
                        {u.is_active ? "Actief" : "Inactief"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => toggleActive(u.id, !u.is_active)}
                          style={{ background: "none", border: "1px solid #333", color: u.is_active ? "#ef4444" : "#22c55e", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}
                        >
                          {u.is_active ? "Deactiveer" : "Activeer"}
                        </button>
                        <button
                          onClick={() => { setResetId(u.id); setResetPw(""); }}
                          style={{ background: "none", border: "1px solid #333", color: "#888", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}
                        >
                          Reset PW
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: 48, textAlign: "center", color: "#444", fontSize: 14 }}>Nog geen gebruikers aangemaakt.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reset wachtwoord modal */}
      {resetId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
          <form onSubmit={resetPassword} style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 20, padding: "28px 24px", maxWidth: 360, width: "100%" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 700 }}>Wachtwoord resetten</h2>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "#666" }}>
              Vul het nieuwe wachtwoord in voor {users.find(u => u.id === resetId)?.name}.
            </p>
            <input
              type="password"
              value={resetPw}
              onChange={e => setResetPw(e.target.value)}
              required
              minLength={8}
              placeholder="Nieuw wachtwoord (min. 8 tekens)"
              style={{ ...inputStyle, marginBottom: 16 }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={() => setResetId(null)}
                style={{ flex: 1, background: "#1a1a1a", border: "1px solid #333", color: "#ccc", borderRadius: 10, padding: "12px", fontSize: 14, cursor: "pointer" }}>
                Annuleren
              </button>
              <button type="submit" disabled={resetSaving}
                style={{ flex: 1, background: "#a855f7", border: "none", color: "#fff", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                {resetSaving ? "Opslaan..." : "Opslaan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
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
