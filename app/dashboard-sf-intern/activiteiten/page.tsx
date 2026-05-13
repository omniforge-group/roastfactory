"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "../_components/AdminShell";

type LogEntry = {
  id: string;
  user_name: string;
  action: string;
  details: string | null;
  created_at: string;
};

const ACTION_LABELS: Record<string, string> = {
  login:                   "Inloggen",
  revisie_verstuurd:       "Revisie verstuurd",
  order_status_gewijzigd:  "Status gewijzigd",
  order_gearchiveerd:      "Order gearchiveerd",
  order_hersteld:          "Order hersteld",
  order_verwijderd:        "Order verwijderd",
  kortingscode_aangemaakt: "Kortingscode aangemaakt",
  gebruiker_aangemaakt:    "Gebruiker aangemaakt",
  gebruiker_gedeactiveerd: "Gebruiker gedeactiveerd",
  gebruiker_gewijzigd:     "Gebruiker gewijzigd",
};

const ACTION_COLORS: Record<string, string> = {
  login:                   "#3b82f6",
  revisie_verstuurd:       "#a855f7",
  order_status_gewijzigd:  "#f59e0b",
  order_gearchiveerd:      "#666",
  order_hersteld:          "#22c55e",
  order_verwijderd:        "#ef4444",
  kortingscode_aangemaakt: "#ec4899",
  gebruiker_aangemaakt:    "#22c55e",
  gebruiker_gedeactiveerd: "#ef4444",
  gebruiker_gewijzigd:     "#f59e0b",
};

const ALL_ACTIONS = Object.keys(ACTION_LABELS);

export default function ActiviteitenPage() {
  return (
    <Suspense fallback={<AdminShell><div style={{ textAlign: "center", color: "#444", padding: 64 }}>Laden...</div></AdminShell>}>
      <ActiviteitenContent />
    </Suspense>
  );
}

function ActiviteitenContent() {
  const router = useRouter();
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [filterAction, setFilterAction] = useState("");

  async function load(action: string) {
    setLoading(true);
    const url = action ? `/api/dashboard-sf-intern/activity?action=${action}` : "/api/dashboard-sf-intern/activity";
    const res = await fetch(url);
    if (res.status === 401) { router.push("/dashboard-sf-intern"); return; }
    if (res.status === 403) { setForbidden(true); setLoading(false); return; }
    const data = await res.json();
    setEntries(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(filterAction); }, [filterAction]); // eslint-disable-line react-hooks/exhaustive-deps

  if (forbidden) {
    return (
      <AdminShell>
        <div style={{ textAlign: "center", padding: 80, color: "#666" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
          <div>Alleen admins en tier2 hebben toegang tot deze pagina.</div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 16px 64px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Activiteiten</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666" }}>{entries.length} vermeldingen</p>
          </div>
          <select
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
            style={{ background: "#111", border: "1px solid #2a2a2a", color: "#ccc", borderRadius: 10, padding: "8px 14px", fontSize: 13, cursor: "pointer" }}
          >
            <option value="">Alle acties</option>
            {ALL_ACTIONS.map(a => <option key={a} value={a}>{ACTION_LABELS[a]}</option>)}
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: "#444", padding: 64 }}>Laden...</div>
        ) : (
          <div style={{ background: "#111", borderRadius: 16, border: "1px solid #1f1f1f", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1f1f1f" }}>
                  {["Tijdstip", "Gebruiker", "Actie", "Details"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((e, i) => {
                  const color = ACTION_COLORS[e.action] || "#666";
                  const label = ACTION_LABELS[e.action] || e.action;
                  return (
                    <tr key={e.id} style={{ borderBottom: i < entries.length - 1 ? "1px solid #1a1a1a" : "none" }}>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#555", whiteSpace: "nowrap" }}>
                        {new Date(e.created_at).toLocaleString("nl-NL")}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600 }}>{e.user_name}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color, background: "rgba(255,255,255,0.04)", padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap" }}>
                          {label}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#888" }}>{e.details || "—"}</td>
                    </tr>
                  );
                })}
                {entries.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: 48, textAlign: "center", color: "#444", fontSize: 14 }}>Geen activiteiten gevonden.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
