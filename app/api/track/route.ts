import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";

const BOT_PATTERN = /bot|crawl|spider|slurp|search|fetch|headless|phantom|selenium|puppeteer/i;

export async function POST(req: Request) {
  // Sla bots over
  const ua = req.headers.get("user-agent") ?? "";
  if (BOT_PATTERN.test(ua)) return new Response(null, { status: 204 });

  let path: string;
  let referrer: string | null;
  try {
    const body = await req.json();
    path = typeof body.path === "string" ? body.path : "/";
    referrer = typeof body.referrer === "string" && body.referrer ? body.referrer : null;
  } catch {
    return new Response(null, { status: 204 });
  }

  // Sla admin-paden over
  if (path.startsWith("/dashboard-sf-intern")) return new Response(null, { status: 204 });

  // Dagelijkse bezoekershash: SHA256(IP + date) — privacy-vriendelijk, reset elke dag
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const today = new Date().toISOString().slice(0, 10);
  const visitorHash = crypto.createHash("sha256").update(`${ip}:${today}`).digest("hex").slice(0, 16);

  // Land via Vercel header
  const country = req.headers.get("x-vercel-ip-country") ?? null;

  await supabaseAdmin.from("pageviews").insert({ path, referrer, country, visitor_hash: visitorHash });

  return new Response(null, { status: 204 });
}
