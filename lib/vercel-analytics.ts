// Vercel Web Analytics — internal dashboard API
// Requires VERCEL_TOKEN + VERCEL_PROJECT_ID (system env var in Vercel deployments)

const BASE = "https://vercel.com/api/web/insights";

function headers() {
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new Error("VERCEL_TOKEN not set");
  return { Authorization: `Bearer ${token}` };
}

function projectId() {
  const id = process.env.VERCEL_PROJECT_ID;
  if (!id) throw new Error("VERCEL_PROJECT_ID not set. This is auto-available in Vercel deployments; set it manually for local use.");
  return id;
}

function buildUrl(path: string, params: Record<string, string>) {
  const url = new URL(`${BASE}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return url.toString();
}

async function apiFetch<T>(path: string, params: Record<string, string>): Promise<T> {
  const res = await fetch(buildUrl(path, params), { headers: headers(), cache: "no-store" });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Vercel API ${path} → ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

type TimeRange = { from: number; to: number };

function todayRange(): TimeRange {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return { from: start.getTime(), to: now.getTime() };
}

function monthRange(): TimeRange {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return { from: start.getTime(), to: now.getTime() };
}

export async function fetchVercelAnalytics() {
  const pid = projectId();
  const today = todayRange();
  const month = monthRange();

  const commonMonth = { projectId: pid, from: String(month.from), to: String(month.to), environment: "production" };
  const commonToday = { projectId: pid, from: String(today.from), to: String(today.to), environment: "production" };

  type StatResponse = { data?: { key: string; total: number; devices?: number }[]; total?: number };
  type VisitorResponse = { data?: { key: string; total: number }[]; total?: number };

  const [visitorsToday, visitorsMonth, pages, referrers, countries] = await Promise.all([
    apiFetch<VisitorResponse>("/stats/unique-visitors", commonToday).catch(() => ({ total: 0, data: [] })),
    apiFetch<VisitorResponse>("/stats/unique-visitors", commonMonth).catch(() => ({ total: 0, data: [] })),
    apiFetch<StatResponse>("/stats/pages", { ...commonMonth, limit: "10" }).catch(() => ({ data: [] })),
    apiFetch<StatResponse>("/stats/referrers", { ...commonMonth, limit: "10" }).catch(() => ({ data: [] })),
    apiFetch<StatResponse>("/stats/countries", { ...commonMonth, limit: "10" }).catch(() => ({ data: [] })),
  ]);

  return {
    today: {
      visitors: typeof visitorsToday.total === "number" ? visitorsToday.total : 0,
    },
    month: {
      visitors: typeof visitorsMonth.total === "number" ? visitorsMonth.total : 0,
    },
    pages: (pages.data ?? []).map(d => ({ path: d.key, views: d.total })),
    referrers: (referrers.data ?? []).map(d => ({ referrer: d.key || "Direct", sessions: d.total })),
    countries: (countries.data ?? []).map(d => ({ country: d.key || "Onbekend", sessions: d.total })),
  };
}

export type VercelAnalyticsData = Awaited<ReturnType<typeof fetchVercelAnalytics>>;
