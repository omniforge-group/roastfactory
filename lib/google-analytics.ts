import { BetaAnalyticsDataClient } from "@google-analytics/data";

function getClient() {
  const encoded = process.env.GOOGLE_ANALYTICS_CREDENTIALS;
  if (!encoded) throw new Error("GOOGLE_ANALYTICS_CREDENTIALS not set");
  const credentials = JSON.parse(Buffer.from(encoded, "base64").toString("utf8"));
  return new BetaAnalyticsDataClient({ credentials });
}

export const GA_PROPERTY_ID = process.env.GOOGLE_ANALYTICS_PROPERTY_ID ?? "";

export async function fetchAnalytics() {
  const client = getClient();
  const property = `properties/${GA_PROPERTY_ID}`;

  const [
    todayRes,
    monthRes,
    channelRes,
    countryRes,
    pagesRes,
    returnRes,
  ] = await Promise.all([
    // Bezoekers vandaag
    client.runReport({
      property,
      dateRanges: [{ startDate: "today", endDate: "today" }],
      metrics: [
        { name: "sessions" },
        { name: "totalUsers" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
      ],
    }),
    // Bezoekers deze maand
    client.runReport({
      property,
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      metrics: [
        { name: "sessions" },
        { name: "totalUsers" },
        { name: "newUsers" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
        { name: "conversions" },
      ],
    }),
    // Kanalen (organic, direct, social, referral)
    client.runReport({
      property,
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      dimensions: [{ name: "sessionDefaultChannelGrouping" }],
      metrics: [{ name: "sessions" }, { name: "totalUsers" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 10,
    }),
    // Landen
    client.runReport({
      property,
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      dimensions: [{ name: "country" }],
      metrics: [{ name: "sessions" }, { name: "totalUsers" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 10,
    }),
    // Populairste pagina's
    client.runReport({
      property,
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
      metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 10,
    }),
    // Nieuw vs terugkerend
    client.runReport({
      property,
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      dimensions: [{ name: "newVsReturning" }],
      metrics: [{ name: "sessions" }, { name: "totalUsers" }],
    }),
  ]);

  function metricVal(res: typeof todayRes[0], row: number, col: number): number {
    return parseFloat(res?.rows?.[row]?.metricValues?.[col]?.value ?? "0");
  }

  const today = {
    sessions: metricVal(todayRes[0], 0, 0),
    users: metricVal(todayRes[0], 0, 1),
    bounceRate: metricVal(todayRes[0], 0, 2),
    avgSessionDuration: metricVal(todayRes[0], 0, 3),
  };

  const month = {
    sessions: metricVal(monthRes[0], 0, 0),
    users: metricVal(monthRes[0], 0, 1),
    newUsers: metricVal(monthRes[0], 0, 2),
    bounceRate: metricVal(monthRes[0], 0, 3),
    avgSessionDuration: metricVal(monthRes[0], 0, 4),
    conversions: metricVal(monthRes[0], 0, 5),
    returningUsers: metricVal(monthRes[0], 0, 1) - metricVal(monthRes[0], 0, 2),
  };

  const channels = (channelRes[0].rows ?? []).map(r => ({
    channel: r.dimensionValues?.[0]?.value ?? "Onbekend",
    sessions: parseInt(r.metricValues?.[0]?.value ?? "0"),
    users: parseInt(r.metricValues?.[1]?.value ?? "0"),
  }));

  const countries = (countryRes[0].rows ?? []).map(r => ({
    country: r.dimensionValues?.[0]?.value ?? "Onbekend",
    sessions: parseInt(r.metricValues?.[0]?.value ?? "0"),
    users: parseInt(r.metricValues?.[1]?.value ?? "0"),
  }));

  const pages = (pagesRes[0].rows ?? []).map(r => ({
    path: r.dimensionValues?.[0]?.value ?? "/",
    title: r.dimensionValues?.[1]?.value ?? "",
    views: parseInt(r.metricValues?.[0]?.value ?? "0"),
    users: parseInt(r.metricValues?.[1]?.value ?? "0"),
  }));

  const newVsReturning = (returnRes[0].rows ?? []).map(r => ({
    type: r.dimensionValues?.[0]?.value ?? "Onbekend",
    sessions: parseInt(r.metricValues?.[0]?.value ?? "0"),
    users: parseInt(r.metricValues?.[1]?.value ?? "0"),
  }));

  return { today, month, channels, countries, pages, newVsReturning };
}

export type AnalyticsData = Awaited<ReturnType<typeof fetchAnalytics>>;
