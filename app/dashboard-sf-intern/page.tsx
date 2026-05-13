import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import OrdersClient from "./_components/OrdersClient";

export const dynamic = "force-dynamic";

function isAuthed(): boolean {
  const token = cookies().get("admin-token")?.value;
  const secret = process.env.ADMIN_SECRET_TOKEN;
  return !!token && !!secret && token === secret;
}

export default async function BestellingenPage() {
  if (!isAuthed()) redirect("/dashboard-sf-intern/login");

  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select("id, created_at, status, package, price, customer_name, customer_email, roast_target, occasion, roast_level")
    .order("created_at", { ascending: false });

  return <OrdersClient initialOrders={orders ?? []} fetchError={!!error} />;
}
