import { verifySession } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { logActivity } from "@/lib/activity-log";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  const user = verifySession(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await supabaseAdmin
    .from("admin_users")
    .select("id, name, email, role, created_at, last_login, is_active")
    .order("created_at", { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(req: Request) {
  const actor = verifySession(req);
  if (!actor) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (actor.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

  const { name, email, password, role } = await req.json();

  if (!name || !email || !password || !role) {
    return Response.json({ error: "Alle velden zijn verplicht." }, { status: 400 });
  }
  if (!["admin", "medewerker", "tier2"].includes(role)) {
    return Response.json({ error: "Ongeldige rol." }, { status: 400 });
  }

  const password_hash = await bcrypt.hash(password, 12);

  const { data, error } = await supabaseAdmin
    .from("admin_users")
    .insert({ name, email: email.toLowerCase().trim(), password_hash, role })
    .select("id, name, email, role, created_at, is_active")
    .single();

  if (error) {
    if (error.code === "23505") return Response.json({ error: "E-mailadres al in gebruik." }, { status: 409 });
    return Response.json({ error: error.message }, { status: 500 });
  }

  await logActivity(actor.userId, actor.name, "gebruiker_aangemaakt", `${name} (${email}) — rol: ${role}`);
  return Response.json(data, { status: 201 });
}
