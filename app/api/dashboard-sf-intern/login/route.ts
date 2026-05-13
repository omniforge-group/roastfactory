export async function POST(req: Request) {
  const { password } = await req.json();
  const secret = process.env.ADMIN_SECRET_TOKEN;

  if (!password || !secret || password !== secret) {
    return Response.json({ error: "Ongeldig wachtwoord." }, { status: 401 });
  }

  return Response.json({ ok: true, token: secret });
}
