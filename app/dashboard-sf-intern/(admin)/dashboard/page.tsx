"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { VercelAnalyticsData } from "@/lib/vercel-analytics";

type Stats = {
  openOrders: number;
  ordersThisMonth: number;
  totalPaid: number;
  avgScore: string | null;
  surveyRate: number;
  surveyCount: number;
  totalRevisions: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [analytics, setAnalytics] = useState<VercelAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard-sf-intern/dashboard")
      .then(r => { if (r.status === 401) router.push("/dashboard-sf-intern"); return r.json(); })
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
    fetch("/api/dashboard-sf-intern/analytics")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && !d.error) setAnalytics(d); });
  }, [router]);

  return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 700 }}>Dashboard</h1>
        <p style={{ margin: "0 0 32px", fontSize: 13, color: "#666" }}>Overzicht van SongFactory</p>

        {loading ? (
          <div style={{ textAlign: "center", color: "#444", padding: 64 }}>Laden...</div>
        ) : stats ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
              <StatCard
                label="Open orders"
                value={stats.openOrders}
                sub="betaald, nog niet geleverd"
                color="#f59e0b"
                href="/dashboard-sf-intern/orders?filter=open"
              />
              <StatCard
                label="Orders deze maand"
                value={stats.ordersThisMonth}
                sub="betaalde orders"
                color="#a855f7"
                href="/dashboard-sf-intern/orders?filter=month"
              />
              <StatCard
                label="Totaal orders"
                value={stats.totalPaid}
                sub="alle betaalde orders"
                color="#3b82f6"
                href="/dashboard-sf-intern/orders"
              />
              <StatCard
                label="Gem. waardering"
                value={stats.avgScore !== null ? `${stats.avgScore}/10` : "—"}
                sub={`${stats.surveyCount} surveys ingevuld`}
                color="#22c55e"
              />
              <StatCard
                label="Survey respons"
                value={`${stats.surveyRate}%`}
                sub="van klanten vult survey in"
                color="#ec4899"
              />
              <StatCard
                label="Revisies verstuurd"
                value={stats.totalRevisions}
                sub="totaal over alle orders"
                color="#f97316"
                href="/dashboard-sf-intern/orders?filter=revisies"
              />
            </div>

            {/* Analytics samenvatting */}
            {analytics && (
              <div style={{ marginTop: 32 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Website analytics <span style={{ fontSize: 12, color: "#555", fontWeight: 400 }}>deze maand</span></h2>
                  <a href="/dashboard-sf-intern/analytics" style={{ fontSize: 12, color: "#a855f7", textDecoration: "none" }}>Alles bekijken →</a>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
                  <StatCard label="Bezoekers vandaag" value={analytics.today.visitors} sub="unieke bezoekers" color="#f59e0b" href="/dashboard-sf-intern/analytics" />
                  <StatCard label="Bezoekers deze maand" value={analytics.month.visitors} sub="unieke bezoekers" color="#3b82f6" href="/dashboard-sf-intern/analytics" />
                  <StatCard label="Top pagina" value={analytics.pages[0]?.path ?? "—"} sub={`${analytics.pages[0]?.views ?? 0} weergaven`} color="#a855f7" />
                  <StatCard label="Top herkomst" value={analytics.referrers[0]?.referrer ?? "—"} sub={`${analytics.referrers[0]?.sessions ?? 0} sessies`} color="#22c55e" />
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ color: "#444" }}>Kon statistieken niet laden.</div>
        )}
      </div>
  );
}

function StatCard({ label, value, sub, color, href }: { label: string; value: string | number; sub: string; color: string; href?: string }) {
  const inner = (
    <div style={{
      background: "#111",
      border: "1px solid #1f1f1f",
      borderRadius: 16,
      padding: "24px 20px",
      cursor: href ? "pointer" : "default",
      transition: "border-color 0.15s, background 0.15s",
    }}
      onMouseEnter={e => { if (href) { (e.currentTarget as HTMLDivElement).style.borderColor = color; (e.currentTarget as HTMLDivElement).style.background = "#161616"; } }}
      onMouseLeave={e => { if (href) { (e.currentTarget as HTMLDivElement).style.borderColor = "#1f1f1f"; (e.currentTarget as HTMLDivElement).style.background = "#111"; } }}
    >
      <div style={{ fontSize: 32, fontWeight: 800, color, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#ccc", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 11, color: "#555" }}>{sub}</div>
      {href && <div style={{ fontSize: 11, color: color, marginTop: 8, opacity: 0.7 }}>Bekijken →</div>}
    </div>
  );

  if (href) {
    return <a href={href} style={{ textDecoration: "none" }}>{inner}</a>;
  }
  return inner;
}
