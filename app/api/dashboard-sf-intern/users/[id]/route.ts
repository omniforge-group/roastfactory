import { isAdminRequest } from "@/lib/check-admin-token";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { logActivity } from "@/lib/activity-log";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const actor = isAdminRequest(req);
  if (!actor) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (actor.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

  const { id } = params;
  const body = await req.json();
  const updates: Record<string, unknown> = {};
  const logParts: string[] = [];

  if (body.role !== undefined) {
    if (!["admin", "medewerker", "tier2"].includes(body.role)) {
      return Response.json({ error: "Ongeldige rol." }, { status: 400 });
    }
    updates.role = body.role;
    logParts.push(`rol → ${body.role}`);
  }

  if (body.is_active !== undefined) {
    updates.is_active = body.is_active;
    logParts.push(body.is_active ? "geactiveerd" : "gedeactiveerd");
  }

  if (body.password !== undefined) {
    updates.password_hash = await bcrypt.hash(body.password, 12);
    logParts.push("wachtwoord gereset");
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: "Geen wijzigingen." }, { status: 400 });
  }

  const { data: target } = await supabaseAdmin
    .from("admin_users")
    .select("name, email")
    .eq("id", id)
    .single();

  const { error } = await supabaseAdmin.from("admin_users").update(updates).eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  if (target) {
    const action = body.is_active === false ? "gebruiker_gedeactiveerd" : "gebruiker_gewijzigd";
    await logActivity(actor.userId, actor.name, action, `${target.name} — ${logParts.join(", ")}`);
  }

  return Response.json({ ok: true });
}
