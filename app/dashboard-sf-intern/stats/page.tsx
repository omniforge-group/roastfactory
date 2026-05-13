"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "../_components/AdminShell";

type Item = { label: string; count: number };
type StatsData = {
  occasions: Item[];
  languages: Item[];
  styles: Item[];
  moods: Item[];
  avgDeliveryMinutes: number | null;
  discountCodes: Item[];
};

type FinanceData = {
  revenueThisMonth: number;
  revenueThisYear: number;
  totalRevenue: number;
  avgOrderValue: number;
  totalDiscount: number;
  revenuePerMonth: { month: string; revenue: number }[];
  failedPayments: number;
};

function fmt(cents: number) {
  return `€${(cents / 100).toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function StatsPage() {
  const router = useRouter();
  const [data, setData] = useState<StatsData | null>(null);
  const [finance, setFinance] = useState<FinanceData | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard-sf-intern/me").then(r => r.ok ? r.json() : null).then(d => { if (d?.role) setRole(d.role); });
  }, []);

  useEffect(() => {
    fetch("/api/dashboard-sf-intern/stats")
      .then(r => { if (r.status === 401) router.push("/dashboard-sf-intern"); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (role !== "admin") return;
    fetch("/api/dashboard-sf-intern/stats/finance")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && !d.error) setFinance(d); });
  }, [role]);

  function formatDelivery(minutes: number | null) {
    if (minutes === null) return "—";
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}u ${m}m` : `${h}u`;
  }

  return (
    <AdminShell>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 700 }}>Statistieken</h1>
        <p style={{ margin: "0 0 32px", fontSize: 13, color: "#666" }}>Gebaseerd op alle betaalde orders</p>

        {loading ? (
          <div style={{ textAlign: "center", color: "#444", padding: 64 }}>Laden...</div>
        ) : data ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Financiën — alleen voor admin */}
            {role === "admin" && finance && (
              <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 16, padding: 24 }}>
                <h2 style={sectionTitle}>Financiën</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 14, marginBottom: 20 }}>
                  {[
                    { label: "Omzet deze maand", value: fmt(finance.revenueThisMonth), color: "#22c55e" },
                    { label: "Omzet dit jaar", value: fmt(finance.revenueThisYear), color: "#a855f7" },
                    { label: "Totale omzet", value: fmt(finance.totalRevenue), color: "#3b82f6" },
                    { label: "Gem. orderwaarde", value: fmt(finance.avgOrderValue), color: "#f59e0b" },
                    { label: "Totaal korting", value: fmt(finance.totalDiscount), color: "#ec4899" },
                    { label: "Mislukte betalingen", value: finance.failedPayments, color: "#ef4444" },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: "#161616", borderRadius: 12, padding: "16px 14px" }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
                      <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>{label}</div>
                    </div>
                  ))}
                </div>
                {/* Omzet per maand grafiek */}
                {finance.revenuePerMonth.length > 0 && (() => {
                  const maxRev = Math.max(...finance.revenuePerMonth.map(m => m.revenue), 1);
                  return (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Omzet per maand</div>
                      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
                        {finance.revenuePerMonth.map(({ month, revenue }) => (
                          <div key={month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                            <div
                              style={{ width: "100%", background: revenue > 0 ? "#a855f7" : "#1f1f1f", borderRadius: "4px 4px 0 0", height: `${Math.max(4, (revenue / maxRev) * 64)}px`, transition: "height 0.3s" }}
                              title={`${month}: ${fmt(revenue)}`}
                            />
                            <div style={{ fontSize: 9, color: "#444", transform: "rotate(-45deg)", transformOrigin: "center", whiteSpace: "nowrap" }}>
                              {month.slice(5)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Delivery time */}
            <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 16, padding: 24 }}>
              <h2 style={sectionTitle}>Gemiddelde levertijd</h2>
              <div style={{ fontSize: 36, fontWeight: 800, color: "#a855f7" }}>{formatDelivery(data.avgDeliveryMinutes)}</div>
              <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>van betaling tot levering</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <BarChart title="Gelegenheden" items={data.occasions} color="#f59e0b" />
              <BarChart title="Talen" items={data.languages} color="#3b82f6" />
              <BarChart title="Muziekstijlen" items={data.styles} color="#ec4899" />
              <BarChart title="Sferen" items={data.moods} color="#22c55e" />
            </div>

            {data.discountCodes.length > 0 && (
              <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 16, padding: 24 }}>
                <h2 style={sectionTitle}>Kortingscodes</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                  {data.discountCodes.map(({ label, count }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#161616", borderRadius: 10 }}>
                      <span style={{ fontSize: 13, fontFamily: "monospace", color: "#ccc" }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b" }}>{count}×</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : (
          <div style={{ color: "#444" }}>Kon statistieken niet laden.</div>
        )}
      </div>
    </AdminShell>
  );
}

const sectionTitle: React.CSSProperties = {
  margin: "0 0 12px",
  fontSize: 13,
  fontWeight: 600,
  color: "#555",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
};

function BarChart({ title, items, color }: { title: string; items: Item[]; color: string }) {
  const max = items[0]?.count ?? 1;
  return (
    <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 16, padding: 24 }}>
      <h2 style={sectionTitle}>{title}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.slice(0, 8).map(({ label, count }) => (
          <div key={label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: "#aaa" }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#ccc" }}>{count}</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: "#1f1f1f" }}>
              <div style={{ height: "100%", borderRadius: 3, background: color, width: `${(count / max) * 100}%` }} />
            </div>
          </div>
        ))}
        {items.length === 0 && <div style={{ fontSize: 13, color: "#444" }}>Geen data</div>}
      </div>
    </div>
  );
}
