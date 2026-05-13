import { verifySession } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: Request) {
  if (!verifySession(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [ordersRes, monthRes, surveyRes, paidRes, revisionsRes] = await Promise.all([
    // Open = betaald, nog niet afgerond of verstuurd
    supabaseAdmin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("payment_status", "paid")
      .is("archived_at", null)
      .not("order_status", "in", '("Afgerond","Verstuurd","Betaling niet afgerond")'),

    supabaseAdmin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("payment_status", "paid")
      .gte("created_at", startOfMonth),

    supabaseAdmin
      .from("survey_responses")
      .select("q8_cijfer"),

    supabaseAdmin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("payment_status", "paid"),

    supabaseAdmin
      .from("orders")
      .select("revision_count")
      .eq("payment_status", "paid"),
  ]);

  const openOrders = ordersRes.count ?? 0;
  const ordersThisMonth = monthRes.count ?? 0;
  const totalPaid = paidRes.count ?? 0;
  const surveys = surveyRes.data ?? [];
  const surveyCount = surveys.length;
  const avgScore =
    surveyCount > 0
      ? (surveys.reduce((s, r) => s + (r.q8_cijfer ?? 0), 0) / surveyCount).toFixed(1)
      : null;
  const surveyRate =
    totalPaid > 0 ? Math.round((surveyCount / totalPaid) * 100) : 0;
  const totalRevisions = (revisionsRes.data ?? []).reduce((sum, o) => sum + (o.revision_count ?? 0), 0);

  return Response.json({ openOrders, ordersThisMonth, totalPaid, avgScore, surveyRate, surveyCount, totalRevisions });
}
