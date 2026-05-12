import { verifySession } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { logActivity } from "@/lib/activity-log";

export async function GET(req: Request) {
  if (!verifySession(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(`
      id, created_at, paid_at, customer_name, customer_email, recipient_name,
      occasion, style, payment_status, generation_status,
      delivered_at, amount_total, amount_subtotal, discount_code, revision_count,
      order_status, archived_at, archive_folder, internal_notes
    `)
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function PATCH(req: Request) {
  const actor = verifySession(req);
  if (!actor) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id, order_status, archive_folder, unarchive } = await req.json();
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

  const updates: Record<string, unknown> = {};

  // Haal huidige status op voor het log
  const { data: current } = await supabaseAdmin
    .from("orders")
    .select("customer_name, order_status, archive_folder")
    .eq("id", id)
    .single();

  if (order_status !== undefined) {
    updates.order_status = order_status;
    const from = current?.order_status || "—";
    await logActivity(actor.userId, actor.name, "order_status_gewijzigd",
      `Order ${id.slice(0, 8)} (${current?.customer_name || "?"}) — ${from} → ${order_status}`);
  }

  if (unarchive) {
    updates.archived_at = null;
    updates.archive_folder = null;
    await logActivity(actor.userId, actor.name, "order_hersteld",
      `Order ${id.slice(0, 8)} (${current?.customer_name || "?"}) uit archief`);
  } else if (archive_folder !== undefined) {
    updates.archived_at = new Date().toISOString();
    updates.archive_folder = archive_folder;
    await logActivity(actor.userId, actor.name, "order_gearchiveerd",
      `Order ${id.slice(0, 8)} (${current?.customer_name || "?"}) → ${archive_folder}`);
  }

  const { error } = await supabaseAdmin.from("orders").update(updates).eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const actor = verifySession(req);
  if (!actor) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (actor.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  // Bulk delete: { ids: string[] }  /  Single: { id: string }
  const ids: string[] = body.ids ?? (body.id ? [body.id] : []);
  if (ids.length === 0) return Response.json({ error: "Missing id(s)" }, { status: 400 });

  // Haal namen op voor logging
  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select("id, customer_name")
    .in("id", ids);

  // Cascade: verwijder survey_responses eerst
  await supabaseAdmin.from("survey_responses").delete().in("order_id", ids);

  const { error } = await supabaseAdmin.from("orders").delete().in("id", ids);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  for (const order of orders ?? []) {
    await logActivity(actor.userId, actor.name, "order_verwijderd",
      `Order ${order.id.slice(0, 8)} (${order.customer_name || "?"})`);
  }
  return Response.json({ ok: true, deleted: ids.length });
}

export async function PUT(req: Request) {
  const actor = verifySession(req);
  if (!actor) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id, internal_notes } = await req.json();
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

  const { error } = await supabaseAdmin.from("orders").update({ internal_notes }).eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
