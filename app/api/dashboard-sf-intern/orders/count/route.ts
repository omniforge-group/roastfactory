import { isAdminRequest } from "@/lib/check-admin-token";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: Request) {
  if (!isAdminRequest(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { count, error } = await supabaseAdmin
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "paid");

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ count: count ?? 0 });
}
