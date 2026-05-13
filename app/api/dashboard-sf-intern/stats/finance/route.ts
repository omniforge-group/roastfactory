import { isAdminRequest } from "@/lib/check-admin-token";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: Request) {
  const user = isAdminRequest(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();

  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select("amount_total, amount_subtotal, discount_code, payment_status, paid_at, created_at")
    .eq("payment_status", "paid")
    .not("paid_at", "is", null);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const all = orders ?? [];

  const revenueThisMonth = all
    .filter(o => o.paid_at >= monthStart)
    .reduce((s, o) => s + (o.amount_total ?? 0), 0);

  const revenueThisYear = all
    .filter(o => o.paid_at >= yearStart)
    .reduce((s, o) => s + (o.amount_total ?? 0), 0);

  const totalRevenue = all.reduce((s, o) => s + (o.amount_total ?? 0), 0);
  const avgOrderValue = all.length > 0 ? totalRevenue / all.length : 0;

  // Korting = verschil subtotaal en totaal (als subtotaal beschikbaar)
  const totalDiscount = all.reduce((s, o) => {
    const diff = (o.amount_subtotal ?? o.amount_total ?? 0) - (o.amount_total ?? 0);
    return s + (diff > 0 ? diff : 0);
  }, 0);

  // Omzet per maand (laatste 12 maanden)
  const monthlyMap = new Map<string, number>();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap.set(key, 0);
  }
  for (const o of all) {
    if (!o.paid_at) continue;
    const d = new Date(o.paid_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (monthlyMap.has(key)) {
      monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + (o.amount_total ?? 0));
    }
  }
  const revenuePerMonth = Array.from(monthlyMap.entries()).map(([month, revenue]) => ({ month, revenue }));

  // Mislukte betalingen
  const { count: failedPayments } = await supabaseAdmin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("order_status", "Betaling niet afgerond");

  return Response.json({
    revenueThisMonth,
    revenueThisYear,
    totalRevenue,
    avgOrderValue,
    totalDiscount,
    revenuePerMonth,
    failedPayments: failedPayments ?? 0,
  });
}
