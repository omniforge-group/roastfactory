import { supabaseAdmin } from "@/lib/supabase-admin";
import { resend } from "@/lib/resend";

export async function GET(req: Request) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();

  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select("id, package, roast_target, customer_email, created_at")
    .eq("status", "paid")
    .lt("created_at", cutoff);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!orders || orders.length === 0) return Response.json({ ok: true, notified: 0 });

  const PKG: Record<string, string> = {
    quick_roast: "Quick Roast", savage_pack: "Savage Pack",
    nuclear_pack: "Nuclear Pack", battle_mode: "Battle Mode",
  };

  for (const order of orders) {
    const hoursWaiting = Math.round((Date.now() - new Date(order.created_at).getTime()) / 1000 / 3600);
    try {
      await resend.emails.send({
        from: "RoastFactory <roasts@songfactory.eu>",
        to: process.env.ADMIN_EMAIL || "info@songfactory.eu",
        subject: `⏰ Bestelling wacht al ${hoursWaiting} uur — ${PKG[order.package] ?? order.package} voor ${order.roast_target}`,
        html: `<!DOCTYPE html>
<html lang="nl"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
  <div style="background:#FF6B00;padding:24px 32px;text-align:center;">
    <h1 style="margin:0;font-size:20px;font-weight:900;color:#fff;">⏰ Bestelling wacht op behandeling</h1>
  </div>
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
      <p style="margin:0;font-size:15px;font-weight:700;color:#856404;">
        Deze bestelling wacht al <strong>${hoursWaiting} uur</strong> zonder behandeling.
      </p>
    </div>
    <div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;width:140px;">Pakket</td>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:700;color:#FF2D2D;">${PKG[order.package] ?? order.package}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;">Voor wie</td>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:600;color:#0f172a;">${order.roast_target}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;">Klant</td>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#0f172a;">${order.customer_email}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#64748b;">Besteld op</td>
          <td style="padding:8px 0;font-size:14px;color:#0f172a;">${new Date(order.created_at).toLocaleString("nl-NL")}</td>
        </tr>
      </table>
    </div>
    <div style="text-align:center;margin-top:20px;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard-sf-intern/orders/${order.id}"
         style="display:inline-block;background:#FF2D2D;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">
        Bekijk bestelling →
      </a>
    </div>
  </div>
</body></html>`,
      });
    } catch (err) {
      console.error("check-pending mail error:", err);
    }
  }

  return Response.json({ ok: true, notified: orders.length });
}
