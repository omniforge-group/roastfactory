import { verifySession } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: Request) {
  if (!verifySession(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { count, error } = await supabaseAdmin
    .from("pageviews")
    .select("id", { count: "exact", head: true });

  if (error) {
    return Response.json({ ok: false, error: error.message, hint: "Tabel 'pageviews' bestaat mogelijk nog niet — voer de migratie uit." }, { status: 500 });
  }

  return Response.json({ ok: true, total_pageviews: count ?? 0, message: "Verbinding met pageviews tabel werkt." });
}
