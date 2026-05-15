import { isAdminRequest } from "@/lib/check-admin-token";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  if (!isAdminRequest(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { subscription } = await req.json();
  if (!subscription?.endpoint) return Response.json({ error: "Invalid subscription" }, { status: 400 });

  const { endpoint, keys } = subscription;

  await supabaseAdmin
    .from("push_subscriptions")
    .upsert(
      { endpoint, p256dh: keys.p256dh, auth: keys.auth },
      { onConflict: "endpoint" }
    );

  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!isAdminRequest(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { endpoint } = await req.json();
  if (!endpoint) return Response.json({ error: "Missing endpoint" }, { status: 400 });

  await supabaseAdmin.from("push_subscriptions").delete().eq("endpoint", endpoint);
  return Response.json({ ok: true });
}
