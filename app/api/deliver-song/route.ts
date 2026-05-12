import { supabaseAdmin } from "@/lib/supabase-admin";
import { resend } from "@/lib/resend";

function formatLyrics(raw: string): string {
  const lines = raw.split("\n");
  let html = "";

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      html += '<div style="height:12px"></div>';
      continue;
    }

    // Sectiekoppen zoals [Verse 1], [Chorus], [Bridge]
    if (/^\[.+\]$/.test(trimmed)) {
      html += `<p style="margin:0 0 6px 0; font-size:11px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#9ca3af;">${trimmed.replace(/[\[\]]/g, "")}</p>`;
      continue;
    }

    html += `<p style="margin:0 0 4px 0; font-size:15px; line-height:1.7; color:#1e293b;">${trimmed}</p>`;
  }

  return html;
}

function audioButton(label: string, url: string): string {
  return `
    <a href="${url}" download target="_blank" style="
      display:inline-block;
      background:linear-gradient(135deg,#f59e0b 0%,#ec4899 50%,#3b82f6 100%);
      color:#ffffff;
      font-family:Arial,sans-serif;
      font-size:15px;
      font-weight:700;
      text-decoration:none;
      padding:14px 28px;
      border-radius:100px;
      margin:8px 8px 8px 0;
    ">${label}</a>
  `;
}

export async function POST(req: Request) {
  try {
    console.log("🚀 DELIVERY ROUTE HIT");

    const { orderId, audioFailed = false, toEmail } = await req.json();

    if (!orderId) {
      return new Response("Missing orderId", { status: 400 });
    }

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      console.error("❌ Order not found");
      return new Response("Order not found", { status: 404 });
    }

    if (!order.generated_lyrics) {
      console.error("❌ No lyrics");
      return new Response("No lyrics", { status: 400 });
    }

    const lyricsHtml = formatLyrics(order.generated_lyrics);

    const downloadUrl1 = order.song_url_1 || order.audio_url_1;
    const downloadUrl2 = order.song_url_2 || order.audio_url_2;

    const hasAudio = downloadUrl1 || downloadUrl2;

    let expiryNotice = "";
    if (order.expires_at) {
      const expiresDate = new Date(order.expires_at);
      const formatted = expiresDate.toLocaleDateString("nl-NL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      expiryNotice = `
        <p style="margin:16px 0 0 0; font-size:13px; color:#92400e; background:#fef3c7; border:1px solid #fde68a; border-radius:10px; padding:10px 14px; line-height:1.6;">
          ⏳ <strong>Let op:</strong> je liedjes zijn beschikbaar tot <strong>${formatted}</strong>. Download ze op tijd!
        </p>
      `;
    }

    const audioSection = hasAudio
      ? `
        <div>
          <p style="margin:0 0 16px 0; font-size:16px; font-weight:700; color:#0f172a;">🎧 Download jouw songs</p>
          <div>
            ${downloadUrl1 ? audioButton("⬇ Versie 1 downloaden", downloadUrl1) : ""}
            ${downloadUrl2 ? audioButton("⬇ Versie 2 downloaden", downloadUrl2) : ""}
          </div>
          <p style="margin:16px 0 0 0; font-size:13px; color:#64748b; line-height:1.6;">
            Klik op de knop om je liedje te downloaden.<br />
            <strong>Op mobiel:</strong> houd de knop ingedrukt en kies 'Opslaan' of 'Downloaden'.
          </p>
          ${expiryNotice}
        </div>
      `
      : audioFailed
      ? `
        <div style="padding:20px 24px; background:#fef2f2; border-radius:12px; border:1px solid #fecaca;">
          <p style="margin:0 0 8px 0; font-size:14px; font-weight:700; color:#991b1b;">Audio kon niet worden aangemaakt</p>
          <p style="margin:0; font-size:14px; color:#7f1d1d; line-height:1.6;">
            Er is iets misgegaan bij het genereren van het audiobestand. We lossen dit zo snel mogelijk handmatig op en sturen je de audio apart toe via <a href="mailto:info@songfactory.eu" style="color:#ec4899;">info@songfactory.eu</a>.
          </p>
        </div>
      `
      : `
        <div style="padding:16px 20px; background:#fef9c3; border-radius:12px;">
          <p style="margin:0; font-size:14px; color:#854d0e;">De audio wordt nog verwerkt. Je ontvangt een tweede mail zodra je MP3 klaar is.</p>
        </div>
      `;

    console.log("📩 Sending DELIVERY email...");

    await resend.emails.send({
      from: "SongFactory <hello@songfactory.eu>",
      to: toEmail || order.customer_email,
      subject: "🎶 Jouw persoonlijke song is klaar!",
      html: `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0; padding:0; background:#f8fafc; font-family:Arial,Helvetica,sans-serif;">

  <!-- Gradient header -->
  <div style="background:linear-gradient(135deg,#f59e0b 0%,#ec4899 50%,#3b82f6 100%); padding:40px 32px 36px; text-align:center;">
    <p style="margin:0 0 8px 0; font-size:13px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:rgba(255,255,255,0.75);">SongFactory</p>
    <h1 style="margin:0; font-size:28px; font-weight:900; color:#ffffff; line-height:1.2;">Jouw persoonlijke song<br />is klaar! 🎉</h1>
  </div>

  <!-- Body -->
  <div style="max-width:600px; margin:0 auto; padding:0 16px 48px;">

    <!-- Intro card -->
    <div style="background:#ffffff; border-radius:20px; padding:32px; margin-top:24px; box-shadow:0 2px 12px rgba(15,23,42,0.06);">
      <p style="margin:0 0 16px 0; font-size:16px; color:#0f172a;">Hi <strong>${order.customer_name || "daar"}</strong>,</p>
      <p style="margin:0; font-size:15px; line-height:1.7; color:#475569;">
        Jouw persoonlijke song voor <strong>${order.recipient_name}</strong> is klaar.
        Hieronder vind je de liedtekst en twee versies om te beluisteren.
      </p>

      <!-- Order details -->
      <div style="margin:24px 0 0 0; border-top:1px solid #f1f5f9; padding-top:20px; display:flex; flex-wrap:wrap; gap:0;">
        <div style="min-width:120px; margin:0 24px 12px 0;">
          <p style="margin:0 0 2px 0; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:#94a3b8;">Voor</p>
          <p style="margin:0; font-size:14px; font-weight:600; color:#0f172a;">${order.recipient_name}</p>
        </div>
        <div style="min-width:120px; margin:0 24px 12px 0;">
          <p style="margin:0 0 2px 0; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:#94a3b8;">Gelegenheid</p>
          <p style="margin:0; font-size:14px; font-weight:600; color:#0f172a;">${order.occasion}</p>
        </div>
        <div style="min-width:120px; margin:0 24px 12px 0;">
          <p style="margin:0 0 2px 0; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:#94a3b8;">Stijl</p>
          <p style="margin:0; font-size:14px; font-weight:600; color:#0f172a;">${order.style}</p>
        </div>
      </div>
    </div>

    <!-- Audio section -->
    <div style="background:#ffffff; border-radius:20px; padding:32px; margin-top:16px; box-shadow:0 2px 12px rgba(15,23,42,0.06);">
      ${audioSection}
    </div>

    <!-- Lyrics card -->
    <div style="background:#ffffff; border-radius:20px; padding:32px; margin-top:16px; box-shadow:0 2px 12px rgba(15,23,42,0.06);">
      <p style="margin:0 0 20px 0; font-size:16px; font-weight:700; color:#0f172a;">📝 Liedtekst</p>
      <div style="background:#f8fafc; border-radius:14px; padding:24px; border:1px solid #f1f5f9;">
        ${lyricsHtml}
      </div>
    </div>

    <!-- Kwaliteitscontrole blok -->
    <div style="background:linear-gradient(135deg,rgba(245,158,11,0.08),rgba(236,72,153,0.08),rgba(59,130,246,0.08)); border:1px solid rgba(236,72,153,0.2); border-radius:20px; padding:24px 32px; margin-top:16px;">
      <p style="margin:0 0 10px 0; font-size:15px; font-weight:700; color:#0f172a;">🎧 Kwaliteitscontrole</p>
      <p style="margin:0; font-size:14px; line-height:1.75; color:#475569;">
        Binnen 48 uur luisteren wij persoonlijk jouw liedje na.
        Voldoet het niet aan onze kwaliteitseisen? Dan ontvang je automatisch
        twee handgemaakte liedjes inclusief lyrics — gratis, zonder dat je
        daar iets voor hoeft te doen.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align:center; margin-top:32px; padding:0 16px;">
      <p style="font-size:13px; color:#94a3b8; margin:0 0 6px 0;">Vragen? Stuur een mail naar <a href="mailto:info@songfactory.eu" style="color:#ec4899;">info@songfactory.eu</a></p>
      <p style="font-size:12px; color:#cbd5e1; margin:0;">© SongFactory.eu</p>
    </div>

  </div>
</body>
</html>
      `,
    });

    console.log("✅ DELIVERY EMAIL SENT");

    if (!toEmail) {
      await supabaseAdmin
        .from("orders")
        .update({ delivered_at: new Date().toISOString() })
        .eq("id", order.id);
    }

    return new Response("OK", { status: 200 });

  } catch (err) {
    console.error("❌ DELIVERY ERROR:", err);
    return new Response("Failed", { status: 500 });
  }
}
