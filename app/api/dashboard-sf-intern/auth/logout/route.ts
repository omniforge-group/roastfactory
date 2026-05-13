export async function POST() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `admin-token=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/${secure}`,
    },
  });
}
