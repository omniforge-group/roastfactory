import { isAdminRequest } from "@/lib/check-admin-token";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: Request) {
  if (!isAdminRequest(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const todayStart     = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const yesterdayStart = new Date(todayStart.getTime() - 86_400_000);

  const dow = todayStart.getUTCDay();
  const weekStart      = new Date(todayStart.getTime() - (dow === 0 ? 6 : dow - 1) * 86_400_000);
  const prevWeekStart  = new Date(weekStart.getTime() - 7 * 86_400_000);

  const monthStart     = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const prevMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));

  const thirtyDaysAgo  = new Date(todayStart.getTime() - 29 * 86_400_000);

  const { data: all } = await supabaseAdmin
    .from("pageviews")
    .select("visitor_hash, created_at, path, referrer, country")
    .order("created_at", { ascending: true })
    .limit(10_000);

  const rows = (all ?? []) as {
    visitor_hash: string | null;
    created_at: string;
    path: string;
    referrer: string | null;
    country: string | null;
  }[];

  function uniqueSetIn(from: Date, to?: Date): Set<string> {
    const set = new Set<string>();
    for (const r of rows) {
      if (!r.visitor_hash) continue;
      const t = new Date(r.created_at).getTime();
      if (t >= from.getTime() && (to === undefined || t < to.getTime())) {
        set.add(r.visitor_hash);
      }
    }
    return set;
  }

  // Daily chart: last 30 days
  const dailyMap = new Map<string, Set<string>>();
  for (const r of rows) {
    if (!r.visitor_hash) continue;
    if (new Date(r.created_at).getTime() < thirtyDaysAgo.getTime()) continue;
    const key = new Date(r.created_at).toISOString().slice(0, 10);
    if (!dailyMap.has(key)) dailyMap.set(key, new Set());
    dailyMap.get(key)!.add(r.visitor_hash);
  }
  const dailyChart: { date: string; visitors: number }[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo.getTime() + i * 86_400_000);
    const key = d.toISOString().slice(0, 10);
    dailyChart.push({ date: key, visitors: dailyMap.get(key)?.size ?? 0 });
  }

  // New vs returning this month
  const monthSet  = uniqueSetIn(monthStart);
  const beforeSet = uniqueSetIn(new Date(0), monthStart);
  let newCount = 0, returningCount = 0;
  for (const hash of monthSet) {
    if (beforeSet.has(hash)) returningCount++;
    else newCount++;
  }

  function topN(vals: string[], n = 10) {
    const map = new Map<string, number>();
    for (const v of vals) map.set(v, (map.get(v) ?? 0) + 1);
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
  }

  const monthRows = rows.filter(r => new Date(r.created_at).getTime() >= monthStart.getTime());

  return Response.json({
    today:     { visitors: uniqueSetIn(todayStart).size },
    yesterday: { visitors: uniqueSetIn(yesterdayStart, todayStart).size },
    week:      { visitors: uniqueSetIn(weekStart).size },
    prevWeek:  { visitors: uniqueSetIn(prevWeekStart, weekStart).size },
    month:     { visitors: uniqueSetIn(monthStart).size },
    prevMonth: { visitors: uniqueSetIn(prevMonthStart, monthStart).size },
    dailyChart,
    newVsReturning: { new: newCount, returning: returningCount },
    pages:     topN(monthRows.map(r => r.path)).map(([path, views]) => ({ path, views })),
    referrers: topN(monthRows.filter(r => r.referrer).map(r => r.referrer as string)).map(([referrer, sessions]) => ({ referrer, sessions })),
    countries: topN(monthRows.filter(r => r.country).map(r => r.country as string)).map(([country, sessions]) => ({ country, sessions })),
  });
}
