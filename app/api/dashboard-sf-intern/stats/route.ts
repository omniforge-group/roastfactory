import { verifySession } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

function countBy<T>(arr: T[], key: keyof T): { label: string; count: number }[] {
  const map = new Map<string, number>();
  for (const item of arr) {
    const val = String(item[key] ?? "Onbekend");
    map.set(val, (map.get(val) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export async function GET(req: Request) {
  if (!verifySession(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const [ordersRes, discountRes] = await Promise.all([
    supabaseAdmin
      .from("orders")
      .select("occasion, language, style, mood, created_at, delivered_at, paid_at")
      .eq("payment_status", "paid"),

    supabaseAdmin
      .from("orders")
      .select("discount_code")
      .eq("payment_status", "paid")
      .not("discount_code", "is", null),
  ]);

  const orders = ordersRes.data ?? [];
  const discountOrders = discountRes.data ?? [];

  const occasions = countBy(orders, "occasion");
  const languages = countBy(orders, "language");
  const styles = countBy(orders, "style");
  const moods = countBy(orders, "mood");

  const deliveryTimes: number[] = [];
  for (const o of orders) {
    const from = o.paid_at ?? o.created_at;
    if (from && o.delivered_at) {
      const diff = (new Date(o.delivered_at).getTime() - new Date(from).getTime()) / 1000 / 60;
      if (diff >= 0 && diff < 60 * 24 * 30) deliveryTimes.push(diff);
    }
  }
  const avgDeliveryMinutes =
    deliveryTimes.length > 0
      ? Math.round(deliveryTimes.reduce((s, v) => s + v, 0) / deliveryTimes.length)
      : null;

  const discountCodes = countBy(discountOrders, "discount_code");

  return Response.json({ occasions, languages, styles, moods, avgDeliveryMinutes, discountCodes });
}
