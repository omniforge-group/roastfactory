"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Permission = {
  page_key: string;
  medewerker: boolean;
  tier2: boolean;
  admin?: boolean;
};

const PAGE_LABELS: Record<string, string> = {
  bestellingen: "🔥 Bestellingen",
  stats:        "📊 Statistieken",
  kortingscodes:"🎟️ Kortingscodes",
  gebruikers:   "👥 Gebruikers",
  activiteiten: "📋 Activiteiten",
  toegang:      "🔐 Toegang",
};

export default function ToegangsPage() {
  const router = useRouter();
  const [perms, setPerms] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/dashboard-sf-intern/permissions");
    if (res.status === 401) { router.push("/dashboard-sf-intern/login"); return; }
    if (!res.ok) { setError("Fout bij ophalen."); setLoading(false); return; }
    setPerms(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggle(pageKey: string, field: "medewerker" | "tier2", current: boolean) {
    setSaving(`${pageKey}-${field}`);
    const perm = perms.find(p => p.page_key === pageKey);
    if (!perm) { setSaving(null); return; }

    const updated = { ...perm, [field]: !current };
    await fetch("/api/dashboard-sf-intern/permissions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page_key: pageKey, medewerker: updated.medewerker, tier2: updated.tier2 }),
    });

    setPerms(p => p.map(x => x.page_key === pageKey ? updated : x));
    setSaving(null);
  }

  const ROLES: { key: "admin" | "medewerker" | "tier2"; label: string; color: string; fixed?: boolean }[] = [
    { key: "admin",      label: "Admin",      color: "#FF2D2D", fixed: true },
    { key: "tier2",      label: "Tier 2",     color: "#FF6B00" },
    { key: "medewerker", label: "Medewerker", color: "#60A5FA" },
  ];

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 24px" }}>
      <style>{`
        @media (max-width: 768px) {
          .rf-tg-page { padding: 16px 14px !important; }
          .rf-tg-page h1 { font-size: 20px !important; }
          .rf-tg-grid { grid-template-columns: 1fr repeat(3, 72px) !important; padding: 10px 14px !important; }
          .rf-tg-row { grid-template-columns: 1fr repeat(3, 72px) !important; padding: 12px 14px !important; }
          .rf-tg-toggle { width: 36px !important; height: 36px !important; min-width: 36px !important; min-height: 36px !important; }
        }
      `}</style>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>Toegangsrechten</h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666" }}>Bepaal welke rollen toegang hebben tot welke pagina's</p>
      </div>

      {error && (
        <div style={{ background: "#1a0505", border: "1px solid #FF2D2D44", borderRadius: 10, padding: "12px 18px", marginBottom: 20, color: "#ff8888", fontSize: 14 }}>{error}</div>
      )}

      <div style={{ background: "#111111", border: "1px solid #222", borderRadius: 14, overflow: "hidden" }}>
        {/* Header */}
        <div className="rf-tg-grid" style={{ display: "grid", gridTemplateColumns: "1fr repeat(3, 110px)", padding: "12px 24px", borderBottom: "1px solid #222", background: "#0d0d0d", alignItems: "center" }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#555" }}>Pagina</span>
          {ROLES.map(r => (
            <span key={r.key} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: r.color, textAlign: "center" }}>{r.label}</span>
          ))}
        </div>

        {loading && <div style={{ padding: "40px 20px", textAlign: "center", color: "#555", fontSize: 14 }}>Laden...</div>}

        {perms.map((perm, i) => (
          <div key={perm.page_key} className="rf-tg-row" style={{
            display: "grid", gridTemplateColumns: "1fr repeat(3, 110px)",
            padding: "14px 24px", borderBottom: i < perms.length - 1 ? "1px solid #1a1a1a" : "none",
            alignItems: "center",
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
              {PAGE_LABELS[perm.page_key] ?? perm.page_key}
            </span>

            {/* Admin — always on, not editable */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div className="rf-tg-toggle" style={{ width: 32, height: 32, borderRadius: 8, background: "#FF2D2D33", border: "2px solid #FF2D2D", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 16, lineHeight: 1 }}>✓</span>
              </div>
            </div>

            {/* Tier2 */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                onClick={() => toggle(perm.page_key, "tier2", perm.tier2)}
                disabled={saving === `${perm.page_key}-tier2`}
                className="rf-tg-toggle"
                style={{
                  width: 32, height: 32, borderRadius: 8, cursor: "pointer", border: "none",
                  background: perm.tier2 ? "#FF6B00" : "#1a1a1a",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  outline: "2px solid " + (perm.tier2 ? "#FF6B00" : "#333"),
                  transition: "background 0.15s",
                }}
              >
                {perm.tier2 && <span style={{ fontSize: 16, color: "#fff" }}>✓</span>}
              </button>
            </div>

            {/* Medewerker */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                onClick={() => toggle(perm.page_key, "medewerker", perm.medewerker)}
                disabled={saving === `${perm.page_key}-medewerker`}
                className="rf-tg-toggle"
                style={{
                  width: 32, height: 32, borderRadius: 8, cursor: "pointer", border: "none",
                  background: perm.medewerker ? "#60A5FA" : "#1a1a1a",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  outline: "2px solid " + (perm.medewerker ? "#60A5FA" : "#333"),
                  transition: "background 0.15s",
                }}
              >
                {perm.medewerker && <span style={{ fontSize: 16, color: "#fff" }}>✓</span>}
              </button>
            </div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 16, fontSize: 12, color: "#444" }}>
        Admin heeft altijd volledige toegang. Wijzigingen worden direct opgeslagen.
      </p>
    </div>
  );
}
