"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "../_components/AdminShell";

type PagePermission = {
  page_key: string;
  medewerker: boolean;
  tier2: boolean;
};

const PAGE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  orders: "Orders",
  surveys: "Surveys",
  stats: "Statistieken",
  analytics: "Analytics",
  werkprocessen: "Werkprocessen",
  kortingscodes: "Kortingscodes",
  gebruikers: "Gebruikers",
  activiteiten: "Activiteiten",
  toegang: "Toegangsbeheer",
};

const ADMIN_ONLY = ["gebruikers", "toegang"];

export default function ToegangsPage() {
  const router = useRouter();
  const [permissions, setPermissions] = useState<PagePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/me")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d?.role) { router.push("/dashboard-sf-intern"); return; }
        if (d.role !== "admin") { router.push("/dashboard-sf-intern/dashboard"); return; }
        setRole(d.role);
      });

    fetch("/api/admin/permissions")
      .then(r => { if (r.status === 401) router.push("/dashboard-sf-intern"); return r.json(); })
      .then(data => { setPermissions(data ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  async function toggle(page_key: string, field: "medewerker" | "tier2", value: boolean) {
    setSaving(`${page_key}-${field}`);
    const current = permissions.find(p => p.page_key === page_key);
    if (!current) return;

    const updated = { ...current, [field]: value };
    setPermissions(prev => prev.map(p => p.page_key === page_key ? updated : p));

    const res = await fetch("/api/admin/permissions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    if (!res.ok) {
      setPermissions(prev => prev.map(p => p.page_key === page_key ? current : p));
      alert("Opslaan mislukt");
    }
    setSaving(null);
  }

  return (
    <AdminShell>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 700 }}>Toegangsbeheer</h1>
        <p style={{ margin: "0 0 32px", fontSize: 13, color: "#666" }}>
          Beheer welke rollen toegang hebben tot elke pagina. Admins hebben altijd volledige toegang.
        </p>

        {loading ? (
          <div style={{ textAlign: "center", color: "#444", padding: 64 }}>Laden...</div>
        ) : (
          <div style={{ border: "1px solid #1f1f1f", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1f1f1f", background: "#111" }}>
                  <th style={{ padding: "12px 20px", textAlign: "left", fontWeight: 600, color: "#888" }}>Pagina</th>
                  <th style={{ padding: "12px 20px", textAlign: "center", fontWeight: 600, color: "#888", width: 120 }}>Admin</th>
                  <th style={{ padding: "12px 20px", textAlign: "center", fontWeight: 600, color: "#888", width: 120 }}>Medewerker</th>
                  <th style={{ padding: "12px 20px", textAlign: "center", fontWeight: 600, color: "#888", width: 120 }}>Tier 2</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((perm, i) => {
                  const isAdminOnly = ADMIN_ONLY.includes(perm.page_key);
                  const savingThis = (field: string) => saving === `${perm.page_key}-${field}`;
                  return (
                    <tr
                      key={perm.page_key}
                      style={{
                        borderBottom: i < permissions.length - 1 ? "1px solid #1a1a1a" : "none",
                        background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a",
                      }}
                    >
                      <td style={{ padding: "14px 20px", fontWeight: 500 }}>
                        {PAGE_LABELS[perm.page_key] ?? perm.page_key}
                        {isAdminOnly && (
                          <span style={{ marginLeft: 8, fontSize: 11, color: "#555", background: "#1a1a1a", padding: "2px 6px", borderRadius: 4 }}>
                            admin only
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: "center", padding: "14px 20px" }}>
                        <span style={{ fontSize: 18 }}>✓</span>
                      </td>
                      <td style={{ textAlign: "center", padding: "14px 20px" }}>
                        {isAdminOnly ? (
                          <span style={{ color: "#333", fontSize: 18 }}>—</span>
                        ) : (
                          <Toggle
                            value={perm.medewerker}
                            loading={savingThis("medewerker")}
                            onChange={v => toggle(perm.page_key, "medewerker", v)}
                          />
                        )}
                      </td>
                      <td style={{ textAlign: "center", padding: "14px 20px" }}>
                        {isAdminOnly ? (
                          <span style={{ color: "#333", fontSize: 18 }}>—</span>
                        ) : (
                          <Toggle
                            value={perm.tier2}
                            loading={savingThis("tier2")}
                            onChange={v => toggle(perm.page_key, "tier2", v)}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p style={{ marginTop: 20, fontSize: 12, color: "#444" }}>
          Wijzigingen worden direct opgeslagen en zijn van kracht bij de volgende paginanavigatie.
        </p>
      </div>
    </AdminShell>
  );
}

function Toggle({ value, loading, onChange }: { value: boolean; loading: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => !loading && onChange(!value)}
      disabled={loading}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        border: "none",
        background: loading ? "#333" : value ? "#a855f7" : "#2a2a2a",
        cursor: loading ? "wait" : "pointer",
        position: "relative",
        transition: "background 0.2s",
        outline: "none",
      }}
    >
      <span style={{
        position: "absolute",
        top: 3,
        left: value ? 23 : 3,
        width: 18,
        height: 18,
        borderRadius: "50%",
        background: "#fff",
        transition: "left 0.2s",
        display: "block",
      }} />
    </button>
  );
}
