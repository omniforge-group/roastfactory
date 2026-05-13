import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

  const { data: expiredOrders, error } = await supabaseAdmin
    .from("orders")
    .select("id, audio_url")
    .lt("delivered_at", cutoff)
    .not("audio_url", "is", null);

  if (error) {
    console.error("Cleanup query error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  const rows = expiredOrders ?? [];
  let deleted = 0;
  const errors: string[] = [];

  for (const order of rows) {
    if (!order.audio_url) continue;

    // Extract storage path from public URL
    // Format: https://{project}.supabase.co/storage/v1/object/public/roast-audio/{path}
    const match = (order.audio_url as string).match(/\/roast-audio\/(.+)$/);
    if (!match) {
      errors.push(`${order.id}: kon pad niet extraheren uit URL`);
      continue;
    }

    const { error: deleteError } = await supabaseAdmin.storage
      .from("roast-audio")
      .remove([match[1]]);

    if (deleteError) {
      errors.push(`${order.id}: ${deleteError.message}`);
      continue;
    }

    await supabaseAdmin
      .from("orders")
      .update({ audio_url: null, audio_expires_at: null })
      .eq("id", order.id);

    deleted++;
  }

  console.log(`Audio cleanup: ${deleted} verwijderd, ${errors.length} fouten`);

  return Response.json({
    ok: true,
    checked: rows.length,
    deleted,
    ...(errors.length > 0 && { errors }),
  });
}
