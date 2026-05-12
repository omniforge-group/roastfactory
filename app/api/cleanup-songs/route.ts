import { del } from "@vercel/blob";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 60;

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data: expiredOrders, error } = await supabaseAdmin
    .from("orders")
    .select("id, song_url_1, song_url_2")
    .lt("expires_at", new Date().toISOString())
    .not("expires_at", "is", null);

  if (error) {
    console.error("❌ Cleanup query error:", error);
    return new Response("Database error", { status: 500 });
  }

  if (!expiredOrders || expiredOrders.length === 0) {
    return new Response(JSON.stringify({ deleted: 0, message: "Niets te verwijderen" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  let deleted = 0;
  const errors: string[] = [];

  for (const order of expiredOrders) {
    const urls = [order.song_url_1, order.song_url_2].filter(Boolean) as string[];

    for (const url of urls) {
      try {
        await del(url);
        deleted++;
        console.log("🗑️ Verwijderd uit Blob:", url);
      } catch (err) {
        const msg = `Fout bij verwijderen ${url}: ${err instanceof Error ? err.message : String(err)}`;
        console.error("❌", msg);
        errors.push(msg);
      }
    }

    await supabaseAdmin
      .from("orders")
      .update({ song_url_1: null, song_url_2: null })
      .eq("id", order.id);
  }

  console.log(`✅ Cleanup klaar: ${deleted} bestanden verwijderd`);

  return new Response(
    JSON.stringify({ deleted, orders: expiredOrders.length, errors }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
