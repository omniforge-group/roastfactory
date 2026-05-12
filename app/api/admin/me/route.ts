import { verifySession } from "@/lib/admin-auth";

export async function GET(req: Request) {
  const user = verifySession(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json({ userId: user.userId, name: user.name, role: user.role });
}
