import { logActivity } from "@/lib/activity-log";

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  const secret = process.env.ADMIN_SECRET_TOKEN;

  if (!password || !secret || password !== secret) {
    return Response.json({ error: "Ongeldig wachtwoord." }, { status: 401 });
  }

  await logActivity("admin", "Admin", "login", "Succesvol ingelogd");

  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `admin-token=${encodeURIComponent(secret)}; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}; Path=/${secure}`,
    },
  });
}
