import { supabaseAdmin } from "@/lib/supabase-admin";
import { resend } from "@/lib/resend";

export async function GET(req: Request) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();

  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select("id, status, package, price, roast_target, customer_name, created_at, delivered_at");

  const all = orders ?? [];

  const openstaand     = all.filter(o => o.status === "paid");
  const inBehandeling  = all.filter(o => o.status === "in_progress");
  const gisterAfgeleverd = all.filter(o =>
    o.status === "delivered" &&
    o.delivered_at &&
    o.delivered_at >= yesterdayStart &&
    o.delivered_at < todayStart
  );
  const omzetGisteren = all
    .filter(o => o.status !== "pending" && o.created_at >= yesterdayStart && o.created_at < todayStart)
    .reduce((s, o) => s + Number(o.price ?? 0), 0);

  const PKG: Record<string, string> = {
    quick_roast: "Quick Roast", savage_pack: "Savage Pack",
    nuclear_pack: "Nuclear Pack", battle_mode: "Battle Mode",
  };

  function orderRow(o: { customer_name: string | null; roast_target: string | null; package: string }) {
    return `<tr>
      <td style="padding:6px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#334155;">${o.customer_name || "—"}</td>
      <td style="padding:6px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;">${PKG[o.package] ?? o.package}</td>
      <td style="padding:6px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#FF6B00;">${o.roast_target || "—"}</td>
    </tr>`;
  }

  function section(title: string, color: string, rows: typeof all) {
    if (rows.length === 0) return `<div style="background:#fff;border-radius:12px;padding:16px 20px;margin-bottom:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${color};">${title} (0)</p>
      <p style="margin:0;font-size:13px;color:#94a3b8;">Geen bestellingen.</p>
    </div>`;
    return `<div style="background:#fff;border-radius:12px;padding:16px 20px;margin-bottom:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      <p style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${color};">${title} (${rows.length})</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr><th style="text-align:left;font-size:11px;color:#94a3b8;padding-bottom:6px;">Klant</th><th style="text-align:left;font-size:11px;color:#94a3b8;padding-bottom:6px;">Pakket</th><th style="text-align:left;font-size:11px;color:#94a3b8;padding-bottom:6px;">Voor</th></tr>
        ${rows.map(orderRow).join("")}
      </table>
    </div>`;
  }

  const dateLabel = new Date(yesterdayStart).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });

  try {
    await resend.emails.send({
      from: "RoastFactory <roasts@songfactory.eu>",
      to: process.env.ADMIN_EMAIL || "info@songfactory.eu",
      subject: `📊 Dagelijkse samenvatting — ${new Date().toLocaleDateString("nl-NL")}`,
      html: `<!DOCTYPE html>
<html lang="nl"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
  <div style="background:linear-gradient(135deg,#FF2D2D,#FF6B00);padding:28px 32px;text-align:center;">
    <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.75);">RoastFactory Admin</p>
    <h1 style="margin:0;font-size:22px;font-weight:900;color:#fff;">📊 Dagelijkse samenvatting</h1>
    <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">${new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
  </div>

  <div style="max-width:600px;margin:0 auto;padding:24px 16px 48px;">

    <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
      <div style="flex:1;min-width:120px;background:#fff;border-radius:12px;padding:16px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <p style="margin:0;font-size:24px;font-weight:900;color:#60A5FA;">${openstaand.length}</p>
        <p style="margin:4px 0 0;font-size:11px;color:#94a3b8;font-weight:700;text-transform:uppercase;">Openstaand</p>
      </div>
      <div style="flex:1;min-width:120px;background:#fff;border-radius:12px;padding:16px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <p style="margin:0;font-size:24px;font-weight:900;color:#FF6B00;">${inBehandeling.length}</p>
        <p style="margin:4px 0 0;font-size:11px;color:#94a3b8;font-weight:700;text-transform:uppercase;">In behandeling</p>
      </div>
      <div style="flex:1;min-width:120px;background:#fff;border-radius:12px;padding:16px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <p style="margin:0;font-size:24px;font-weight:900;color:#22C55E;">${gisterAfgeleverd.length}</p>
        <p style="margin:4px 0 0;font-size:11px;color:#94a3b8;font-weight:700;text-transform:uppercase;">Gister afgeleverd</p>
      </div>
      <div style="flex:1;min-width:120px;background:#fff;border-radius:12px;padding:16px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <p style="margin:0;font-size:24px;font-weight:900;color:#FF2D2D;">€${omzetGisteren.toFixed(2).replace(".", ",")}</p>
        <p style="margin:4px 0 0;font-size:11px;color:#94a3b8;font-weight:700;text-transform:uppercase;">Omzet gisteren</p>
      </div>
    </div>

    ${section("💳 Openstaande bestellingen (betaald, nog niet gestart)", "#60A5FA", openstaand)}
    ${section("⚙️ In behandeling", "#FF6B00", inBehandeling)}
    ${section(`✅ Gisteren afgeleverd (${dateLabel})`, "#22C55E", gisterAfgeleverd)}

    <div style="text-align:center;margin-top:20px;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://roastfactory.eu"}/dashboard-sf-intern"
         style="display:inline-block;background:#FF2D2D;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">
        Naar het dashboard →
      </a>
    </div>
  </div>
</body></html>`,
    });
  } catch (err) {
    console.error("daily-summary mail error:", err);
    return Response.json({ error: "Mail failed" }, { status: 500 });
  }

  return Response.json({ ok: true, openstaand: openstaand.length, inBehandeling: inBehandeling.length, gisterAfgeleverd: gisterAfgeleverd.length });
}
