import { supabaseAdmin } from "@/lib/supabase-admin";
import { openai } from "@/lib/openai";
import { generateAudio, downloadAudioToServer } from "@/lib/audio";

// Allow up to 5 minutes on Vercel Pro
export const maxDuration = 300;

export async function POST(req: Request) {
  const { orderId } = await req.json();

  if (!orderId) {
    return new Response("Missing orderId", { status: 400 });
  }

  const { data: order, error: fetchError } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (fetchError || !order) {
    console.error("❌ Order not found:", orderId);
    return new Response("Order not found", { status: 404 });
  }

  // =========================================
  // 🤖 LYRICS GENEREREN
  // =========================================
  console.log("🤖 Generating lyrics for order:", orderId);

  let lyrics = "";

  try {
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: order.lyrics_prompt || "Schrijf een liedje over liefde",
    });

    lyrics = response.output_text || "";

    if (!lyrics || lyrics.length < 10) {
      throw new Error("Geen geldige lyrics ontvangen");
    }

    await supabaseAdmin
      .from("orders")
      .update({
        generated_lyrics: lyrics,
        generation_status: "generating_audio",
      })
      .eq("id", order.id);

    console.log("✅ Lyrics opgeslagen");

  } catch (err) {
    console.error("❌ Lyrics generatie mislukt:", err);

    await supabaseAdmin
      .from("orders")
      .update({ generation_status: "failed" })
      .eq("id", order.id);

    return new Response("Lyrics generation failed", { status: 500 });
  }

  // =========================================
  // 🎵 AUDIO GENEREREN (2x sequentieel)
  // =========================================
  console.log("🎵 Generating audio (2 versions)...");

  const baseStyle = order.style || "pop";
  const baseMood  = order.mood  || "emotional";
  const baseTempo = order.tempo || "medium";

  const prompt1 = `${baseStyle} song, ${baseMood} mood, ${baseTempo} tempo, modern production, strong melody, clear vocals`;
  const prompt2 = `${baseStyle} song, ${baseMood} feel, ${baseTempo} tempo, cinematic arrangement, expressive vocals, rich instrumentation`;

  const audio1 = await generateAudio({ prompt: prompt1, lyrics });
  console.log("🎧 Audio 1:", audio1.success ? audio1.audioUrl : audio1.error);

  let songUrl1: string | null = null;
  if (audio1.success && audio1.audioUrl) {
    const dl1 = await downloadAudioToServer(audio1.audioUrl, order.id, 1);
    songUrl1 = dl1.success ? dl1.publicUrl! : null;
    console.log("💾 Lokaal opgeslagen versie 1:", songUrl1 ?? "mislukt");
  }

  await supabaseAdmin
    .from("orders")
    .update({
      audio_url_1: audio1.success ? audio1.audioUrl : null,
      song_url_1: songUrl1,
    })
    .eq("id", order.id);

  const audio2 = await generateAudio({ prompt: prompt2, lyrics });
  console.log("🎧 Audio 2:", audio2.success ? audio2.audioUrl : audio2.error);

  let songUrl2: string | null = null;
  if (audio2.success && audio2.audioUrl) {
    const dl2 = await downloadAudioToServer(audio2.audioUrl, order.id, 2);
    songUrl2 = dl2.success ? dl2.publicUrl! : null;
    console.log("💾 Lokaal opgeslagen versie 2:", songUrl2 ?? "mislukt");
  }

  const audioFailed = !audio1.success && !audio2.success;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14);

  await supabaseAdmin
    .from("orders")
    .update({
      audio_url_2: audio2.success ? audio2.audioUrl : null,
      song_url_2: songUrl2,
      expires_at: expiresAt.toISOString(),
      generation_status: audioFailed ? "audio_failed" : "completed",
    })
    .eq("id", order.id);

  console.log("✅ Audio URLs opgeslagen, vervalt op:", expiresAt.toISOString());

  // =========================================
  // 🚀 DELIVERY TRIGGEREN
  // =========================================
  try {
    console.log("🚀 Triggering delivery...");

    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/deliver-song`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id, audioFailed }),
    });

    console.log("✅ Delivery triggered");

  } catch (err) {
    console.error("❌ Delivery trigger error:", err);
  }

  return new Response("OK", { status: 200 });
}
