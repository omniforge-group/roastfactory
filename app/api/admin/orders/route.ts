import { verifySession } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: Request) {
  if (!verifySession(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("id, created_at, status, package, price, customer_name, customer_email, roast_target, occasion, roast_level, delivered_at, audio_url")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function PATCH(req: Request) {
  if (!verifySession(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status, lyrics, audio_url } = await req.json();
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (status !== undefined) updates.status = status;
  if (lyrics !== undefined) updates.lyrics = lyrics;
  if (audio_url !== undefined) updates.audio_url = audio_url;

  const { error } = await supabaseAdmin.from("orders").update(updates).eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
