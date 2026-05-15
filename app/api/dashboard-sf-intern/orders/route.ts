import { isAdminRequest } from "@/lib/check-admin-token";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { logActivity } from "@/lib/activity-log";

export async function DELETE(req: Request) {
  const actor = isAdminRequest(req);
  if (!actor) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { ids } = await req.json().catch(() => ({ ids: [] }));
  if (!Array.isArray(ids) || ids.length === 0) {
    return Response.json({ error: "Missing ids array" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("orders").delete().in("id", ids);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  await logActivity(actor.userId, actor.name, "bestellingen_verwijderd", `${ids.length} bestelling(en) verwijderd`);
  return Response.json({ ok: true });
}

export async function GET(req: Request) {
  if (!isAdminRequest(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("id, created_at, status, package, price, customer_name, customer_email, roast_target, occasion, roast_level, delivered_at, audio_url")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function PATCH(req: Request) {
  const actor = isAdminRequest(req);
  if (!actor) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status, lyrics, audio_url, internal_notes } = await req.json();
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (status !== undefined) updates.status = status;
  if (lyrics !== undefined) updates.lyrics = lyrics;
  if (audio_url !== undefined) updates.audio_url = audio_url;
  if (internal_notes !== undefined) updates.internal_notes = internal_notes;

  const { error } = await supabaseAdmin.from("orders").update(updates).eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  if (status !== undefined) {
    await logActivity(actor.userId, actor.name, "status_gewijzigd", `Order ${id} → ${status}`);
  }

  return Response.json({ ok: true });
}
