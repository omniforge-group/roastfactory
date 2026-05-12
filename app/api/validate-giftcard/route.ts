import { supabaseAdmin } from "@/lib/supabase-admin";
import { normalizeCode } from "@/lib/giftcard-utils";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code) return Response.json({ valid: false, error: "Code ontbreekt" }, { status: 400 });

    const { data } = await supabaseAdmin
      .from("gift_cards")
      .select("status")
      .eq("code", normalizeCode(code))
      .maybeSingle();

    if (!data) return Response.json({ valid: false, error: "Cadeaubon niet gevonden" });
    if (data.status === "used") return Response.json({ valid: false, error: "Deze cadeaubon is al gebruikt" });

    return Response.json({ valid: true });
  } catch {
    return Response.json({ valid: false, error: "Fout bij controleren code" }, { status: 500 });
  }
}
