import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: Request) {
  const secret = req.headers.get("x-cron-secret") ?? new URL(req.url).searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabaseAdmin
    .from("orders")
    .delete()
    .not("deleted_at", "is", null)
    .lt("deleted_at", cutoff)
    .select("id");

  if (error) {
    console.error("empty-trash cron error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }

  const removed = data?.length ?? 0;
  console.log(`[empty-trash] ${removed} order(s) definitief verwijderd`);
  return Response.json({ ok: true, removed });
}
