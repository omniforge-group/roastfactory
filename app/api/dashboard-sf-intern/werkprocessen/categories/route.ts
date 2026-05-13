import { verifySession } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: Request) {
  const user = verifySession(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "tier2"].includes(user.role)) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await supabaseAdmin
    .from("werkprocessen_categories")
    .select("id, name, sort_order")
    .order("sort_order", { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(req: Request) {
  const user = verifySession(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

  const { name, sort_order } = await req.json();
  if (!name) return Response.json({ error: "Naam is verplicht." }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("werkprocessen_categories")
    .insert({ name, sort_order: sort_order ?? 0 })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}

export async function DELETE(req: Request) {
  const user = verifySession(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await req.json();
  if (!id) return Response.json({ error: "Missing id." }, { status: 400 });

  const { error } = await supabaseAdmin.from("werkprocessen_categories").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
