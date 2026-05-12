import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const { email, naam } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }

    const { data: existing } = await supabaseAdmin
      .from("abandoned_carts")
      .select("id, status")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (!existing) {
      await supabaseAdmin.from("abandoned_carts").insert({
        email: email.toLowerCase().trim(),
        naam: naam || null,
        status: "pending",
      });
    } else if (existing.status !== "completed") {
      await supabaseAdmin
        .from("abandoned_carts")
        .update({ naam: naam || null, status: "pending", created_at: new Date().toISOString() })
        .eq("id", existing.id);
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("❌ save-cart error:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
