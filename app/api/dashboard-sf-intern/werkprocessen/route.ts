import { verifySession } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: Request) {
  const user = verifySession(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "tier2"].includes(user.role)) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await supabaseAdmin
    .from("werkprocessen")
    .select("id, title, description, url, category_id, created_at, werkprocessen_categories(id, name, sort_order)")
    .order("created_at", { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(req: Request) {
  const user = verifySession(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

  const { title, description, url, category_id } = await req.json();
  if (!title || !url) return Response.json({ error: "Titel en URL zijn verplicht." }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("werkprocessen")
    .insert({ title, description: description ?? null, url, category_id: category_id ?? null })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
