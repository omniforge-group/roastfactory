import { supabaseAdmin } from "@/lib/supabase-admin";
import { resend } from "@/lib/resend";
import { isAdminRequest } from "@/lib/check-admin-token";

export async function POST(req: Request) {
  if (!isAdminRequest(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId } = await req.json();
  if (!orderId) return Response.json({ error: "Missing orderId" }, { status: 400 });

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error || !order) return Response.json({ error: "Order niet gevonden" }, { status: 404 });
  if (!order.customer_email) return Response.json({ error: "Geen e-mailadres" }, { status: 400 });

  const PACKAGE_LABELS: Record<string, string> = {
    quick_roast: "Quick Roast",
    savage_pack: "Savage Pack",
    nuclear_pack: "Nuclear Pack",
    battle_mode: "Battle Mode",
  };

  const packageLabel = PACKAGE_LABELS[order.package] ?? order.package;

  const lyricsBlock = order.lyrics
    ? `<div style="background:#111111;border:1px solid #2A2A2A;border-radius:14px;padding:24px;margin:24px 0;">
        <p style="margin:0 0 16px;font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#666666;">Lyrics</p>
        <pre style="margin:0;font-size:14px;line-height:1.9;color:#DDDDDD;white-space:pre-wrap;font-family:inherit;">${order.lyrics}</pre>
      </div>`
    : "";

  const audioButton = order.audio_url
    ? `<a href="${order.audio_url}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#FF2D2D,#FF6B00);color:#ffffff;font-size:16px;font-weight:800;text-decoration:none;padding:16px 36px;border-radius:12px;margin:8px 0;">
        ⬇ Download je roast MP3
      </a>
      <p style="margin:12px 0 0;font-size:13px;color:#666666;line-height:1.6;">
        Klik op de knop om je roast te downloaden.<br/>
        <strong style="color:#888888;">Op mobiel:</strong> houd de knop ingedrukt en kies <em>Opslaan</em> of <em>Downloaden</em>.
      </p>`
    : `<p style="color:#FF2D2D;font-size:14px;">De audio is nog niet beschikbaar. Neem contact op met info@roastfactory.nl</p>`;

  await resend.emails.send({
    from: "RoastFactory <roasts@songfactory.eu>",
    to: order.customer_email,
    subject: "Je roast is klaar! 🔥",
    html: `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:Arial,Helvetica,sans-serif;">

  <div style="background:linear-gradient(135deg,#FF2D2D 0%,#FF6B00 100%);padding:40px 32px;text-align:center;">
    <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.7);">ROASTFACTORY</p>
    <h1 style="margin:0;font-size:30px;font-weight:900;color:#ffffff;line-height:1.2;">Je roast is klaar! 🔥</h1>
  </div>

  <div style="max-width:600px;margin:0 auto;padding:0 16px 48px;">
    <div style="background:#1A1A1A;border-radius:20px;padding:32px;margin-top:24px;border:1px solid #2A2A2A;">

      <p style="margin:0 0 16px;font-size:16px;color:#ffffff;">Hi <strong>${order.customer_name}</strong>,</p>
      <p style="margin:0 0 8px;font-size:15px;line-height:1.75;color:#AAAAAA;">
        Je persoonlijke roast voor <strong style="color:#FF6B00;">${order.roast_target}</strong> staat klaar!
      </p>

      <div style="background:#0A0A0A;border:1px solid #FF2D2D44;border-radius:14px;padding:16px 20px;margin:20px 0;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0;border-bottom:1px solid #2A2A2A;font-size:13px;color:#666666;width:120px;">Pakket</td>
            <td style="padding:6px 0;border-bottom:1px solid #2A2A2A;font-size:14px;font-weight:700;color:#FF6B00;">${packageLabel}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-size:13px;color:#666666;">Gelegenheid</td>
            <td style="padding:6px 0;font-size:14px;color:#ffffff;">${order.occasion || "—"}</td>
          </tr>
        </table>
      </div>

      <div style="text-align:center;margin:28px 0;">
        ${audioButton}
      </div>

      ${lyricsBlock}

      <p style="margin:24px 0 0;font-size:13px;color:#555555;background:#111111;border-radius:10px;padding:12px 16px;">
        💡 <strong style="color:#777777;">Spam tip:</strong> Zit er geen mail in je inbox? Check dan ook je spamfolder.
      </p>
    </div>

    <div style="text-align:center;margin-top:28px;">
      <p style="font-size:13px;color:#444444;margin:0;">Vragen? <a href="mailto:info@roastfactory.nl" style="color:#FF6B00;">info@roastfactory.nl</a></p>
      <p style="font-size:12px;color:#333333;margin:6px 0 0;">© RoastFactory.eu</p>
    </div>
  </div>
</body>
</html>`,
  });

  await supabaseAdmin
    .from("orders")
    .update({ status: "delivered", delivered_at: new Date().toISOString() })
    .eq("id", orderId);

  // Admin bevestiging
  await resend.emails.send({
    from: "RoastFactory <roasts@songfactory.eu>",
    to: process.env.ADMIN_EMAIL!,
    subject: `✅ Roast verstuurd — ${order.roast_target}`,
    html: `<p style="font-family:sans-serif;">Roast voor <strong>${order.roast_target}</strong> (${order.customer_email}) is succesvol verstuurd.<br/>Order ID: ${order.id}</p>`,
  }).catch(() => {});

  return Response.json({ ok: true });
}
