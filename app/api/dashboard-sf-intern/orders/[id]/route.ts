import { isAdminRequest } from "@/lib/check-admin-token";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { logActivity } from "@/lib/activity-log";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  if (!isAdminRequest(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !data) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(data);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const actor = isAdminRequest(req);
  if (!actor) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const updates: Record<string, unknown> = {};
  if (body.status !== undefined) updates.status = body.status;
  if (body.lyrics !== undefined) updates.lyrics = body.lyrics;

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: "No updates" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("orders").update(updates).eq("id", params.id);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  if (body.status !== undefined) {
    await logActivity(actor.userId, actor.name, "status_gewijzigd", `Order ${params.id} → ${body.status}`);
  }

  return Response.json({ ok: true });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!isAdminRequest(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("audio") as File | null;
  if (!file || file.size === 0) return Response.json({ error: "Geen audiobestand" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${params.id}-roast.mp3`;

  const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
    .from("roast-audio")
    .upload(filename, buffer, { contentType: "audio/mpeg", upsert: true });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    return Response.json({ error: "Upload mislukt: " + uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from("roast-audio")
    .getPublicUrl(uploadData.path);

  await supabaseAdmin.from("orders").update({ audio_url: publicUrl }).eq("id", params.id);

  return Response.json({ ok: true, audio_url: publicUrl });
}
