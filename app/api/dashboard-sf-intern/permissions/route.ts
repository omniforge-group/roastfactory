import { isAdminRequest } from "@/lib/check-admin-token";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { logActivity } from "@/lib/activity-log";

export async function GET(req: Request) {
  if (!isAdminRequest(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("page_permissions")
    .select("page_key, medewerker, tier2")
    .order("page_key");

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function PUT(req: Request) {
  const actor = isAdminRequest(req);
  if (!actor) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (actor.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

  const { page_key, medewerker, tier2 } = await req.json();
  if (!page_key) return Response.json({ error: "Missing page_key" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("page_permissions")
    .upsert({ page_key, medewerker, tier2 }, { onConflict: "page_key" });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  await logActivity(
    actor.userId, actor.name, "toegang_gewijzigd",
    `Pagina "${page_key}" — medewerker: ${medewerker}, tier2: ${tier2}`
  );

  return Response.json({ ok: true });
}
