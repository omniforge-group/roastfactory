"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "../_components/AdminShell";
import type { AnalyticsData } from "@/lib/analytics-types";

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<AdminShell><div style={{ textAlign: "center", color: "#444", padding: 64 }}>Laden...</div></AdminShell>}>
      <AnalyticsContent />
    </Suspense>
  );
}

function AnalyticsContent() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then(r => {
        if (r.status === 401) { router.push("/dashboard-sf-intern"); return null; }
        return r.json();
      })
      .then(d => {
        if (!d) return;
        if (d.error) { setError(d.error); setLoading(false); return; }
        setData(d);
        setLoading(false);
      });
  }, [router]);

  return (
    <AdminShell>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 16px 64px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Analytics</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666" }}>Unieke bezoekers — Supabase pageview tracking</p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: "#444", padding: 64 }}>Laden...</div>
        ) : error ? (
          <div style={{ background: "#1a0a0a", border: "1px solid #3a1a1a", borderRadius: 14, padding: 24 }}>
            <div style={{ color: "#ef4444", fontSize: 14, marginBottom: 8 }}>Kon analytics niet laden</div>
            <div style={{ color: "#666", fontSize: 13, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{error}</div>
          </div>
        ) : data ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Unieke bezoekers — prominente kaarten */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              <VisitorCard
                label="Vandaag"
                value={data.today.visitors}
                prev={data.yesterday.visitors}
                prevLabel="vs gisteren"
                color="#a855f7"
              />
              <VisitorCard
                label="Deze week"
                value={data.week.visitors}
                prev={data.prevWeek.visitors}
                prevLabel="vs vorige week"
                color="#3b82f6"
              />
              <VisitorCard
                label="Deze maand"
                value={data.month.visitors}
                prev={data.prevMonth.visitors}
                prevLabel="vs vorige maand"
                color="#f59e0b"
              />
            </div>

            {/* Lijndiagram — laatste 30 dagen */}
            <div style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
                <h2 style={sectionLabel}>Unieke bezoekers per dag — laatste 30 dagen</h2>
              </div>
              <VisitorChart data={data.dailyChart} />
            </div>

            {/* Nieuw vs Terugkerend */}
            <div style={card}>
              <h2 style={sectionLabel}>Nieuw vs Terugkerend — deze maand</h2>
              <NewVsReturning data={data.newVsReturning} />
            </div>

            {/* Top pagina's + herkomst */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={card}>
                <h2 style={sectionLabel}>Top pagina&apos;s</h2>
                <BarList items={data.pages.map(p => ({ label: p.path, value: p.views }))} color="#a855f7" />
              </div>
              <div style={card}>
                <h2 style={sectionLabel}>Herkomst</h2>
                <BarList items={data.referrers.map(r => ({ label: r.referrer, value: r.sessions }))} color="#3b82f6" />
              </div>
            </div>

            {/* Landen */}
            <div style={card}>
              <h2 style={sectionLabel}>Landen</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10, marginTop: 12 }}>
                {data.countries.map(c => (
                  <div key={c.country} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#161616", borderRadius: 8, padding: "10px 14px" }}>
                    <span style={{ fontSize: 13, color: "#aaa" }}>{c.country}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#22c55e" }}>{c.sessions}</span>
                  </div>
                ))}
                {data.countries.length === 0 && <NoData />}
              </div>
            </div>

          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}

// ─── Visitor card with % change ───────────────────────────────────────────────

function VisitorCard({ label, value, prev, prevLabel, color }: {
  label: string; value: number; prev: number; prevLabel: string; color: string;
}) {
  const { pct, positive } = calcDelta(value, prev);
  return (
    <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 16, padding: "24px 20px" }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 44, fontWeight: 800, color, lineHeight: 1, marginBottom: 12 }}>
        {value.toLocaleString("nl-NL")}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {pct !== null ? (
          <span style={{
            fontSize: 12, fontWeight: 700,
            color: positive ? "#22c55e" : "#ef4444",
            background: positive ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
            borderRadius: 6, padding: "2px 7px",
          }}>
            {positive ? "+" : ""}{pct}%
          </span>
        ) : (
          <span style={{ fontSize: 12, color: "#444" }}>—</span>
        )}
        <span style={{ fontSize: 12, color: "#444" }}>{prevLabel}</span>
      </div>
    </div>
  );
}

function calcDelta(current: number, prev: number): { pct: number | null; positive: boolean } {
  if (prev === 0) return { pct: current > 0 ? 100 : null, positive: true };
  const pct = Math.round(((current - prev) / prev) * 100);
  return { pct, positive: pct >= 0 };
}

// ─── SVG line chart ────────────────────────────────────────────────────────────

type TooltipState = { index: number; x: number; y: number } | null;

function VisitorChart({ data }: { data: { date: string; visitors: number }[] }) {
  const [tooltip, setTooltip] = useState<TooltipState>(null);

  if (data.length === 0) return <NoData />;

  const VW = 900, VH = 220;
  const PAD = { top: 24, right: 24, bottom: 44, left: 48 };
  const cW = VW - PAD.left - PAD.right;
  const cH = VH - PAD.top - PAD.bottom;

  const maxVal = Math.max(...data.map(d => d.visitors), 1);
  const xOf = (i: number) => PAD.left + (i / (data.length - 1)) * cW;
  const yOf = (v: number) => PAD.top + cH - (v / maxVal) * cH;

  const points = data.map((d, i) => ({ x: xOf(i), y: yOf(d.visitors), ...d }));
  const linePts = points.map(p => `${p.x},${p.y}`).join(" ");
  const areaPts = `${points[0].x},${yOf(0)} ` + linePts + ` ${points[points.length - 1].x},${yOf(0)}`;

  // Y-axis grid lines
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({
    y: yOf(f * maxVal),
    label: Math.round(f * maxVal),
  }));

  // X-axis labels every 5 days
  const xLabels = data
    .map((d, i) => ({ i, d }))
    .filter(({ i }) => i % 5 === 0 || i === data.length - 1);

  const hovered = tooltip !== null ? data[tooltip.index] : null;
  const ttX = tooltip ? Math.min(Math.max(tooltip.x, PAD.left + 60), VW - PAD.right - 60) : 0;
  const ttY = tooltip ? Math.max(tooltip.y - 10, PAD.top + 40) : 0;

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      style={{ width: "100%", overflow: "visible" }}
      onMouseLeave={() => setTooltip(null)}
    >
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTicks.map(t => (
        <g key={t.label}>
          <line x1={PAD.left} y1={t.y} x2={VW - PAD.right} y2={t.y} stroke="#1f1f1f" strokeWidth={1} />
          <text x={PAD.left - 6} y={t.y + 4} textAnchor="end" fontSize={10} fill="#444">{t.label}</text>
        </g>
      ))}

      {/* X-axis baseline */}
      <line x1={PAD.left} y1={yOf(0)} x2={VW - PAD.right} y2={yOf(0)} stroke="#2a2a2a" strokeWidth={1} />

      {/* X-axis labels */}
      {xLabels.map(({ i, d }) => (
        <text key={d.date} x={xOf(i)} y={VH - 8} textAnchor="middle" fontSize={10} fill="#555">
          {formatDate(d.date)}
        </text>
      ))}

      {/* Area fill */}
      <polygon points={areaPts} fill="url(#chartFill)" />

      {/* Line */}
      <polyline points={linePts} fill="none" stroke="#a855f7" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

      {/* Data points — invisible hit targets */}
      {points.map((p, i) => (
        <circle
          key={p.date}
          cx={p.x}
          cy={p.y}
          r={14}
          fill="transparent"
          style={{ cursor: "crosshair" }}
          onMouseEnter={() => setTooltip({ index: i, x: p.x, y: p.y })}
        />
      ))}

      {/* Visible dot on hovered point */}
      {tooltip !== null && (
        <circle cx={points[tooltip.index].x} cy={points[tooltip.index].y} r={4} fill="#a855f7" stroke="#111" strokeWidth={2} />
      )}

      {/* Tooltip */}
      {tooltip !== null && hovered && (
        <g>
          <rect x={ttX - 62} y={ttY - 42} width={124} height={38} rx={7} fill="#1a1a1a" stroke="#333" strokeWidth={1} />
          <text x={ttX} y={ttY - 26} textAnchor="middle" fontSize={10} fill="#888">{formatDateLong(hovered.date)}</text>
          <text x={ttX} y={ttY - 12} textAnchor="middle" fontSize={12} fontWeight={700} fill="#a855f7">
            {hovered.visitors} {hovered.visitors === 1 ? "bezoeker" : "bezoekers"}
          </text>
        </g>
      )}
    </svg>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short", timeZone: "UTC" });
}

function formatDateLong(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
}

// ─── New vs Returning ─────────────────────────────────────────────────────────

function NewVsReturning({ data }: { data: { new: number; returning: number } }) {
  const total = data.new + data.returning;
  const newPct    = total > 0 ? Math.round((data.new / total) * 100) : 0;
  const returnPct = total > 0 ? 100 - newPct : 0;

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: "#22c55e" }} />
          <span style={{ fontSize: 13, color: "#aaa" }}>Nieuw</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#22c55e" }}>{data.new.toLocaleString("nl-NL")}</span>
          <span style={{ fontSize: 12, color: "#555" }}>({newPct}%)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: "#3b82f6" }} />
          <span style={{ fontSize: 13, color: "#aaa" }}>Terugkerend</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#3b82f6" }}>{data.returning.toLocaleString("nl-NL")}</span>
          <span style={{ fontSize: 12, color: "#555" }}>({returnPct}%)</span>
        </div>
      </div>
      {total > 0 ? (
        <div style={{ height: 8, borderRadius: 6, background: "#1f1f1f", overflow: "hidden" }}>
          <div style={{ display: "flex", height: "100%" }}>
            <div style={{ width: `${newPct}%`, background: "#22c55e", transition: "width 0.4s ease" }} />
            <div style={{ flex: 1, background: "#3b82f6" }} />
          </div>
        </div>
      ) : (
        <NoData />
      )}
    </div>
  );
}

// ─── Shared helpers ────────────────────────────────────────────────────────────

function BarList({ items, color }: { items: { label: string; value: number }[]; color: string }) {
  const max = items[0]?.value ?? 1;
  if (items.length === 0) return <NoData />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
      {items.map(({ label, value }) => (
        <div key={label}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: "#aaa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "75%" }}>{label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#ccc" }}>{value.toLocaleString("nl-NL")}</span>
          </div>
          <div style={{ height: 5, borderRadius: 3, background: "#1f1f1f" }}>
            <div style={{ height: "100%", borderRadius: 3, background: color, width: `${(value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function NoData() {
  return <div style={{ fontSize: 13, color: "#444", marginTop: 12 }}>Geen data beschikbaar</div>;
}

const card: React.CSSProperties = { background: "#111", border: "1px solid #1f1f1f", borderRadius: 16, padding: 24 };
const sectionLabel: React.CSSProperties = { margin: 0, fontSize: 11, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" };
