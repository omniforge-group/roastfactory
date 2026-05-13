import { supabaseAdmin } from "@/lib/supabase-admin";
import { logActivity } from "@/lib/activity-log";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { username, password } = await req.json().catch(() => ({ username: "", password: "" }));
  const secret = process.env.ADMIN_SECRET_TOKEN;

  if (!username || !password || !secret) {
    return Response.json({ error: "Gebruikersnaam en wachtwoord zijn verplicht." }, { status: 400 });
  }

  // 1. Check admin_users table in Supabase
  const { data: user } = await supabaseAdmin
    .from("admin_users")
    .select("id, name, email, password_hash, role, is_active")
    .or(`email.eq.${username.toLowerCase().trim()},name.ilike.${username.trim()}`)
    .single();

  if (user) {
    if (!user.is_active) {
      return Response.json({ error: "Account is gedeactiveerd." }, { status: 403 });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return Response.json({ error: "Ongeldige inloggegevens." }, { status: 401 });
    }

    // Update last_login
    await supabaseAdmin.from("admin_users").update({ last_login: new Date().toISOString() }).eq("id", user.id);
    await logActivity(user.id, user.name, "login", `Ingelogd als ${user.role}`);

    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `admin-token=${encodeURIComponent(secret)}; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}; Path=/${secure}`,
      },
    });
  }

  // 2. Fallback: check ADMIN_USERNAME + ADMIN_PASSWORD env vars
  const envUser = process.env.ADMIN_USERNAME;
  const envPass = process.env.ADMIN_PASSWORD;

  if (
    envUser && envPass &&
    username.toLowerCase().trim() === envUser.toLowerCase() &&
    password === envPass
  ) {
    await logActivity("admin", "Admin (env)", "login", "Ingelogd via omgevingsvariabelen");

    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `admin-token=${encodeURIComponent(secret)}; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}; Path=/${secure}`,
      },
    });
  }

  return Response.json({ error: "Ongeldige inloggegevens." }, { status: 401 });
}
