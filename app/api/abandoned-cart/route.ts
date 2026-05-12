import { supabaseAdmin } from "@/lib/supabase-admin";
import { resend } from "@/lib/resend";

export const maxDuration = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.songfactory.eu";

function buildEmailHtml(naam: string) {
  const firstName = naam.split(" ")[0];
  return `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">

  <div style="background:linear-gradient(135deg,#f59e0b 0%,#ec4899 50%,#3b82f6 100%);padding:40px 32px 36px;text-align:center;">
    <p style="margin:0 0 8px 0;font-size:13px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.75);">SongFactory</p>
    <h1 style="margin:0;font-size:26px;font-weight:900;color:#ffffff;line-height:1.2;">Je persoonlijke lied staat nog klaar 🎵</h1>
  </div>

  <div style="max-width:600px;margin:0 auto;padding:0 16px 48px;">

    <div style="background:#ffffff;border-radius:20px;padding:32px;margin-top:24px;box-shadow:0 2px 12px rgba(15,23,42,0.06);">
      <p style="margin:0 0 16px 0;font-size:16px;color:#0f172a;">Hoi <strong>${firstName}</strong>,</p>
      <p style="margin:0 0 16px 0;font-size:15px;line-height:1.75;color:#475569;">
        Je bent begonnen met het maken van een persoonlijk lied, maar je bestelling is nog niet afgerond.
        Het lied dat jij voor iemand bijzonders wilde maken, staat nog te wachten. 🎶
      </p>
      <p style="margin:0 0 24px 0;font-size:15px;line-height:1.75;color:#475569;">
        Voor <strong>€14,95</strong> geef je iemand een lied dat alleen over hén gaat —
        hun naam, hun verhaal, hun herinneringen. Binnen 24 uur als MP3 in je inbox, klaar om cadeau te geven.
      </p>

      <div style="text-align:center;margin:0 0 24px 0;">
        <a href="${SITE_URL}/bestellen" style="
          display:inline-block;
          background:linear-gradient(135deg,#f59e0b 0%,#ec4899 50%,#3b82f6 100%);
          color:#ffffff;
          font-family:Arial,sans-serif;
          font-size:16px;
          font-weight:700;
          text-decoration:none;
          padding:16px 36px;
          border-radius:100px;
        ">Maak mijn persoonlijk lied →</a>
      </div>

      <div style="background:linear-gradient(135deg,rgba(245,158,11,0.07),rgba(236,72,153,0.07),rgba(59,130,246,0.07));border:1px solid rgba(236,72,153,0.15);border-radius:14px;padding:16px 20px;">
        <p style="margin:0;font-size:13px;line-height:1.7;color:#475569;">
          ✅ Eenmalige betaling van €14,95 &nbsp;·&nbsp; 🎵 2 versies van jouw lied &nbsp;·&nbsp; ⚡ Binnen 24 uur geleverd
        </p>
      </div>
    </div>

    <div style="text-align:center;margin-top:32px;padding:0 16px;">
      <p style="font-size:15px;color:#475569;margin:0 0 6px 0;">Warme groet,<br /><strong>Team SongFactory</strong></p>
      <p style="font-size:13px;color:#94a3b8;margin:12px 0 4px 0;">Vragen? Stuur een mail naar <a href="mailto:info@songfactory.eu" style="color:#ec4899;">info@songfactory.eu</a></p>
      <p style="font-size:12px;color:#cbd5e1;margin:0;">© SongFactory.eu</p>
    </div>

  </div>
</body>
</html>`;
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();

  const { data: carts, error } = await supabaseAdmin
    .from("abandoned_carts")
    .select("id, email, naam")
    .eq("status", "pending")
    .lt("created_at", cutoff);

  if (error) {
    console.error("❌ abandoned-cart query error:", error);
    return new Response("Database error", { status: 500 });
  }

  if (!carts || carts.length === 0) {
    console.log("📭 Geen abandoned carts om te versturen");
    return Response.json({ sent: 0, total: 0 });
  }

  let sent = 0;
  const errors: string[] = [];

  for (const cart of carts) {
    try {
      await resend.emails.send({
        from: "SongFactory <hello@songfactory.eu>",
        to: cart.email,
        subject: "Je persoonlijke lied staat nog klaar 🎵",
        html: buildEmailHtml(cart.naam || "daar"),
      });

      await supabaseAdmin
        .from("abandoned_carts")
        .update({ status: "reminded" })
        .eq("id", cart.id);

      sent++;
      console.log(`✅ Abandoned cart mail verstuurd naar ${cart.email}`);
    } catch (err) {
      const msg = `Fout bij ${cart.email}: ${err instanceof Error ? err.message : String(err)}`;
      console.error("❌", msg);
      errors.push(msg);
    }
  }

  console.log(`📬 Abandoned cart klaar: ${sent}/${carts.length} verstuurd`);
  return Response.json({ sent, total: carts.length, errors });
}
