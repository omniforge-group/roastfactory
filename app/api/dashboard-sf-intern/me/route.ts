import { isAdminRequest } from "@/lib/check-admin-token";

export async function GET(req: Request) {
  if (!isAdminRequest(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json({ userId: "admin", name: "Admin", role: "admin" });
}
