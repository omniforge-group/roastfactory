import { resend } from "@/lib/resend";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const { answers } = await req.json();

    if (!answers) {
      return new Response("Missing answers", { status: 400 });
    }

    const a = answers;

    const rows = [
      ["Taal", a.lang?.toUpperCase()],
      ["Voor wie", a.q1_voor_wie],
      ["Ontdekt via", a.q2_ontdekt],
      ["Taal liedje", a.q3_taal],
      ["Gemak bestellen", a.q4_gemak ? `${a.q4_gemak}/5 ⭐` : "—"],
      ["Snelheid levering", a.q5_snelheid],
      ["Aansluiting aanvraag", a.q6_aansluiting ? `${a.q6_aansluiting}/5 ⭐` : "—"],
      ["Kwaliteit — Stem", a.q7_stem ? `${a.q7_stem}/5` : "—"],
      ["Kwaliteit — Uitspraak", a.q7_uitspraak ? `${a.q7_uitspraak}/5` : "—"],
      ["Kwaliteit — Lyrics", a.q7_lyrics ? `${a.q7_lyrics}/5` : "—"],
      ["Kwaliteit — Muziek", a.q7_muziek ? `${a.q7_muziek}/5` : "—"],
      ["Algemeen cijfer", a.q8_cijfer !== undefined ? `${a.q8_cijfer}/10` : "—"],
      ["NPS score", a.q9_nps !== undefined ? `${a.q9_nps}/10` : "—"],
      a.q10a_best ? ["Beste aan het liedje", a.q10a_best] : null,
      a.q10b_improve ? ["Wat verbeteren", a.q10b_improve] : null,
      a.q10b_missing ? ["Wat miste er", a.q10b_missing] : null,
      a.q11_cadeau ? ["Als cadeau kopen", a.q11_cadeau] : null,
      a.q12_prijs_bereid ? ["Bereid te betalen", a.q12_prijs_bereid] : null,
      ["Gedeeld met anderen", a.q13_gedeeld || "—"],
      a.q13_who ? ["Met wie gedeeld", a.q13_who] : null,
      ["Prijs mening", a.q14_prijs_mening || "—"],
      a.q15_tips ? ["Tips / opmerkingen", a.q15_tips] : null,
      ["Contact opnemen", a.q16_contact || "—"],
      a.contact_email ? ["E-mailadres", a.contact_email] : null,
    ].filter(Boolean) as [string, string][];

    const tableRows = rows
      .map(([label, value]) => `
        <tr>
          <td style="padding:10px 14px;font-size:13px;color:#64748b;white-space:nowrap;border-bottom:1px solid #f1f5f9;width:180px;">${label}</td>
          <td style="padding:10px 14px;font-size:14px;color:#0f172a;border-bottom:1px solid #f1f5f9;white-space:pre-wrap;">${value || "—"}</td>
        </tr>`)
      .join("");

    const nps = a.q9_nps ?? 0;
    const npsColor = nps >= 9 ? "#15803d" : nps >= 7 ? "#b45309" : "#dc2626";
    const npsLabel = nps >= 9 ? "Promotor 🟢" : nps >= 7 ? "Passief 🟡" : "Criticus 🔴";

    await supabaseAdmin.from("survey_responses").insert({
      order_id:         a.order_id         || null,
      lang:             a.lang,
      q1_voor_wie:      a.q1_voor_wie      || null,
      q2_ontdekt:       a.q2_ontdekt       || null,
      q3_taal:          a.q3_taal          || null,
      q4_gemak:         a.q4_gemak         || null,
      q5_snelheid:      a.q5_snelheid      || null,
      q6_aansluiting:   a.q6_aansluiting   || null,
      q7_stem:          a.q7_stem          || null,
      q7_uitspraak:     a.q7_uitspraak     || null,
      q7_lyrics:        a.q7_lyrics        || null,
      q7_muziek:        a.q7_muziek        || null,
      q8_cijfer:        a.q8_cijfer        ?? null,
      q9_nps:           a.q9_nps           ?? null,
      q10a_best:        a.q10a_best        || null,
      q10b_improve:     a.q10b_improve     || null,
      q10b_missing:     a.q10b_missing     || null,
      q11_cadeau:       a.q11_cadeau       || null,
      q12_prijs_bereid: a.q12_prijs_bereid || null,
      q13_gedeeld:      a.q13_gedeeld      || null,
      q13_who:          a.q13_who          || null,
      q14_prijs_mening: a.q14_prijs_mening || null,
      q15_tips:         a.q15_tips         || null,
      q16_contact:      a.q16_contact      || null,
      contact_email:    a.contact_email    || null,
    });

    await resend.emails.send({
      from: "SongFactory <hello@songfactory.eu>",
      to: "info@songfactory.eu",
      subject: `Nieuwe survey inzending — NPS ${nps}/10 (${npsLabel})`,
      html: `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">

  <div style="background:linear-gradient(135deg,#f59e0b 0%,#ec4899 50%,#3b82f6 100%);padding:28px 32px;text-align:center;">
    <p style="margin:0 0 4px 0;font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.75);">SongFactory</p>
    <h1 style="margin:0;font-size:22px;font-weight:900;color:#ffffff;">Nieuwe survey inzending 📋</h1>
  </div>

  <div style="max-width:600px;margin:0 auto;padding:24px 16px 48px;">

    <div style="background:#ffffff;border-radius:12px;padding:16px 20px;margin-bottom:20px;border:1px solid #e2e8f0;text-align:center;">
      <p style="margin:0 0 4px 0;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;">NPS Score</p>
      <p style="margin:0;font-size:36px;font-weight:900;color:${npsColor};">${nps}/10</p>
      <p style="margin:4px 0 0 0;font-size:13px;font-weight:600;color:${npsColor};">${npsLabel}</p>
    </div>

    <div style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(15,23,42,0.06);">
      <table style="width:100%;border-collapse:collapse;">
        ${tableRows}
      </table>
    </div>

    <div style="text-align:center;margin-top:24px;">
      <p style="font-size:12px;color:#cbd5e1;margin:0;">© SongFactory.eu</p>
    </div>

  </div>
</body>
</html>`,
    });

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("❌ Survey email error:", err);
    return new Response("Failed", { status: 500 });
  }
}
