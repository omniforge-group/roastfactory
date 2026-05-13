export type AdminUser = { userId: string; name: string; role: string };

export function isAdminRequest(req: Request): AdminUser | null {
  const token = req.headers.get('x-admin-token');
  const secret = process.env.ADMIN_SECRET_TOKEN;
  if (!token || !secret || token !== secret) return null;
  return { userId: "admin", name: "Admin", role: "admin" };
}
