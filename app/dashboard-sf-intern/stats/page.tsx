import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function isAuthed(): boolean {
  const token = cookies().get("admin-token")?.value;
  const secret = process.env.ADMIN_SECRET_TOKEN;
  return !!token && !!secret && token === secret;
}

const PKG: Record<string, string> = {
  quick_roast: "Quick Roast",
  savage_pack: "Savage Pack",
  nuclear_pack: "Nuclear Pack",
  battle_mode: "Battle Mode",
};

const LEVEL: Record<string, string> = {
  mild: "Mild 😅", medium: "Medium 😬", savage: "Savage 🔥", nuclear: "Nuclear ☢️",
};

function countBy(arr: Record<string, unknown>[], key: string): { label: string; count: number }[] {
  const map = new Map<string, number>();
  for (const item of arr) {
    const val = String(item[key] ?? "Onbekend");
    map.set(val, (map.get(val) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function Bar({ count, max, color = "#FF2D2D" }: { count: number; max: number; color?: string }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div style={{ flex: 1, height: 6, background: "#1a1a1a", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.3s" }} />
    </div>
  );
}

export default async function StatsPage() {
  if (!isAuthed()) redirect("/dashboard-sf-intern/login");

  const { data: allOrders } = await supabaseAdmin
    .from("orders")
    .select("status, package, price, roast_level, occasion, created_at, delivered_at");

  const rows = allOrders ?? [];
  const paid = rows.filter(o => o.status !== "pending");
  const totalOrders = rows.length;

  const totalRevenue = paid.reduce((s, o) => s + Number(o.price ?? 0), 0);
  const avgOrderValue = paid.length > 0 ? totalRevenue / paid.length : 0;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const revenueThisMonth = paid
    .filter(o => o.created_at >= monthStart)
    .reduce((s, o) => s + Number(o.price ?? 0), 0);

  // Conversion rate
  const conversionRate = totalOrders > 0 ? Math.round((paid.length / totalOrders) * 100) : 0;

  // Avg delivery time (hours)
  const deliveryTimes = rows
    .filter(o => o.status === "delivered" && o.created_at && o.delivered_at)
    .map(o => (new Date(o.delivered_at!).getTime() - new Date(o.created_at).getTime()) / 3600000);
  const avgDeliveryHours = deliveryTimes.length > 0
    ? (deliveryTimes.reduce((s, v) => s + v, 0) / deliveryTimes.length).toFixed(1)
    : null;

  // Revenue per package
  const revenueByPackage: Record<string, number> = {};
  for (const o of paid) {
    const pkg = o.package as string;
    revenueByPackage[pkg] = (revenueByPackage[pkg] ?? 0) + Number(o.price ?? 0);
  }
  const pkgRevenue = Object.entries(revenueByPackage)
    .map(([label, revenue]) => ({ label, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
  const maxPkgRevenue = Math.max(...pkgRevenue.map(p => p.revenue), 1);

  // Counts
  const pkgCounts = countBy(paid as Record<string, unknown>[], "package");
  const levelCounts = countBy(paid as Record<string, unknown>[], "roast_level");
  const occasionCounts = countBy(paid as Record<string, unknown>[], "occasion");
  const pkgMax = pkgCounts[0]?.count ?? 1;
  const totalPaid = paid.length;

  // Monthly revenue (6 months)
  const monthlyMap = new Map<string, number>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap.set(key, 0);
  }
  for (const o of paid) {
    if (!o.created_at) continue;
    const d = new Date(o.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (monthlyMap.has(key)) monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + Number(o.price ?? 0));
  }
  const revenuePerMonth = Array.from(monthlyMap.entries()).map(([month, revenue]) => ({ month, revenue }));
  const maxMonthRevenue = Math.max(...revenuePerMonth.map(m => m.revenue), 1);

  const cardStyle: React.CSSProperties = { background: "#111111", border: "1px solid #222", borderRadius: 14, padding: "24px 28px" };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

      {/* Row 1: 6 summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Totale omzet",      value: `€${totalRevenue.toFixed(2).replace(".", ",")}`,       color: "#FF2D2D" },
          { label: "Deze maand",        value: `€${revenueThisMonth.toFixed(2).replace(".", ",")}`,   color: "#FF6B00" },
          { label: "Bestellingen",      value: paid.length,                                            color: "#60A5FA" },
          { label: "Gem. orderwaarde",  value: `€${avgOrderValue.toFixed(2).replace(".", ",")}`,       color: "#22C55E" },
          { label: "Conversie rate",    value: `${conversionRate}%`,                                   color: "#a78bfa", sub: `${paid.length} van ${totalOrders} checkouts` },
          { label: "Gem. levertijd",    value: avgDeliveryHours ? `${avgDeliveryHours} uur` : "—",    color: "#facc15", sub: avgDeliveryHours ? `op basis van ${deliveryTimes.length} leveringen` : "nog geen data" },
        ].map(s => (
          <div key={s.label} style={{ ...cardStyle, padding: "20px 22px" }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: s.color, letterSpacing: -1, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#555", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</div>
            {"sub" in s && <div style={{ fontSize: 10, color: "#444", marginTop: 4 }}>{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* Row 2: Monthly revenue chart */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h2 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 800 }}>Omzet per maand (6 maanden)</h2>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
          {revenuePerMonth.map(({ month, revenue }) => {
            const pct = revenue / maxMonthRevenue;
            const [y, m] = month.split("-");
            const label = new Date(Number(y), Number(m) - 1, 1).toLocaleString("nl-NL", { month: "short" });
            return (
              <div key={month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 10, color: "#555" }}>€{revenue.toFixed(0)}</span>
                <div style={{ width: "100%", height: `${Math.max(pct * 90, revenue > 0 ? 4 : 2)}px`, background: revenue > 0 ? "#FF2D2D" : "#222", borderRadius: "4px 4px 0 0", transition: "height 0.3s" }} />
                <span style={{ fontSize: 10, color: "#666", textTransform: "capitalize" }}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 3: Revenue per package */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h2 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 800 }}>Omzet per pakket</h2>
        {pkgRevenue.length === 0 ? (
          <p style={{ color: "#555", fontSize: 13, margin: 0 }}>Geen data.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {pkgRevenue.map(({ label, revenue }) => (
              <div key={label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: "#ccc", fontWeight: 600 }}>{PKG[label] ?? label}</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: "#FF6B00" }}>€{revenue.toFixed(2).replace(".", ",")}</span>
                </div>
                <Bar count={revenue} max={maxPkgRevenue} color="#FF6B00" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Row 4: 3 columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>

        {/* Package distribution met % */}
        <div style={cardStyle}>
          <h2 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 800 }}>Pakketten</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {pkgCounts.map(({ label, count }) => {
              const pct = totalPaid > 0 ? Math.round((count / totalPaid) * 100) : 0;
              return (
                <div key={label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: "#ccc" }}>{PKG[label] ?? label}</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ fontSize: 11, color: "#555" }}>{pct}%</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#FF6B00" }}>{count}</span>
                    </div>
                  </div>
                  <Bar count={count} max={pkgMax} />
                </div>
              );
            })}
            {pkgCounts.length === 0 && <p style={{ fontSize: 12, color: "#555", margin: 0 }}>Geen data.</p>}
          </div>
        </div>

        {/* Roast level met % */}
        <div style={cardStyle}>
          <h2 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 800 }}>Roast levels</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {levelCounts.map(({ label, count }) => {
              const pct = totalPaid > 0 ? Math.round((count / totalPaid) * 100) : 0;
              const levelColors: Record<string, string> = { mild: "#22C55E", medium: "#facc15", savage: "#FF6B00", nuclear: "#FF2D2D" };
              return (
                <div key={label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: "#ccc" }}>{LEVEL[label] ?? label}</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ fontSize: 11, color: "#555" }}>{pct}%</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: levelColors[label] ?? "#FF6B00" }}>{count}</span>
                    </div>
                  </div>
                  <Bar count={count} max={levelCounts[0]?.count ?? 1} color={levelColors[label] ?? "#FF6B00"} />
                </div>
              );
            })}
            {levelCounts.length === 0 && <p style={{ fontSize: 12, color: "#555", margin: 0 }}>Geen data.</p>}
          </div>
        </div>

        {/* Top 5 gelegenheden met % */}
        <div style={cardStyle}>
          <h2 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 800 }}>Top gelegenheden</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {occasionCounts.slice(0, 5).map(({ label, count }) => {
              const pct = totalPaid > 0 ? Math.round((count / totalPaid) * 100) : 0;
              return (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#ccc", flex: 1, paddingRight: 8 }}>{label}</span>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, color: "#555" }}>{pct}%</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#60A5FA" }}>{count}</span>
                  </div>
                </div>
              );
            })}
            {occasionCounts.length === 0 && <p style={{ fontSize: 12, color: "#555", margin: 0 }}>Geen data.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
