import { verifySession } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { resend } from "@/lib/resend";
import { put } from "@vercel/blob";
import NodeID3 from "node-id3";
import { logActivity } from "@/lib/activity-log";

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

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const actor = verifySession(req);
  if (!actor) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data: order, error: fetchError } = await supabaseAdmin
    .from("orders")
    .select("customer_name, customer_email, revision_count, generated_lyrics, song_url_1, song_url_2")
    .eq("id", params.id)
    .single();

  if (fetchError || !order) return Response.json({ error: "Order not found" }, { status: 404 });

  const formData = await req.formData();
  const file1 = formData.get("audio_1") as File | null;
  const file2 = formData.get("audio_2") as File | null;
  const name1 = (formData.get("filename_1") as string | null)?.trim() || null;
  const name2 = (formData.get("filename_2") as string | null)?.trim() || null;

  if (!file1 && !file2) {
    return Response.json({ error: "Geen audiobestand meegegeven" }, { status: 400 });
  }

  const revisionNum = (order.revision_count ?? 0) + 1;
  const existingUrl1 = order.song_url_1 as string | null;
  const existingUrl2 = order.song_url_2 as string | null;

  async function tagAndUpload(file: File, filename: string | null, slot: number): Promise<string> {
    // Buffer read + tag write happen before the async upload, fully in parallel with the other slot
    const raw = Buffer.from(await file.arrayBuffer());
    const tags: NodeID3.Tags = {
      title: filename || `SongFactory - Revisie ${revisionNum} (versie ${slot})`,
      artist: "SongFactory",
      album: order!.customer_name || "SongFactory",
      comment: { language: "nld", text: params.id },
    };
    const tagged = NodeID3.write(tags, raw);
    const blobName = filename
      ? `songs/${filename.replace(/[^a-zA-Z0-9-_]/g, "_")}-${Date.now()}.mp3`
      : `songs/revision-${params.id}-${revisionNum}-${slot}-${Date.now()}.mp3`;
    const { url } = await put(blobName, tagged, { access: "public", contentType: "audio/mpeg" });
    return url;
  }

  const [newUrl1, newUrl2] = await Promise.all([
    file1 && file1.size > 0 ? tagAndUpload(file1, name1, 1) : Promise.resolve(existingUrl1),
    file2 && file2.size > 0 ? tagAndUpload(file2, name2, 2) : Promise.resolve(existingUrl2),
  ]);

  await supabaseAdmin
    .from("orders")
    .update({
      song_url_1: newUrl1,
      song_url_2: newUrl2,
      revision_count: revisionNum,
    })
    .eq("id", params.id);

  // Stuur revisie-mail naar klant
  await resend.emails.send({
    from: "SongFactory <hello@songfactory.eu>",
    to: order.customer_email,
    subject: `🎵 Jouw herziene song is klaar! (revisie ${revisionNum})`,
    html: `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
  <div style="background:linear-gradient(135deg,#f59e0b 0%,#ec4899 50%,#3b82f6 100%);padding:40px 32px;text-align:center;">
    <p style="margin:0 0 8px 0;font-size:13px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.75);">SongFactory</p>
    <h1 style="margin:0;font-size:26px;font-weight:900;color:#fff;">Jouw herziene song is klaar! 🎉</h1>
  </div>
  <div style="max-width:600px;margin:0 auto;padding:0 16px 48px;">
    <div style="background:#fff;border-radius:20px;padding:32px;margin-top:24px;box-shadow:0 2px 12px rgba(15,23,42,0.06);">
      <p style="margin:0 0 16px 0;font-size:16px;color:#0f172a;">Hi <strong>${order.customer_name || "daar"}</strong>,</p>
      <p style="margin:0 0 24px 0;font-size:15px;line-height:1.7;color:#475569;">
        We hebben jouw song herzien en er staan twee nieuwe versies voor je klaar.
        Klik hieronder om ze te downloaden.
      </p>
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${newUrl1 ? `<a href="${newUrl1}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#ec4899,#3b82f6);color:#fff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:100px;">⬇ Versie 1 downloaden</a>` : ""}
        ${newUrl2 ? `<a href="${newUrl2}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#ec4899,#3b82f6);color:#fff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:100px;">⬇ Versie 2 downloaden</a>` : ""}
      </div>
    </div>
    <div style="text-align:center;margin-top:32px;">
      <p style="font-size:13px;color:#94a3b8;margin:0;">Vragen? <a href="mailto:info@songfactory.eu" style="color:#ec4899;">info@songfactory.eu</a></p>
      <p style="font-size:12px;color:#cbd5e1;margin:4px 0 0 0;">© SongFactory.eu</p>
    </div>
  </div>
</body>
</html>`,
  });

  await logActivity(actor.userId, actor.name, "revisie_verstuurd",
    `Order ${params.id.slice(0, 8)} (${order!.customer_name || "?"}) — revisie ${revisionNum}`);

  return Response.json({ ok: true, revisionNum, song_url_1: newUrl1, song_url_2: newUrl2 });
}
