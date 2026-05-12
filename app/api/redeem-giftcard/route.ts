import { supabaseAdmin } from "@/lib/supabase-admin";
import { resend } from "@/lib/resend";
import { normalizeCode } from "@/lib/giftcard-utils";

export async function POST(req: Request) {
  try {
    const {
      code,
      customerName, email, recipientName,
      occasion, story, style, language,
      voicePreference, mood, tempo, extraNotes = "",
    } = await req.json();

    if (!code || !customerName || !email || !recipientName || !occasion || !story || !style || !language || !voicePreference || !mood || !tempo) {
      return Response.json({ error: "Ontbrekende velden" }, { status: 400 });
    }

    const normalizedCode = normalizeCode(code);

    // ── Atomisch inwisselen: alleen als status 'active' ────────────────
    const { data: card, error: cardError } = await supabaseAdmin
      .from("gift_cards")
      .update({ status: "used", used_at: new Date().toISOString() })
      .eq("code", normalizedCode)
      .eq("status", "active")
      .select()
      .single();

    if (cardError || !card) {
      return Response.json({ error: "Ongeldige of al gebruikte cadeaubon." }, { status: 400 });
    }

    // ── Prompts bouwen (zelfde logica als create-checkout-session) ─────
    const languageNames: Record<string, string> = {
      NL: "Dutch (Nederlands)", FR: "French (Français)",
      EN: "English", DE: "German (Deutsch)",
    };
    const languageLabel = languageNames[language] ?? language;
    const cleanNotes = typeof extraNotes === "string" ? extraNotes.trim() : "";

    const songRequest = `Create a personalised song for ${recipientName}.
Occasion: ${occasion}. Language: ${language}. Music style: ${style}.
Voice preference: ${voicePreference}. Mood: ${mood}. Tempo: ${tempo}.
Customer name: ${customerName}. Recipient name: ${recipientName}.
Story/input: ${story}. Extra notes: ${cleanNotes || "None"}.`;

    const lyricsPrompt = `You are a professional songwriter. Write catchy, emotionally powerful song lyrics as a personalised gift.

CRITICAL LANGUAGE RULE: The ENTIRE song must be written in ${languageLabel} — every single word.
If Dutch: natural native Dutch, no English words. Do NOT mix languages.

SONG STRUCTURE:
[Intro]
[Verse 1]
[Chorus]
[Verse 2]
[Chorus]
[Bridge]
[Chorus]

VOICE: ${voicePreference}
Recipient: ${recipientName}
Occasion: ${occasion}
Style: ${style}
Mood: ${mood}
Tempo: ${tempo}

Core story: ${story}
Extra notes: ${cleanNotes || "None"}

REQUIREMENTS: Each section 2-4 lines. Catchy chorus. Personal details from story. No clichés. No markdown.`;

    const stylePrompt = `Genre: ${style}. Mood: ${mood}. Tempo: ${tempo}. Language: ${languageLabel}. Voice: ${voicePreference}. Polished, memorable, gift-worthy.`;

    // ── Order aanmaken als direct betaald ─────────────────────────────
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        name: customerName,
        email,
        story,
        style,
        occasion,
        customer_name: customerName,
        customer_email: email,
        recipient_name: recipientName,
        language,
        mood,
        voice_preference: voicePreference,
        tempo,
        extra_notes: cleanNotes || null,
        song_request: songRequest,
        lyrics_prompt: lyricsPrompt,
        style_prompt: stylePrompt,
        generated_prompt: songRequest,
        package_name: "Cadeaubon",
        amount_total: 1495,
        amount_subtotal: 1495,
        currency: "eur",
        payment_status: "paid",
        generation_status: "ready",
        discount_code: normalizedCode,
        paid_at: new Date().toISOString(),
        provider: null,
      })
      .select()
      .single();

    if (orderError || !order) {
      // Rollback: set card back to active
      await supabaseAdmin.from("gift_cards").update({ status: "active", used_at: null }).eq("code", normalizedCode);
      console.error("❌ Order create failed:", orderError);
      return Response.json({ error: "Order aanmaken mislukt" }, { status: 500 });
    }

    // ── Generatie asynchroon triggeren ────────────────────────────────
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/generate-song`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id }),
    }).catch((err) => console.error("❌ Generate-song trigger:", err));

    // ── Bevestigingsmail ──────────────────────────────────────────────
    resend.emails.send({
      from: "SongFactory <hello@songfactory.eu>",
      to: email,
      subject: "Je song wordt gemaakt 🎵",
      html: `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
  <div style="background:linear-gradient(135deg,#f59e0b 0%,#ec4899 50%,#3b82f6 100%);padding:40px 32px 36px;text-align:center;">
    <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.75);">SongFactory</p>
    <h1 style="margin:0;font-size:28px;font-weight:900;color:#fff;">Je cadeaubon is ingewisseld! 🎁</h1>
  </div>
  <div style="max-width:600px;margin:0 auto;padding:0 16px 48px;">
    <div style="background:#fff;border-radius:20px;padding:32px;margin-top:24px;box-shadow:0 2px 12px rgba(15,23,42,.06);">
      <p style="margin:0 0 16px;font-size:16px;color:#0f172a;">Hi <strong>${order.customer_name || "daar"}</strong>,</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#475569;">
        Je cadeaubon is succesvol ingewisseld. We zijn gestart met het maken van jouw persoonlijke song voor <strong>${recipientName}</strong>.
        <strong>Je ontvangt hem Binnen 24 uur in je mailbox.</strong>
      </p>
      <div style="background:linear-gradient(135deg,rgba(245,158,11,.08),rgba(236,72,153,.08),rgba(59,130,246,.08));border:1px solid rgba(236,72,153,.2);border-radius:14px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0;font-size:14px;line-height:1.7;color:#0f172a;">
          🎵 <strong>Gelegenheid:</strong> ${occasion} &nbsp;·&nbsp; <strong>Stijl:</strong> ${style} &nbsp;·&nbsp; <strong>Taal:</strong> ${languageLabel}
        </p>
      </div>
      <p style="margin:0;font-size:13px;color:#94a3b8;">Vragen? Mail naar <a href="mailto:info@songfactory.eu" style="color:#ec4899;">info@songfactory.eu</a></p>
    </div>
    <div style="text-align:center;margin-top:20px;">
      <p style="font-size:12px;color:#cbd5e1;">© SongFactory.eu</p>
    </div>
  </div>
</body>
</html>`,
    }).catch((err) => console.error("❌ Confirmation email error:", err));

    return Response.json({ success: true, orderId: order.id });
  } catch (err) {
    console.error("❌ redeem-giftcard error:", err);
    return Response.json({ error: "Er is een fout opgetreden" }, { status: 500 });
  }
}
