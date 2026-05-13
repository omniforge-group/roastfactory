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

function Bar({ count, max }: { count: number; max: number }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div style={{ flex: 1, height: 6, background: "#1a1a1a", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: "#FF2D2D", borderRadius: 3, transition: "width 0.3s" }} />
    </div>
  );
}

export default async function StatsPage() {
  if (!isAuthed()) redirect("/dashboard-sf-intern/login");

  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select("status, package, price, roast_level, occasion, created_at");

  const rows = orders ?? [];
  const paid = rows.filter(o => o.status !== "pending");
  const totalRevenue = paid.reduce((s, o) => s + Number(o.price ?? 0), 0);
  const avgOrderValue = paid.length > 0 ? totalRevenue / paid.length : 0;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const revenueThisMonth = paid
    .filter(o => o.created_at >= monthStart)
    .reduce((s, o) => s + Number(o.price ?? 0), 0);

  const pkgCounts = countBy(paid, "package");
  const levelCounts = countBy(paid, "roast_level");
  const occasionCounts = countBy(paid as Record<string, unknown>[], "occasion");

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

  const pkgMax = pkgCounts[0]?.count ?? 1;
  const levelMax = levelCounts[0]?.count ?? 1;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Totale omzet",      value: `€${totalRevenue.toFixed(2).replace(".", ",")}`,         color: "#FF2D2D" },
          { label: "Deze maand",        value: `€${revenueThisMonth.toFixed(2).replace(".", ",")}`,     color: "#FF6B00" },
          { label: "Bestellingen",      value: paid.length,                                              color: "#60A5FA" },
          { label: "Gem. orderwaarde",  value: `€${avgOrderValue.toFixed(2).replace(".", ",")}`,         color: "#22C55E" },
        ].map(s => (
          <div key={s.label} style={{ background: "#111111", border: "1px solid #222", borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: s.color, letterSpacing: -1, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#555", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Monthly revenue chart */}
      <div style={{ background: "#111111", border: "1px solid #222", borderRadius: 14, padding: "24px 28px", marginBottom: 24 }}>
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
        {/* Package distribution */}
        <div style={{ background: "#111111", border: "1px solid #222", borderRadius: 14, padding: "24px 28px" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 800 }}>Pakketten</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pkgCounts.map(({ label, count }) => (
              <div key={label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "#ccc" }}>{PKG[label] ?? label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#FF6B00" }}>{count}</span>
                </div>
                <Bar count={count} max={pkgMax} />
              </div>
            ))}
            {pkgCounts.length === 0 && <p style={{ fontSize: 12, color: "#555", margin: 0 }}>Geen data.</p>}
          </div>
        </div>

        {/* Roast level distribution */}
        <div style={{ background: "#111111", border: "1px solid #222", borderRadius: 14, padding: "24px 28px" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 800 }}>Roast levels</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {levelCounts.map(({ label, count }) => (
              <div key={label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "#ccc" }}>{LEVEL[label] ?? label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#FF6B00" }}>{count}</span>
                </div>
                <Bar count={count} max={levelMax} />
              </div>
            ))}
            {levelCounts.length === 0 && <p style={{ fontSize: 12, color: "#555", margin: 0 }}>Geen data.</p>}
          </div>
        </div>

        {/* Occasion distribution */}
        <div style={{ background: "#111111", border: "1px solid #222", borderRadius: 14, padding: "24px 28px" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 800 }}>Gelegenheden</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {occasionCounts.slice(0, 6).map(({ label, count }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "#ccc" }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#60A5FA" }}>{count}</span>
              </div>
            ))}
            {occasionCounts.length === 0 && <p style={{ fontSize: 12, color: "#555", margin: 0 }}>Geen data.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
