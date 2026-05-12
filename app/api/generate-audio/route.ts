import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { generateAudio } from "@/lib/audio";
import { generateLyrics } from "@/lib/lyrics";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderId = body.orderId as string;

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing orderId" },
        { status: 400 }
      );
    }

    // 🔍 Order ophalen
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // 🟡 STATUS → lyrics genereren
    await supabaseAdmin
      .from("orders")
      .update({ generation_status: "generating_lyrics" })
      .eq("id", orderId);

    // 🎤 Lyrics genereren
    const lyrics = await generateLyrics({
      name: order.recipient_name,
      story: order.story,
      occasion: order.occasion,
      style: order.style,
      language: order.language,
      mood: order.mood,
      tempo: order.tempo,
    });

    // 💾 Lyrics opslaan
    await supabaseAdmin
      .from("orders")
      .update({
        generated_lyrics: lyrics,
        generation_status: "generating_audio",
      })
      .eq("id", orderId);

    // 🎧 Audio genereren MET lyrics
    const result = await generateAudio({
      prompt: `${order.style || "pop"} song, ${order.mood || "emotional"} mood`,
      lyrics: lyrics,
    });

    if (!result.success || !result.audioUrl) {
      await supabaseAdmin
        .from("orders")
        .update({ generation_status: "failed" })
        .eq("id", orderId);

      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    // 💾 Audio opslaan
    await supabaseAdmin
      .from("orders")
      .update({
        generated_audio_url: result.audioUrl,
        provider: "minimax",
        generation_status: "completed",
      })
      .eq("id", orderId);

    return NextResponse.json({
      success: true,
      audioUrl: result.audioUrl,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
