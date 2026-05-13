import { verifySession } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  if (!verifySession(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !data) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(data);
}

// Upload audio naar Supabase Storage bucket 'roast-audio'
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const actor = verifySession(req);
  if (!actor) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("audio") as File | null;
  if (!file || file.size === 0) return Response.json({ error: "Geen audiobestand" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${params.id}/${Date.now()}.mp3`;

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
