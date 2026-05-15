import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function isAuthed(): boolean {
  const token = cookies().get("admin-token")?.value;
  const secret = process.env.ADMIN_SECRET_TOKEN;
  return !!token && !!secret && token === secret;
}

const ACTION_LABELS: Record<string, string> = {
  login:                   "Ingelogd",
  logout:                  "Uitgelogd",
  status_gewijzigd:        "Status gewijzigd",
  roast_afgeleverd:        "Roast afgeleverd",
  kortingscode_aangemaakt: "Kortingscode aangemaakt",
  kortingscode_verwijderd: "Kortingscode verwijderd",
  gebruiker_aangemaakt:    "Gebruiker aangemaakt",
  gebruiker_gewijzigd:     "Gebruiker gewijzigd",
  gebruiker_gedeactiveerd: "Gebruiker gedeactiveerd",
  toegang_gewijzigd:       "Toegang gewijzigd",
};

const ACTION_COLORS: Record<string, string> = {
  login:                   "#22C55E",
  roast_afgeleverd:        "#22C55E",
  kortingscode_aangemaakt: "#60A5FA",
  gebruiker_aangemaakt:    "#60A5FA",
  status_gewijzigd:        "#FF6B00",
  kortingscode_verwijderd: "#FF2D2D",
  gebruiker_gedeactiveerd: "#FF2D2D",
  toegang_gewijzigd:       "#a855f7",
};

export default async function ActiviteitenPage() {
  if (!isAuthed()) redirect("/dashboard-sf-intern/login");

  const { data: logs } = await supabaseAdmin
    .from("activity_log")
    .select("id, user_name, action, details, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = logs ?? [];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
      <style>{`
        @media (max-width: 768px) {
          .rf-act-page { padding: 16px 14px !important; }
          .rf-act-page h1 { font-size: 20px !important; }
          .rf-act-desktop { display: none !important; }
          .rf-act-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .rf-act-mobile { display: none !important; }
        }
      `}</style>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>Activiteiten</h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666" }}>{rows.length} recente acties — audit log</p>
      </div>

      {/* Desktop table */}
      <div className="rf-act-desktop" style={{ background: "#111111", border: "1px solid #222", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "150px 140px 180px 1fr", padding: "10px 20px", borderBottom: "1px solid #222", background: "#0d0d0d" }}>
          {["Tijdstip", "Gebruiker", "Actie", "Details"].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#555" }}>{h}</span>
          ))}
        </div>

        {rows.length === 0 && (
          <div style={{ padding: "48px 20px", textAlign: "center", color: "#555", fontSize: 14 }}>Nog geen activiteiten gelogd.</div>
        )}

        {rows.map((log, i) => {
          const color = ACTION_COLORS[log.action] ?? "#666";
          const label = ACTION_LABELS[log.action] ?? log.action;
          const date = new Date(log.created_at).toLocaleString("nl-NL", {
            day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit",
          });
          return (
            <div key={log.id} style={{
              display: "grid", gridTemplateColumns: "150px 140px 180px 1fr",
              padding: "12px 20px", borderBottom: i < rows.length - 1 ? "1px solid #1a1a1a" : "none",
              alignItems: "center",
            }}>
              <span style={{ fontSize: 11, color: "#555" }}>{date}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{log.user_name}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color }}>{label}</span>
              <span style={{ fontSize: 12, color: "#888" }}>{log.details || "—"}</span>
            </div>
          );
        })}
      </div>

      {/* Mobile cards */}
      <div className="rf-act-mobile" style={{ flexDirection: "column", gap: 12, display: "none" }}>
        {rows.length === 0 && (
          <div style={{ padding: "48px 20px", textAlign: "center", color: "#555", fontSize: 14, background: "#111", borderRadius: 14 }}>Nog geen activiteiten gelogd.</div>
        )}
        {rows.map(log => {
          const color = ACTION_COLORS[log.action] ?? "#666";
          const label = ACTION_LABELS[log.action] ?? log.action;
          const date = new Date(log.created_at).toLocaleString("nl-NL", {
            day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit",
          });
          return (
            <div key={log.id} style={{
              background: "#111", border: "1px solid #222", borderRadius: 14,
              padding: 12, display: "flex", flexDirection: "column", gap: 8,
              borderLeft: `4px solid ${color}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{log.user_name}</span>
                <span style={{ fontSize: 10, color: "#555", flexShrink: 0 }}>{date}</span>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, color,
                display: "inline-block", padding: "2px 8px",
                background: color + "18", borderRadius: 6,
                alignSelf: "flex-start",
              }}>{label}</span>
              {log.details && (
                <span style={{ fontSize: 13, color: "#888", lineHeight: 1.5 }}>{log.details}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
