import {
  checkRateLimit, recordFailedAttempt, clearAttempts,
  createSessionCookie, getClientIp,
} from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { logActivity } from "@/lib/activity-log";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const { allowed, waitMinutes } = checkRateLimit(ip);

  if (!allowed) {
    return Response.json(
      { error: `Te veel pogingen. Probeer het over ${waitMinutes} minuten opnieuw.` },
      { status: 429 }
    );
  }

  const { email, password } = await req.json();

  // Probeer eerst admin_users tabel (als email is opgegeven)
  if (email) {
    try {
      const { data: user } = await supabaseAdmin
        .from("admin_users")
        .select("id, name, role, password_hash, is_active")
        .eq("email", email.toLowerCase().trim())
        .single();

      if (user) {
        if (!user.is_active) {
          recordFailedAttempt(ip);
          return Response.json({ error: "Account is gedeactiveerd." }, { status: 401 });
        }
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
          recordFailedAttempt(ip);
          return Response.json({ error: "Ongeldige inloggegevens." }, { status: 401 });
        }
        clearAttempts(ip);
        await supabaseAdmin
          .from("admin_users")
          .update({ last_login: new Date().toISOString() })
          .eq("id", user.id);
        await logActivity(user.id, user.name, "login", `Ingelogd (${ip})`);
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": createSessionCookie(user.id, user.name, user.role),
          },
        });
      }
    } catch {
      // Tabel bestaat nog niet — val terug op legacy
    }
  }

  // Legacy: single ADMIN_PASSWORD (geen email nodig)
  if (password !== process.env.ADMIN_PASSWORD) {
    recordFailedAttempt(ip);
    return Response.json({ error: "Ongeldige inloggegevens." }, { status: 401 });
  }

  clearAttempts(ip);
  await logActivity("system", "Admin", "login", `Master login (${ip})`).catch(() => {});

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": createSessionCookie("system", "Admin", "admin"),
    },
  });
}
